/**
 * Modal Component
 */

import { useEffect, useId } from "react";

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  actions,
  size = "md",
  closeOnBackdrop = true,
  className = "",
  ...props
}) => {
  const titleId = useId();

  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      {...props}
    >
      <div
        className={`
          bg-white rounded-xl shadow-2xl
          w-full mx-4
          transform transition-all
          ${sizeStyles[size]}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Modal"}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 id={titleId} className="text-xl font-bold text-slate-900">
              {title}
            </h2>
            <button
              onClick={() => onClose?.()}
              className="text-slate-500 hover:text-slate-700 transition"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 px-6 py-4 border-t border-slate-200 justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
