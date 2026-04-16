import { Link } from "react-router-dom";
import BookingForm from "../../components/appointment/BookingForm";
import useAppointments from "../../hooks/useAppointments";

function BookAppointment() {
  const { createForPatient, submitting, error, clearError } = useAppointments();

  const handleCreate = async (payload) => {
    clearError();
    return createForPatient(payload);
  };

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book a New Appointment</h1>
          <p className="text-sm text-slate-600">
            Pick a doctor, choose a date, and reserve an available slot.
          </p>
        </div>

        <Link
          to="/appointment/my"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          View My Appointments
        </Link>
      </header>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900">Step 1</p>
          <p className="mt-1 text-sm text-slate-600">Choose a verified doctor.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900">Step 2</p>
          <p className="mt-1 text-sm text-slate-600">Pick an open date and time slot.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900">Step 3</p>
          <p className="mt-1 text-sm text-slate-600">Confirm the booking and update doctor availability.</p>
        </article>
      </div>

      {error && (
        <p className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <BookingForm onSubmit={handleCreate} submitting={submitting} />
    </section>
  );
}

export default BookAppointment;
