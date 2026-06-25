import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubscriptionActions } from '../../hooks/useSubscriptions';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';
import { format } from 'date-fns';

export function UpdateDatesModal({ club, onClose }: { club: SubscriptionListItem; onClose: () => void }) {
  const { updateDates } = useSubscriptionActions();
  
  // Initialize with current values (format to YYYY-MM-DD for date inputs)
  const formatDateForInput = (isoDate: string | null | undefined) => 
    isoDate ? format(new Date(isoDate), 'yyyy-MM-dd') : '';

  const [trialEndsAt, setTrialEndsAt] = useState(formatDateForInput(club.trialEndsAt));
  const [subscriptionEnd, setSubscriptionEnd] = useState(formatDateForInput(club.subscriptionEnd));
  const [billingCycleEnd, setBillingCycleEnd] = useState(formatDateForInput(club.billingCycleEnd));

  const handleSave = () => {
    updateDates.mutate(
      { 
        clubId: club.id, 
        data: { 
          trialEndsAt: trialEndsAt ? new Date(trialEndsAt).toISOString() : undefined,
          subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd).toISOString() : undefined,
          billingCycleEnd: billingCycleEnd ? new Date(billingCycleEnd).toISOString() : undefined,
        } 
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl w-full max-w-md z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-text">Modificar Fechas</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text"><X size={20} /></button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Ajusta manualmente las fechas de corte para <strong>{club.name}</strong>. Cuidado, esto afecta la lógica de pagos automáticos.
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fin de Trial (Opcional)</label>
              <Input 
                type="date"
                value={trialEndsAt}
                onChange={(e) => setTrialEndsAt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fin de Suscripción</label>
              <Input 
                type="date"
                value={subscriptionEnd}
                onChange={(e) => setSubscriptionEnd(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fin de Ciclo de Facturación</label>
              <Input 
                type="date"
                value={billingCycleEnd}
                onChange={(e) => setBillingCycleEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={handleSave} 
              disabled={updateDates.isPending}
            >
              {updateDates.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Guardar Fechas
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
