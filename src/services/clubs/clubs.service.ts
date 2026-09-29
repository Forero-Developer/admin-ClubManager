import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResult, ClubListItem, ClubListQuery, ClubDetail, ClubPlanHistoryItem } from './clubs.types';

export const clubsService = {
  getAll: (params?: ClubListQuery) => 
    apiClient.get<any, PaginatedResult<ClubListItem>>(ENDPOINTS.clubs.list, { params }),
    
  getById: (id: string) => 
    apiClient.get<any, ClubDetail>(ENDPOINTS.clubs.byId(id)),
    
  delete: (id: string) =>
    apiClient.delete<any, { message: string }>(ENDPOINTS.clubs.byId(id)),

  getPlanHistory: (id: string) =>
    apiClient.get<any, ClubPlanHistoryItem[]>(ENDPOINTS.clubs.planHistory(id)),
    
  releaseAccess: (id: string) =>
    apiClient.post<any, { message: string }>(ENDPOINTS.clubs.releaseAccess(id), {}),
    
  cancelAndRevert: (id: string) =>
    apiClient.post<any, { message: string }>(ENDPOINTS.clubs.cancelAndRevert(id), {}),
    
  cancelRecurring: (id: string) =>
    apiClient.post<any, { message: string }>(ENDPOINTS.clubs.cancelRecurring(id), {}),

  /** Marca o desmarca un club como propio / de prueba. */
  setInternal: (id: string, isInternal: boolean) =>
    apiClient.patch<unknown, { id: string; name: string; isInternal: boolean }>(ENDPOINTS.clubs.internal(id), { isInternal }),
};
