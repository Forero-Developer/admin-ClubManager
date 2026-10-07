import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, Activity, UserMinus, Wallet, CalendarRange, ArrowUpRight, ArrowDownRight, ChevronRight, ShieldAlert, FlaskConical, Trophy } from 'lucide-react';
import { useDashboardStats } from './hooks/useDashboardStats';
import { formatCurrency, formatNumber } from '@/lib/format';
import { StatCard, SectionTitle } from '@/components/ui/Card';
import { DashboardAlerts } from './components/DashboardAlerts';
import { DashboardCharts } from './components/DashboardCharts';
import { MrrDetailsModal } from './components/MrrDetailsModal';
import { ChurnDetailsModal } from './components/ChurnDetailsModal';

function DeltaPill({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null;
  const delta = ((current - previous) / previous) * 100;
  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}

const ALL_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function DashboardPage() {
  const [showMrrModal, setShowMrrModal] = useState(false);
  const [showChurnModal, setShowChurnModal] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const { data: stats, isLoading, isError, error } = useDashboardStats(selectedMonth, selectedYear);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-border/60" />
        <div className="h-52 animate-pulse rounded-3xl bg-border/60" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-border/60" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-2xl bg-rose-50 p-6 text-center">
        <p className="text-lg font-medium text-rose-700">Error al cargar las estadísticas</p>
        <p className="mt-2 text-rose-600">{error?.message || 'Error desconocido'}</p>
      </div>
    );
  }

  const { kpis, distributions, alerts } = stats;
  const s = kpis.totalClubsByStatus;
  const totalClubs = s.ACTIVE + s.TRIAL + s.PAST_DUE + s.SUSPENDED;
  const currency = kpis.mrrCurrency ?? 'COP';
  const payingClubs = kpis.payingClubs ?? s.ACTIVE;
  const mrrAtRisk = kpis.mrrAtRisk ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Así va la plataforma.</p>
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

      {/* MRR esperado: la métrica principal, explicada en la misma tarjeta */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-sidebar p-5 text-white shadow-xl shadow-sidebar/20 sm:p-7"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">MRR esperado</p>
            <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              {formatCurrency(kpis.mrr, currency)}
              <span className="ml-1 text-base font-semibold text-white/50">/ mes</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Lo que suman al mes los clubes al día: su plan PRO más los packs que necesitan según los deportistas
              que tienen hoy. Si un club crece, su pack extra ya cuenta aquí.
            </p>
          </div>

          <button
            onClick={() => setShowMrrModal(true)}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-sidebar shadow-lg shadow-primary/30 transition hover:bg-primary-hover active:scale-[0.98]"
          >
            Ver club por club
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
            <p className="text-xs text-white/60">Clubes pagando</p>
            <p className="mt-1 text-xl font-bold">{formatNumber(payingClubs)}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
            <p className="text-xs text-white/60">Promedio por club</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(kpis.arpu, currency)}</p>
          </div>
          <div className="col-span-2 rounded-2xl bg-amber-400/10 p-3.5 ring-1 ring-amber-300/20 sm:col-span-1">
            <p className="flex items-center gap-1.5 text-xs text-amber-200">
              <ShieldAlert size={13} /> En riesgo · {formatNumber(alerts.pastDueClubs)} en gracia
            </p>
            <p className="mt-1 text-xl font-bold text-amber-100">{formatCurrency(mrrAtRisk, currency)}</p>
          </div>
        </div>
      </motion.section>

      {stats.internal && stats.internal.clubs > 0 && (
        <Link
          to="/clubs?internal=only"
          className="group -mt-4 flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-900 ring-1 ring-inset ring-violet-200 transition hover:shadow-md"
        >
          <FlaskConical size={18} className="shrink-0 text-violet-600" />
          <span className="min-w-0 flex-1">
            <b>{stats.internal.clubs} club{stats.internal.clubs > 1 ? 'es' : ''} tuyo{stats.internal.clubs > 1 ? 's' : ''}</b> cobraron{' '}
            {formatCurrency(stats.internal.revenueThisMonth, currency)} este mes. No cuentan en ninguna cifra de aquí.
          </span>
          <ChevronRight size={16} className="shrink-0 opacity-50 transition group-hover:translate-x-0.5" />
        </Link>
      )}

      {stats.tournaments && stats.tournaments.totalClubs > 0 && (
        <div className="group -mt-4 flex flex-col gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-200 transition hover:shadow-md sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="shrink-0 text-amber-600" />
            <span className="font-medium">
              <b>{stats.tournaments.totalClubs} club{stats.tournaments.totalClubs > 1 ? 'es' : ''} de torneos</b> (excluidos del MRR).
            </span>
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-amber-800/80 sm:justify-end">
            <span>+{stats.tournaments.newThisMonth} nuevos este mes</span>
            <span className="flex items-center gap-1 font-semibold text-amber-700">
              <ArrowUpRight size={14} />
              {stats.tournaments.convertedToClient} convertidos a SaaS ({stats.tournaments.convertedToClientThisMonth} este mes)
            </span>
          </div>
        </div>
      )}

      <section>
        <SectionTitle>Requiere atención</SectionTitle>
        <DashboardAlerts alerts={alerts} />
      </section>

      <section>
        <SectionTitle>Crecimiento</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            index={0}
            label="Deportistas"
            value={formatNumber(kpis.totalPlayers)}
            hint={<><span className="font-semibold text-text">+{formatNumber(kpis.newPlayersThisMonth)}</span> este mes</>}
            icon={<Users size={18} />}
            accent="sky"
          />
          <StatCard
            index={1}
            label="Clubes registrados"
            value={formatNumber(totalClubs)}
            hint={<>+{kpis.newClubsThisMonth} este mes · +{kpis.newClubsYtd} en el año</>}
            icon={<Building2 size={18} />}
            accent="violet"
          />
          <StatCard
            index={2}
            label="Clubes activos"
            value={formatNumber(s.ACTIVE)}
            hint={<>Conversión <span className="font-semibold text-text">{kpis.conversionRate}%</span> · {s.TRIAL} en prueba</>}
            icon={<Activity size={18} />}
            accent="emerald"
          />
          <StatCard
            index={3}
            label="Churn del mes"
            value={`${kpis.churnRate}%`}
            hint="Suspendidos hace más de 15 días"
            icon={<UserMinus size={18} />}
            accent="rose"
            onClick={() => setShowChurnModal(true)}
            actionLabel="Ver clubes"
          />
        </div>
      </section>

      <section>
        <SectionTitle>Recaudo real</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
          <StatCard
            index={0}
            label="Recaudado este mes"
            value={formatCurrency(kpis.revenueThisMonth, currency)}
            hint={
              <span className="flex flex-wrap items-center gap-1.5">
                Mes anterior {formatCurrency(kpis.revenuePreviousMonth, currency)}
                <DeltaPill current={kpis.revenueThisMonth} previous={kpis.revenuePreviousMonth} />
              </span>
            }
            icon={<Wallet size={18} />}
            accent="emerald"
          />
          <StatCard
            index={1}
            label="Recaudado en el año"
            value={formatCurrency(kpis.revenueYtd, currency)}
            hint="Desde el 1 de enero"
            icon={<CalendarRange size={18} />}
            accent="primary"
          />
        </div>
      </section>

      <DashboardCharts distributions={distributions} />

      <MrrDetailsModal open={showMrrModal} onClose={() => setShowMrrModal(false)} mrr={kpis.mrr} currency={currency} />
      <ChurnDetailsModal open={showChurnModal} onClose={() => setShowChurnModal(false)} />
    </div>
  );
}
