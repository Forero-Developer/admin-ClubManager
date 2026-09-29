import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { DashboardStats, MrrClub, Paginated } from './dashboard.types';

export const dashboardService = {
  getStats: () => 
    apiClient.get<any, DashboardStats>(ENDPOINTS.dashboard.stats),
  getChurnedClubs: (page: number = 1, limit: number = 10) =>
    apiClient.get<any, any>(ENDPOINTS.dashboard.churnedClubs, { params: { page, limit } }),
  getMrrClubs: (page: number = 1, limit: number = 10) =>
    apiClient.get<any, Paginated<MrrClub>>(ENDPOINTS.dashboard.mrrClubs, { params: { page, limit } }),
};
