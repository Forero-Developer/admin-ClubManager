import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResult, ClubListItem, ClubListQuery, ClubDetail } from './clubs.types';

export const clubsService = {
  getAll: (params?: ClubListQuery) => 
    apiClient.get<any, PaginatedResult<ClubListItem>>(ENDPOINTS.clubs.list, { params }),
    
  getById: (id: string) => 
    apiClient.get<any, ClubDetail>(ENDPOINTS.clubs.byId(id)),
};
