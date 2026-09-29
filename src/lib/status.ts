/**
 * Etiquetas y colores de los estados que vienen del backend, en un solo
 * lugar para que todas las pantallas hablen igual.
 *
 * Modelo de cobro: mensual, sin deuda. Si el mes vence el club pasa a
 * PAST_DUE (gracia, conserva acceso) y luego a SUSPENDED hasta que pague.
 */

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'trial';

export interface StatusMeta {
  label: string;
  tone: Tone;
  description?: string;
}

export const CLUB_STATUS: Record<string, StatusMeta> = {
  ACTIVE: { label: 'Activo', tone: 'success', description: 'Mes pagado y al día' },
  TRIAL: { label: 'Prueba', tone: 'trial', description: 'En período de prueba gratis' },
  PAST_DUE: { label: 'En gracia', tone: 'warning', description: 'Venció su mes, aún tiene acceso' },
  SUSPENDED: { label: 'Suspendido', tone: 'danger', description: 'Sin acceso hasta que pague el mes' },
  DELETED: { label: 'Eliminado', tone: 'neutral' },
};

export const BILLING_STATUS: Record<string, StatusMeta> = {
  ACTIVE: { label: 'Al día', tone: 'success' },
  PAST_DUE: { label: 'En gracia', tone: 'warning' },
  SUSPENDED: { label: 'Suspendido', tone: 'danger' },
};

export const BILLING_METHOD: Record<string, string> = {
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta / Wompi',
  CASH: 'Efectivo',
  LINK: 'Link de pago',
};

export const PAYMENT_STATUS: Record<string, StatusMeta> = {
  SUCCESS: { label: 'Pagado', tone: 'success' },
  PENDING: { label: 'Pendiente', tone: 'warning' },
  FAILED: { label: 'Fallido', tone: 'danger' },
  REFUNDED: { label: 'Reembolsado', tone: 'neutral' },
};

export const PLAYER_STATUS: Record<string, StatusMeta> = {
  ACTIVE: { label: 'Activo', tone: 'success' },
  SUSPENDED: { label: 'Suspendido', tone: 'warning' },
  INACTIVE: { label: 'Inactivo', tone: 'neutral' },
  DROPPED_OUT: { label: 'Retirado', tone: 'danger' },
  PENDING: { label: 'Pendiente', tone: 'info' },
  REJECTED: { label: 'Rechazado', tone: 'danger' },
};

export const ADDON_STATUS: Record<string, StatusMeta> = {
  ACTIVE: { label: 'Activo', tone: 'success' },
  CANCELLED: { label: 'Cancelado', tone: 'neutral' },
  EXPIRED: { label: 'Vencido', tone: 'danger' },
};

/** Clases de color por tono (fondo suave + texto + punto). */
export const TONE_CLASSES: Record<Tone, { badge: string; dot: string; soft: string; text: string }> = {
  success: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', dot: 'bg-emerald-500', soft: 'bg-emerald-50', text: 'text-emerald-700' },
  warning: { badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500', soft: 'bg-amber-50', text: 'text-amber-700' },
  danger: { badge: 'bg-rose-50 text-rose-700 ring-rose-600/15', dot: 'bg-rose-500', soft: 'bg-rose-50', text: 'text-rose-700' },
  info: { badge: 'bg-sky-50 text-sky-700 ring-sky-600/15', dot: 'bg-sky-500', soft: 'bg-sky-50', text: 'text-sky-700' },
  trial: { badge: 'bg-violet-50 text-violet-700 ring-violet-600/15', dot: 'bg-violet-500', soft: 'bg-violet-50', text: 'text-violet-700' },
  neutral: { badge: 'bg-slate-100 text-slate-600 ring-slate-500/15', dot: 'bg-slate-400', soft: 'bg-slate-50', text: 'text-slate-600' },
};

export function statusMeta(map: Record<string, StatusMeta>, key?: string | null): StatusMeta {
  if (!key) return { label: '—', tone: 'neutral' };
  return map[key] ?? { label: key, tone: 'neutral' };
}
