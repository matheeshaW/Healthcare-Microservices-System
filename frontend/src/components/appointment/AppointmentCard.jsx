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

function AppointmentCard({ appointment, doctorName, onCancel, cancelling }) {
  const appointmentId = appointment?._id;
  const status = appointment?.status;
  const canCancel = status === "pending" || status === "confirmed";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            {doctorName || "Doctor appointment"}
          </h3>
          <p className="text-sm text-slate-500">Patient booking record</p>
        </div>
        <AppointmentStatusBadge status={appointment?.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <div>
          <dt className="font-medium text-slate-900">Date</dt>
          <dd>{formatDate(appointment?.date)}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Time</dt>
          <dd>{appointment?.time || "N/A"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Doctor</dt>
          <dd className="break-all">{doctorName || appointment?.doctorId || "N/A"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Payment</dt>
          <dd className="capitalize">{appointment?.paymentStatus || "pending"}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/appointment/${appointmentId}`}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          View Details
        </Link>

        {canCancel && (
          <button
            onClick={() => onCancel?.(appointmentId)}
            disabled={!appointmentId || cancelling}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </article>
  );
}

export default AppointmentCard;
