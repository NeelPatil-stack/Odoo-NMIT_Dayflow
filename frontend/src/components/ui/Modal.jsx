import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Modal — Premium slide-up modal with glass design.
 *
 * Props:
 *   isOpen       {boolean}   — controls visibility
 *   onClose      {function}  — called when backdrop or Escape pressed
 *   title        {string}    — modal heading
 *   children     {ReactNode} — body content
 *   size         {string}    — 'sm' | 'md' | 'lg' | 'xl'
 *   hideClose    {boolean}   — hides the close button when true
 *   footer       {ReactNode} — optional footer slot
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideClose = false,
  footer,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`glass w-full ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md} max-h-[90vh] flex flex-col shadow-card animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h2
            id="modal-title"
            className="text-lg font-display font-semibold text-white"
          >
            {title}
          </h2>
          {!hideClose && (
            <button
              onClick={onClose}
              className="btn-icon ml-4 shrink-0"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>

        {/* Footer (optional) */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/[0.06] shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
