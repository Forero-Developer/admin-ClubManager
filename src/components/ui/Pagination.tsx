import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  lastPage: number;
  total?: number;
  /** Texto del tipo de elemento, ej. "clubes". */
  itemLabel?: string;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, lastPage, total, itemLabel = 'resultados', onChange, className }: PaginationProps) {
  if (lastPage <= 1) return null;

  const btn =
    'inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text transition hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40';

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <p className="text-xs text-text-secondary sm:text-sm">
        Página <span className="font-semibold text-text">{page}</span> de {lastPage}
        {typeof total === 'number' && <span className="hidden sm:inline"> · {total} {itemLabel}</span>}
      </p>
      <div className="flex gap-2">
        <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior">
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <button className={btn} disabled={page >= lastPage} onClick={() => onChange(page + 1)} aria-label="Página siguiente">
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
