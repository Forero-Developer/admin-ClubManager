import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export function useCollections() {
  return useQuery({
    queryKey: ['dashboard', 'collections'],
    queryFn: () => dashboardService.getCollections(),
    retry: false,
    staleTime: 1000 * 60,
  });
}
