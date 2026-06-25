import { useState } from 'react';
import { MoreHorizontal, Calendar, ArrowRightLeft, Clock, Edit3, AlertOctagon, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

import { MigratePlanModal } from './modals/MigratePlanModal';
import { AssignTrialModal } from './modals/AssignTrialModal';
import { ExtendSubscriptionModal } from './modals/ExtendSubscriptionModal';
import { UpdateDatesModal } from './modals/UpdateDatesModal';

interface SubscriptionActionsProps {
  club: SubscriptionListItem;
}

export function SubscriptionActions({ club }: SubscriptionActionsProps) {
  const [activeModal, setActiveModal] = useState<'migrate' | 'trial' | 'extend' | 'dates' | null>(null);
  const queryClient = useQueryClient();

  const downgrade = useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.subscriptions.downgradeToFree(club.id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  // ─── Club SUSPENDIDO: solo mostrar botón de plan gratuito ───
  if (club.status === 'SUSPENDED') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1">
          <AlertOctagon size={13} />
          <span>Acceso suspendido</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-primary text-primary hover:bg-primary-light"
          onClick={() => downgrade.mutate()}
          disabled={downgrade.isPending}
        >
          <ArrowDownCircle size={13} className="mr-1" />
          {downgrade.isPending ? 'Procesando...' : 'Pasar a Plan Gratuito'}
        </Button>
      </div>
    );
  }

  // ─── Club normal: dropdown con todas las opciones ───
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
            <MoreHorizontal size={18} />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[220px] bg-white rounded-md p-1 shadow-md border border-border z-50"
            sideOffset={5}
            align="end"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-2 py-2 text-sm text-text outline-none hover:bg-bg cursor-pointer rounded-sm"
              onClick={() => setActiveModal('migrate')}
            >
              <ArrowRightLeft size={16} className="text-primary" />
              Cambiar Plan
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-2 py-2 text-sm text-text outline-none hover:bg-bg cursor-pointer rounded-sm"
              onClick={() => setActiveModal('trial')}
            >
              <Clock size={16} className="text-yellow-600" />
              Asignar Trial
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-2 py-2 text-sm text-text outline-none hover:bg-bg cursor-pointer rounded-sm"
              onClick={() => setActiveModal('extend')}
            >
              <Calendar size={16} className="text-blue-600" />
              Extender Suscripción
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-[1px] bg-border my-1" />

            <DropdownMenu.Item
              className="flex items-center gap-2 px-2 py-2 text-sm text-text outline-none hover:bg-bg cursor-pointer rounded-sm"
              onClick={() => setActiveModal('dates')}
            >
              <Edit3 size={16} className="text-text-secondary" />
              Modificar Fechas
            </DropdownMenu.Item>

          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Modals */}
      {activeModal === 'migrate' && (
        <MigratePlanModal club={club} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'trial' && (
        <AssignTrialModal club={club} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'extend' && (
        <ExtendSubscriptionModal club={club} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'dates' && (
        <UpdateDatesModal club={club} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}
