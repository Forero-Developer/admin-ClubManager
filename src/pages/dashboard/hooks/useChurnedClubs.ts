import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export function useChurnedClubs(page: number = 1) {
  return useQuery({
    queryKey: ['dashboard', 'churnedClubs', page],
    queryFn: () => dashboardService.getChurnedClubs(page, 10),
    retry: false,
    staleTime: 1000 * 60,
  });
}
