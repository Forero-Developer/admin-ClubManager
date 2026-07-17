import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export function useMrrClubs(page: number = 1) {
  return useQuery({
    queryKey: ['dashboard', 'mrrClubs', page],
    queryFn: () => dashboardService.getMrrClubs(page, 10),
    retry: false,
    staleTime: 1000 * 60,
  });
}
