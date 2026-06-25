import { useQuery } from '@tanstack/react-query';
import { clubsService } from '@/services/clubs/clubs.service';
import type { ClubListQuery } from '@/services/clubs/clubs.types';

export function useClubs(params?: ClubListQuery) {
  return useQuery({
    queryKey: ['clubs', params],
    queryFn: () => clubsService.getAll(params),
  });
}
