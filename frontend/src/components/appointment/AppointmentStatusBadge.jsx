const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-rose-100 text-rose-800 border-rose-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
};

function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase();
  const styleClass = STATUS_STYLES[normalized] || STATUS_STYLES.pending;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${styleClass}`}
    >
      {normalized}
    </span>
  );
}

export default StatusBadge;
