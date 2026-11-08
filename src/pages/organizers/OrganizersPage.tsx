import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Trophy, X } from 'lucide-react';
import type { AccountStatus, OrganizerListItem } from '@/services/organizers/organizers.types';
import { useOrganizers } from './hooks/useOrganizers';
import { OrganizerCard } from './components/OrganizerCard';
import { DeleteOrganizerDialog } from './components/DeleteOrganizerDialog';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/Card';
import { ACCOUNT_STATUS, TONE_CLASSES } from '@/lib/status';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: AccountStatus[] = ['ACTIVE', 'INACTIVE'];

export function OrganizersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const statusFilter = (searchParams.get('status') || '') as AccountStatus | '';

  const [searchInput, setSearchInput] = useState(search);
  const [toDelete, setToDelete] = useState<OrganizerListItem | null>(null);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setSearchParams(next);
  };

  const { data, isLoading, isError, isFetching } = useOrganizers({
    page,
    limit: 12,
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const organizers = data?.data ?? [];
  const total = data?.total ?? 0;

  const applySearch = () => updateParams({ search: searchInput.trim() || undefined, page: '1' });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Organizadores</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {total > 0
              ? `${total} organizadores${statusFilter || search ? ' con estos filtros' : ''}`
              : 'Cuentas que organizan torneos.'}
          </p>
        </div>
        {isFetching && !isLoading && <span className="h-2 w-2 animate-ping rounded-full bg-primary" aria-label="Actualizando" />}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          onBlur={() => searchInput.trim() !== search && applySearch()}
          placeholder="Buscar por organización, correo o teléfono…"
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-base text-text placeholder:text-text-secondary/70 transition focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15 sm:text-sm"
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput('');
              updateParams({ search: undefined, page: '1' });
            }}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary hover:bg-bg hover:text-text"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => updateParams({ status: undefined, page: '1' })}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition',
            !statusFilter ? 'bg-sidebar text-white shadow-md' : 'bg-surface text-text-secondary ring-1 ring-border hover:text-text',
          )}
        >
          Todos
        </button>
        {STATUS_FILTERS.map((s) => {
          const meta = ACCOUNT_STATUS[s];
          const t = TONE_CLASSES[meta.tone];
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => updateParams({ status: active ? undefined : s, page: '1' })}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition',
                active ? cn(t.badge, 'shadow-sm ring-2 ring-inset') : 'bg-surface text-text-secondary ring-1 ring-border hover:text-text',
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', t.dot)} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-border/50" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-rose-50 py-12 text-center text-rose-700">Error al cargar los organizadores.</div>
      ) : organizers.length === 0 ? (
        <EmptyState
          icon={<Trophy size={22} />}
          title={search || statusFilter ? 'No hay organizadores con estos filtros' : 'Aún no hay organizadores'}
          description={search || statusFilter ? 'Prueba con otro nombre, correo o estado.' : undefined}
        />
      ) : (
        <div className={cn('grid grid-cols-1 gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', isFetching && 'opacity-70')}>
          {organizers.map((o, i) => (
            <OrganizerCard key={o.id} organizer={o} index={i} onDelete={setToDelete} />
          ))}
        </div>
      )}

      <Pagination
        page={data?.page ?? page}
        lastPage={data?.lastPage ?? 1}
        total={total}
        itemLabel="organizadores"
        onChange={(p) => {
          updateParams({ page: String(p) });
          document.getElementById('app-main')?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="border-t border-border/70 pt-4"
      />

      {toDelete && (
        <DeleteOrganizerDialog
          organizerId={toDelete.id}
          email={toDelete.email}
          companyName={toDelete.companyName}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
