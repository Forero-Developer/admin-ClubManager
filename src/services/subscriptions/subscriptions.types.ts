export interface SubscriptionFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  billingStatus?: 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  billingMethod?: 'TRANSFER' | 'CARD' | 'CASH' | 'LINK';
  addonCount?: number;
  /** Ordenar por cobro mensual esperado (desc = el que más paga). */
  orderByAmount?: 'asc' | 'desc';
  /** Clubes propios / de prueba: all, exclude (clientes reales) u only. */
  internal?: InternalFilter;
}

export type InternalFilter = 'all' | 'exclude' | 'only';

export interface PaymentFilterQuery {
  page?: number;
  limit?: number;
  status?: 'SUCCESS' | 'PENDING' | 'FAILED';
  periodMonth?: number;
  periodYear?: number;
}

export interface MigratePlanDto {
  newPriceId: string;
  reason?: string;
}

export interface AssignTrialDto {
  days?: number;
  reason?: string;
}

export interface ExtendSubscriptionDto {
  days: number;
  reason?: string;
}

export interface UpdateDatesDto {
  trialEndsAt?: string;
  subscriptionEnd?: string;
  billingCycleEnd?: string;
}

export interface SubscriptionListItem {
  id: string;
  name: string;
  email: string | null;
  logoUrl: string | null;
  status: string;
  billingStatus: string;
  billingMethod: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  billingCycleEnd: string;
  trialEndsAt: string | null;
  nextChargeDate: string | null;
  lastChargeAt: string | null;
  paymentProfile: {
    status: 'PENDING' | 'AVAILABLE' | 'DECLINED';
    paymentMethodType: 'CARD' | 'NEQUI' | 'PSE' | null;
    cardBrand: string | null;
    cardLastFour: string | null;
  } | null;
  currentBaseAmount: number | null;
  currentAddonAmount: number | null;
  countryCode: string;
  country: { name: string; currency: string };
  subscriptionPrice: {
    id: string;
    price: number;
    currency: string;
    interval: string;
    plan: { id: string; name: string };
  } | null;
  _count: {
    players: number;
    addOns: number;
    saasPayments: number;
  };
  /** Correo con el que se registró el club. */
  registeredEmail?: string | null;
  gracePeriodEndsAt?: string | null;
  /** Club propio / de prueba (no cuenta en las métricas de clientes). */
  isInternal?: boolean;
  /** Cobro mensual esperado hoy: plan + packs según deportistas. */
  expectedMonthly?: { total: number; base: number; packs: number; addons: number } | null;
  billablePlayersCount?: number;
  playerStats?: { active: number; suspended: number; total: number; billable: number };
}

export interface PaymentListItem {
  id: string;
  amount: number;
  transactionId: string;
  status: string;
  method: string;
  periodMonth: number;
  periodYear: number;
  notes: string | null;
  clubId: string | null;
  club: { name: string } | null;
  createdAt?: string;
}

export interface PlanFeature {
  id: string;
  value: string | null;
  feature: {
    id: string;
    code: string;
    type: string;
  };
}

export interface PlanPricing {
  id: string;
  price: number;
  interval: string;
  currency: string;
  countryCode: string | null;
  discount: number | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  features: PlanFeature[];
  pricing: PlanPricing[];
}

export interface PlanOverview extends SubscriptionPlan {
  isActive: boolean;
  sortOrder: number | null;
  _count: {
    activeClubs: number;
    pastDueClubs: number;
    suspendedClubs: number;
  };
  revenueThisMonth: number;
}

export interface SubscriptionStats {
  byStatus: Record<string, number>;
  byBillingStatus: Record<string, number>;
  byBillingMethod: Record<string, number>;
  byInterval: Record<string, number>;
  byPlan: Record<string, number>;
  payments: {
    totalRevenue: number;
    thisMonth: number;
    pendingCount: number;
    pendingAddOnsAmount: number;
    pendingAddOnsCount: number;
  };
}

export interface PaymentAddOnDto {
  addOnId: string;
  quantity: number;
}

export interface RegisterPaymentDto {
  newPriceId?: string;
  addOns?: PaymentAddOnDto[];
  amount: number;
  method: 'TRANSFER' | 'CARD' | 'CASH' | 'LINK';
  /** Opcional: el backend genera el número (MAN-…). Si se envía, queda como referencia externa. */
  transactionId?: string;
  periodMonth: number;
  periodYear: number;
  notes?: string;
  reason?: string;
  paymentDate?: string;
  isGift?: boolean;
}

export interface ResolveDebtsDto {
  transactionId?: string;
}

export interface AssignAddOnDto {
  addOnId: string;
  quantity: number;
  notes?: string;
  isGift?: boolean;
}

export interface AddOnOption {
  id: string;
  name: string;
  code: string;
  description: string | null;
  /** Unidades que aporta (ej. 10 deportistas en player_pack_10). */
  value?: number | null;
  price?: number;
  currency?: string;
  pricing: Array<{
    id: string;
    price: number;
    currency: string;
    interval: string;
    isActive?: boolean;
  }>;
}

export interface AnalyticsTierEntry {
  addOnCount: number;
  clubCount: number;
  baseRevenue: number;
  addonRevenue: number;
  totalRevenue: number;
  label: string;
}

export interface MonthlyRevenueEntry {
  year: number;
  month: number;
  /** Total recaudado del mes. */
  amount: number;
  /** Mensualidades (plan + packs de deportistas). */
  subscriptions: number;
  /** Extras de pago único (paquetes de WhatsApp, etc.). */
  extras: number;
}

export interface PriceTier {
  packs: number;
  label: string;
  playersRange: string;
  clubs: number;
  mrr: number;
  avgAmount: number;
  avgPlayers: number;
  shareOfClubs: number;
  shareOfMrr: number;
}

export interface InternalSummary {
  clubs: Array<{ id: string; name: string; status: string }>;
  mrr: number;
  revenueThisMonth: number;
  paymentsThisMonth: number;
  revenueAllTime: number;
  paymentsAllTime: number;
}

export interface SubscriptionAnalytics {
  currency: string;
  expected: {
    mrr: number;
    payingClubs: number;
    arpu: number;
    mrrAtRisk: number;
    pastDueClubs: number;
    billablePlayers: number;
    avgPlayersPerClub: number;
    revenuePerPlayer: number;
  };
  collection: {
    month: number;
    year: number;
    collectedThisMonth: number;
    collectedPrevMonth: number;
    extrasThisMonth: number;
    /** Mensualidades cobradas este mes / MRR esperado (0-1). */
    rate: number;
  };
  priceTiers: PriceTier[];
  concentration: {
    top5Share: number;
    topClubs: Array<{ id: string; name: string; logoUrl: string | null; total: number; billablePlayers: number; packs: number; share: number }>;
  };
  funnel: { registered: number; everPaid: number; conversionRate: number; trialsNow: number; payingNow: number };
  totals: { totalRevenue: number; subscriptionRevenue: number; extrasRevenue: number };
  monthlyRevenue: MonthlyRevenueEntry[];
  extras: {
    performance: Array<{ id: string; name: string; code: string; revenue: number; count: number }>;
    topClubs: Array<{ clubId: string; clubName: string; revenue: number; count: number }>;
  };
  byStatus: Record<string, number>;
  internal: InternalSummary;
}
