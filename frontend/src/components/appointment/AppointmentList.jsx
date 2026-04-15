import AppointmentCard from "./AppointmentCard";

function AppointmentList({ appointments, onCancel, cancellingId }) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
        No appointments yet. Book your first session.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          onCancel={onCancel}
          cancelling={cancellingId === appointment._id}
        />
      ))}
    </div>
  );
}

export default AppointmentList;
