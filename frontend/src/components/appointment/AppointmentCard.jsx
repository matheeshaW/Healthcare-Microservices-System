import { Link } from "react-router-dom";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString();
};

function AppointmentCard({ appointment, onCancel, cancelling }) {
  const appointmentId = appointment?._id;
  const isCancelled = appointment?.status === "cancelled";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Appointment</h3>
        <AppointmentStatusBadge status={appointment?.status} />
      </div>

      <dl className="mt-3 space-y-1 text-sm text-slate-700">
        <div>
          <dt className="inline font-medium">Date:</dt>{" "}
          <dd className="inline">{formatDate(appointment?.date)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Time:</dt>{" "}
          <dd className="inline">{appointment?.time || "N/A"}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Doctor ID:</dt>{" "}
          <dd className="inline break-all">{appointment?.doctorId || "N/A"}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/appointment/${appointmentId}`}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          View Details
        </Link>

        <button
          onClick={() => onCancel?.(appointmentId)}
          disabled={!appointmentId || isCancelled || cancelling}
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
        >
          {cancelling ? "Cancelling..." : "Cancel"}
        </button>
      </div>
    </article>
  );
}

export default AppointmentCard;
