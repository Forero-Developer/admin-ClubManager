import type { ReactNode } from 'react';
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
  Legend,
} from 'recharts';
import type { DashboardStats } from '@/services/dashboard/dashboard.types';
import { Card, SectionTitle } from '@/components/ui/Card';
import { BILLING_METHOD } from '@/lib/status';

interface DashboardChartsProps {
  distributions: DashboardStats['distributions'];
}

const COLORS = ['#5BC470', '#A8C94A', '#1A2B1F', '#38BDF8', '#A78BFA', '#F59E0B'];

/** Paleta categórica de tonos bien separados (se distinguen incluso con muchos deportes). */
const CATEGORY_PALETTE = [
  '#16A34A', '#F97316', '#2563EB', '#EAB308', '#DB2777', '#0891B2',
  '#7C3AED', '#DC2626', '#65A30D', '#0D9488', '#C026D3', '#78716C',
];

/** Color fijo por deporte: el mismo deporte siempre sale del mismo color. */
const SPORT_COLORS: Record<string, string> = {
  futbol: '#16A34A',
  'futbol sala': '#65A30D',
  microfutbol: '#65A30D',
  baloncesto: '#F97316',
  basketball: '#F97316',
  voleibol: '#EAB308',
  voleyball: '#EAB308',
  natacion: '#0891B2',
  tenis: '#84CC16',
  patinaje: '#7C3AED',
  atletismo: '#DB2777',
  beisbol: '#DC2626',
  softbol: '#E11D48',
  rugby: '#92400E',
  gimnasia: '#C026D3',
  ciclismo: '#2563EB',
  taekwondo: '#1E3A8A',
  karate: '#334155',
  judo: '#475569',
  boxeo: '#B91C1C',
  ajedrez: '#57534E',
  'varios/ninguno': '#94A3B8',
};

// Minúsculas y sin tildes: "Fútbol" y "futbol" son el mismo deporte
const normalize = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

function colorForCategory(name: string): string {
  const known = SPORT_COLORS[normalize(name)];
  if (known) return known;
  // Deportes nuevos: color estable según el nombre (no según el orden)
  let hash = 0;
  for (const ch of normalize(name)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #D8EAD8',
  boxShadow: '0 10px 30px -10px rgba(15,31,18,0.2)',
  fontSize: 12,
};

function ChartCard({ title, children, empty }: { title: string; children: ReactNode; empty: boolean }) {
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-text">{title}</h3>
      <div className="h-56 sm:h-64">
        {empty ? (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">Sin datos todavía</div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

function Donut({
  data,
  offset = 0,
  colorFor,
}: {
  data: { name: string; value: number }[];
  offset?: number;
  colorFor?: (name: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} innerRadius="55%" outerRadius="78%" paddingAngle={4} dataKey="value" stroke="none">
          {data.map((d, i) => (
            <Cell key={d.name} fill={colorFor ? colorFor(d.name) : COLORS[(i + offset) % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DashboardCharts({ distributions }: DashboardChartsProps) {
  const { byCountry, byPlan, byBillingMethod, bySport } = distributions;
  const methods = byBillingMethod.map((m) => ({ ...m, name: BILLING_METHOD[m.name] ?? m.name }));

  return (
    <section>
      <SectionTitle>Distribución de clubes</SectionTitle>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <ChartCard title="Por plan" empty={byPlan.length === 0}>
          <Donut data={byPlan} />
        </ChartCard>

        <ChartCard title="Por país" empty={byCountry.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCountry} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7F1E7" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: '#EEF8F0' }} />
              <Bar dataKey="value" fill="#5BC470" radius={[8, 8, 0, 0]} name="Clubes" maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Por método de pago" empty={methods.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={methods} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7F1E7" />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <YAxis dataKey="name" type="category" width={96} tickLine={false} axisLine={false} fontSize={12} />
              <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: '#F5FAE8' }} />
              <Bar dataKey="value" fill="#A8C94A" radius={[0, 8, 8, 0]} name="Clubes" maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Por deporte" empty={bySport.length === 0}>
          <Donut data={[...bySport].sort((a, b) => b.value - a.value)} colorFor={colorForCategory} />
        </ChartCard>
      </div>
    </section>
  );
}
