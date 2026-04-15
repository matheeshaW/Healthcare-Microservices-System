import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  const { loading, error, fetchAppointmentById } = useAppointments();
  const [appointment, setAppointment] = useState(null);
  const [doctorName, setDoctorName] = useState("");

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
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Appointment Detail</h1>
        <AppointmentStatusBadge status={appointment.status} />
      </header>

      <dl className="space-y-2 text-sm text-slate-700">
        <div>
          <dt className="inline font-medium">Appointment ID:</dt>{" "}
          <dd className="inline break-all">{appointment._id}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Doctor:</dt>{" "}
          <dd className="inline">{doctorName || appointment.doctorId}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Date:</dt>{" "}
          <dd className="inline">{formatDate(appointment.date)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Time:</dt>{" "}
          <dd className="inline">{appointment.time}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Payment Status:</dt>{" "}
          <dd className="inline capitalize">{appointment.paymentStatus || "pending"}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <Link
          to="/appointment/my"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to My Appointments
        </Link>
      </div>
    </section>
  );
}

export default AppointmentDetail;
