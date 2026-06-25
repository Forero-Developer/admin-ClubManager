import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    retry: false,          // No reintentar si falla (evita loops en error 401)
    staleTime: 1000 * 60,  // Datos frescos por 1 minuto, evita refetch innecesario
  });
}
