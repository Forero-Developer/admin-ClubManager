import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Fila etiqueta / valor, con un subtítulo opcional (ej. "hace 3 días"). */
export function InfoRow({ label, value, sub, className }: { label: ReactNode; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-4 py-3', className)}>
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-right">
        <span className="block text-sm font-medium text-text">{value}</span>
        {sub && <span className="block text-xs text-text-secondary">{sub}</span>}
      </span>
    </div>
  );
}

export function InfoList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-surface', className)}>
      {children}
    </div>
  );
}
