import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsService } from '@/services/subscriptions/subscriptions.service';
import { clubsService } from '@/services/clubs/clubs.service';
import type { 
  SubscriptionFilterQuery, 
  MigratePlanDto, 
  AssignTrialDto, 
  ExtendSubscriptionDto, 
  UpdateDatesDto,
  RegisterPaymentDto,
  ResolveDebtsDto,
  AssignAddOnDto,
} from '@/services/subscriptions/subscriptions.types';

export function useSubscriptionStats() {
  return useQuery({
    queryKey: ['subscriptions', 'stats'],
    queryFn: () => subscriptionsService.getStats(),
  });
}

export function useSubscriptionOverview() {
  return useQuery({
    queryKey: ['subscriptions', 'overview'],
    queryFn: () => subscriptionsService.getOverview(),
  });
}

export function useSubscriptions(params?: SubscriptionFilterQuery) {
  return useQuery({
    queryKey: ['subscriptions', params],
    queryFn: () => subscriptionsService.getAll(params),
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionsService.getPlans(),
  });
}

export function useAddOns() {
  return useQuery({
    queryKey: ['addons'],
    queryFn: () => subscriptionsService.getAddOns(),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['subscriptions', 'analytics'],
    queryFn: () => subscriptionsService.getAnalytics(),
  });
}

export function useTransactions(params: { page: number; limit: number; search?: string }) {
  return useQuery({
    queryKey: ['subscriptions', 'transactions', params],
    queryFn: () => subscriptionsService.getTransactions(params),
  });
}

export function useClubPayments(clubId: string) {
  return useQuery({
    queryKey: ['clubPayments', clubId],
    queryFn: () => subscriptionsService.getClubPayments(clubId),
    enabled: !!clubId,
  });
}

export function useSubscriptionActions() {
  const queryClient = useQueryClient();

  const invalidateSubscriptions = () => {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    queryClient.invalidateQueries({ queryKey: ['clubs'] });
  };

  const migratePlan = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: MigratePlanDto }) => 
      subscriptionsService.migratePlan(clubId, data),
    onSuccess: invalidateSubscriptions,
  });

  const assignTrial = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: AssignTrialDto }) => 
      subscriptionsService.assignTrial(clubId, data),
    onSuccess: invalidateSubscriptions,
  });

  const extendSubscription = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: ExtendSubscriptionDto }) => 
      subscriptionsService.extendSubscription(clubId, data),
    onSuccess: invalidateSubscriptions,
  });

  const updateDates = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: UpdateDatesDto }) => 
      subscriptionsService.updateDates(clubId, data),
    onSuccess: invalidateSubscriptions,
  });

  const registerPayment = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: RegisterPaymentDto }) =>
      subscriptionsService.registerPayment(clubId, data),
    onSuccess: invalidateSubscriptions,
  });

  const downgradeToFree = useMutation({
    mutationFn: (clubId: string) => subscriptionsService.downgradeToFree(clubId),
    onSuccess: invalidateSubscriptions,
  });

  const cancelSubscription = useMutation({
    mutationFn: ({ clubId, reason }: { clubId: string; reason?: string }) => 
      subscriptionsService.cancelSubscription(clubId, reason),
    onSuccess: invalidateSubscriptions,
  });

  const deleteClub = useMutation({
    mutationFn: (clubId: string) => clubsService.delete(clubId),
    onSuccess: invalidateSubscriptions,
  });

  const resolveDebts = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data?: ResolveDebtsDto }) =>
      subscriptionsService.resolveDebts(clubId, data),
    onSuccess: invalidateSubscriptions,
  });

  const assignManualAddOn = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: AssignAddOnDto }) =>
      subscriptionsService.assignManualAddOn(clubId, data),
    onSuccess: invalidateSubscriptions,
  });

  const revertPayment = useMutation({
    mutationFn: ({ clubId, paymentId }: { clubId: string; paymentId: string }) =>
      subscriptionsService.revertPayment(clubId, paymentId),
    onSuccess: invalidateSubscriptions,
  });

  const approveTransaction = useMutation({
    mutationFn: ({ clubId, transactionId }: { clubId: string; transactionId: string }) =>
      subscriptionsService.approveTransaction(clubId, transactionId),
    onSuccess: invalidateSubscriptions,
  });

  return {
    migratePlan,
    assignTrial,
    extendSubscription,
    updateDates,
    registerPayment,
    downgradeToFree,
    cancelSubscription,
    deleteClub,
    resolveDebts,
    assignManualAddOn,
    revertPayment,
    approveTransaction,
  };
}
