export interface PlanFeature {
  id: string;
  planId: string;
  featureId: string;
  value: string;
  feature: {
    id: string;
    code: string;
    name: string;
    description: string;
  };
}

export interface PlanPricing {
  id: string;
  planId: string;
  price: number;
  interval: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'YEARLY';
  currency: string;
  countryCode: string;
  discount?: number | null;
  isActive: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  isActive: boolean;
  sortOrder: number | null;
  features: PlanFeature[];
  pricing: PlanPricing[];
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  features: Array<{ featureId: string; value: string }>;
  pricing: Array<{
    price: number;
    interval: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'YEARLY';
    currency: string;
    countryCode: string;
    discount?: number;
  }>;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  features?: Array<{ featureId: string; value: string }>;
  pricing?: Array<{
    price: number;
    interval: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'YEARLY';
    currency: string;
    countryCode: string;
    discount?: number;
  }>;
}

export interface BaseFeature {
  id: string;
  code: string;
  name: string;
  description: string;
}
