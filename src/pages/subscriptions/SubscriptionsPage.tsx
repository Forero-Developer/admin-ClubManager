import { useState } from 'react';
import { useSubscriptions, useAnalytics, useTransactions } from './hooks/useSubscriptions';
import { AnalyticsView } from './components/AnalyticsView';
import {
  Plus, CreditCard, Building2, Search, X, ChevronRight,
  Banknote, Wallet, Link2, ReceiptText, ArrowDownWideNarrow,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SubscriptionFilterQuery } from '@/services/subscriptions/subscriptions.types';
import { formatDate, formatCurrency, formatRelative } from '@/lib/format';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/Card';
import { BILLING_METHOD, CLUB_STATUS, TONE_CLASSES } from '@/lib/status';
import { cn } from '@/lib/utils';

const METHOD_ICONS: Record<string, React.ReactNode> = {
  CARD:     <CreditCard size={14} className="text-blue-500" />,
  TRANSFER: <Banknote   size={14} className="text-green-600" />,
  CASH:     <Wallet     size={14} className="text-yellow-600" />,
  LINK:     <Link2      size={14} className="text-purple-500" />,
};
// ── Club (tarjeta en celular, fila en escritorio) ─────────────────────────────
function SubRow({ club }: { club: any }) {
  const billable = club.billablePlayersCount ?? club._count?.players ?? 0;
  // Cobro mensual esperado hoy (plan + packs según deportistas)
  const total = club.expectedMonthly?.total ?? Number(club.currentBaseAmount || 0) + Number(club.currentAddonAmount || 0);
  const packs = club.expectedMonthly?.packs ?? 0;
  return (
    <li>
      <Link
        to={`/clubs/${club.id}`}
        className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 transition hover:bg-bg/60 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto]"
      >
        {club.logoUrl ? (
          <img src={club.logoUrl} className="h-10 w-10 rounded-xl border border-border object-cover lg:hidden" alt="" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary-hover lg:hidden"><Building2 size={17} /></div>
        )}

        <div className="flex min-w-0 items-center gap-2.5">
          {club.logoUrl ? (
            <img src={club.logoUrl} className="hidden h-9 w-9 shrink-0 rounded-xl border border-border object-cover lg:block" alt="" />
          ) : (
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-hover lg:flex"><Building2 size={15} /></div>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-text group-hover:text-primary-hover">
              <span className="truncate">{club.name}</span>
              {club.isInternal && <Badge tone="trial">Tuyo</Badge>}
            </p>
            <p className="truncate text-xs text-text-secondary">{club.registeredEmail ?? club.email ?? 'Sin correo'}</p>
          </div>
        </div>

        <div className="text-right lg:hidden">
          <p className="text-sm font-bold text-text">{formatCurrency(total)}</p>
          <p className="text-[11px] text-text-secondary">/ mes</p>
        </div>

        <div className="col-span-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary lg:col-span-1">
          <StatusBadge map={CLUB_STATUS} value={club.status} />
          <span className="lg:hidden">· {billable} deportistas{packs > 0 ? ` · ${packs} pack${packs > 1 ? 's' : ''}` : ''}</span>
        </div>

        <div className="hidden text-sm lg:block">
          <p className="font-medium text-text">{club.subscriptionPrice?.plan.name ?? '—'}{packs > 0 && <span className="text-text-secondary"> + {packs} pack{packs > 1 ? 's' : ''}</span>}</p>
          <p className="text-[11px] text-text-secondary">{billable} / {club._count?.players ?? 0} deportistas</p>
        </div>

        <div className="hidden text-sm lg:block">
          <span className="flex items-center gap-1.5 text-text">
            {METHOD_ICONS[club.billingMethod] ?? <ReceiptText size={14} className="text-text-secondary" />}
            {BILLING_METHOD[club.billingMethod] ?? club.billingMethod ?? '—'}
          </span>
          {club.paymentProfile?.status === 'AVAILABLE' && club.billingMethod !== 'CARD' && (
            <Badge tone="info" className="mt-1">Wompi guardado</Badge>
          )}
        </div>

        <div className="col-span-3 text-xs text-text-secondary lg:col-span-1 lg:text-sm">
          <span className="lg:hidden">Vence </span>
          <span className="font-medium text-text">{formatDate(club.subscriptionEnd ?? club.nextChargeDate)}</span>
          <span className="block text-[11px]">{formatRelative(club.subscriptionEnd ?? club.nextChargeDate)}</span>
        </div>

        <div className="hidden text-sm font-semibold text-text lg:block">{formatCurrency(total)}</div>

        <ChevronRight size={16} className="hidden text-text-secondary/40 transition group-hover:translate-x-0.5 group-hover:text-primary lg:block" />
      </Link>
    </li>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [filters, setFilters] = useState<SubscriptionFilterQuery>({ limit: 15, internal: 'exclude', orderByAmount: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<'management' | 'metrics' | 'history'>('management');

  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: subs, isLoading: subsLoading } = useSubscriptions({ ...filters, page });
  const { data: txs, isLoading: txsLoading } = useTransactions({ page: txPage, limit: 15 });

  const setStatusFilter = (s: string) => setFilters(f => f.status === s ? { ...f, status: undefined } : { ...f, status: s, page: 1 });
  const setBillingMethodFilter = (m: 'TRANSFER' | 'CARD' | 'CASH' | 'LINK') => setFilters(f => f.billingMethod === m ? { ...f, billingMethod: undefined } : { ...f, billingMethod: m, page: 1 });
  const setAddonCountFilter = (c: number | undefined) => setFilters(f => ({ ...f, addonCount: c, page: 1 }));
  const applySearch = () => { setFilters(f => ({ ...f, search: searchInput || undefined, page: 1 })); setPage(1); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Suscripciones</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Clubes, métricas de cobro y pagos recibidos.</p>
        </div>
        <Link to="/plans" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
          <Plus size={16} /> <span className="hidden sm:inline">Crear plan</span><span className="sm:hidden">Plan</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-surface p-1 ring-1 ring-border/70 [scrollbar-width:none] sm:inline-flex">
        {([
          ['management', 'Clubes'],
          ['metrics', 'Métricas'],
          ['history', 'Pagos recibidos'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition',
              activeTab === key ? 'bg-sidebar text-white shadow-sm' : 'text-text-secondary hover:text-text',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'metrics' && <AnalyticsView analytics={analytics} isLoading={analyticsLoading} />}

      {/* ── LIST view & Filters ── */}
      {activeTab === 'management' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              onBlur={applySearch}
              placeholder="Buscar club…"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: undefined })); }} aria-label="Limpiar" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary hover:bg-bg">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <ArrowDownWideNarrow size={16} className="shrink-0" />
              <select
                value={filters.orderByAmount ?? 'none'}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((f) => ({ ...f, orderByAmount: v === 'none' ? undefined : (v as 'asc' | 'desc') }));
                  setPage(1);
                }}
                className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text focus:outline-none focus:ring-4 focus:ring-primary/15 sm:flex-none"
              >
                <option value="desc">El que más paga primero</option>
                <option value="asc">El que menos paga primero</option>
                <option value="none">Próximos a vencer</option>
              </select>
            </label>
            <div className="flex rounded-xl bg-surface p-1 ring-1 ring-border/70">
              {([
                ['exclude', 'Clientes'],
                ['all', 'Todos'],
                ['only', 'Mis clubes'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setFilters((f) => ({ ...f, internal: value }));
                    setPage(1);
                  }}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:flex-none',
                    (filters.internal ?? 'all') === value ? 'bg-sidebar text-white shadow-sm' : 'text-text-secondary hover:text-text',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {(['ACTIVE', 'TRIAL', 'PAST_DUE', 'SUSPENDED'] as const).map((st) => {
              const meta = CLUB_STATUS[st];
              const t = TONE_CLASSES[meta.tone];
              const active = filters.status === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition', active ? cn(t.badge, 'ring-2 ring-inset') : 'bg-surface text-text-secondary ring-1 ring-border hover:text-text')}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} /> {meta.label}
                </button>
              );
            })}
            <span className="mx-1 w-px shrink-0 bg-border" />
            {(['TRANSFER', 'CARD', 'CASH', 'LINK'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setBillingMethodFilter(m)}
                className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition', filters.billingMethod === m ? 'bg-primary-light text-primary-hover ring-2 ring-inset ring-primary/30' : 'bg-surface text-text-secondary ring-1 ring-border hover:text-text')}
              >
                {METHOD_ICONS[m]} {BILLING_METHOD[m]}
              </button>
            ))}
            <select
              className="h-8 shrink-0 cursor-pointer rounded-full border-0 bg-surface px-3 text-xs font-medium text-text-secondary ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={filters.addonCount ?? ''}
              onChange={(e) => setAddonCountFilter(e.target.value === '' ? undefined : Number(e.target.value))}
            >
              <option value="">Cualquier cantidad de add-ons</option>
              <option value="0">Sin add-ons</option>
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>Plan + {i + 1} add-on{i ? 's' : ''}</option>
              ))}
            </select>
            {(filters.search || filters.status || filters.billingMethod || filters.addonCount !== undefined) && (
              <button onClick={() => { setFilters((f) => ({ limit: 15, internal: f.internal, orderByAmount: f.orderByAmount })); setSearchInput(''); setPage(1); }} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
                <X size={12} /> Limpiar
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface">
            <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1fr)_16px] gap-x-3 border-b border-border/70 bg-bg/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary lg:grid">
              <span>Club</span><span>Estado</span><span>Plan</span><span>Método</span><span>Mes pagado hasta</span><span>Paga / mes</span><span />
            </div>
            {subsLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-bg" />)}
              </div>
            ) : subs?.data.length === 0 ? (
              <div className="p-4"><EmptyState icon={<Building2 size={22} />} title="No hay clubes con esos filtros" /></div>
            ) : (
              <ul className="divide-y divide-border/60">
                {subs?.data.map((club) => <SubRow key={club.id} club={club} />)}
              </ul>
            )}
          </div>

          <Pagination page={subs?.page ?? page} lastPage={subs?.lastPage ?? 1} total={subs?.total} itemLabel="clubes" onChange={setPage} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface">
            <div className="flex items-center gap-2 border-b border-border/70 bg-bg/60 px-4 py-3">
              <ReceiptText size={16} className="text-primary-hover" />
              <h2 className="text-sm font-semibold text-text">Pagos recibidos recientemente</h2>
            </div>
            {txsLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-bg" />)}
              </div>
            ) : !txs?.data || txs.data.length === 0 ? (
              <div className="p-4"><EmptyState icon={<ReceiptText size={22} />} title="Sin pagos recientes" /></div>
            ) : (
              <ul className="divide-y divide-border/60">
                {txs.data.map((tx: any) => (
                  <li key={tx.id}>
                    <Link to={`/clubs/${tx.clubId}`} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-bg/60">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-text group-hover:text-primary-hover">{tx.clubName}</p>
                          <Badge tone={tx.type === 'SUBSCRIPTION' ? 'info' : 'trial'}>{tx.type === 'SUBSCRIPTION' ? 'Mensualidad' : 'Add-on'}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-text-secondary">
                          {formatDate(tx.createdAt)} · {formatRelative(tx.createdAt)}{tx.description ? ` · ${tx.description}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-text">{formatCurrency(tx.amount)}</p>
                      <ChevronRight size={16} className="shrink-0 text-text-secondary/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Pagination page={txs?.page ?? txPage} lastPage={txs?.lastPage ?? 1} total={txs?.total} itemLabel="pagos" onChange={setTxPage} />
        </div>
      )}

    </div>
  );
}
