import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { DashboardStats } from './dashboard.types';

export const dashboardService = {
  getStats: () => 
    apiClient.get<any, DashboardStats>(ENDPOINTS.dashboard.stats),
};
