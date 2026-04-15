import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppointmentStatusBadge from "../../components/appointment/AppointmentStatusBadge";
import useAppointments from "../../hooks/useAppointments";
import { getDoctorById } from "../../api/appointment.api";

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, cancellingId, fetchAppointmentById, cancelMine } = useAppointments();
  const [appointment, setAppointment] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAppointment = async () => {
      const result = await fetchAppointmentById(id);

      if (!isMounted) {
        return;
      }

      setAppointment(result);

      if (result?.doctorId) {
        try {
          const doctor = await getDoctorById(result.doctorId);
          if (isMounted) {
            setDoctorName(doctor?.name || "");
          }
        } catch {
          if (isMounted) {
            setDoctorName("");
          }
        }
      }
    };

    loadAppointment();

    return () => {
      isMounted = false;
    };
  }, [id, fetchAppointmentById]);

  const handleCancel = async () => {
    const shouldCancel = window.confirm("Cancel this appointment?");

    if (!shouldCancel) {
      return;
    }

    try {
      const updated = await cancelMine(id);
      setAppointment((current) => ({
        ...current,
        ...(updated || {}),
        status: "cancelled",
      }));
      setNotice("Appointment cancelled. The doctor's slot can now be released back to availability.");
    } catch {
      // Hook already exposes error state.
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700">
        Loading appointment details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700">
        <p>Appointment not found.</p>
        <Link to="/appointment/my" className="font-semibold text-cyan-700 hover:text-cyan-800">
          Back to My Appointments
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-4 flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Appointment Detail</h1>
            <AppointmentStatusBadge status={appointment.status} />
          </header>

          <dl className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-900">Appointment ID</dt>
              <dd className="break-all">{appointment._id}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Doctor</dt>
              <dd>{doctorName || appointment.doctorId}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Date</dt>
              <dd>{formatDate(appointment.date)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Time</dt>
              <dd>{appointment.time}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Payment Status</dt>
              <dd className="capitalize">{appointment.paymentStatus || "pending"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-900">Current Status</dt>
              <dd className="capitalize">{appointment.status}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/appointment/my"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Back to My Appointments
            </Link>

            <button
              type="button"
              onClick={handleCancel}
              disabled={appointment.status === "cancelled" || cancellingId === id}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {cancellingId === id ? "Cancelling..." : "Cancel Appointment"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/appointment/book")}
              className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
            >
              Book Another
            </button>
          </div>
        </article>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Workflow impact</h2>
          <p className="mt-2 text-sm text-slate-600">
            This booking is linked to doctor availability. When the appointment is active,
            the selected doctor slot is occupied. If you cancel it, that slot can be freed
            again for future bookings.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default AppointmentDetail;
