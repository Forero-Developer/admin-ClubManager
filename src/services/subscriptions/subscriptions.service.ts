import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResult } from '../clubs/clubs.types';
import type {
  SubscriptionPlan,
  SubscriptionFilterQuery,
  SubscriptionListItem,
  PaymentFilterQuery,
  PaymentListItem,
  MigratePlanDto,
  AssignTrialDto,
  ExtendSubscriptionDto,
  UpdateDatesDto
} from './subscriptions.types';

export const subscriptionsService = {
  getPlans: () => 
    apiClient.get<any, SubscriptionPlan[]>(ENDPOINTS.subscriptions.plans),
    
  getAll: (params?: SubscriptionFilterQuery) => 
    apiClient.get<any, PaginatedResult<SubscriptionListItem>>(ENDPOINTS.subscriptions.list, { params }),
    
  getClubsWithPlans: () => 
    apiClient.get<any, any[]>(ENDPOINTS.subscriptions.clubsWithPlans),
    
  getPayments: (params?: PaymentFilterQuery) => 
    apiClient.get<any, PaginatedResult<PaymentListItem>>(ENDPOINTS.subscriptions.payments, { params }),
    
  getClubPayments: (clubId: string, params?: PaymentFilterQuery) => 
    apiClient.get<any, PaginatedResult<PaymentListItem>>(ENDPOINTS.subscriptions.clubPayments(clubId), { params }),
    
  getPlanHistory: (clubId: string) => 
    apiClient.get<any, any[]>(ENDPOINTS.subscriptions.planHistory(clubId)),
    
  migratePlan: (clubId: string, data: MigratePlanDto) => 
    apiClient.post<any, any>(ENDPOINTS.subscriptions.migratePlan(clubId), data),
    
  assignTrial: (clubId: string, data: AssignTrialDto) => 
    apiClient.post<any, any>(ENDPOINTS.subscriptions.assignTrial(clubId), data),
    
  extendSubscription: (clubId: string, data: ExtendSubscriptionDto) => 
    apiClient.post<any, any>(ENDPOINTS.subscriptions.extendSubscription(clubId), data),
    
  updateDates: (clubId: string, data: UpdateDatesDto) => 
    apiClient.put<any, any>(ENDPOINTS.subscriptions.updateDates(clubId), data),
};
