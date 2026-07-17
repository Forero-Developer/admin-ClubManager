import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubscriptionActions } from '../../hooks/useSubscriptions';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';
import { toast } from 'sonner';

export function ResolveDebtsModal({ club, onClose }: { club: SubscriptionListItem; onClose: () => void }) {
  const { resolveDebts } = useSubscriptionActions();
  const [transactionId, setTransactionId] = useState('');

  const handleSave = () => {
    resolveDebts.mutate(
      { clubId: club.id, data: transactionId ? { transactionId } : undefined },
      {
        onSuccess: () => {
          toast.success(`Deudas saldadas y club ${club.name} reactivado`);
          onClose();
        },
        onError: () => toast.error('Error al saldar las deudas'),
      }
    );
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-2xl w-full max-w-md z-50 border border-border">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-text flex items-center gap-2">
              <CheckCircle2 size={20} className="text-success" />
              Saldar Deudas y Reactivar
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text"><X size={20} /></button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
              Esto marcará todos los pagos pendientes o fallidos de <strong>{club.name}</strong> como exitosos y reactivará el club. Úsalo cuando el cliente te pagó por fuera (Nequi, Bancolombia, etc.).
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Referencia de transacción (opcional)</label>
              <Input
                placeholder="Ej. 1234567890 (referencia del giro)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <p className="text-xs text-text-secondary mt-1">Si no tienes referencia, puedes dejarlo vacío.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={resolveDebts.isPending} className="bg-success hover:bg-success/90 text-white">
              {resolveDebts.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Saldar y Reactivar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
