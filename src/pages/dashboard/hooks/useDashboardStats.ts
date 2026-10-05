import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export function useDashboardStats(month?: number, year?: number) {
  return useQuery({
    queryKey: ['dashboard', 'stats', month, year],
    queryFn: () => dashboardService.getStats(month, year),
    retry: false,          // No reintentar si falla (evita loops en error 401)
    staleTime: 1000 * 60,  // Datos frescos por 1 minuto, evita refetch innecesario
  });
}
