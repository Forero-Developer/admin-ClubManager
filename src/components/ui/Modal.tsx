import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Contenido fijo bajo el header (ej. resumen o filtros). */
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const SIZES = { md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

/**
 * Modal responsive: en celular es una hoja que sube desde abajo (fácil de
 * usar con el pulgar); desde `sm` es un diálogo centrado.
 */
export function Modal({ open, onClose, title, description, header, footer, children, size = 'lg' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
              <Dialog.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className={cn(
                    'pointer-events-auto flex w-full flex-col bg-surface shadow-2xl outline-none',
                    'max-h-[92dvh] rounded-t-3xl sm:max-h-[85vh] sm:rounded-2xl',
                    SIZES[size],
                  )}
                  initial={{ y: '100%', opacity: 0.6 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                >
                  {/* Asa para arrastrar (solo visual, en celular) */}
                  <div className="flex justify-center pt-2.5 sm:hidden">
                    <span className="h-1.5 w-10 rounded-full bg-slate-200" />
                  </div>

                  <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-3 sm:px-6 sm:pt-5">
                    <div className="min-w-0">
                      <Dialog.Title className="text-base font-bold text-text sm:text-lg">{title}</Dialog.Title>
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-text-secondary">{description}</Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close
                      className="-mr-1.5 shrink-0 rounded-full p-2 text-text-secondary transition hover:bg-bg hover:text-text"
                      aria-label="Cerrar"
                    >
                      <X size={18} />
                    </Dialog.Close>
                  </div>

                  {header && <div className="border-b border-border/70 px-5 pb-4 sm:px-6">{header}</div>}

                  <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">{children}</div>

                  {footer && (
                    <div className="border-t border-border/70 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
                      {footer}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
