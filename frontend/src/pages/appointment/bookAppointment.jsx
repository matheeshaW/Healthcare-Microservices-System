import BookingForm from "../../components/appointment/BookingForm";
import useAppointments from "../../hooks/useAppointments";

function BookAppointment() {
  const { createForPatient, submitting, error, clearError } = useAppointments();

  const handleCreate = async (payload) => {
    clearError();
    return createForPatient(payload);
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Book a New Appointment</h1>
        <p className="text-sm text-slate-600">
          Pick a doctor, choose a date, and reserve an available slot.
        </p>
      </header>

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
