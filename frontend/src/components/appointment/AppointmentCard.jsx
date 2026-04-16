import { Link } from "react-router-dom";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

function AppointmentCard({ appointment, doctorName, onCancel, cancelling, onPay, payingId, paidAppointmentIds = [] }) {
  const appointmentId = appointment?._id;
  const isCancelled = appointment?.status === "cancelled";
  const isConfirmed = appointment?.status === "confirmed";
  
  // 💳 Check if this specific appointment is already in our payment history
  const isAlreadyPaid = paidAppointmentIds.includes(appointmentId);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">{doctorName || "Doctor"}</h3>
          <p className="text-sm text-slate-500">Booking ID: {appointmentId}</p>
        </div>
        <AppointmentStatusBadge status={appointment?.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/appointment/${appointmentId}`} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
          View Details
        </Link>

        {/* 💳 Pay Now logic with "Paid" block */}
        {isConfirmed && (
          isAlreadyPaid ? (
            <button disabled className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-sm font-bold cursor-not-allowed border border-slate-200">
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
          )
        )}

        <button
          onClick={() => onCancel?.(appointmentId)}
          disabled={isCancelled || cancelling || isAlreadyPaid} // Block cancel if paid
          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-30"
        >
          {cancelling ? "..." : "Cancel"}
        </button>
      </div>
    </article>
  );
}

export default AppointmentCard;