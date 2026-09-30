import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Users, Minus, Plus, AlertTriangle, CalendarRange, Gift, Loader2, CheckCircle2,
  Banknote, CreditCard, Landmark, Link2, RotateCcw, ChevronDown, Package, Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { useClubDetail } from './hooks/useClubs';
import { useSubscriptionActions, usePlans, useAddOns } from '../subscriptions/hooks/useSubscriptions';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CLUB_STATUS } from '@/lib/status';
import { formatCurrency, formatDate, formatDateLong, MONTH_NAMES } from '@/lib/format';
import { previewPaidPeriod } from '@/lib/billing';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import type { ClubDetail } from '@/services/clubs/clubs.types';
import type { AddOnOption, SubscriptionPlan } from '@/services/subscriptions/subscriptions.types';

type Method = 'TRANSFER' | 'CARD' | 'CASH' | 'LINK';

const METHODS: { value: Method; label: string; icon: ReactNode }[] = [
  { value: 'TRANSFER', label: 'Transferencia', icon: <Landmark size={16} /> },
  { value: 'CASH', label: 'Efectivo', icon: <Banknote size={16} /> },
  { value: 'CARD', label: 'Tarjeta', icon: <CreditCard size={16} /> },
  { value: 'LINK', label: 'Link de pago', icon: <Link2 size={16} /> },
];

const PACK_CODE = 'player_pack_10';

const inputCls =
  'h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary/70 transition focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15';

type PricingLike = { interval: string; price: number | string; isActive?: boolean };

const monthlyPrice = (pricing: PricingLike[] | undefined) => {
  const active = (pricing ?? []).filter((p) => p.isActive !== false);
  const monthly = active.find((p) => p.interval === 'MONTHLY');
  const oneTime = active.find((p) => p.interval === 'ONE_TIME');
  return { price: Number(monthly?.price ?? oneTime?.price ?? 0), oneTime: !monthly && !!oneTime };
};

function Step({ n, title, children, hint }: { n: number; title: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{n}</span>
        <div>
          <h2 className="font-semibold text-text">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-text-secondary">{hint}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  const btn = 'flex h-10 w-10 items-center justify-center rounded-xl text-text transition hover:bg-surface active:scale-95 disabled:opacity-40';
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-bg p-1 ring-1 ring-border">
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Menos">
        <Minus size={16} />
      </button>
      <motion.span key={value} initial={{ scale: 0.8, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="w-10 text-center text-base font-bold text-text">
        {value}
      </motion.span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} aria-label="Más">
        <Plus size={16} />
      </button>
    </div>
  );
}

/** Deportistas que incluye un plan (feature max_players). */
const capacityOf = (plan?: SubscriptionPlan) =>
  parseInt(plan?.features?.find((f) => f.feature.code === 'max_players')?.value ?? '30', 10) || 30;

export function ClubRegisterPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { data: club, isLoading: clubLoading } = useClubDetail(id || '');
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { data: addOnsData, isLoading: addOnsLoading } = useAddOns();

  if (clubLoading || plansLoading || addOnsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-border/60" />
        <div className="h-64 animate-pulse rounded-3xl bg-border/60" />
      </div>
    );
  }
  if (!club) return <div className="py-12 text-center text-text-secondary">Club no encontrado</div>;

  // El formulario se monta con los datos ya cargados: sus valores iniciales
  // (packs según deportistas, extras activos) se calculan una sola vez.
  return <RegisterPaymentForm club={club} plans={plansData ?? []} addOnDefs={addOnsData ?? []} />;
}

function RegisterPaymentForm({ club, plans, addOnDefs }: { club: ClubDetail; plans: SubscriptionPlan[]; addOnDefs: AddOnOption[] }) {
  const navigate = useNavigate();
  const { registerPayment } = useSubscriptionActions();

  const now = new Date();
  const packAddOn = addOnDefs.find((a) => a.code === PACK_CODE);
  const packSize = Number(packAddOn?.value) || 10;
  const packPrice = monthlyPrice(packAddOn?.pricing).price;
  const otherAddOns = addOnDefs.filter((a) => a.code !== PACK_CODE);
  const billable = club.billablePlayersCount ?? club.playerStats?.billable ?? club._count?.players ?? 0;
  const requiredFor = (capacity: number) => Math.max(0, Math.ceil((billable - capacity) / packSize));
  const currentPlan = plans.find((p) => p.id === club.subscriptionPrice?.plan?.id);

  // Solo planes mensuales de pago: registrar un pago de un plan de $0 no tiene sentido
  const planOptions = useMemo(
    () =>
      plans.flatMap((plan) =>
        (plan.pricing ?? [])
          .filter((p) => p.interval === 'MONTHLY' && (p as PricingLike).isActive !== false && Number(p.price) > 0)
          .map((p) => ({ id: p.id, plan, price: Number(p.price), currency: p.currency })),
      ),
    [plans],
  );

  // Si el club está en prueba o en el plan gratuito (ej. suspendido tras la
  // prueba), al pagar pasa a PRO: se preselecciona PRO y los packs se
  // calculan con los deportistas que incluye PRO, no con el "ilimitado" del trial.
  const defaultOption =
    planOptions.find((o) => o.id === club.subscriptionPrice?.id) ??
    planOptions.find((o) => o.plan.name.toUpperCase() === 'PRO') ??
    planOptions[0];

  const [priceId, setPriceId] = useState(defaultOption?.id ?? club.subscriptionPrice?.id ?? '');
  const [packs, setPacks] = useState(() => requiredFor(capacityOf(defaultOption?.plan ?? currentPlan)));
  const [extras, setExtras] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    (club.addOns ?? [])
      .filter((a) => a.status === 'ACTIVE' && a.addOn?.code !== PACK_CODE)
      .forEach((a) => {
        const def = otherAddOns.find((d) => d.id === (a.addOnId || a.addOn?.id));
        if (def && !monthlyPrice(def.pricing).oneTime) initial[def.id] = a.quantity;
      });
    return initial;
  });
  const [method, setMethod] = useState<Method>('TRANSFER');
  const [paymentDate, setPaymentDate] = useState(format(now, 'yyyy-MM-dd'));
  const [paymentTime, setPaymentTime] = useState(format(now, 'HH:mm'));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [amountOverride, setAmountOverride] = useState<string | null>(null);
  const [periodOverride, setPeriodOverride] = useState<{ month: number; year: number } | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const selected = planOptions.find((o) => o.id === priceId);

  const baseCapacity = capacityOf(selected?.plan ?? currentPlan);
  const requiredPacks = requiredFor(baseCapacity);
  const capacity = baseCapacity + packs * packSize;
  const isShort = billable > capacity;

  const currency = selected?.currency ?? club.subscriptionPrice?.currency ?? 'COP';
  const planAmount = selected?.price ?? Number(club.subscriptionPrice?.price ?? 0);
  const packsAmount = packs * packPrice;
  const extrasAmount = Object.entries(extras).reduce((sum, [addOnId, qty]) => {
    const def = otherAddOns.find((a) => a.id === addOnId);
    return sum + monthlyPrice(def?.pricing).price * qty;
  }, 0);
  const calculated = planAmount + packsAmount + extrasAmount;
  const amount = isGift ? 0 : amountOverride !== null ? Number(amountOverride) || 0 : calculated;

  const paidAt = new Date(`${paymentDate}T${paymentTime || '12:00'}:00`);
  const preview = previewPaidPeriod({
    status: club.status,
    subscriptionEnd: club.subscriptionEnd,
    trialEndsAt: club.trialEndsAt,
    planPrice: Number(club.subscriptionPrice?.price ?? 0),
    paymentDate: isNaN(paidAt.getTime()) ? new Date() : paidAt,
  });
  const period = periodOverride ?? { month: preview.start.getMonth() + 1, year: preview.start.getFullYear() };

  const submit = () => {
    if (isNaN(paidAt.getTime())) return toast.error('Revisa la fecha y hora del pago');
    const addOns = [
      ...(packAddOn ? [{ addOnId: packAddOn.id, quantity: packs }] : []),
      ...Object.entries(extras).map(([addOnId, quantity]) => ({ addOnId, quantity })),
    ].filter((a) => a.quantity > 0);

    registerPayment.mutate(
      {
        clubId: club.id,
        data: {
          newPriceId: priceId && priceId !== club.subscriptionPrice?.id ? priceId : undefined,
          amount,
          method,
          transactionId: reference.trim() || undefined,
          periodMonth: period.month,
          periodYear: period.year,
          notes: notes.trim() || undefined,
          reason: 'Pago manual registrado por admin',
          paymentDate: paidAt.toISOString(),
          addOns,
          isGift,
        },
      },
      {
        onSuccess: () => {
          toast.success('Pago registrado', { description: `Mes activo hasta el ${formatDate(preview.end)}` });
          navigate(`/clubs/${club.id}`);
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, 'Error al registrar el pago')),
      },
    );
  };

  const summary = (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary">Plan {selected?.plan?.name ?? club.subscriptionPrice?.plan?.name}</span>
        <span className="font-medium text-text">{formatCurrency(planAmount, currency)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-text-secondary">
          {packs} pack{packs === 1 ? '' : 's'} × {formatCurrency(packPrice, currency)}
        </span>
        <span className="font-medium text-text">{formatCurrency(packsAmount, currency)}</span>
      </div>
      {extrasAmount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Extras</span>
          <span className="font-medium text-text">{formatCurrency(extrasAmount, currency)}</span>
        </div>
      )}
      {(amountOverride !== null || isGift) && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Calculado</span>
          <span className="text-text-secondary line-through">{formatCurrency(calculated, currency)}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <span className="font-semibold text-text">Total</span>
        <span className="text-lg font-bold text-text">{formatCurrency(amount, currency)}</span>
      </div>
      {(
        <div className="rounded-2xl bg-primary-light/70 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-hover">
            <CalendarRange size={14} /> Mes que cubre
          </p>
          <p className="mt-1 font-semibold text-text">
            {formatDate(preview.start)} → {formatDate(preview.end)}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">{preview.explanation}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-4">
      {/* Encabezado */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          to={`/clubs/${club.id}`}
          aria-label="Volver al club"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:text-text"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">Registrar pago</h1>
          <p className="flex items-center gap-2 truncate text-sm text-text-secondary">
            <span className="truncate">{club.name}</span>
            <StatusBadge map={CLUB_STATUS} value={club.status} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-4">
          {/* 1. Qué paga */}
          <Step n={1} title="¿Qué paga?" hint="Plan mensual + los packs que necesita según sus deportistas.">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Plan</span>
                <select value={priceId} onChange={(e) => setPriceId(e.target.value)} className={inputCls}>
                  {!planOptions.some((o) => o.id === priceId) && <option value={priceId}>Plan actual</option>}
                  {planOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.plan.name} · {formatCurrency(o.price, o.currency)}/mes
                    </option>
                  ))}
                </select>
              </label>

              {packAddOn && (
                <div className="rounded-2xl border border-border/70 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="flex items-center gap-1.5 font-semibold text-text">
                        <Users size={16} className="text-text-secondary" /> Packs de {packSize} deportistas
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        Tiene <b className="text-text">{billable}</b> deportistas (activos + suspendidos). Plan incluye {baseCapacity}.
                      </p>
                    </div>
                    <Stepper value={packs} onChange={setPacks} />
                  </div>

                  {/* Barra de capacidad */}
                  <div className="mt-4">
                    <div className="h-2.5 overflow-hidden rounded-full bg-bg">
                      <motion.div
                        className={cn('h-full rounded-full', isShort ? 'bg-amber-500' : 'bg-primary')}
                        animate={{ width: `${Math.min(100, capacity ? (billable / capacity) * 100 : 0)}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-xs text-text-secondary">
                      <span>{billable} deportistas</span>
                      <span>Capacidad {capacity}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {packs !== requiredPacks && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className={cn('mt-3 flex items-start gap-2 rounded-xl p-3 text-xs', isShort ? 'bg-amber-50 text-amber-800' : 'bg-sky-50 text-sky-800')}>
                          {isShort ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <Info size={14} className="mt-0.5 shrink-0" />}
                          <span className="flex-1">
                            {isShort
                              ? `Con ${packs} pack${packs === 1 ? '' : 's'} faltan ${billable - capacity} cupos. Según sus deportistas le corresponden ${requiredPacks}.`
                              : `Según sus deportistas le corresponden ${requiredPacks} pack${requiredPacks === 1 ? '' : 's'}.`}
                          </span>
                          <button type="button" onClick={() => setPacks(requiredPacks)} className="shrink-0 font-semibold underline underline-offset-2">
                            Usar {requiredPacks}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {otherAddOns.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                    <Package size={13} /> Otros extras
                  </p>
                  <div className="space-y-2">
                    {otherAddOns.map((addon) => {
                      const { price, oneTime } = monthlyPrice(addon.pricing);
                      const qty = extras[addon.id] ?? 0;
                      const on = qty > 0;
                      return (
                        <div key={addon.id} className={cn('flex items-center gap-3 rounded-2xl border p-3 transition', on ? 'border-primary/40 bg-primary-light/40' : 'border-border/70')}>
                          <button
                            type="button"
                            onClick={() => setExtras((prev) => ({ ...prev, [addon.id]: on ? 0 : 1 }))}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition', on ? 'border-primary bg-primary text-white' : 'border-border')}>
                              {on && <CheckCircle2 size={12} />}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-text">{addon.name}</span>
                              <span className="block text-xs text-text-secondary">
                                {formatCurrency(price, currency)} {oneTime ? 'pago único' : '/ mes'}
                              </span>
                            </span>
                          </button>
                          {on && <Stepper value={qty} min={1} onChange={(v) => setExtras((prev) => ({ ...prev, [addon.id]: v }))} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Step>

          {/* 2. Cómo pagó */}
          <Step n={2} title="¿Cómo pagó?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    'flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition active:scale-[0.98]',
                    method === m.value ? 'border-primary bg-primary-light text-primary-hover ring-2 ring-primary/20' : 'border-border text-text-secondary hover:text-text',
                  )}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Fecha del pago</span>
                <input type="date" value={paymentDate} max={format(now, 'yyyy-MM-dd')} onChange={(e) => setPaymentDate(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Hora</span>
                <input type="time" value={paymentTime} onChange={(e) => setPaymentTime(e.target.value)} className={inputCls} />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Referencia del comprobante (opcional)</span>
              <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ej. número de la transferencia" className={inputCls} />
              <span className="mt-1 block text-[11px] text-text-secondary">El número de transacción se genera automáticamente; esto queda en las notas.</span>
            </label>
          </Step>

          {/* 3. Monto y detalle */}
          <Step n={3} title="Monto y detalle">
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text-secondary">
                Monto recibido
                {amountOverride !== null && !isGift && (
                  <button type="button" onClick={() => setAmountOverride(null)} className="inline-flex items-center gap-1 font-semibold text-primary-hover">
                    <RotateCcw size={12} /> Usar calculado
                  </button>
                )}
              </span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  disabled={isGift}
                  value={isGift ? 0 : amountOverride ?? String(calculated)}
                  onChange={(e) => setAmountOverride(e.target.value)}
                  className={cn(inputCls, 'h-12 pl-8 text-lg font-semibold disabled:opacity-60')}
                />
              </div>
              <span className="mt-1 block text-[11px] text-text-secondary">Se calcula solo; ajústalo si hubo un descuento o un valor distinto.</span>
            </label>

            <button
              type="button"
              onClick={() => setIsGift((v) => !v)}
              className={cn(
                'mt-4 flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition',
                isGift ? 'border-violet-300 bg-violet-50' : 'border-border/70 hover:border-violet-200',
              )}
            >
              <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2', isGift ? 'border-violet-500 bg-violet-500 text-white' : 'border-border')}>
                {isGift && <CheckCircle2 size={12} />}
              </span>
              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-text">
                  <Gift size={15} className="text-violet-500" /> Es una cortesía
                </span>
                <span className="block text-xs text-text-secondary">Activa el mes completo con monto $0, sin inflar los ingresos.</span>
              </span>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Mes contable</span>
                <select
                  value={period.month}
                  onChange={(e) => setPeriodOverride({ ...period, month: Number(e.target.value) })}
                  className={inputCls}
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Año</span>
                <select
                  value={period.year}
                  onChange={(e) => setPeriodOverride({ ...period, year: Number(e.target.value) })}
                  className={inputCls}
                >
                  {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Notas (opcional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Quién autorizó, detalles del pago…"
                className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
            </label>
          </Step>
        </div>

        {/* Resumen (escritorio) */}
        <aside className="hidden lg:sticky lg:top-6 lg:block">
          <Card className="p-5">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Resumen</p>
            {summary}
            <button
              onClick={submit}
              disabled={registerPayment.isPending}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
            >
              {registerPayment.isPending && <Loader2 size={16} className="animate-spin" />}
              Registrar pago
            </button>
            {club.lastChargeAt && (
              <p className="mt-3 text-center text-xs text-text-secondary">
                Último pago: {formatDateLong(club.lastChargeAt)}
              </p>
            )}
          </Card>
        </aside>
      </div>

      {/* Barra fija de celular: total + resumen desplegable */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-border/70 bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgba(15,31,18,0.35)] backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
        <AnimatePresence initial={false}>
          {showSummary && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pb-3">{summary}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowSummary((v) => !v)} className="min-w-0 flex-1 text-left">
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              Total a registrar <ChevronDown size={14} className={cn('transition-transform', showSummary && 'rotate-180')} />
            </span>
            <span className="block text-xl font-bold text-text">{formatCurrency(amount, currency)}</span>
          </button>
          <button
            onClick={submit}
            disabled={registerPayment.isPending}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
          >
            {registerPayment.isPending && <Loader2 size={16} className="animate-spin" />}
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
