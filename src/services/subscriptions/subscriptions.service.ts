import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResult } from '../clubs/clubs.types';
import type {
  SubscriptionPlan,
  PlanOverview,
  SubscriptionFilterQuery,
  SubscriptionListItem,
  PaymentFilterQuery,
  PaymentListItem,
  MigratePlanDto,
  AssignTrialDto,
  ExtendSubscriptionDto,
  UpdateDatesDto,
  SubscriptionStats,
  RegisterPaymentDto,
  ResolveDebtsDto,
  AssignAddOnDto,
  AddOnOption,
  SubscriptionAnalytics,
} from './subscriptions.types';

export const subscriptionsService = {
  getOverview: () => 
    apiClient.get<any, PlanOverview[]>(ENDPOINTS.subscriptions.overview),

  getPlans: () => 
    apiClient.get<any, SubscriptionPlan[]>(ENDPOINTS.subscriptions.plans.list),
    
  getAll: (params?: SubscriptionFilterQuery) => 
    apiClient.get<any, PaginatedResult<SubscriptionListItem>>(ENDPOINTS.subscriptions.list, { params }),
    
  getStats: () => 
    apiClient.get<any, SubscriptionStats>(ENDPOINTS.subscriptions.stats),

  getClubsWithPlans: () => 
    apiClient.get<any, any[]>(ENDPOINTS.subscriptions.clubsWithPlans),
    
  getPayments: (params?: PaymentFilterQuery) => 
    apiClient.get<any, PaginatedResult<PaymentListItem>>(ENDPOINTS.subscriptions.payments, { params }),
    
  getClubPayments: (clubId: string, params?: PaymentFilterQuery) => 
    apiClient.get<any, PaginatedResult<PaymentListItem>>(ENDPOINTS.subscriptions.clubPayments(clubId), { params }),
    
  revertPayment: (clubId: string, paymentId: string) =>
    apiClient.post<any, { success: boolean; message: string }>(ENDPOINTS.subscriptions.revertPayment(clubId, paymentId)),
    
  getPlanHistory: (clubId: string) => 
    apiClient.get<any, any[]>(ENDPOINTS.subscriptions.planHistory(clubId)),
    
  migratePlan: (clubId: string, data: MigratePlanDto) => 
    apiClient.post<any, { message: string; planHistory: any }>(ENDPOINTS.subscriptions.migratePlan(clubId), data),
    
  registerPayment: (clubId: string, data: RegisterPaymentDto) =>
    apiClient.post<any, { message: string }>(ENDPOINTS.subscriptions.registerPayment(clubId), data),

  assignTrial: (clubId: string, data: AssignTrialDto) => 
    apiClient.post<any, any>(ENDPOINTS.subscriptions.assignTrial(clubId), data),
    
  extendSubscription: (clubId: string, data: ExtendSubscriptionDto) => 
    apiClient.post<any, any>(ENDPOINTS.subscriptions.extendSubscription(clubId), data),
    
  updateDates: (clubId: string, data: UpdateDatesDto) => 
    apiClient.put<any, any>(ENDPOINTS.subscriptions.updateDates(clubId), data),

  downgradeToFree: (clubId: string) => 
    apiClient.post<any, any>(ENDPOINTS.subscriptions.downgradeToFree(clubId)),
    
  cancelSubscription: (clubId: string, reason?: string) => 
    apiClient.post<any, any>(ENDPOINTS.subscriptions.cancelSubscription(clubId), { reason }),

  resolveDebts: (clubId: string, data?: ResolveDebtsDto) =>
    apiClient.post<any, { success: boolean; message: string }>(ENDPOINTS.subscriptions.resolveDebts(clubId), data || {}),

  assignManualAddOn: (clubId: string, data: AssignAddOnDto) =>
    apiClient.post<any, any>(ENDPOINTS.subscriptions.assignAddOn(clubId), data),

  getAddOns: () =>
    apiClient.get<any, AddOnOption[]>(ENDPOINTS.subscriptions.addons.list),

  getAnalytics: () =>
    apiClient.get<any, SubscriptionAnalytics>(ENDPOINTS.subscriptions.analytics),

  createAddOn: (data: any) =>
    apiClient.post<any, any>(ENDPOINTS.subscriptions.addons.create, data),
    
  updateAddOn: (id: string, data: any) =>
    apiClient.put<any, any>(ENDPOINTS.subscriptions.addons.update(id), data),

  deleteAddOn: (id: string) =>
    apiClient.delete<any, any>(ENDPOINTS.subscriptions.addons.delete(id)),
};
