import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansService } from '@/services/plans/plans.service';
import { subscriptionsService } from '@/services/subscriptions/subscriptions.service';
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
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'overview'] });
      toast.success('Plan creado correctamente');
    },
    onError: () => toast.error('Error al crear el plan'),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) => plansService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'overview'] });
      toast.success('Plan actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar el plan'),
  });
}

export function useTogglePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      plansService.update(id, { isActive }),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'overview'] });
      toast.success(isActive ? 'Plan activado' : 'Plan desactivado');
    },
    onError: () => toast.error('Error al cambiar el estado del plan'),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'overview'] });
      toast.success('Plan eliminado correctamente');
    },
    onError: (error: any) => {
      const msg = error?.message ?? 'Error al eliminar el plan';
      toast.error(msg);
    },
  });
}

// ─── AddOns ──────────────────────────────────────────────────────────

export function useAddOns() {
  return useQuery({
    queryKey: ['addons'],
    queryFn: () => subscriptionsService.getAddOns(),
  });
}

export function useCreateAddOn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => subscriptionsService.createAddOn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('AddOn creado correctamente');
    },
    onError: () => toast.error('Error al crear el AddOn'),
  });
}

export function useUpdateAddOn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subscriptionsService.updateAddOn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('AddOn actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar el AddOn'),
  });
}

export function useDeleteAddOn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsService.deleteAddOn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      toast.success('AddOn desactivado/eliminado correctamente');
    },
    onError: () => toast.error('Error al eliminar el AddOn'),
  });
}
