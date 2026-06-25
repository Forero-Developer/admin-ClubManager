export interface SubscriptionFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  billingStatus?: 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  billingMethod?: 'TRANSFER' | 'CARD' | 'CASH' | 'LINK';
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
