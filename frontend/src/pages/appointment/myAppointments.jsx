import { useEffect, useState, useContext, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AppointmentList from "../../components/appointment/AppointmentList";
import useAppointments from "../../hooks/useAppointments";
import { getDoctorById } from "../../api/appointment.api";
import { AuthContext } from "../../context/AuthContext";
import {
  createCheckoutSession,
  confirmPaymentToDB,
} from "../../api/payment.api";

function MyAppointments() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    appointments,
    loading,
    error,
    fetchMine,
    cancelMine,
    cancellingId,
    deleteMine,
    deletingId,
  } = useAppointments();

  const [doctorNames, setDoctorNames] = useState({});
  const [notice, setNotice] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [paidAppointmentIds, setPaidAppointmentIds] = useState([]); 

  // ============================================
  // FETCH PAYMENT STATUS
  // ============================================
  const fetchPaymentStatus = useCallback(async () => {
    if (!user) return;
    try {
      const userId = user._id || user.id;
      const res = await fetch(
        `http://localhost:5005/api/payment/history/${userId}`,
      );

      // Check if response is ok before parsing
      if (!res.ok) {
        console.warn(
          `Payment history fetch returned ${res.status}: ${res.statusText}`,
        );
        setPaidAppointmentIds([]);
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const paidIds = data.data.map((payment) => payment.appointmentId);
        setPaidAppointmentIds(paidIds);
      } else {
        setPaidAppointmentIds([]);
      }
    } catch (err) {
      console.warn(
        "Payment service unavailable, continuing without payment history:",
        err,
      );
      setPaidAppointmentIds([]);
    }
  }, [user]);

  // ============================================
  // HANDLE STRIPE REDIRECT (Success/Cancel)
  // ============================================
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const appointmentId = searchParams.get("appointmentId");

    if (paymentStatus === "success" && appointmentId && user) {
      const finalizeTransaction = async () => {
        try {
          setNotice("Verifying payment and generating receipt...");
          
          // GRAB THE DOCTOR ID SAVED BEFORE REDIRECT
          const savedDoctorId = localStorage.getItem("pending_doctor_id");

          await confirmPaymentToDB({
            appointmentId: appointmentId,
            patientId: user._id || user.id,
            patientEmail: user.email,
            amount: 2500,
            doctorId: savedDoctorId || "UNKNOWN_DOC" // Fallback to prevent crash
          });

          // CLEANUP
          localStorage.removeItem("pending_doctor_id");
          setSearchParams({}); 
          
          // Refresh data and redirect
          await fetchPaymentStatus();
          navigate("/patient/payments?status=success");
        } catch (err) {
          console.error("Finalization failed:", err);
          setNotice("Payment verified, but history update failed.");
        }
      };
      finalizeTransaction();
    } else if (paymentStatus === "cancelled") {
      setNotice("Payment was cancelled.");
      setSearchParams({});
    }
  }, [searchParams, user, navigate, setSearchParams, fetchPaymentStatus]);

  // ============================================
  // DATA LOADING
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      const result = await fetchMine();
      await fetchPaymentStatus();

      if (!isMounted || !result || result.length === 0) {
        if (isMounted) setDoctorNames({});
        return;
      }

      const uniqueDoctorIds = [
        ...new Set(result.map((item) => item.doctorId).filter(Boolean)),
      ];

      const doctorEntries = await Promise.all(
        uniqueDoctorIds.map(async (doctorId) => {
          try {
            const doctor = await getDoctorById(doctorId);
            return [doctorId, doctor?.name || doctorId];
          } catch {
            return [doctorId, doctorId];
          }
        }),
      );

      if (isMounted) {
        setDoctorNames(Object.fromEntries(doctorEntries));
      }
    };

    loadAppointments();
    return () => { isMounted = false; };
  }, [fetchMine, fetchPaymentStatus]);

  // ============================================
  // ACTION HANDLERS
  // ============================================
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await cancelMine(appointmentId);
      setNotice("Appointment cancelled successfully.");
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (appointmentId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this appointment? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteMine(appointmentId);
      setNotice("Appointment deleted successfully.");
    } catch {
      setNotice("Failed to delete appointment.");
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      setPayingId(appointmentId);
      setNotice("");
      
      // 1. Find the appointment to get the doctorId
      const targetAppointment = appointments.find(a => a._id === appointmentId);
      if (targetAppointment) {
        // 2. Save it to localStorage so it survives the Stripe redirect
        localStorage.setItem("pending_doctor_id", targetAppointment.doctorId);
      }

      const data = await createCheckoutSession(appointmentId);

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setNotice("Payment service is currently unavailable.");
    } finally {
      setPayingId(null);
    }
  };

  const upcomingCount = appointments.filter(
    (item) => item.status !== "cancelled",
  ).length;
  const cancelledCount = appointments.filter(
    (item) => item.status === "cancelled",
  ).length;

  return (
    <section className="mx-auto max-w-4xl p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-sm text-slate-600">
            Review and manage your scheduled visits.
          </p>
        </div>
        <Link
          to="/appointment/book"
          className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Book New
        </Link>
      </header>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total appointments</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {appointments.length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active or completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {upcomingCount}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {cancelledCount}
          </p>
        </article>
      </div>

      {notice && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700">
          Loading appointments...
        </div>
      ) : (
        <AppointmentList
          appointments={appointments}
          doctorNames={doctorNames}
          onCancel={handleCancel}
          cancellingId={cancellingId}
          onPay={handlePayment}
          payingId={payingId}
          paidAppointmentIds={paidAppointmentIds}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </section>
  );
}

export default MyAppointments;