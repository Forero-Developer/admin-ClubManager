/**
 * Vista previa del mes que se registra en un pago manual. Replica la regla
 * del backend (`resolvePeriodStart` en subscription-pricing.util.ts) para
 * que el admin vea las fechas antes de guardar; el backend es quien decide.
 *
 * - Mes o trial de plan pago vigente → se suma al actual (desde su vencimiento)
 * - En gracia (PAST_DUE) o vencido hace menos de un mes → desde que venció
 * - Suspendido, plan gratuito o vencido hace más de un mes → desde el pago
 */

/** Suma meses sin desbordar (31 ene + 1 mes = 28/29 feb). */
export function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export type PeriodRule = 'extends' | 'from_expiry' | 'from_payment';

export interface PeriodPreview {
  start: Date;
  end: Date;
  rule: PeriodRule;
  explanation: string;
}

export function previewPaidPeriod(params: {
  status: string;
  subscriptionEnd?: string | null;
  trialEndsAt?: string | null;
  planPrice: number;
  paymentDate: Date;
}): PeriodPreview {
  const { status, planPrice, paymentDate } = params;

  let end = params.subscriptionEnd ? new Date(params.subscriptionEnd) : null;
  if (status === 'TRIAL' && params.trialEndsAt) {
    const trialEnd = new Date(params.trialEndsAt);
    if (!end || trialEnd > end) end = trialEnd;
  }

  const fromPayment = (explanation: string): PeriodPreview => ({
    start: paymentDate,
    end: addMonthsClamped(paymentDate, 1),
    rule: 'from_payment',
    explanation,
  });

  if (status === 'SUSPENDED') {
    return fromPayment('Estaba suspendido: empieza de nuevo desde el día del pago.');
  }
  if (!end) return fromPayment('Sin mes anterior: cuenta desde el día del pago.');

  if (end > paymentDate) {
    const running = (status === 'ACTIVE' || status === 'TRIAL') && planPrice > 0;
    return running
      ? {
          start: end,
          end: addMonthsClamped(end, 1),
          rule: 'extends',
          explanation: 'Tiene su mes vigente: el nuevo mes se suma al actual, sin perder días.',
        }
      : fromPayment('Viene de un plan gratuito: cuenta desde el día del pago.');
  }

  if (addMonthsClamped(end, 1) > paymentDate) {
    return {
      start: end,
      end: addMonthsClamped(end, 1),
      rule: 'from_expiry',
      explanation: 'Pagó en su período de gracia: el mes cuenta desde que venció.',
    };
  }

  return fromPayment('Llevaba más de un mes vencido: empieza de nuevo desde el pago, sin cobrar meses atrasados.');
}
