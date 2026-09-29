import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClubAction {
  label: string;
  description?: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/** Menú "Más" con las acciones secundarias del club (cabe bien en celular). */
export function ClubActionsMenu({ actions }: { actions: ClubAction[] }) {
  const [open, setOpen] = useState(false);
  if (actions.length === 0) return null;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-text transition hover:border-primary/40 data-[state=open]:border-primary/40 data-[state=open]:bg-primary-light"
          aria-label="Más acciones"
        >
          <MoreHorizontal size={18} />
          <span className="hidden sm:inline">Más</span>
        </button>
      </DropdownMenu.Trigger>
      <AnimatePresence>
        {open && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content asChild align="end" sideOffset={8} forceMount>
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border/70 bg-surface p-1.5 shadow-xl"
              >
                {actions.map((action) => (
                  <DropdownMenu.Item
                    key={action.label}
                    disabled={action.disabled}
                    onSelect={action.onSelect}
                    className={cn(
                      'flex cursor-pointer select-none items-start gap-3 rounded-xl px-3 py-2.5 outline-none transition data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                      action.danger ? 'text-rose-600 data-[highlighted]:bg-rose-50' : 'text-text data-[highlighted]:bg-bg',
                    )}
                  >
                    <span className="mt-0.5 shrink-0">{action.icon}</span>
                    <span>
                      <span className="block text-sm font-medium">{action.label}</span>
                      {action.description && (
                        <span className={cn('block text-xs', action.danger ? 'text-rose-500/80' : 'text-text-secondary')}>
                          {action.description}
                        </span>
                      )}
                    </span>
                  </DropdownMenu.Item>
                ))}
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
}
