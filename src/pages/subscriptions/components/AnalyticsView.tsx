import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis,
} from 'recharts';
import {
  TrendingUp, Wallet, Users, Coins, Lightbulb, ShieldAlert, Crown, MessageCircle, FlaskConical, ChevronRight, Filter,
} from 'lucide-react';
import { StatCard, SectionTitle, Card, EmptyState } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { CLUB_STATUS } from '@/lib/status';
import { formatCurrency, formatNumber, MONTH_NAMES } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SubscriptionAnalytics } from '@/services/subscriptions/subscriptions.types';

const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;
const short = (v: number) =>
  new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

type Tone = 'good' | 'warn' | 'bad' | 'info';
interface Insight {
  tone: Tone;
  title: string;
  detail: string;
}

/** Hallazgos clave redactados a partir de los datos (lo que un analista te diría). */
function buildInsights(a: SubscriptionAnalytics): Insight[] {
  const out: Insight[] = [];
  const cur = a.currency;
  const { expected, collection, concentration, funnel, priceTiers, monthlyRevenue } = a;

  if (expected.payingClubs === 0) {
    return [{ tone: 'info', title: 'Aún no hay clubes pagando', detail: 'Cuando el primer club pague, aquí verás el análisis.' }];
  }

  // Cobro del mes
  const rate = collection.rate;
  out.push({
    tone: rate >= 0.8 ? 'good' : rate >= 0.5 ? 'info' : 'warn',
    title: `Has cobrado el ${pct(rate)} de lo esperado este mes`,
    detail: `${formatCurrency(collection.collectedThisMonth, cur)} de ${formatCurrency(expected.mrr, cur)} en mensualidades de ${MONTH_NAMES[collection.month - 1].toLowerCase()}.`,
  });

  // Riesgo
  if (expected.pastDueClubs > 0) {
    out.push({
      tone: 'warn',
      title: `${expected.pastDueClubs} club${expected.pastDueClubs > 1 ? 'es' : ''} en gracia: ${formatCurrency(expected.mrrAtRisk, cur)} en riesgo`,
      detail: 'Venció su mes y aún no pagan. Un recordatorio a tiempo evita la suspensión.',
    });
  }

  // Packs: cuánto del MRR viene del crecimiento de los clubes
  const withPacks = priceTiers.filter((t) => t.packs > 0);
  const packsMrrShare = withPacks.reduce((s, t) => s + t.shareOfMrr, 0);
  const packsClubsShare = withPacks.reduce((s, t) => s + t.shareOfClubs, 0);
  if (withPacks.length > 0) {
    out.push({
      tone: 'good',
      title: `El ${pct(packsMrrShare)} de tu MRR lo generan clubes con packs extra`,
      detail: `Son el ${pct(packsClubsShare)} de los clubes: cuando un club crece en deportistas, tu ingreso crece con él.`,
    });
  }

  // Concentración
  if (expected.payingClubs >= 5) {
    const c = concentration.top5Share;
    out.push({
      tone: c > 0.5 ? 'bad' : c > 0.35 ? 'warn' : 'good',
      title: `Tus 5 clubes más grandes aportan el ${pct(c)} del MRR`,
      detail:
        c > 0.5
          ? 'Alta dependencia: perder uno de ellos se nota mucho. Vale la pena cuidarlos de cerca.'
          : 'Ingreso bien repartido: no dependes de pocos clubes.',
    });
  }

  // Tendencia de recaudo (último mes cerrado vs anterior)
  const closed = monthlyRevenue.slice(-3, -1);
  if (closed.length === 2 && closed[0].amount > 0) {
    const d = (closed[1].amount - closed[0].amount) / closed[0].amount;
    out.push({
      tone: d >= 0 ? 'good' : 'warn',
      title: `${MONTH_NAMES[closed[1].month - 1]} cerró ${d >= 0 ? '+' : ''}${pct(d)} vs ${MONTH_NAMES[closed[0].month - 1].toLowerCase()}`,
      detail: `${formatCurrency(closed[1].amount, cur)} recaudados frente a ${formatCurrency(closed[0].amount, cur)}.`,
    });
  }

  // Embudo
  if (funnel.registered > 0) {
    out.push({
      tone: funnel.conversionRate >= 0.3 ? 'good' : 'info',
      title: `${funnel.everPaid} de ${funnel.registered} clubes registrados ha pagado alguna vez (${pct(funnel.conversionRate)})`,
      detail: `Hoy hay ${funnel.trialsNow} en prueba: son tu próxima fuente de ingresos.`,
    });
  }

  // Valor por deportista
  out.push({
    tone: 'info',
    title: `Cada deportista te deja ${formatCurrency(expected.revenuePerPlayer, cur)} al mes`,
    detail: `En promedio un club paga ${formatCurrency(expected.arpu, cur)} y tiene ${expected.avgPlayersPerClub} deportistas.`,
  });

  return out;
}

const INSIGHT_TONE: Record<Tone, string> = {
  good: 'bg-emerald-50 ring-emerald-200/70 [&_svg]:text-emerald-600',
  warn: 'bg-amber-50 ring-amber-200/70 [&_svg]:text-amber-600',
  bad: 'bg-rose-50 ring-rose-200/70 [&_svg]:text-rose-600',
  info: 'bg-sky-50 ring-sky-200/70 [&_svg]:text-sky-600',
};

function Bar2({ value, className }: { value: number; className: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-bg">
      <motion.div
        className={cn('h-full rounded-full', className)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

function PriceTiers({ a }: { a: SubscriptionAnalytics }) {
  if (a.priceTiers.length === 0) {
    return <EmptyState icon={<Coins size={22} />} title="Sin clubes pagando todavía" />;
  }
  return (
    <div className="space-y-3">
      {a.priceTiers.map((t, i) => (
        <motion.div
          key={t.packs}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-border/70 p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-semibold text-text">
                {t.label} <span className="text-sm font-normal text-text-secondary">· {t.playersRange} deportistas</span>
              </p>
              <p className="text-xs text-text-secondary">Pagan en promedio {formatCurrency(t.avgAmount, a.currency)}/mes · {t.avgPlayers} deportistas</p>
            </div>
            <p className="text-right">
              <span className="text-lg font-bold text-text">{t.clubs}</span>
              <span className="ml-1 text-sm text-text-secondary">club{t.clubs === 1 ? '' : 'es'}</span>
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-text-secondary">
                <span>de los clubes</span>
                <span className="font-semibold text-text">{pct(t.shareOfClubs)}</span>
              </div>
              <Bar2 value={t.shareOfClubs} className="bg-sky-400" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-text-secondary">
                <span>del MRR · {formatCurrency(t.mrr, a.currency)}</span>
                <span className="font-semibold text-text">{pct(t.shareOfMrr)}</span>
              </div>
              <Bar2 value={t.shareOfMrr} className="bg-primary" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RevenueChart({ a }: { a: SubscriptionAnalytics }) {
  const data = a.monthlyRevenue.map((m) => ({
    label: `${MONTH_NAMES[m.month - 1].slice(0, 3)} ${String(m.year).slice(2)}`,
    Mensualidades: m.subscriptions,
    Extras: m.extras,
  }));
  const hasData = data.some((d) => d.Mensualidades + d.Extras > 0);
  if (!hasData) return <div className="flex h-64 items-center justify-center text-sm text-text-secondary">Aún no hay pagos en los últimos 12 meses</div>;

  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7F1E7" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval="preserveStartEnd" />
          <YAxis tickFormatter={short} tickLine={false} axisLine={false} fontSize={11} width={48} />
          <RechartsTooltip
            cursor={{ fill: '#EEF8F0' }}
            formatter={(v) => formatCurrency(Number(v), a.currency)}
            contentStyle={{ borderRadius: 12, border: '1px solid #D8EAD8', fontSize: 12, boxShadow: '0 10px 30px -10px rgba(15,31,18,0.2)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Mensualidades" stackId="r" fill="#5BC470" maxBarSize={36} />
          <Bar dataKey="Extras" stackId="r" fill="#A78BFA" radius={[8, 8, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ListCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
        {icon} {title}
      </p>
      {children}
    </Card>
  );
}

export function AnalyticsView({ analytics, isLoading }: { analytics?: SubscriptionAnalytics; isLoading: boolean }) {
  const [showAllInsights, setShowAllInsights] = useState(false);

  if (isLoading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-border/50" />)}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-border/50" />
      </div>
    );
  }

  const a = analytics;
  const cur = a.currency;
  const insights = buildInsights(a);
  const visible = showAllInsights ? insights : insights.slice(0, 4);

  return (
    <div className="space-y-8">
      {a.internal.clubs.length > 0 && (
        <p className="flex items-center gap-2 rounded-2xl bg-bg px-4 py-2.5 text-xs text-text-secondary">
          <Filter size={14} className="shrink-0" />
          Estas métricas son solo de clientes: excluyen {a.internal.clubs.length} club{a.internal.clubs.length > 1 ? 'es' : ''} tuyo{a.internal.clubs.length > 1 ? 's' : ''} (ver abajo).
        </p>
      )}

      <section>
        <SectionTitle>Lo esencial</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            index={0}
            label="MRR esperado"
            value={formatCurrency(a.expected.mrr, cur)}
            hint={<>{a.expected.payingClubs} clubes pagando{a.expected.mrrAtRisk > 0 && <> · <span className="text-amber-600">{formatCurrency(a.expected.mrrAtRisk, cur)} en riesgo</span></>}</>}
            icon={<TrendingUp size={18} />}
            accent="primary"
          />
          <StatCard
            index={1}
            label="Cobrado este mes"
            value={formatCurrency(a.collection.collectedThisMonth, cur)}
            hint={
              <div className="space-y-1.5">
                <span>{pct(a.collection.rate)} de lo esperado</span>
                <Bar2 value={a.collection.rate} className={a.collection.rate >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'} />
              </div>
            }
            icon={<Wallet size={18} />}
            accent="emerald"
          />
          <StatCard
            index={2}
            label="Promedio por club"
            value={formatCurrency(a.expected.arpu, cur)}
            hint={`${a.expected.avgPlayersPerClub} deportistas en promedio`}
            icon={<Coins size={18} />}
            accent="violet"
          />
          <StatCard
            index={3}
            label="Por deportista"
            value={formatCurrency(a.expected.revenuePerPlayer, cur)}
            hint={`${formatNumber(a.expected.billablePlayers)} deportistas facturables`}
            icon={<Users size={18} />}
            accent="sky"
          />
        </div>
      </section>

      <section>
        <SectionTitle>Hallazgos</SectionTitle>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visible.map((ins, i) => (
            <motion.div
              key={ins.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn('flex gap-3 rounded-2xl p-4 ring-1 ring-inset', INSIGHT_TONE[ins.tone])}
            >
              {ins.tone === 'warn' || ins.tone === 'bad' ? <ShieldAlert size={18} className="mt-0.5 shrink-0" /> : <Lightbulb size={18} className="mt-0.5 shrink-0" />}
              <div>
                <p className="text-sm font-semibold text-text">{ins.title}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{ins.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
        {insights.length > 4 && (
          <button onClick={() => setShowAllInsights((v) => !v)} className="mt-3 text-sm font-semibold text-primary-hover">
            {showAllInsights ? 'Ver menos' : `Ver ${insights.length - 4} más`}
          </button>
        )}
      </section>

      <section>
        <SectionTitle>¿Cuánto paga cada club?</SectionTitle>
        <p className="-mt-1 mb-3 text-xs text-text-secondary">
          Agrupados por los packs que necesitan según sus deportistas de hoy (plan de 30 + packs de 10).
        </p>
        <PriceTiers a={a} />
      </section>

      <section>
        <SectionTitle>Histórico de ingresos · 12 meses</SectionTitle>
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-text-secondary">Recaudo real por mes contable</p>
            <p className="text-sm">
              <span className="text-text-secondary">Total histórico </span>
              <span className="font-bold text-text">{formatCurrency(a.totals.totalRevenue, cur)}</span>
            </p>
          </div>
          <RevenueChart a={a} />
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListCard title={`Clubes que más pagan · top 5 = ${pct(a.concentration.top5Share)} del MRR`} icon={<Crown size={16} className="text-amber-500" />}>
          {a.concentration.topClubs.length === 0 ? (
            <p className="text-sm text-text-secondary">Sin datos.</p>
          ) : (
            <ul className="space-y-1">
              {a.concentration.topClubs.map((c, i) => (
                <li key={c.id}>
                  <Link to={`/clubs/${c.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-bg">
                    <span className="w-5 text-center text-xs font-bold text-text-secondary">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">{c.name}</p>
                      <p className="text-[11px] text-text-secondary">{c.billablePlayers} deportistas · {c.packs} pack{c.packs === 1 ? '' : 's'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text">{formatCurrency(c.total, cur)}</p>
                      <p className="text-[11px] text-text-secondary">{pct(c.share, 1)}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-secondary/40 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ListCard>

        <ListCard title="Embudo de clubes" icon={<Users size={16} className="text-sky-500" />}>
          {[
            { label: 'Registrados', value: a.funnel.registered, of: a.funnel.registered, cls: 'bg-slate-300' },
            { label: 'Han pagado alguna vez', value: a.funnel.everPaid, of: a.funnel.registered, cls: 'bg-sky-400' },
            { label: 'Pagando hoy', value: a.funnel.payingNow, of: a.funnel.registered, cls: 'bg-primary' },
            { label: 'En prueba ahora', value: a.funnel.trialsNow, of: a.funnel.registered, cls: 'bg-violet-400' },
          ].map((row) => (
            <div key={row.label} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-semibold text-text">
                  {row.value} <span className="text-xs font-normal text-text-secondary">{row.of ? pct(row.value / row.of) : ''}</span>
                </span>
              </div>
              <Bar2 value={row.of ? row.value / row.of : 0} className={row.cls} />
            </div>
          ))}
        </ListCard>
      </div>

      <section>
        <SectionTitle>Extras (pagos únicos)</SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ListCard title={`Lo más vendido · ${formatCurrency(a.totals.extrasRevenue, cur)} en total`} icon={<MessageCircle size={16} className="text-violet-500" />}>
            {a.extras.performance.length === 0 ? (
              <p className="text-sm text-text-secondary">Todavía no se han vendido extras.</p>
            ) : (
              <ul className="space-y-2">
                {a.extras.performance.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-text">{e.name}</span>
                    <span className="shrink-0 text-text-secondary">{e.count} ventas · <b className="text-text">{formatCurrency(e.revenue, cur)}</b></span>
                  </li>
                ))}
              </ul>
            )}
          </ListCard>
          <ListCard title="Clubes que más compran extras" icon={<Crown size={16} className="text-violet-500" />}>
            {a.extras.topClubs.length === 0 ? (
              <p className="text-sm text-text-secondary">Sin compras todavía.</p>
            ) : (
              <ul className="space-y-1">
                {a.extras.topClubs.map((c) => (
                  <li key={c.clubId}>
                    <Link to={`/clubs/${c.clubId}`} className="flex items-center justify-between gap-3 rounded-xl p-2 text-sm transition hover:bg-bg">
                      <span className="min-w-0 truncate text-text">{c.clubName}</span>
                      <span className="shrink-0 text-text-secondary">{c.count} · <b className="text-text">{formatCurrency(c.revenue, cur)}</b></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </ListCard>
        </div>
      </section>

      <section>
        <SectionTitle>Tus clubes (propios / de prueba)</SectionTitle>
        <Card className="p-4 sm:p-5">
          {a.internal.clubs.length === 0 ? (
            <div className="flex gap-3 text-sm text-text-secondary">
              <FlaskConical size={18} className="mt-0.5 shrink-0 text-violet-500" />
              <p>
                Aún no marcas ningún club como tuyo. Desde el detalle de un club, en <b>Más → Marcar como club propio</b>, sus pagos de prueba dejan
                de contar como ingresos de clientes y aparecen aquí.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-violet-50 p-3">
                  <p className="text-[11px] text-violet-700">Cobrado este mes</p>
                  <p className="font-bold text-text">{formatCurrency(a.internal.revenueThisMonth, cur)}</p>
                  <p className="text-[11px] text-text-secondary">{a.internal.paymentsThisMonth} pagos</p>
                </div>
                <div className="rounded-2xl bg-violet-50 p-3">
                  <p className="text-[11px] text-violet-700">Total histórico</p>
                  <p className="font-bold text-text">{formatCurrency(a.internal.revenueAllTime, cur)}</p>
                  <p className="text-[11px] text-text-secondary">{a.internal.paymentsAllTime} pagos</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-violet-50 p-3 sm:col-span-1">
                  <p className="text-[11px] text-violet-700">MRR esperado (no cuenta)</p>
                  <p className="font-bold text-text">{formatCurrency(a.internal.mrr, cur)}</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {a.internal.clubs.map((c) => (
                  <li key={c.id}>
                    <Link to={`/clubs/${c.id}`} className="inline-flex items-center gap-2 rounded-xl bg-bg px-3 py-2 text-sm font-medium text-text transition hover:bg-violet-50">
                      <Badge tone="trial">Tuyo</Badge> {c.name} <StatusBadge map={CLUB_STATUS} value={c.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
