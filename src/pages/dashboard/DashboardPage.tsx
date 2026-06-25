import { useDashboardStats } from './hooks/useDashboardStats';
import { formatCurrency } from '@/lib/utils';
import { Users, Building2, TrendingUp, DollarSign, Activity, UserMinus } from 'lucide-react';
import { DashboardAlerts } from './components/DashboardAlerts';
import { DashboardCharts } from './components/DashboardCharts';

export function DashboardPage() {
  const { data: stats, isLoading, isError, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando estadísticas globales...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <p className="text-red-600 font-medium text-lg">Error al cargar las estadísticas</p>
        <p className="text-red-500 mt-2">{error?.message || 'Error desconocido'}</p>
      </div>
    );
  }

  const { kpis, distributions, alerts } = stats;
  const totalClubs = kpis.totalClubsByStatus.ACTIVE + kpis.totalClubsByStatus.TRIAL + kpis.totalClubsByStatus.PAST_DUE + kpis.totalClubsByStatus.SUSPENDED;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard Global (SaaS)</h1>
      </div>

      {/* Alertas Críticas (Top Widgets) */}
      <DashboardAlerts alerts={alerts} />

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* MRR */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">MRR (Ingreso Recurrente)</p>
              <p className="text-2xl font-bold text-text mt-1">{formatCurrency(kpis.mrr)}</p>
            </div>
            <div className="bg-primary-light p-3 rounded-full">
              <TrendingUp className="text-primary" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Base + Addons de clubes activos
          </p>
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Ingresos (SaaS) Mes Actual</p>
              <p className="text-2xl font-bold text-text mt-1">{formatCurrency(kpis.revenueThisMonth)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Mes anterior: <span className="font-semibold">{formatCurrency(kpis.revenuePreviousMonth)}</span>
          </p>
        </div>

        {/* Clubes Activos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Clubes Activos / Total</p>
              <p className="text-2xl font-bold text-text mt-1">
                {kpis.totalClubsByStatus.ACTIVE} <span className="text-lg text-text-secondary font-normal">/ {totalClubs}</span>
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Building2 className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-text-secondary">
            <span>Conversión: <span className="font-semibold text-text">{kpis.conversionRate}%</span></span>
            <span>Nuevos: <span className="font-semibold text-text">+{kpis.newClubsThisMonth}</span></span>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Churn Rate (Bajas Mes)</p>
              <p className="text-2xl font-bold text-text mt-1">{kpis.churnRate}%</p>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <UserMinus className="text-red-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Clubes suspendidos este mes vs activos
          </p>
        </div>

      </div>

      {/* Gráficos de Distribución */}
      <DashboardCharts distributions={distributions} />

    </div>
  );
}
