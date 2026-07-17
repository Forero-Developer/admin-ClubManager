import { useState } from 'react';
import { useClubs } from './hooks/useClubs';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Building2, Users, Calendar, CreditCard, 
  TrendingUp, AlertTriangle, Clock, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, SlidersHorizontal, X,
  ArrowDownWideNarrow, ArrowUpNarrowWide
} from 'lucide-react';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ClubListItem } from '@/services/clubs/clubs.types';

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  ACTIVE: { label: 'Activo', class: 'bg-success/10 text-success border-success/20', icon: <CheckCircle2 size={12} /> },
  TRIAL: { label: 'Trial', class: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock size={12} /> },
  PAST_DUE: { label: 'En Mora', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle size={12} /> },
  SUSPENDED: { label: 'Suspendido', class: 'bg-red-50 text-danger border-red-200', icon: <XCircle size={12} /> },
};

const BILLING_CONFIG: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: 'Al día', class: 'text-success' },
  TRIAL: { label: 'Trial', class: 'text-yellow-600' },
  PAST_DUE: { label: 'En mora', class: 'text-amber-600' },
  SUSPENDED: { label: 'Suspendido', class: 'text-danger' },
};

const STATUS_FILTERS = ['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED'] as const;

function ClubCard({ club }: { club: ClubListItem }) {
  const statusCfg = STATUS_CONFIG[club.status] ?? STATUS_CONFIG.ACTIVE;
  const billCfg = BILLING_CONFIG[club.billingStatus] ?? BILLING_CONFIG.ACTIVE;
  const isPendingMP = (club as any).mpStatus === 'pending';

  const formatDate = (d?: string | null) =>
    d ? format(new Date(d), "d MMM yy", { locale: es }) : '—';

  return (
    <div className={`group relative rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      club.status === 'PAST_DUE' || isPendingMP ? 'border-amber-200' : 'border-border hover:border-primary/30'
    }`}>
      {/* Accent top bar */}
      <div className={`h-1 w-full ${
        club.status === 'ACTIVE' ? 'bg-success' :
        club.status === 'TRIAL' ? 'bg-yellow-400' :
        club.status === 'PAST_DUE' ? 'bg-amber-400' : 'bg-red-400'
      }`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {club.logoUrl ? (
            <img src={club.logoUrl} alt={club.name} className="h-12 w-12 rounded-lg object-cover border border-border flex-shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary-light text-primary flex items-center justify-center border border-primary/10 flex-shrink-0">
              <Building2 size={22} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-text truncate text-sm">{club.name}</h3>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${statusCfg.class}`}>
                {statusCfg.icon} {statusCfg.label}
              </span>
            </div>
            
            <div className="mt-1 flex flex-col gap-0.5">
              {club.users && club.users.length > 0 ? (
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <p className="text-xs text-text-secondary truncate" title="Login (Admin)">
                    {club.users[0].email}
                  </p>
                  {club.users[0].googleId && (
                    <span className="flex-shrink-0 px-1 py-0.5 bg-blue-50 text-blue-600 text-[8px] rounded font-bold border border-blue-100 uppercase tracking-wider">
                      Google
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-secondary truncate" title="Contacto Club">
                  {club.email}
                </p>
              )}
              <p className="text-[10px] text-text-secondary/70 truncate">{club.country.name} · {club.country.code}</p>
              <p className="text-[10px] text-text-secondary/70 truncate">Registrado: {formatDate(club.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Plan info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-bg/60 rounded-lg p-2.5">
            <p className="text-[10px] text-text-secondary uppercase tracking-wide font-medium flex items-center gap-1 mb-1">
              <CreditCard size={10} /> Plan
            </p>
            <p className="text-sm font-semibold text-text truncate">
              {club.subscriptionPrice?.plan.name ?? '—'}
            </p>
            {club.subscriptionPrice && (
              <p className="text-[10px] text-text-secondary">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: club.subscriptionPrice.currency, maximumFractionDigits: 0 }).format(club.subscriptionPrice.price)}
                /{club.subscriptionPrice.interval === 'MONTHLY' ? 'mes' : club.subscriptionPrice.interval}
              </p>
            )}
          </div>
          <div className="bg-bg/60 rounded-lg p-2.5">
            <p className="text-[10px] text-text-secondary uppercase tracking-wide font-medium flex items-center gap-1 mb-1">
              <Users size={10} /> Miembros
            </p>
            <p className="text-sm font-semibold text-text">{club._count.players}</p>
            <p className="text-[10px] text-text-secondary">jugadores</p>
          </div>
        </div>

        {/* Billing status + dates */}
        <div className="flex items-center justify-between text-xs border-t border-border pt-3">
          <span className={`font-medium ${billCfg.class}`}>{billCfg.label}</span>
          <span className="text-text-secondary flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(club.subscriptionEnd)}
          </span>
        </div>
      </div>

      {/* Actions footer */}
      <div className="px-5 pb-4 flex items-center justify-between gap-2 border-t border-border/50 pt-3 bg-bg/30">
        <Link to={`/clubs/${club.id}`} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
          <TrendingUp size={12} /> Gestionar Club y Facturación
        </Link>
      </div>
    </div>
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

  const [searchInput, setSearchInput] = useState(search);
  const [minPlayersInput, setMinPlayersInput] = useState(minPlayers);
  const [maxPlayersInput, setMaxPlayersInput] = useState(maxPlayers);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const setPage = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const { data, isLoading, isError } = useClubs({ 
    page, 
    limit: 12,
    search: search || undefined,
    status: (statusFilter as any) || undefined,
    minPlayers: minPlayers ? parseInt(minPlayers, 10) : undefined,
    maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : undefined,
    orderByPlayers: (orderByPlayers as any) || undefined,
  });

  const handleSearch = () => {
    updateParams({ search: searchInput, minPlayers: minPlayersInput, maxPlayers: maxPlayersInput, page: '1' });
  };

  const handleStatusFilter = (status: string) => {
    updateParams({ status: statusFilter === status ? undefined : status, page: '1' });
  };

  const handleSort = (direction: string) => {
    updateParams({ orderByPlayers: orderByPlayers === direction ? undefined : direction, page: '1' });
  };

  const clearSearch = () => {
    setSearchInput('');
    setMinPlayersInput('');
    setMaxPlayersInput('');
    updateParams({ search: undefined, minPlayers: undefined, maxPlayers: undefined, orderByPlayers: undefined, page: '1' });
  };

  // Quick stats from data
  const totalShown = data?.data.length ?? 0;
  const totalClubs = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Gestión de Clubes</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {totalClubs > 0 ? `${totalClubs} clubes registrados` : 'Visualiza y administra todos los clubes.'}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm bg-white text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); updateParams({ search: undefined, page: '1' }); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Players filter */}
        <div className="flex items-center gap-2">
          <Users size={16} className="text-text-secondary" />
          <input 
            type="number"
            min="0"
            placeholder="Min Jug."
            value={minPlayersInput}
            onChange={(e) => setMinPlayersInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-white text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
          <span className="text-text-secondary">-</span>
          <input 
            type="number"
            min="0"
            placeholder="Max Jug."
            value={maxPlayersInput}
            onChange={(e) => setMaxPlayersInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-white text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
          <button onClick={handleSearch} className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Filtrar
          </button>

          <div className="h-5 w-px bg-border mx-1"></div>
          
          <button 
            onClick={() => handleSort('desc')}
            className={`p-2 rounded-lg border transition-colors ${orderByPlayers === 'desc' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-bg hover:text-text'}`}
            title="Mayor a menor jugadores"
          >
            <ArrowDownWideNarrow size={16} />
          </button>
          <button 
            onClick={() => handleSort('asc')}
            className={`p-2 rounded-lg border transition-colors ${orderByPlayers === 'asc' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-bg hover:text-text'}`}
            title="Menor a mayor jugadores"
          >
            <ArrowUpNarrowWide size={16} />
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={15} className="text-text-secondary" />
          {STATUS_FILTERS.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  statusFilter === s ? cfg.class + ' ring-2 ring-offset-1' : 'border-border text-text-secondary hover:border-primary/30'
                }`}
              >
                {cfg.icon} {cfg.label}
              </button>
            );
          })}
          {statusFilter && (
            <button onClick={() => updateParams({ status: undefined, page: '1' })} className="text-xs text-text-secondary hover:text-danger flex items-center gap-1">
              <X size={12} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-border bg-white animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-danger">Error al cargar los clubes.</div>
      ) : (
        <>
          {totalShown === 0 ? (
            <div className="text-center py-16 rounded-xl border-2 border-dashed border-border">
              <Building2 size={40} className="mx-auto text-text-secondary/30 mb-3" />
              <p className="text-text-secondary">No se encontraron clubes con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.data.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {(data?.lastPage ?? 1) > 1 && (
            <div className="flex items-center justify-between text-sm text-text-secondary border-t border-border pt-4">
              <span>Mostrando {totalShown} de {totalClubs} clubes · Página {data?.page} de {data?.lastPage}</span>
              <div className="flex gap-2">
                <button
                  disabled={!data || data.page === 1}
                  onClick={() => setPage(page - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <button
                  disabled={!data || data.page === data.lastPage}
                  onClick={() => setPage(page + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
