/**
 * Badge Component
 */

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const variantStyles = {
    // Default gray badge
    default: "bg-slate-200 text-slate-900",
    // Primary cyan badge
    primary: "bg-cyan-100 text-cyan-900",
    // Success green badge
    success: "bg-emerald-100 text-emerald-900",
    // Warning yellow badge
    warning: "bg-amber-100 text-amber-900",
    // Danger red badge
    danger: "bg-red-100 text-red-900",
    // Info blue badge
    info: "bg-blue-100 text-blue-900",
    // Verified checkmark badge
    verified: "bg-emerald-100 text-emerald-900",
    // Unverified badge
    unverified: "bg-slate-100 text-slate-700",
    // Specialization badge
    specialization: "bg-purple-100 text-purple-900",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const baseStyles = `
    inline-flex items-center justify-center
    rounded-full font-semibold
    whitespace-nowrap
  `;

  const badgeClass = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `;

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
};

export default Badge;
