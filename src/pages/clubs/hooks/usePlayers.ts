import { useQuery } from '@tanstack/react-query';
import { playersService } from '@/services/players/players.service';
import type { PlayerListQuery } from '@/services/players/players.types';

export function usePlayers(clubId: string, params?: PlayerListQuery) {
  return useQuery({
    queryKey: ['players', clubId, params],
    queryFn: () => playersService.getByClub(clubId, params),
    enabled: !!clubId,
  });
}

export function usePlayerDetail(clubId: string, playerId: string) {
  return useQuery({
    queryKey: ['players', clubId, playerId],
    queryFn: () => playersService.getById(clubId, playerId),
    enabled: !!clubId && !!playerId,
  });
}
