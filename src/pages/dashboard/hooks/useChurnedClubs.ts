import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export function useChurnedClubs(page: number = 1, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'churnedClubs', page],
    queryFn: () => dashboardService.getChurnedClubs(page, 10),
    enabled,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 1000 * 60,
  });
}
