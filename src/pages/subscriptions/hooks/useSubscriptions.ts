import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsService } from '@/services/subscriptions/subscriptions.service';
import type { 
  SubscriptionFilterQuery, 
  MigratePlanDto, 
  AssignTrialDto, 
  ExtendSubscriptionDto, 
  UpdateDatesDto 
} from '@/services/subscriptions/subscriptions.types';

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

export function useSubscriptionActions() {
  const queryClient = useQueryClient();

  const invalidateSubscriptions = () => {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
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

  return {
    migratePlan,
    assignTrial,
    extendSubscription,
    updateDates,
  };
}
