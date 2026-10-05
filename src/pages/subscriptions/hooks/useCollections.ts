import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export function useCollections(month?: number, year?: number) {
  return useQuery({
    queryKey: ['dashboard', 'collections', month, year],
    queryFn: () => dashboardService.getCollections(month, year),
    retry: false,
    staleTime: 1000 * 60,
  });
}
