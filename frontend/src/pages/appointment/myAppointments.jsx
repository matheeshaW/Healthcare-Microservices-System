import { useEffect } from "react";
import { Link } from "react-router-dom";
import AppointmentList from "../../components/appointment/AppointmentList";
import useAppointments from "../../hooks/useAppointments";

function MyAppointments() {
  const { appointments, loading, error, fetchMine, cancelMine, cancellingId } = useAppointments();

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const handleCancel = async (appointmentId) => {
    const shouldCancel = window.confirm("Cancel this appointment?");

    if (!shouldCancel) {
      return;
    }

    try {
      await cancelMine(appointmentId);
    } catch {
      // Hook already stores error state used below.
    }
  };

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
          onCancel={handleCancel}
          cancellingId={cancellingId}
        />
      )}
    </section>
  );
}

export default MyAppointments;
