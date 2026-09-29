import {
  differenceInCalendarDays,
  differenceInYears,
  format,
  formatDistanceToNowStrict,
  isValid,
} from 'date-fns';
import { es } from 'date-fns/locale';

type DateInput = string | Date | null | undefined;

const toDate = (value: DateInput): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
};

/**
 * Fechas "solo día" (ej. nacimiento) llegan como medianoche UTC; en Colombia
 * (UTC-5) se verían como el día anterior. Se leen en UTC para no correrlas.
 */
const toDateOnly = (value: DateInput): Date | null => {
  const date = toDate(value);
  if (!date) return null;
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

/** 12 mar 2026 */
export function formatDate(value: DateInput): string {
  const date = toDate(value);
  return date ? format(date, 'd MMM yyyy', { locale: es }) : '—';
}

/** 12 de marzo de 2026 */
export function formatDateLong(value: DateInput): string {
  const date = toDate(value);
  return date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: es }) : '—';
}

/** 12 mar 2026, 3:45 p. m. */
export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy, h:mm aaaa", { locale: es }) : '—';
}

/** Fecha sin hora (nacimiento, etc.), sin correrse por zona horaria. */
export function formatBirthDate(value: DateInput): string {
  const date = toDateOnly(value);
  return date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: es }) : '—';
}

/** hace 3 meses · en 5 días · hoy */
export function formatRelative(value: DateInput): string {
  const date = toDate(value);
  if (!date) return '—';
  const days = differenceInCalendarDays(date, new Date());
  if (days === 0) return 'hoy';
  if (days === -1) return 'ayer';
  if (days === 1) return 'mañana';
  return formatDistanceToNowStrict(date, { locale: es, addSuffix: true });
}

/** Días hasta una fecha (negativo si ya pasó). */
export function daysUntil(value: DateInput): number | null {
  const date = toDate(value);
  return date ? differenceInCalendarDays(date, new Date()) : null;
}

/** Edad en años a partir de la fecha de nacimiento. */
export function ageFrom(value: DateInput): number | null {
  const date = toDateOnly(value);
  return date ? differenceInYears(new Date(), date) : null;
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Marzo 2026 (mes 1-12) */
export function formatPeriod(month?: number | null, year?: number | null): string {
  if (!month || !year) return '—';
  return `${MONTH_NAMES[month - 1] ?? month} ${year}`;
}

export function formatCurrency(value?: number | string | null, currency = 'COP'): string {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat('es-CO').format(Number(value ?? 0));
}
