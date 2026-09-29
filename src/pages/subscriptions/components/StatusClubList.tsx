import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, ChevronRight, X } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/Card';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import type { SubscriptionFilterQuery, SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';
import { cn } from '@/lib/utils';

interface StatusClubListProps {
  title: string;
  description: string;
  filter: Pick<SubscriptionFilterQuery, 'status' | 'billingStatus'>;
  emptyTitle: string;
  /** Fecha clave del club (fin de prueba, fin de la gracia…). */
  dateOf: (club: SubscriptionListItem) => string | null | undefined;
  dateLabel: (when: 'past' | 'future') => string;
  accent: string;
  icon: ReactNode;
}

/** Lista de clubes filtrada por estado (pruebas, gracia), pensada para celular. */
export function StatusClubList({ title, description, filter, emptyTitle, dateOf, dateLabel, accent, icon }: StatusClubListProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data, isLoading, isError } = useSubscriptions({ page, limit: 12, search: debouncedSearch || undefined, ...filter });
  const clubs = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
        <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          placeholder="Buscar club por nombre o correo…"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} aria-label="Limpiar" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary hover:bg-bg">
            <X size={14} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-border/50" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-rose-50 py-12 text-center text-rose-700">Error al cargar los clubes.</div>
      ) : clubs.length === 0 ? (
        <EmptyState icon={<Building2 size={22} />} title={emptyTitle} />
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {clubs.map((club, i) => {
            const date = dateOf(club);
            const past = date ? new Date(date) < new Date() : false;
            return (
              <motion.li key={club.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}>
                <Link
                  to={`/clubs/${club.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-4 transition hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
                >
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover" />
                  ) : (
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accent)}>{icon}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text group-hover:text-primary-hover">{club.name}</p>
                    <p className="truncate text-xs text-text-secondary">{club.registeredEmail ?? club.email ?? 'Sin correo'}</p>
                    {club.subscriptionPrice && (
                      <p className="text-[11px] text-text-secondary">
                        {club.subscriptionPrice.plan.name} · {formatCurrency(club.subscriptionPrice.price, club.subscriptionPrice.currency)}/mes
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-text-secondary">{dateLabel(past ? 'past' : 'future')}</p>
                    <p className={cn('text-sm font-semibold', past ? 'text-rose-600' : 'text-text')}>{formatDate(date)}</p>
                    <p className="text-[11px] text-text-secondary">{formatRelative(date)}</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-text-secondary/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}

      {data && <Pagination page={data.page} lastPage={data.lastPage} total={data.total} itemLabel="clubes" onChange={setPage} />}
    </div>
  );
}
