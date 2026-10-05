import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronRight, Clock, PauseCircle, Search, Wallet, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, EmptyState, StatCard } from '@/components/ui/Card';
import { formatCurrency, formatDate, formatRelative, MONTH_NAMES } from '@/lib/format';
import type { CollectionBucket, CollectionClub } from '@/services/dashboard/dashboard.types';
import { cn } from '@/lib/utils';
import { useCollections } from './hooks/useCollections';

type Tab = 'PENDING' | CollectionBucket;

const ALL_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const BUCKET: Record<CollectionBucket, { label: string; tone: 'success' | 'warning' | 'danger' | 'info'; icon: ReactNode; accent: string }> = {
  PAID: { label: 'Pagó', tone: 'success', icon: <CheckCircle2 size={18} />, accent: 'bg-emerald-50 text-emerald-600' },
  UPCOMING: { label: 'Por vencer', tone: 'info', icon: <CalendarClock size={18} />, accent: 'bg-sky-50 text-sky-600' },
  PAST_DUE: { label: 'En gracia', tone: 'warning', icon: <AlertTriangle size={18} />, accent: 'bg-amber-50 text-amber-600' },
  SUSPENDED: { label: 'Dejó de pagar', tone: 'danger', icon: <PauseCircle size={18} />, accent: 'bg-rose-50 text-rose-600' },
};

/** Fecha clave de cada estado: cuándo pagó, cuándo vence o desde cuándo no paga. */
function KeyDate({ club }: { club: CollectionClub }) {
  const [label, date, danger] =
    club.bucket === 'PAID'
      ? ['Pagó', club.paidAt, false]
      : club.bucket === 'UPCOMING'
        ? ['Vence', club.dueDate, false]
        : club.bucket === 'PAST_DUE'
          ? ['Se suspende', club.graceEndsAt ?? club.dueDate, true]
          : ['Venció', club.dueDate, true];
  return (
    <div className="text-right">
      <p className="text-[11px] text-text-secondary">{label}</p>
      <p className={cn('text-sm font-semibold', danger ? 'text-rose-600' : 'text-text')}>{formatDate(date)}</p>
      <p className="text-[11px] text-text-secondary">{formatRelative(date)}</p>
    </div>
  );
}

function ClubRow({ club, index }: { club: CollectionClub; index: number }) {
  const meta = BUCKET[club.bucket];
  const owes = club.bucket !== 'PAID';

  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}>
      <Card className="group p-4 transition hover:border-primary/40 hover:shadow-md">
        <Link to={`/clubs/${club.id}`} className="flex items-center gap-3">
          {club.logoUrl ? (
            <img src={club.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover" />
          ) : (
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', meta.accent)}>{meta.icon}</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-text group-hover:text-primary-hover">{club.name}</p>
            <p className="truncate text-xs text-text-secondary">{club.email ?? 'Sin correo'}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge tone={meta.tone} dot>
                {meta.label}
              </Badge>
              {club.hasPendingPayment && <Badge tone="warning">Transferencia por aprobar</Badge>}
            </div>
          </div>
          <KeyDate club={club} />
          <ChevronRight size={16} className="hidden shrink-0 text-text-secondary/40 transition group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-border/60 pt-3">
          <div>
            <p className="text-[11px] text-text-secondary">{owes ? 'Espera cobrar' : 'Pagado'}</p>
            <p className="text-base font-bold text-text">{formatCurrency(club.amount, club.currency)}</p>
            <p className="text-[11px] text-text-secondary">
              {club.billablePlayers} deportistas{club.planName ? ` · ${club.planName}` : ''}
              {owes && club.lastPaymentAt && ` · último pago ${formatRelative(club.lastPaymentAt)}`}
            </p>
          </div>
          {owes && (
            <Link
              to={`/clubs/${club.id}/register-payment`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white shadow-sm shadow-primary/30 transition hover:bg-primary-hover active:scale-[0.98]"
            >
              <Wallet size={14} /> Registrar pago
            </Link>
          )}
        </div>
      </Card>
    </motion.li>
  );
}

export function CollectionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  
  const { data, isLoading, isError } = useCollections(selectedMonth, selectedYear);
  const [tab, setTab] = useState<Tab>('PENDING');
  const [search, setSearch] = useState('');

  const clubs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.clubs ?? []).filter(
      (c) =>
        (tab === 'PENDING' ? c.bucket === 'UPCOMING' || c.bucket === 'PAST_DUE' : c.bucket === tab) &&
        (!term || c.name.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term)),
    );
  }, [data, tab, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-2xl bg-border/50" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-border/50" />
          ))}
        </div>
      </div>
    );
  }
  if (isError || !data) {
    return <div className="rounded-2xl bg-rose-50 py-12 text-center text-rose-700">Error al cargar los cobros del mes.</div>;
  }

  const { summary: s, currency } = data;
  const money = (v: number) => formatCurrency(v, currency);
  const pct = (v: number) => (s.expected > 0 ? (v / s.expected) * 100 : 0);
  const monthName = MONTH_NAMES[data.month - 1];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'PENDING', label: 'Por cobrar', count: s.counts.upcoming + s.counts.pastDue },
    { key: 'PAST_DUE', label: 'En gracia', count: s.counts.pastDue },
    { key: 'UPCOMING', label: 'Por vencer', count: s.counts.upcoming },
    { key: 'SUSPENDED', label: 'Dejaron de pagar', count: s.counts.suspended },
    { key: 'PAID', label: 'Pagaron', count: s.counts.paid },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Cobros de {monthName}</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Quién ya pagó, quién falta y cuánto esperas recaudar este mes.
          </p>
        </div>
        
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            {ALL_MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Avance del recaudo */}
      <Card className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-text-secondary">Recaudado de lo esperado</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-text">
              {money(s.collected)} <span className="text-base font-medium text-text-secondary">de {money(s.expected)}</span>
            </p>
          </div>
          <p className="text-3xl font-black text-primary-hover">{s.collectionRate}%</p>
        </div>
        <div className="relative mt-4 flex h-3 overflow-hidden rounded-full bg-bg">
          {[
            { v: s.collected, c: 'bg-emerald-500' },
            { v: s.pastDue, c: 'bg-amber-400' },
            { v: s.upcoming, c: 'bg-sky-400' },
          ].map((seg, i) => (
            <motion.div key={i} className={seg.c} initial={{ width: 0 }} animate={{ width: `${pct(seg.v)}%` }} transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }} />
          ))}
        </div>
        <div className="relative mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Pagado {money(s.collected)}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />En gracia {money(s.pastDue)}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />Por vencer {money(s.upcoming)}</span>
        </div>
        <p className="relative mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock size={13} /> Te falta cobrar <span className="font-semibold text-text">{money(s.pending)}</span> este mes.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard index={0} label="Pagaron" value={s.counts.paid} hint={money(s.collected)} icon={<CheckCircle2 size={18} />} accent="emerald" onClick={() => setTab('PAID')} actionLabel="Ver clubes" />
        <StatCard index={1} label="En gracia" value={s.counts.pastDue} hint={`${money(s.pastDue)} · ya vencieron`} icon={<AlertTriangle size={18} />} accent="amber" onClick={() => setTab('PAST_DUE')} actionLabel="Ver clubes" />
        <StatCard index={2} label="Por vencer" value={s.counts.upcoming} hint={`${money(s.upcoming)} · antes de fin de mes`} icon={<CalendarClock size={18} />} accent="sky" onClick={() => setTab('UPCOMING')} actionLabel="Ver clubes" />
        <StatCard index={3} label="Dejaron de pagar" value={s.counts.suspended} hint={`${money(s.recoverable)} recuperables`} icon={<PauseCircle size={18} />} accent="rose" onClick={() => setTab('SUSPENDED')} actionLabel="Ver clubes" />
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                tab === t.key ? 'text-white' : 'bg-surface text-text-secondary ring-1 ring-inset ring-border hover:text-text',
              )}
            >
              {tab === t.key && <motion.span layoutId="collections-tab" className="absolute inset-0 rounded-full bg-primary" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">
                {t.label} <span className={cn('ml-0.5 text-xs', tab === t.key ? 'text-white/80' : 'text-text-secondary/70')}>{t.count}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            placeholder="Buscar club por nombre o correo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Limpiar" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary hover:bg-bg">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          icon={<Wallet size={22} />}
          title={tab === 'PENDING' ? '¡Todo cobrado este mes!' : 'No hay clubes aquí'}
          description={tab === 'SUSPENDED' ? 'Clubes que pagaban y se suspendieron en los últimos 60 días.' : undefined}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {clubs.map((club, i) => (
            <ClubRow key={club.id} club={club} index={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
