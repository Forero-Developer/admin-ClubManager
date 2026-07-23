import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsService } from '@/services/subscriptions/subscriptions.service';
import { X, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AssignAddOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
}

export function AssignAddOnModal({ isOpen, onClose, clubId }: AssignAddOnModalProps) {
  const queryClient = useQueryClient();
  const [selectedAddOn, setSelectedAddOn] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [isGift, setIsGift] = useState<boolean>(false);

  const { data: addOns, isLoading } = useQuery({
    queryKey: ['admin-addons'],
    queryFn: () => subscriptionsService.getAddOns(),
    enabled: isOpen,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { addOnId: string; quantity: number; reason: string; isGift: boolean }) =>
      subscriptionsService.assignManualAddOn(clubId, data),
    onSuccess: () => {
      toast.success('AddOn asignado correctamente');
      queryClient.invalidateQueries({ queryKey: ['clubs', clubId] });
      onClose();
      // Reset form
      setSelectedAddOn('');
      setQuantity(1);
      setReason('');
      setIsGift(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al asignar el AddOn');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddOn) {
      toast.error('Selecciona un AddOn');
      return;
    }
    mutate({ addOnId: selectedAddOn, quantity, reason, isGift });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Asignar AddOn Manual
          </h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text rounded-lg hover:bg-bg transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">AddOn a Asignar</label>
            {isLoading ? (
              <div className="h-10 border border-border rounded-lg bg-bg/50 animate-pulse" />
            ) : (
              <select
                value={selectedAddOn}
                onChange={(e) => setSelectedAddOn(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text"
                required
              >
                <option value="">Selecciona un AddOn...</option>
                {addOns?.map((addon) => (
                  <option key={addon.id} value={addon.id}>
                    {addon.name} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: addon.currency }).format(addon.price)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text"
              required
            />
            <p className="text-[11px] text-text-secondary mt-1">
              Depende del AddOn. Por ejemplo, si es "100 Mensajes", cantidad 2 = 200 Mensajes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Motivo / Notas</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Pago realizado por transferencia externa, cortesía, etc."
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="w-4 h-4 text-primary bg-white border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-text font-medium">Es un obsequio / cortesía</span>
            </label>
            <p className="text-[11px] text-text-secondary mt-1 pl-6">
              Si marcas esta opción, el monto registrado en auditoría será $0 y no inflará tus métricas de ingresos.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text border border-transparent hover:border-border hover:bg-bg rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedAddOn}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? 'Asignando...' : 'Asignar AddOn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
