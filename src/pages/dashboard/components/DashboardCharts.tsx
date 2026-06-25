import type { DashboardStats } from '@/services/dashboard/dashboard.types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DashboardChartsProps {
  distributions: DashboardStats['distributions'];
}

const COLORS = ['#5BC470', '#A8C94A', '#4AAF5E', '#1A2B1F', '#D97706'];

export function DashboardCharts({ distributions }: DashboardChartsProps) {
  const { byCountry, byPlan, byBillingMethod, bySport } = distributions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Clubes por Plan (Donut Chart) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-text mb-4">Distribución por Plan</h3>
        <div className="h-64">
          {byPlan.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byPlan}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {byPlan.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-text-secondary">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Clubes por País (Bar Chart) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-text mb-4">Clubes por País</h3>
        <div className="h-64">
          {byCountry.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCountry}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#5BC470" radius={[4, 4, 0, 0]} name="Clubes" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-text-secondary">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Clubes por Método de Pago */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-text mb-4">Métodos de Pago</h3>
        <div className="h-64">
          {byBillingMethod.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBillingMethod} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={80} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#A8C94A" radius={[0, 4, 4, 0]} name="Clubes" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-text-secondary">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Clubes por Deporte */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-text mb-4">Distribución por Deporte</h3>
        <div className="h-64">
          {bySport.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bySport}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bySport.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-text-secondary">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
