import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizersService } from '@/services/organizers/organizers.service';
import type { OrganizerListQuery } from '@/services/organizers/organizers.types';

const keys = {
  all: ['organizers'] as const,
  list: (params?: OrganizerListQuery) => ['organizers', 'list', params] as const,
  detail: (id: string) => ['organizers', 'detail', id] as const,
};

export function useOrganizers(params?: OrganizerListQuery) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => organizersService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrganizerDetail(id: string | null) {
  return useQuery({
    queryKey: keys.detail(id ?? ''),
    queryFn: () => organizersService.getById(id as string),
    enabled: !!id,
  });
}

export function useSetOrganizerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) => organizersService.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteOrganizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirmEmail }: { id: string; confirmEmail: string }) => organizersService.delete(id, confirmEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      // Si conservaba la cuenta con clubes, sus datos de club también cambian
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });
}
