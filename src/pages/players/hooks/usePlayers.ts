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
