import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResult } from '../clubs/clubs.types';
import type { PlayerListQuery, PlayerListItem, PlayerDetail } from './players.types';

export const playersService = {
  getByClub: (clubId: string, params?: PlayerListQuery) => 
    apiClient.get<any, PaginatedResult<PlayerListItem>>(ENDPOINTS.players.list(clubId), { params }),
    
  getById: (clubId: string, playerId: string) => 
    apiClient.get<any, PlayerDetail>(ENDPOINTS.players.byId(clubId, playerId)),
};
