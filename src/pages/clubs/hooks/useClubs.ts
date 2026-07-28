import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubsService } from '@/services/clubs/clubs.service';
import type { ClubListQuery } from '@/services/clubs/clubs.types';

export function useClubs(params?: ClubListQuery) {
  return useQuery({
    queryKey: ['clubs', params],
    queryFn: () => clubsService.getAll(params),
  });
}

export function useClubDetail(id: string) {
  return useQuery({
    queryKey: ['clubs', id],
    queryFn: () => clubsService.getById(id),
    enabled: !!id,
  });
}

export function useClubPlanHistory(id: string) {
  return useQuery({
    queryKey: ['clubs', id, 'plan-history'],
    queryFn: () => clubsService.getPlanHistory(id),
    enabled: !!id,
  });
}

export function useReleaseAccess() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clubsService.releaseAccess(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', id] });
    },
  });
}

export function useCancelAndRevert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clubsService.cancelAndRevert(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', id] });
    },
  });
}

export function useCancelRecurring() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clubsService.cancelRecurring(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', id] });
    },
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clubsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
}
