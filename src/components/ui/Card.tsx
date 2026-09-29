import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-border/70 bg-surface shadow-[0_1px_2px_rgba(15,31,18,0.04)]', className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">{children}</h2>
      </div>
      {action}
    </div>
  );
}

type Accent = 'primary' | 'emerald' | 'sky' | 'violet' | 'amber' | 'rose';

const ACCENTS: Record<Accent, { icon: string; glow: string }> = {
  primary: { icon: 'bg-primary-light text-primary-hover', glow: 'from-primary/15' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', glow: 'from-emerald-400/15' },
  sky: { icon: 'bg-sky-50 text-sky-600', glow: 'from-sky-400/15' },
  violet: { icon: 'bg-violet-50 text-violet-600', glow: 'from-violet-400/15' },
  amber: { icon: 'bg-amber-50 text-amber-600', glow: 'from-amber-400/20' },
  rose: { icon: 'bg-rose-50 text-rose-600', glow: 'from-rose-400/15' },
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  accent?: Accent;
  /** Si se pasa, la tarjeta es clickeable y muestra "Ver detalle". */
  onClick?: () => void;
  actionLabel?: string;
  index?: number;
}

export function StatCard({ label, value, hint, icon, accent = 'primary', onClick, actionLabel = 'Ver detalle', index = 0 }: StatCardProps) {
  const a = ACCENTS[accent];
  const clickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={clickable ? { y: -2 } : undefined}
      whileTap={clickable ? { scale: 0.985 } : undefined}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick?.() : undefined}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-surface p-4 shadow-[0_1px_2px_rgba(15,31,18,0.04)] sm:p-5',
        clickable && 'cursor-pointer transition-shadow hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      )}
    >
      <div className={cn('pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl', a.glow)} />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-text-secondary sm:text-sm">{label}</p>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', a.icon)}>{icon}</div>
      </div>
      <p className="relative mt-2 text-xl font-bold tracking-tight text-text sm:text-2xl">{value}</p>
      {hint && <div className="relative mt-1.5 text-xs text-text-secondary">{hint}</div>}
      {clickable && (
        <div className="relative mt-3 flex items-center gap-1 text-xs font-semibold text-primary-hover">
          {actionLabel}
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </motion.div>
  );
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg text-text-secondary/60">{icon}</div>
      <p className="font-semibold text-text">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>}
    </div>
  );
}
