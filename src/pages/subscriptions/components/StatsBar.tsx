import { Building2, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { useSubscriptionStats } from '../hooks/useSubscriptions';

export function StatsBar() {
  const { data: stats, isLoading } = useSubscriptionStats();

  if (isLoading || !stats) {
    return <div className="h-24 animate-pulse bg-surface border border-border rounded-xl"></div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const activeClubs = stats.data?.byBillingStatus?.ACTIVE || 0;
  const trialClubs = stats.data?.byBillingStatus?.TRIAL || 0;
  const pastDueClubs = stats.data?.byBillingStatus?.PAST_DUE || 0;
  const suspendedClubs = stats.data?.byBillingStatus?.SUSPENDED || 0;
  const revenueThisMonth = stats.data?.payments?.thisMonth || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Activos */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-primary">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <p className="text-sm text-text-secondary font-medium">Clubes Activos</p>
          <p className="text-2xl font-bold text-text">{activeClubs}</p>
        </div>
      </div>

      {/* En Trial */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
          <Building2 size={24} />
        </div>
        <div>
          <p className="text-sm text-text-secondary font-medium">En Trial</p>
          <p className="text-2xl font-bold text-text">{trialClubs}</p>
        </div>
      </div>

      {/* En Mora o Suspendidos */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm text-text-secondary font-medium">En Mora / Suspendidos</p>
          <p className="text-2xl font-bold text-text">{pastDueClubs + suspendedClubs}</p>
        </div>
      </div>

      {/* Ingresos Mes */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-sm text-text-secondary font-medium">Ingresos del Mes</p>
          <p className="text-xl font-bold text-text">{formatCurrency(revenueThisMonth)}</p>
        </div>
      </div>
    </div>
  );
}
