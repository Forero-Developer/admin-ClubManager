import { useState } from 'react';
import { useSubscriptionStats, useSubscriptions, useAnalytics, useTransactions } from './hooks/useSubscriptions';
import {
  Plus, TrendingUp, CreditCard,
  CheckCircle2, AlertTriangle, DollarSign,
  CalendarDays, BarChart3, Building2, Search, X, ChevronLeft, ChevronRight,
  Banknote, Wallet, Link2, ReceiptText, Package, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SubscriptionFilterQuery } from '@/services/subscriptions/subscriptions.types';
import { formatDate, formatCurrency } from '@/lib/utils';

const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: 'Mensual', QUARTERLY: 'Trimestral', SEMIANNUAL: 'Semestral', YEARLY: 'Anual',
};
const METHOD_ICONS: Record<string, React.ReactNode> = {
  CARD:     <CreditCard size={14} className="text-blue-500" />,
  TRANSFER: <Banknote   size={14} className="text-green-600" />,
  CASH:     <Wallet     size={14} className="text-yellow-600" />,
  LINK:     <Link2      size={14} className="text-purple-500" />,
};
const STATUS_CONFIG: Record<string, { label: string; class: string; dot: string }> = {
  ACTIVE:    { label: 'Activo',      class: 'bg-success/10 text-success border-success/20',   dot: 'bg-success' },
  TRIAL:     { label: 'Trial',       class: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  PAST_DUE:  { label: 'En Mora',     class: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  SUSPENDED: { label: 'Suspendido',  class: 'bg-red-50 text-danger border-red-200',           dot: 'bg-danger' },
};
const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ── Mini KPI card ─────────────────────────────────────────────────────────────
function MiniStat({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm ${accent ?? 'border-border'}`}>
      <div className="h-10 w-10 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-text-secondary uppercase tracking-wide font-medium truncate">{label}</p>
        <p className="text-lg font-bold text-text leading-tight truncate">{value}</p>
        {sub && <p className="text-[10px] text-text-secondary truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Mini horizontal bar ───────────────────────────────────────────────────────
function DistBar({ data, colorFn }: { data: [string, number][]; colorFn: (k: string) => string }) {
  const total = data.reduce((s, [, v]) => s + v, 0);
  if (!total) return <p className="text-xs text-text-secondary">Sin datos</p>;
  return (
    <div className="space-y-2">
      {data.map(([key, val]) => (
        <div key={key} className="flex items-center gap-2 text-xs">
          <span className="w-24 truncate text-text-secondary">{key}</span>
          <div className="flex-1 h-2 rounded-full bg-bg overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${colorFn(key)}`} style={{ width: `${(val / total) * 100}%` }} />
          </div>
          <span className="w-6 font-semibold text-text text-right">{val}</span>
        </div>
      ))}
    </div>
  );
}

// ── Monthly sparkline bar chart ───────────────────────────────────────────────
function MonthlyChart({ data }: { data: { year: number; month: number; amount: number }[] }) {
  if (!data.length) return <p className="text-xs text-text-secondary py-4 text-center">Sin datos históricos aún.</p>;
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 mt-2">
      {data.map((d) => {
        const pct = (d.amount / max) * 100;
        return (
          <div key={`${d.year}-${d.month}`} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: '80px' }}>
              <div
                className="w-full rounded-t bg-primary/80 hover:bg-primary transition-all cursor-default"
                style={{ height: `${Math.max(pct, 3)}%` }}
                title={`${MONTH_NAMES[d.month - 1]} ${d.year}: ${formatCurrency(d.amount)}`}
              />
              {/* tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-text text-white text-[9px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {formatCurrency(d.amount)}
              </div>
            </div>
            <span className="text-[8px] text-text-secondary">{MONTH_NAMES[d.month - 1]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Addon tier breakdown table ────────────────────────────────────────────────
function TierBreakdown({ tiers }: { tiers: any[] }) {
  if (!tiers.length) return <p className="text-xs text-text-secondary">Sin datos.</p>;
  const maxRevenue = Math.max(...tiers.map(t => t.totalRevenue), 1);
  return (
    <div className="space-y-3">
      {tiers.map((tier) => (
        <div key={tier.addOnCount} className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1.5 font-medium text-text">
              <Package size={12} className={tier.addOnCount === 0 ? 'text-text-secondary' : 'text-primary'} />
              {tier.label}
            </span>
            <div className="flex items-center gap-3 text-text-secondary">
              <span><strong className="text-text">{tier.clubCount}</strong> club{tier.clubCount !== 1 ? 's' : ''}</span>
              <span className="font-semibold text-text">{formatCurrency(tier.totalRevenue)}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-bg overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${tier.addOnCount === 0 ? 'bg-text-secondary/40' : 'bg-primary'}`}
              style={{ width: `${(tier.totalRevenue / maxRevenue) * 100}%` }}
            />
          </div>
          {tier.addonRevenue > 0 && (
            <p className="text-[10px] text-text-secondary pl-4">
              Base: {formatCurrency(tier.baseRevenue)} · Addons: {formatCurrency(tier.addonRevenue)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}


// ── Addon Performance Dashboard ────────────────────────────────────────────────
function AddOnsPerformance({ metrics }: { metrics?: { performance: any[]; topClubs: any[] } }) {
  if (!metrics || metrics.performance.length === 0) return <p className="text-xs text-text-secondary text-center py-4">No hay ventas de addons registradas.</p>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-[10px] uppercase font-bold tracking-wider text-text-secondary mb-3">Ingresos por AddOn</h4>
        <div className="space-y-3">
          {metrics.performance.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-bg/50 p-2 rounded-lg border border-border">
              <div>
                <p className="text-xs font-semibold text-text">{item.name}</p>
                <p className="text-[10px] text-text-secondary">{item.count} ventas realizadas</p>
              </div>
              <p className="text-xs font-bold text-primary">{formatCurrency(item.revenue)}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] uppercase font-bold tracking-wider text-text-secondary mb-3">Top Clubes</h4>
        <div className="space-y-3">
          {metrics.topClubs.map(item => (
            <div key={item.clubId} className="flex justify-between items-center bg-bg/50 p-2 rounded-lg border border-border">
              <div>
                <p className="text-xs font-semibold text-text truncate w-32">{item.clubName}</p>
                <p className="text-[10px] text-text-secondary">{item.count} paquetes</p>
              </div>
              <p className="text-xs font-bold text-text">{formatCurrency(item.revenue)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Subscription table row ────────────────────────────────────────────────────
function SubRow({ club }: { club: any }) {
  const cfg = STATUS_CONFIG[club.status] ?? STATUS_CONFIG.ACTIVE;
  return (
    <tr className="hover:bg-bg/40 transition-colors text-sm">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          {club.logoUrl
            ? <img src={club.logoUrl} className="h-8 w-8 rounded-lg object-cover border border-border" alt={club.name} />
            : <div className="h-8 w-8 rounded-lg bg-primary-light text-primary flex items-center justify-center"><Building2 size={15} /></div>
          }
          <div>
            <p className="font-medium text-text leading-tight">{club.name}</p>
            <p className="text-[10px] text-text-secondary">{club.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cfg.class}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-text">{club.subscriptionPrice?.plan.name ?? '—'}</p>
        {club.subscriptionPrice && (
          <p className="text-[10px] text-text-secondary">{INTERVAL_LABELS[club.subscriptionPrice.interval] || club.subscriptionPrice.interval}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-0.5">
          <span className="flex items-center gap-1">
            {METHOD_ICONS[club.billingMethod] ?? <ReceiptText size={14} className="text-text-secondary" />}
            <span className="text-text-secondary text-xs">{club.billingMethod ?? '—'}</span>
          </span>
          {club.mpSubscriptionId && club.billingMethod !== 'CARD' && (
            <span className="text-[9px] text-blue-500 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-full" title="Suscripción MP sigue activa para el próximo cobro">
              MP Activo
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-text-secondary">{formatDate(club.nextChargeDate)}</td>
      <td className="px-4 py-3 font-medium text-text">
        {formatCurrency(Number(club.currentBaseAmount || 0) + Number(club.currentAddonAmount || 0))}
      </td>
      <td className="px-4 py-3 text-right">
        <Link to={`/clubs/${club.id}`} className="text-xs font-semibold text-primary hover:underline">
          Gestionar
        </Link>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [filters, setFilters] = useState<SubscriptionFilterQuery>({ limit: 15 });
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<'management' | 'metrics' | 'history'>('management');

  const { data: stats, isLoading: statsLoading } = useSubscriptionStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: subs, isLoading: subsLoading } = useSubscriptions({ ...filters, page });
  const { data: txs, isLoading: txsLoading } = useTransactions({ page: txPage, limit: 15 });

  const setStatusFilter = (s: string) => setFilters(f => f.status === s ? { ...f, status: undefined } : { ...f, status: s, page: 1 });
  const setBillingMethodFilter = (m: 'TRANSFER' | 'CARD' | 'CASH' | 'LINK') => setFilters(f => f.billingMethod === m ? { ...f, billingMethod: undefined } : { ...f, billingMethod: m, page: 1 });
  const setAddonCountFilter = (c: number | undefined) => setFilters(f => ({ ...f, addonCount: c, page: 1 }));
  const applySearch = () => { setFilters(f => ({ ...f, search: searchInput || undefined, page: 1 })); setPage(1); };

  const active    = stats?.byStatus?.ACTIVE    ?? 0;
  const trial     = stats?.byStatus?.TRIAL     ?? 0;
  const pastDue   = stats?.byStatus?.PAST_DUE  ?? 0;
  const suspended = stats?.byStatus?.SUSPENDED ?? 0;

  const intervalEntries = Object.entries(stats?.byInterval ?? {}).sort((a, b) => (b[1] as number) - (a[1] as number));
  const INTERVAL_COLORS: Record<string, string> = { MONTHLY: 'bg-primary', QUARTERLY: 'bg-blue-400', SEMIANNUAL: 'bg-indigo-400', YEARLY: 'bg-purple-500' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Suscripciones</h1>
          <p className="text-sm text-text-secondary mt-0.5">Métricas de facturación, gestión y listado de clubes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/plans" className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition">
            <Plus size={15} /> Crear Plan
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border/60">
        <button
          onClick={() => setActiveTab('management')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'management' ? 'text-primary' : 'text-text-secondary hover:text-text'}`}
        >
          Gestión de Clubes
          {activeTab === 'management' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'metrics' ? 'text-primary' : 'text-text-secondary hover:text-text'}`}
        >
          Métricas y Análisis
          {activeTab === 'metrics' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-primary' : 'text-text-secondary hover:text-text'}`}
        >
          Historial de Compras
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'metrics' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {statsLoading || analyticsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse bg-white border border-border rounded-xl" />)}
            </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="Suscripciones y Jugadores" value={formatCurrency((analytics?.baseRevenue ?? 0) + (analytics?.recurringAddonRevenue ?? 0))} sub="Ingresos recurrentes" icon={<TrendingUp size={20} className="text-blue-500" />} accent="border-blue-200" />
            <MiniStat label="Mensajes de WSP (Pagos Únicos)" value={formatCurrency(analytics?.oneTimeAddonRevenue ?? 0)} sub="Paquetes de mensajes" icon={<Package size={20} className="text-purple-500" />} accent="border-purple-200" />
            <MiniStat label="Ticket Promedio"       value={formatCurrency(
              (analytics?.tierBreakdown?.reduce((acc: any, t: any) => acc + t.totalRevenue, 0) ?? 0) / 
              (analytics?.tierBreakdown?.reduce((acc: any, t: any) => acc + t.clubCount, 0) || 1)
            )}                                                                                        sub="Media por club activo"                               icon={<BarChart3 size={20} className="text-green-500" />}    accent="border-green-200" />
            <MiniStat label="En mora / Suspendidos" value={(pastDue + suspended).toString()}                    sub={`${pastDue} mora · ${suspended} susp.`}               icon={<AlertTriangle size={20} className="text-amber-500" />}  accent={pastDue + suspended > 0 ? 'border-amber-200' : 'border-border'} />
          </div>
        )}

        {/* ── ROW 2: Analíticas que el usuario pidió ver de primero ── */}
        {!analyticsLoading && !statsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Desglose de Base + Addons */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                    <Package size={12} className="text-primary" /> Distribución: Plan Base + Addons
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Métricas de adopción de complementos</p>
                </div>
              </div>
              <TierBreakdown tiers={analytics?.tierBreakdown ?? []} />
            </div>

            {/* Distribución por Intervalo de Cobro */}
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" /> Frecuencia de Cobro
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Mensual, Trimestral, Semestral, Anual</p>
                </div>
              </div>
              <div className="space-y-4">
                <DistBar
                  data={intervalEntries.map(([k, v]) => [INTERVAL_LABELS[k] ?? k, v as number])}
                  colorFn={(label) => {
                    const key = Object.keys(INTERVAL_LABELS).find(k => INTERVAL_LABELS[k] === label) ?? '';
                    return INTERVAL_COLORS[key] ?? 'bg-border';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── ROW 3: AddOns Específicos ── */}
        {!analyticsLoading && !statsLoading && analytics?.addonMetrics && (
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={12} className="text-primary" /> Rendimiento de Add-Ons (Excl. Jugadores)
                </p>
                <p className="text-[10px] text-text-secondary mt-0.5">Ingresos y adopción de paquetes como WhatsApp</p>
              </div>
            </div>
            <AddOnsPerformance metrics={analytics.addonMetrics} />
          </div>
        )}
          {/* Row 3: Gráficas adicionales al final */}
          {analyticsLoading ? (
            <div className="h-48 animate-pulse bg-white border border-border rounded-xl" />
          ) : analytics && (
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm mt-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays size={12} className="text-primary" /> Histórico de Ingresos (Últimos 12 meses)
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Pagos SaaS completados</p>
                </div>
                <p className="text-xs font-bold text-primary">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <MonthlyChart data={analytics.monthlyRevenue} />
            </div>
          )}
        </div>
      )}

      {/* ── LIST view & Filters ── */}
      {activeTab === 'management' && (
        <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
            <input
              type="text" value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Buscar club..."
              className="pl-8 pr-8 py-1.5 border border-border rounded-lg text-xs bg-white text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
            />
            {searchInput && <button onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: undefined })); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"><X size={12} /></button>}
          </div>
          {(['ACTIVE','TRIAL','PAST_DUE','SUSPENDED'] as const).map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${filters.status === s ? cfg.class + ' ring-2 ring-offset-1' : 'border-border text-text-secondary hover:border-primary/30'}`}>
                {cfg.label}
              </button>
            );
          })}
          {(['CARD','TRANSFER','CASH','LINK'] as const).map(m => (
            <button key={m} onClick={() => setBillingMethodFilter(m)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${filters.billingMethod === m ? 'border-primary text-primary bg-primary-light ring-2 ring-offset-1' : 'border-border text-text-secondary hover:border-primary/30'}`}>
              {METHOD_ICONS[m]} {m}
            </button>
          ))}
          <select
            className="text-[10px] font-semibold border border-border rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-text-secondary cursor-pointer"
            value={filters.addonCount ?? ''}
            onChange={(e) => setAddonCountFilter(e.target.value === '' ? undefined : Number(e.target.value))}
          >
            <option value="">Todos los addons</option>
            <option value="0">Sin addons (0)</option>
            <option value="1">Plan + 1 Addon</option>
            <option value="2">Plan + 2 Addons</option>
            <option value="3">Plan + 3 Addons</option>
            <option value="4">Plan + 4 Addons</option>
            <option value="5">Plan + 5 Addons</option>
            <option value="6">Plan + 6 Addons</option>
            <option value="7">Plan + 7 Addons</option>
            <option value="8">Plan + 8 Addons</option>
            <option value="9">Plan + 9 Addons</option>
            <option value="10">Plan + 10 Addons</option>
          </select>
          {(filters.search || filters.status || filters.billingMethod || filters.addonCount !== undefined) && (
            <button onClick={() => { setFilters({ limit: 15 }); setSearchInput(''); setPage(1); }} className="text-[10px] text-danger hover:underline flex items-center gap-1">
              <X size={11} /> Limpiar
            </button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-text-secondary uppercase bg-bg/50 border-b border-border">
                <tr>
                  {['Club', 'Estado', 'Plan', 'Método', 'Próx. Cobro', 'Monto Total', ''].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subsLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-border rounded animate-pulse" /></td></tr>
                    ))
                  : subs?.data.map(club => <SubRow key={club.id} club={club} />)
                }
                {!subsLoading && subs?.data.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-text-secondary">No hay suscripciones con esos filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {(subs?.lastPage ?? 1) > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span>Mostrando {subs?.data.length} de {subs?.total} · Página {subs?.page} de {subs?.lastPage}</span>
              <div className="flex gap-1.5">
                <button disabled={subs?.page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <ChevronLeft size={13} /> Ant.
                </button>
                <button disabled={subs?.page === subs?.lastPage} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Sig. <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-bg/50">
              <h2 className="text-sm font-bold text-text flex items-center gap-2">
                <ReceiptText size={16} className="text-primary" /> Transacciones Exitosas Recientes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-text-secondary uppercase bg-bg/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold tracking-wider">Fecha</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Club</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Descripción</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Tipo</th>
                    <th className="px-4 py-3 font-semibold tracking-wider text-right">Monto</th>
                    <th className="px-4 py-3 font-semibold tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {txsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-border rounded animate-pulse" /></td></tr>
                    ))
                  ) : txs?.data?.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-bg/40 transition-colors">
                      <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-text text-xs">{tx.clubName}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{tx.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wider ${
                          tx.type === 'SUBSCRIPTION' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-200'
                        }`}>
                          {tx.type === 'SUBSCRIPTION' ? 'Plan' : 'AddOn'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-text text-right text-xs">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/clubs/${tx.clubId}`} className="text-xs font-semibold text-primary hover:underline">
                          Ver Club
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!txs?.data || txs.data.length === 0) && !txsLoading && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-text-secondary">No hay transacciones recientes.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {(txs?.lastPage ?? 1) > 1 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <span>Mostrando {txs?.data.length} de {txs?.total} · Página {txs?.page} de {txs?.lastPage}</span>
                <div className="flex gap-1.5">
                  <button disabled={txs?.page === 1} onClick={() => setTxPage(p => p - 1)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={13} /> Ant.
                  </button>
                  <button disabled={txs?.page === txs?.lastPage} onClick={() => setTxPage(p => p + 1)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    Sig. <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
