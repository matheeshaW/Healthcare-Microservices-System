/**
 * Card Component
 */

export const Card = ({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  border = false,
  hoverEffect = false,
  ...props
}) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const shadowStyles = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const baseStyles = `
    bg-white rounded-lg
    border border-slate-200
  `;

  const hoverClass = hoverEffect
    ? "hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    : "";

  const borderClass = border ? "border-slate-300" : "border-slate-100";

  const cardClass = `
    ${baseStyles}
    ${paddingStyles[padding]}
    ${shadowStyles[shadow]}
    ${hoverClass}
    ${borderClass}
    ${className}
  `;

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
