import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

/**
 * ConfirmDialog — Reusable confirmation modal with async support.
 *
 * Props:
 *   isOpen          {boolean}   — visibility
 *   onClose         {function}  — cancel callback
 *   onConfirm       {function}  — async confirm callback; shows spinner while pending
 *   title           {string}    — heading
 *   message         {string}    — body message
 *   confirmText     {string}    — confirm button label (default: 'Confirm')
 *   cancelText      {string}    — cancel button label (default: 'Cancel')
 *   confirmVariant  {string}    — 'danger' | 'primary' (default: 'danger')
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const btnClass =
    confirmVariant === 'primary' ? 'btn-primary' : 'btn-danger';

  return (
    <Modal isOpen={isOpen} onClose={!loading ? onClose : undefined} title={title} size="sm" hideClose={loading}>
      <div className="flex flex-col items-center text-center gap-5 py-2">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            confirmVariant === 'danger'
              ? 'bg-danger-500/10 text-danger-500'
              : 'bg-primary-600/10 text-primary-400'
          }`}
        >
          <AlertTriangle size={28} />
        </div>

        {/* Message */}
        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 w-full justify-center mt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`${btnClass} flex-1`}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Working…
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
