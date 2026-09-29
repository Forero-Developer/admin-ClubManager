import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  /** Contenido extra (ej. un campo de texto). */
  children?: ReactNode;
  confirmDisabled?: boolean;
}

/** Reemplazo de window.confirm con el estilo del admin. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  danger,
  loading,
  children,
  confirmDisabled,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={title}
      description={description}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="h-11 rounded-xl px-4 text-sm font-medium text-text-secondary transition hover:bg-bg hover:text-text"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50',
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-primary-hover',
            )}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      }
    >
      {children ?? null}
    </Modal>
  );
}
