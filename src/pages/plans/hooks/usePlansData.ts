import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansService } from '@/services/plans/plans.service';
import type { CreatePlanDto, UpdatePlanDto } from '@/services/plans/plans.types';
import { toast } from 'sonner';

export function usePlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => plansService.getAll(),
  });
}

export function useFeatures() {
  return useQuery({
    queryKey: ['subscription-features'],
    queryFn: () => plansService.getFeatures(),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanDto) => plansService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan creado correctamente');
    },
    onError: () => {
      toast.error('Error al crear el plan');
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) => plansService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el plan');
    },
  });
}
