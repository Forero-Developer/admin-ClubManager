import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubscriptionActions } from '../../hooks/useSubscriptions';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';

export function AssignTrialModal({ club, onClose }: { club: SubscriptionListItem; onClose: () => void }) {
  const { assignTrial } = useSubscriptionActions();
  const [days, setDays] = useState('14');
  const [reason, setReason] = useState('');

  const handleSave = () => {
    const trialDays = parseInt(days, 10);
    if (isNaN(trialDays) || trialDays <= 0) return;
    
    assignTrial.mutate(
      { clubId: club.id, data: { days: trialDays, reason } },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl w-full max-w-md z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-text">Asignar Período de Prueba</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text"><X size={20} /></button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Esto cambiará el estado de <strong>{club.name}</strong> a TRIAL y limpiará cualquier suscripción activa.
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Días de prueba</label>
              <Input 
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
              <Input 
                placeholder="Ej. Extensión comercial" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={handleSave} 
              disabled={!days || assignTrial.isPending}
            >
              {assignTrial.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Asignar Trial
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
