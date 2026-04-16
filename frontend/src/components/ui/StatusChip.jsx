/**
 * StatusChip Component
 */

export const StatusChip = ({
  status,
  size = "md",
  showIcon = true,
  className = "",
  ...props
}) => {
  const statusConfig = {
    active: {
      bg: "bg-emerald-100",
      text: "text-emerald-900",
      dot: "bg-emerald-500",
      label: "Active",
    },
    inactive: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      dot: "bg-slate-400",
      label: "Inactive",
    },
    pending: {
      bg: "bg-amber-100",
      text: "text-amber-900",
      dot: "bg-amber-500",
      label: "Pending",
    },
    confirmed: {
      bg: "bg-cyan-100",
      text: "text-cyan-900",
      dot: "bg-cyan-500",
      label: "Confirmed",
    },
    verified: {
      bg: "bg-cyan-100",
      text: "text-cyan-900",
      dot: "bg-cyan-500",
      label: "Verified",
    },
    unverified: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      dot: "bg-slate-400",
      label: "Unverified",
    },
    approved: {
      bg: "bg-emerald-100",
      text: "text-emerald-900",
      dot: "bg-emerald-500",
      label: "Approved",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-900",
      dot: "bg-red-500",
      label: "Rejected",
    },
    completed: {
      bg: "bg-emerald-100",
      text: "text-emerald-900",
      dot: "bg-emerald-500",
      label: "Completed",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-900",
      dot: "bg-red-500",
      label: "Cancelled",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <div
      className={`
        inline-flex items-center gap-2
        rounded-full font-semibold
        ${config.bg} ${config.text}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {showIcon && (
        <span
          className={`
            w-2 h-2 rounded-full
            ${config.dot}
          `}
        ></span>
      )}
      <span>{config.label}</span>
    </div>
  );
};

export default StatusChip;
