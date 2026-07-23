import { useQuery } from '@tanstack/react-query';
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
