import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Building2, Users, CalendarClock, MapPin, SlidersHorizontal, X,
  ArrowDownWideNarrow, ArrowUpNarrowWide, Trash2, ChevronRight, FlaskConical,
} from 'lucide-react';
import type { ClubListItem, ClubListQuery } from '@/services/clubs/clubs.types';
import { useClubs } from './hooks/useClubs';
import { DeleteClubModal } from './components/DeleteClubModal';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/Card';
import { CLUB_STATUS, TONE_CLASSES } from '@/lib/status';
import { daysUntil, formatCurrency, formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = ['ACTIVE', 'TRIAL', 'PAST_DUE', 'SUSPENDED'] as const;

/** "Vence en 3 días" con color según qué tan cerca está. */
function ExpiryInfo({ club }: { club: ClubListItem }) {
  const date = club.status === 'TRIAL' ? club.trialEndsAt ?? club.subscriptionEnd : club.subscriptionEnd;
  const days = daysUntil(date);
  if (days === null) return <span className="text-text-secondary">Sin fecha</span>;

  const tone = days < 0 ? 'text-rose-600' : days <= 3 ? 'text-amber-600' : 'text-text-secondary';
  const label = days < 0 ? `Venció ${formatRelative(date)}` : `Vence ${formatRelative(date)}`;
  return (
    <span className={cn('flex items-center gap-1.5', tone)} title={formatDate(date)}>
      <CalendarClock size={13} />
      <span className="font-medium">{label}</span>
    </span>
  );
}

function ClubCard({ club, index, onDelete }: { club: ClubListItem; index: number; onDelete: (club: ClubListItem) => void }) {
  const tone = TONE_CLASSES[(CLUB_STATUS[club.status]?.tone ?? 'neutral')];
  const email = club.registeredEmail ?? club.users?.[0]?.email ?? club.email;
  const isGoogle = club.authProvider ? club.authProvider === 'GOOGLE' : !!club.users?.[0]?.googleId;
  const billable = club.billablePlayersCount ?? club.playerStats?.billable ?? club._count.players;
  const location = [club.city?.name, club.country?.name].filter(Boolean).join(', ');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      className="group relative"
    >
      <Link
        to={`/clubs/${club.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-[0_1px_2px_rgba(15,31,18,0.04)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
      >
        <div className={cn('h-1 w-full', tone.dot)} />

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start gap-3">
            {club.logoUrl ? (
              <img src={club.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-hover">
                <Building2 size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1 pr-7">
              <p className="truncate font-semibold text-text">{club.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <StatusBadge map={CLUB_STATUS} value={club.status} />
                {club.isInternal && <Badge tone="trial">Tuyo</Badge>}
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-text-secondary">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{email ?? 'Sin correo'}</span>
              {isGoogle && <Badge tone="info">Google</Badge>}
            </div>
            {location && (
              <p className="flex items-center gap-1 truncate">
                <MapPin size={12} className="shrink-0" /> {location}
              </p>
            )}
            <p title={formatDate(club.createdAt)}>Cliente desde {formatRelative(club.createdAt)}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-bg p-2.5">
              <p className="text-[11px] text-text-secondary">Plan</p>
              <p className="truncate text-sm font-semibold text-text">{club.subscriptionPrice?.plan.name ?? '—'}</p>
              {club.subscriptionPrice && (
                <p className="text-[11px] text-text-secondary">
                  {formatCurrency(club.subscriptionPrice.price, club.subscriptionPrice.currency)}/mes
                </p>
              )}
            </div>
            <div className="rounded-xl bg-bg p-2.5">
              <p className="flex items-center gap-1 text-[11px] text-text-secondary">
                <Users size={11} /> Deportistas
              </p>
              <p className="text-sm font-semibold text-text">
                {billable} <span className="text-xs font-normal text-text-secondary">/ {club._count.players}</span>
              </p>
              <p className="text-[11px] text-text-secondary">a cobrar / total</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
            <ExpiryInfo club={club} />
            <span className="flex items-center gap-0.5 font-semibold text-primary-hover">
              Ver <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={() => onDelete(club)}
        aria-label={`Eliminar ${club.name}`}
        className="absolute right-3 top-4 rounded-lg p-1.5 text-text-secondary/50 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
}

export function ClubsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const minPlayers = searchParams.get('minPlayers') || '';
  const maxPlayers = searchParams.get('maxPlayers') || '';
  const orderByPlayers = searchParams.get('orderByPlayers') || '';
  const onlyInternal = searchParams.get('internal') === 'only';

  const [searchInput, setSearchInput] = useState(search);
  const [minPlayersInput, setMinPlayersInput] = useState(minPlayers);
  const [maxPlayersInput, setMaxPlayersInput] = useState(maxPlayers);
  const [showFilters, setShowFilters] = useState(!!(minPlayers || maxPlayers || orderByPlayers));
  const [clubToDelete, setClubToDelete] = useState<ClubListItem | null>(null);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setSearchParams(next);
  };

  const { data, isLoading, isError, isFetching } = useClubs({
    page,
    limit: 12,
    search: search || undefined,
    status: (statusFilter || undefined) as ClubListQuery['status'],
    minPlayers: minPlayers ? parseInt(minPlayers, 10) : undefined,
    maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : undefined,
    orderByPlayers: (orderByPlayers || undefined) as ClubListQuery['orderByPlayers'],
    internal: onlyInternal ? 'only' : undefined,
  });

  const applySearch = () =>
    updateParams({ search: searchInput.trim() || undefined, minPlayers: minPlayersInput, maxPlayers: maxPlayersInput, page: '1' });

  const advancedCount = [minPlayers, maxPlayers, orderByPlayers].filter(Boolean).length;
  const totalClubs = data?.total ?? 0;
  const clubs = data?.data ?? [];

  const inputCls =
    'h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary/70 transition focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15';

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Clubes</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {totalClubs > 0 ? `${totalClubs} clubes${statusFilter || search ? ' con estos filtros' : ' registrados'}` : 'Administra todos los clubes.'}
          </p>
        </div>
        {isFetching && !isLoading && <span className="h-2 w-2 animate-ping rounded-full bg-primary" aria-label="Actualizando" />}
      </div>

      {/* Buscador + botón de filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            onBlur={() => searchInput.trim() !== search && applySearch()}
            placeholder="Buscar por nombre o correo…"
            className={cn(inputCls, 'pl-10 pr-10')}
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
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition',
            showFilters ? 'border-primary/40 bg-primary-light text-primary-hover' : 'border-border bg-surface text-text hover:border-primary/40',
          )}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filtros</span>
          {advancedCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
              {advancedCount}
            </span>
          )}
        </button>
      </div>

      {/* Estados: píldoras deslizables en celular */}
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
          const meta = CLUB_STATUS[s];
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
        <button
          onClick={() => updateParams({ internal: onlyInternal ? undefined : 'only', page: '1' })}
          title="Clubes propios o de prueba (no cuentan en las métricas)"
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition',
            onlyInternal ? 'bg-violet-50 text-violet-700 shadow-sm ring-2 ring-inset ring-violet-300' : 'bg-surface text-text-secondary ring-1 ring-border hover:text-text',
          )}
        >
          <FlaskConical size={14} /> Mis clubes
        </button>
      </div>

      {/* Filtros avanzados */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 rounded-2xl border border-border/70 bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold text-text-secondary">Deportistas</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="Mínimo"
                    value={minPlayersInput}
                    onChange={(e) => setMinPlayersInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    className={inputCls}
                  />
                  <span className="text-text-secondary">–</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="Máximo"
                    value={maxPlayersInput}
                    onChange={(e) => setMaxPlayersInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-text-secondary">Ordenar por deportistas</p>
                <div className="flex gap-2">
                  {[
                    { dir: 'desc', label: 'Más', icon: ArrowDownWideNarrow },
                    { dir: 'asc', label: 'Menos', icon: ArrowUpNarrowWide },
                  ].map(({ dir, label, icon: Icon }) => (
                    <button
                      key={dir}
                      onClick={() => updateParams({ orderByPlayers: orderByPlayers === dir ? undefined : dir, page: '1' })}
                      className={cn(
                        'inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition sm:flex-none',
                        orderByPlayers === dir ? 'border-primary/40 bg-primary-light text-primary-hover' : 'border-border text-text-secondary hover:text-text',
                      )}
                    >
                      <Icon size={16} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 sm:col-span-2 sm:justify-end">
                {advancedCount > 0 && (
                  <button
                    onClick={() => {
                      setMinPlayersInput('');
                      setMaxPlayersInput('');
                      updateParams({ minPlayers: undefined, maxPlayers: undefined, orderByPlayers: undefined, page: '1' });
                    }}
                    className="h-11 flex-1 rounded-xl px-4 text-sm font-medium text-text-secondary hover:bg-bg hover:text-text sm:flex-none"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={applySearch}
                  className="h-11 flex-1 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.98] sm:flex-none"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-border/50" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-rose-50 py-12 text-center text-rose-700">Error al cargar los clubes.</div>
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={<Building2 size={22} />}
          title="No hay clubes con estos filtros"
          description="Prueba con otro nombre, otro estado o limpia los filtros."
        />
      ) : (
        <div className={cn('grid grid-cols-1 gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', isFetching && 'opacity-70')}>
          {clubs.map((club, i) => (
            <ClubCard key={club.id} club={club} index={i} onDelete={setClubToDelete} />
          ))}
        </div>
      )}

      <Pagination
        page={data?.page ?? page}
        lastPage={data?.lastPage ?? 1}
        total={totalClubs}
        itemLabel="clubes"
        onChange={(p) => {
          updateParams({ page: String(p) });
          document.getElementById('app-main')?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="border-t border-border/70 pt-4"
      />

      {clubToDelete && (
        <DeleteClubModal
          clubId={clubToDelete.id}
          clubName={clubToDelete.name}
          isOpen={!!clubToDelete}
          onClose={() => setClubToDelete(null)}
        />
      )}
    </div>
  );
}
