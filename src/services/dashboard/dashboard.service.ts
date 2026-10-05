import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { DashboardStats, MonthCollections, MrrClub, Paginated } from './dashboard.types';

export const dashboardService = {
  getStats: (month?: number, year?: number) => 
    apiClient.get<any, DashboardStats>(ENDPOINTS.dashboard.stats, { params: { month, year } }),
  getChurnedClubs: (page: number = 1, limit: number = 10) =>
    apiClient.get<any, any>(ENDPOINTS.dashboard.churnedClubs, { params: { page, limit } }),
  getMrrClubs: (page: number = 1, limit: number = 10) =>
    apiClient.get<any, Paginated<MrrClub>>(ENDPOINTS.dashboard.mrrClubs, { params: { page, limit } }),
  getCollections: (month?: number, year?: number) => 
    apiClient.get<any, MonthCollections>(ENDPOINTS.dashboard.collections, { params: { month, year } }),
};
