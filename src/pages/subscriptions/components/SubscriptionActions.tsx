import { useState } from 'react';
import { MoreHorizontal, Calendar, ArrowRightLeft, Clock, Edit3, AlertOctagon, ArrowDownCircle, DollarSign, Trash2, XCircle } from 'lucide-react';
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
import { RegisterPaymentModal } from './modals/RegisterPaymentModal';
import { clubsService } from '@/services/clubs/clubs.service';
import { toast } from 'sonner';
import { useSubscriptionActions } from '../hooks/useSubscriptions';

interface SubscriptionActionsProps {
  club: SubscriptionListItem;
}

export function SubscriptionActions({ club }: SubscriptionActionsProps) {
  const [activeModal, setActiveModal] = useState<'migrate' | 'trial' | 'extend' | 'dates' | 'payment' | null>(null);

  const { downgradeToFree, cancelSubscription, deleteClub } = useSubscriptionActions();

  const handleDowngrade = () => {
    downgradeToFree.mutate(club.id, {
      onSuccess: () => toast.success('Club degradado a plan gratuito'),
      onError: () => toast.error('Error al degradar el club')
    });
  };

  const handleCancel = () => {
    const reason = prompt(`¿Razón para cancelar la suscripción de "${club.name}"?`);
    if (reason !== null) {
      cancelSubscription.mutate({ clubId: club.id, reason }, {
        onSuccess: () => toast.success('Suscripción cancelada en Mercado Pago'),
        onError: () => toast.error('Error al cancelar la suscripción')
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar todo el club "${club.name}"? Esto borrará jugadores, pagos y configuraciones en cascada. ESTA ACCIÓN NO SE PUEDE DESHACER.`)) {
      deleteClub.mutate(club.id, {
        onSuccess: () => toast.success('Club eliminado en cascada correctamente'),
        onError: () => toast.error('Error al eliminar el club')
      });
    }
  };

  // ─── Club SUSPENDIDO: solo mostrar botón de plan gratuito y eliminar ───
  if (club.status === 'SUSPENDED') {
    return (
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1">
          <AlertOctagon size={13} />
          <span>Acceso suspendido</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-primary text-primary hover:bg-primary-light"
          onClick={handleDowngrade}
          disabled={downgradeToFree.isPending}
        >
          <ArrowDownCircle size={13} className="mr-1" />
          {downgradeToFree.isPending ? 'Procesando...' : 'Pasar a Gratuito'}
        </Button>
        <Button variant="outline" size="sm" className="text-xs text-danger border-danger/30 hover:bg-danger/10" onClick={handleDelete} disabled={deleteClub.isPending}>
          <Trash2 size={13} />
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
            align="end"
            className="w-56 bg-white border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in-80 zoom-in-95"
          >
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm text-text cursor-pointer hover:bg-bg outline-none transition-colors"
              onClick={() => setActiveModal('payment')}
            >
              <DollarSign size={16} className="mr-2 text-green-500" />
              Registrar Pago Manual
            </DropdownMenu.Item>
            
            <DropdownMenu.Separator className="h-px bg-border my-1" />
            
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm text-text cursor-pointer hover:bg-bg outline-none transition-colors"
              onClick={() => setActiveModal('migrate')}
            >
              <ArrowRightLeft size={16} className="mr-2 text-primary" />
              Migrar Plan
            </DropdownMenu.Item>
            
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm text-text cursor-pointer hover:bg-bg outline-none transition-colors"
              onClick={() => setActiveModal('trial')}
            >
              <Clock size={16} className="mr-2 text-yellow-500" />
              Asignar Trial
            </DropdownMenu.Item>
            
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm text-text cursor-pointer hover:bg-bg outline-none transition-colors"
              onClick={() => setActiveModal('extend')}
            >
              <Calendar size={16} className="mr-2 text-blue-500" />
              Extender Suscripción
            </DropdownMenu.Item>
            
            <DropdownMenu.Separator className="h-px bg-border my-1" />
            
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm text-text cursor-pointer hover:bg-bg outline-none transition-colors"
              onClick={() => setActiveModal('dates')}
            >
              <Edit3 size={16} className="mr-2 text-text-secondary" />
              Actualizar Fechas
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-border my-1" />

            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm text-text cursor-pointer hover:bg-orange-50 outline-none transition-colors"
              onClick={handleCancel}
            >
              <XCircle size={16} className="mr-2 text-orange-500" />
              Cancelar Suscripción
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-border my-1" />

            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm text-danger cursor-pointer hover:bg-danger/10 outline-none transition-colors"
              onClick={handleDelete}
            >
              <Trash2 size={16} className="mr-2 text-danger" />
              Eliminar Club
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Modales */}
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
      {activeModal === 'payment' && (
        <RegisterPaymentModal club={club} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}
