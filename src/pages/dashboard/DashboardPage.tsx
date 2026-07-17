import { useState } from 'react';
import { useDashboardStats } from './hooks/useDashboardStats';
import { formatCurrency } from '@/lib/utils';
import { Users, Building2, TrendingUp, DollarSign, Activity, UserMinus } from 'lucide-react';
import { DashboardAlerts } from './components/DashboardAlerts';
import { DashboardCharts } from './components/DashboardCharts';
import { MrrDetailsModal } from './components/MrrDetailsModal';
import { ChurnDetailsModal } from './components/ChurnDetailsModal';

export function DashboardPage() {
  const [showMrrModal, setShowMrrModal] = useState(false);
  const [showChurnModal, setShowChurnModal] = useState(false);

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

      {/* Fila 1: KPIs de Volumen e Impacto */}
      <h2 className="text-lg font-bold text-text mb-4 mt-8 border-b border-border pb-2">Crecimiento e Impacto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Jugadores */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Jugadores en la Plataforma</p>
              <p className="text-2xl font-bold text-text mt-1">{kpis.totalPlayers.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            <span className="font-semibold text-text">+{kpis.newPlayersThisMonth}</span> registrados este mes
          </p>
        </div>

        {/* Clubes Registrados */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Clubes Totales (Histórico)</p>
              <p className="text-2xl font-bold text-text mt-1">{totalClubs}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-full">
              <Building2 className="text-indigo-500" size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-text-secondary">
            <span>YTD: <span className="font-semibold text-text">+{kpis.newClubsYtd}</span></span>
            <span>Mes: <span className="font-semibold text-text">+{kpis.newClubsThisMonth}</span></span>
          </div>
        </div>

        {/* Clubes Activos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Clubes Activos (Pagando)</p>
              <p className="text-2xl font-bold text-text mt-1">{kpis.totalClubsByStatus.ACTIVE}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Activity className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Tasa de Conversión: <span className="font-semibold text-text">{kpis.conversionRate}%</span>
          </p>
        </div>

        {/* Churn Rate */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowChurnModal(true)}
        >
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
            Click para ver detalle ({'>'} 15 días sin pago)
          </p>
        </div>
      </div>

      {/* Fila 2: KPIs Financieros (SaaS) */}
      <h2 className="text-lg font-bold text-text mb-4 mt-8 border-b border-border pb-2">Métricas Financieras</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* MRR */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowMrrModal(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">MRR Esperado</p>
              <p className="text-2xl font-bold text-text mt-1">{formatCurrency(kpis.mrr)}</p>
            </div>
            <div className="bg-primary-light p-3 rounded-full">
              <TrendingUp className="text-primary" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Ingreso Recurrente Mensual
          </p>
        </div>

        {/* ARPU */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">ARPU Promedio</p>
              <p className="text-2xl font-bold text-text mt-1">{formatCurrency(kpis.arpu)}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Promedio generado por club activo
          </p>
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Recaudado este Mes</p>
              <p className="text-2xl font-bold text-text mt-1">{formatCurrency(kpis.revenueThisMonth)}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Mes anterior: <span className="font-semibold">{formatCurrency(kpis.revenuePreviousMonth)}</span>
          </p>
        </div>

        {/* Ingresos YTD */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Recaudado YTD (Año)</p>
              <p className="text-2xl font-bold text-text mt-1">{formatCurrency(kpis.revenueYtd)}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-4">
            Desde el 1 de enero
          </p>
        </div>
      </div>

      {/* Gráficos de Distribución */}
      <DashboardCharts distributions={distributions} />

      {/* Modals */}
      {showMrrModal && <MrrDetailsModal onClose={() => setShowMrrModal(false)} />}
      {showChurnModal && <ChurnDetailsModal onClose={() => setShowChurnModal(false)} />}
    </div>
  );
}
