import { Building2, AlertTriangle, CheckCircle2, DollarSign, Clock, XCircle, TrendingUp, Hourglass } from 'lucide-react';
import { useSubscriptionStats } from '../hooks/useSubscriptions';

export function StatsBar() {
  const { data: stats, isLoading } = useSubscriptionStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-surface border border-border rounded-xl" />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

  // byStatus = club.status (TRIAL, ACTIVE, PAST_DUE, SUSPENDED) — use for status display
  const activeClubs    = stats.byStatus?.ACTIVE    || 0;
  const trialClubs     = stats.byStatus?.TRIAL     || 0;
  const pastDueClubs   = stats.byStatus?.PAST_DUE  || 0;
  const suspendedClubs = stats.byStatus?.SUSPENDED || 0;
  const revenueThisMonth = stats.payments?.thisMonth      || 0;
  const totalRevenue     = stats.payments?.totalRevenue   || 0;
  const pendingCount     = stats.payments?.pendingCount   || 0;

  const cards = [
    {
      label: 'Clubes Activos',
      value: activeClubs.toString(),
      sub: `${trialClubs} en trial`,
      icon: <CheckCircle2 size={22} />,
      iconBg: 'bg-success/10 text-success',
      accent: 'border-success/20',
    },
    {
      label: 'En Mora / Suspendidos',
      value: (pastDueClubs + suspendedClubs).toString(),
      sub: `${pastDueClubs} mora · ${suspendedClubs} susp.`,
      icon: <AlertTriangle size={22} />,
      iconBg: 'bg-amber-100 text-amber-600',
      accent: pastDueClubs + suspendedClubs > 0 ? 'border-amber-200' : 'border-border',
    },
    {
      label: 'Ingresos del Mes',
      value: formatCurrency(revenueThisMonth),
      sub: pendingCount > 0 ? `${pendingCount} pago${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''}` : 'Todo al día',
      icon: <DollarSign size={22} />,
      iconBg: 'bg-primary-light text-primary',
      accent: 'border-primary/20',
    },
    {
      label: 'Ingresos Totales',
      value: formatCurrency(totalRevenue),
      sub: `${activeClubs + trialClubs + pastDueClubs + suspendedClubs} clubes en total`,
      icon: <TrendingUp size={22} />,
      iconBg: 'bg-blue-50 text-blue-600',
      accent: 'border-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${card.accent}`}
        >
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-secondary font-medium truncate">{card.label}</p>
            <p className="text-xl font-bold text-text leading-tight truncate">{card.value}</p>
            <p className="text-[10px] text-text-secondary truncate">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
