import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { SubscriptionPlan, CreatePlanDto, UpdatePlanDto, BaseFeature } from './plans.types';

export const plansService = {
  getAll: () => apiClient.get<any, SubscriptionPlan[]>(ENDPOINTS.subscriptions.plans.list),
  getFeatures: () => apiClient.get<any, BaseFeature[]>(ENDPOINTS.subscriptions.plans.features),
  create: (data: CreatePlanDto) => apiClient.post<any, SubscriptionPlan>(ENDPOINTS.subscriptions.plans.create, data),
  update: (id: string, data: UpdatePlanDto) => apiClient.put<any, SubscriptionPlan>(ENDPOINTS.subscriptions.plans.update(id), data),
};
