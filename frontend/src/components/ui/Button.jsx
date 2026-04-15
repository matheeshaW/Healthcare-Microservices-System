/**
 * Button Component
 */

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const variantStyles = {
    // Primary button
    primary: `
      bg-cyan-600 text-white 
      hover:bg-cyan-700 
      focus:ring-cyan-200
      disabled:bg-cyan-400
    `,
    // Secondary button
    secondary: `
      bg-slate-200 text-slate-900 
      hover:bg-slate-300 
      focus:ring-slate-200
      disabled:bg-slate-100
    `,
    // Danger button
    danger: `
      bg-red-600 text-white 
      hover:bg-red-700 
      focus:ring-red-200
      disabled:bg-red-400
    `,
    // Success button
    success: `
      bg-emerald-600 text-white 
      hover:bg-emerald-700 
      focus:ring-emerald-200
      disabled:bg-emerald-400
    `,
    // Ghost button (transparent)
    ghost: `
      bg-transparent text-slate-700 
      border border-slate-300
      hover:bg-slate-50 
      focus:ring-slate-200
      disabled:bg-slate-50
    `,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseStyles = `
    inline-flex items-center justify-center
    rounded-lg font-semibold
    transition duration-200 ease-in-out
    focus:outline-none focus:ring-2
    disabled:opacity-60 disabled:cursor-not-allowed
    gap-2
  `;

  const widthClass = fullWidth ? "w-full" : "";

  const buttonClass = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthClass}
    ${className}
  `;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClass}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
      )}
      {children}
    </button>
  );
};

export default Button;
