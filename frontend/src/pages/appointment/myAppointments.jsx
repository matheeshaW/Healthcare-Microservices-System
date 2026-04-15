import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppointmentList from "../../components/appointment/AppointmentList";
import useAppointments from "../../hooks/useAppointments";
import { getDoctorById } from "../../api/appointment.api";

function MyAppointments() {
  const { appointments, loading, error, fetchMine, cancelMine, cancellingId } = useAppointments();
  const [doctorNames, setDoctorNames] = useState({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      const result = await fetchMine();

      if (!isMounted || result.length === 0) {
        if (isMounted) {
          setDoctorNames({});
        }
        return;
      }

      const uniqueDoctorIds = [...new Set(result.map((item) => item.doctorId).filter(Boolean))];

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

    return () => {
      isMounted = false;
    };
  }, [fetchMine]);

  const handleCancel = async (appointmentId) => {
    const shouldCancel = window.confirm("Cancel this appointment?");

    if (!shouldCancel) {
      return;
    }

    try {
      await cancelMine(appointmentId);
      setNotice("Appointment cancelled. The doctor's time slot can be available again.");
    } catch {
      // Hook already stores error state used below.
    }
  };

  const upcomingCount = appointments.filter((item) => item.status !== "cancelled").length;
  const cancelledCount = appointments.filter((item) => item.status === "cancelled").length;

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-sm text-slate-600">Review and manage your scheduled visits.</p>
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
          <p className="mt-1 text-2xl font-bold text-slate-900">{appointments.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active or completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{upcomingCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{cancelledCount}</p>
        </article>
      </div>

      {notice && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700">
          Loading appointments...
        </div>
      )}

      {!loading && error && (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && (
        <AppointmentList
          appointments={appointments}
          doctorNames={doctorNames}
          onCancel={handleCancel}
          cancellingId={cancellingId}
        />
      )}
    </section>
  );
}

export default MyAppointments;
