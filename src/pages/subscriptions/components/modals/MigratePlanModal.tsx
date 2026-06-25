import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePlans, useSubscriptionActions } from '../../hooks/useSubscriptions';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';

export function MigratePlanModal({ club, onClose }: { club: SubscriptionListItem; onClose: () => void }) {
  const { data: plans } = usePlans();
  const { migratePlan } = useSubscriptionActions();
  const [selectedPriceId, setSelectedPriceId] = useState('');
  const [reason, setReason] = useState('');

  const handleSave = () => {
    if (!selectedPriceId) return;
    migratePlan.mutate(
      { clubId: club.id, data: { newPriceId: selectedPriceId, reason } },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl w-full max-w-md z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-text">Cambiar Plan</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text"><X size={20} /></button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Selecciona el nuevo plan para <strong>{club.name}</strong>.</p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nuevo Plan</label>
              <select 
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={selectedPriceId}
                onChange={(e) => setSelectedPriceId(e.target.value)}
              >
                <option value="">Seleccione un plan...</option>
                {plans?.map((plan) => 
                  plan.pricing.map((price) => (
                    <option key={price.id} value={price.id}>
                      {plan.name} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: price.currency, minimumFractionDigits: 0 }).format(price.price)}/{price.interval}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
              <Input 
                placeholder="Ej. Upgrade manual por soporte" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={handleSave} 
              disabled={!selectedPriceId || migratePlan.isPending}
            >
              {migratePlan.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Confirmar Cambio
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
