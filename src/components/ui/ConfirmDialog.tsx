import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  /** Primary prop names */
  open?: boolean;
  onClose?: () => void;
  message?: string;
  variant?: 'danger' | 'default';
  /** Alias props used by admin pages */
  isOpen?: boolean;
  onCancel?: () => void;
  description?: string;
  isDanger?: boolean;
  /** Common props */
  onConfirm: () => void;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant,
  isDanger,
  loading = false,
}: ConfirmDialogProps) {
  const resolvedOpen = open ?? isOpen ?? false;
  const resolvedOnClose = onClose ?? onCancel ?? (() => {});
  const resolvedMessage = message ?? description ?? '';
  const resolvedVariant: 'danger' | 'default' = isDanger ? 'danger' : (variant ?? 'default');
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') resolvedOnClose();
    },
    [resolvedOnClose]
  );

  useEffect(() => {
    if (resolvedOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [resolvedOpen, handleKeyDown]);

  if (!resolvedOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) resolvedOnClose();
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-white rounded-brand shadow-brand-lg p-6 w-full max-w-md animate-scale-in z-10">
        <button
          onClick={resolvedOnClose}
          className="absolute top-4 end-4 p-1 rounded-full hover:bg-brand-cream-200 transition-colors"
        >
          <X size={18} className="text-brand-olive-400" />
        </button>

        <h3 className="text-lg font-serif font-semibold text-brand-espresso mb-2">
          {title}
        </h3>
        <p className="text-sm text-brand-olive-500 mb-6">{resolvedMessage}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={resolvedOnClose}
            className="btn-ghost"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              resolvedVariant === 'danger' ? 'btn-danger' : 'btn-primary',
              loading && 'opacity-60'
            )}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
