/**
 * Spinner Component
 */

export const Spinner = ({
  size = "md",
  variant = "primary",
  fullScreen = false,
  label = null,
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const variantStyles = {
    primary: "text-cyan-600",
    secondary: "text-slate-500",
    success: "text-emerald-600",
    danger: "text-red-600",
  };

  const spinnerClass = `
    animate-spin
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `;

  const spinner = (
    <svg
      className={spinnerClass}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="text-center">
          {spinner}
          {label && <p className="mt-4 text-slate-700 font-medium">{label}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {spinner}
      {label && <p className="text-sm text-slate-600">{label}</p>}
    </div>
  );
};

export default Spinner;
