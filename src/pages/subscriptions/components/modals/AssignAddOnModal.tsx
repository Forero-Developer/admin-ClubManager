import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubscriptionActions, useAddOns } from '../../hooks/useSubscriptions';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';
import { toast } from 'sonner';

export function AssignAddOnModal({ club, onClose }: { club: SubscriptionListItem; onClose: () => void }) {
  const { assignManualAddOn } = useSubscriptionActions();
  const { data: addOns, isLoading: loadingAddOns } = useAddOns();
  const [selectedAddOnId, setSelectedAddOnId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!selectedAddOnId) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    assignManualAddOn.mutate(
      { clubId: club.id, data: { addOnId: selectedAddOnId, quantity: qty, notes } },
      {
        onSuccess: () => {
          toast.success(`AddOn asignado a ${club.name}`);
          onClose();
        },
        onError: () => toast.error('Error al asignar el AddOn'),
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
              <Package size={20} className="text-primary" />
              Asignar AddOn Manual
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text"><X size={20} /></button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Asignando AddOn a <strong>{club.name}</strong>. Úsalo cuando el cliente pagó el addon por transferencia.
            </p>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de AddOn</label>
              {loadingAddOns ? (
                <div className="flex items-center gap-2 text-text-secondary text-sm"><Loader2 size={14} className="animate-spin" /> Cargando...</div>
              ) : (
                <select
                  value={selectedAddOnId}
                  onChange={(e) => setSelectedAddOnId(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Seleccionar AddOn...</option>
                  {addOns?.map((addon) => (
                    <option key={addon.id} value={addon.id}>
                      {addon.name} ({addon.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cantidad / Cupo adicional</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
              <Input
                placeholder="Ej. Pagado por transferencia 2025-07"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!selectedAddOnId || assignManualAddOn.isPending}>
              {assignManualAddOn.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Asignar AddOn
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
