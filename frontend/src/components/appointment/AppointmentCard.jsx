import { Link } from "react-router-dom";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

function AppointmentCard({
  appointment,
  doctorName,
  onCancel,
  cancelling,
  onPay,
  payingId,
  paidAppointmentIds = [],
  onDelete,
  deleting,
}) {
  const appointmentId = appointment?._id;

  // Format date helper function
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  // Logic from BOTH branches merged
  const status = appointment?.status;
  const isCancelled = status === "cancelled";
  const isCompleted = status?.toLowerCase() === "completed";
  const isConfirmed = status === "confirmed";

  // Logic from main: define who can cancel
  const canCancel =
    status === "pending" || status?.toLowerCase() === "confirmed";

  // Logic from your payment branch
  const isAlreadyPaid = paidAppointmentIds.includes(appointmentId);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            {doctorName || "Doctor"}
          </h3>
          <p className="text-sm text-slate-500">Booking ID: {appointmentId}</p>
        </div>
        <AppointmentStatusBadge status={status} />
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
          <dd className="break-all">
            {doctorName || appointment?.doctorId || "N/A"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Payment</dt>
          <dd className="capitalize">
            {appointment?.paymentStatus || "pending"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/appointment/${appointmentId}`}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
        >
          View Details
        </Link>

        {(isCompleted || isConfirmed) && (
          <Link
            to={`/prescription/${appointmentId}`}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            View Prescription
          </Link>
        )}

        {/* 🗑️ Delete Button for Completed Appointments */}
        {isCompleted && (
          <button
            onClick={() => onDelete?.(appointmentId)}
            disabled={deleting}
            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}

        {/* 💳 Payment Button Logic (Member 3's requirements) */}
        {isConfirmed &&
          (isAlreadyPaid ? (
            <button
              disabled
              className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-sm font-bold cursor-not-allowed border border-slate-200"
            >
              ✓ Paid
            </button>
          ) : (
            <button
              onClick={() => onPay?.(appointmentId)}
              disabled={payingId === appointmentId}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {payingId === appointmentId ? "Processing..." : "Pay Now"}
            </button>
          ))}

        {/* ❌ Cancellation Logic (Merged with Payment Check) */}
        {canCancel && (
          <button
            onClick={() => onCancel?.(appointmentId)}
            // Important: You can't cancel if it's already paid!
            disabled={isCancelled || cancelling || isAlreadyPaid}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </article>
  );
}

export default AppointmentCard;
