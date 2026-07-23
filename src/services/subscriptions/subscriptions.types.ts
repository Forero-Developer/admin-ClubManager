export interface SubscriptionFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  billingStatus?: 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  billingMethod?: 'TRANSFER' | 'CARD' | 'CASH' | 'LINK';
  addonCount?: number;
}

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
  mpSubscriptionId: string | null;
  mpStatus: string | null;
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
  transactionId: string;
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
  price?: number;
  currency?: string;
  pricing: Array<{
    id: string;
    price: number;
    currency: string;
    interval: string;
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
  amount: number;
}

export interface SubscriptionAnalytics {
  totalRevenue: number;
  baseRevenue: number;
  addonRevenue: number;
  byStatus: Record<string, number>;
  tierBreakdown: AnalyticsTierEntry[];
  monthlyRevenue: MonthlyRevenueEntry[];
  addonMetrics: {
    performance: Array<{
      id: string;
      name: string;
      code: string;
      revenue: number;
      count: number;
    }>;
    topClubs: Array<{
      clubId: string;
      clubName: string;
      revenue: number;
      count: number;
    }>;
  };
}
