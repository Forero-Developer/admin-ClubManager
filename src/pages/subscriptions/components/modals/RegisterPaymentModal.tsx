import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubscriptionActions, usePlans } from '../../hooks/useSubscriptions';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';
import { toast } from 'sonner';

const paymentSchema = z.object({
  newPriceId: z.string().min(1, 'Seleccione un plan'),
  amount: z.number({ error: 'Debe ser un número' }).min(0, 'No puede ser negativo'),
  method: z.enum(['TRANSFER', 'CARD', 'CASH', 'LINK'], { error: 'Método inválido' }),
  transactionId: z.string().min(1, 'N° de transacción requerido'),
  paymentDate: z.string().min(1, 'La fecha es requerida'),
  paymentTime: z.string().min(1, 'La hora es requerida'),
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2020),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface Props {
  club: SubscriptionListItem;
  onClose: () => void;
}

export function RegisterPaymentModal({ club, onClose }: Props) {
  const { registerPayment } = useSubscriptionActions();
  const { data: plansData, isLoading: plansLoading } = usePlans();

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().split(' ')[0].slice(0, 5);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      newPriceId: club.subscriptionPrice?.id || '',
      amount: club.subscriptionPrice?.price || 0,
      method: 'TRANSFER',
      transactionId: '',
      paymentDate: defaultDate,
      paymentTime: defaultTime,
      periodMonth: now.getMonth() + 1,
      periodYear: now.getFullYear(),
      reason: 'Pago manual registrado por admin',
    }
  });

  const selectedPriceId = watch('newPriceId');

  // Actualizar el monto automáticamente si cambian el plan
  useEffect(() => {
    if (plansData) {
      for (const plan of plansData) {
        const price = plan.pricing.find(p => p.id === selectedPriceId);
        if (price) {
          setValue('amount', price.price);
          break;
        }
      }
    }
  }, [selectedPriceId, plansData, setValue]);

  const onSubmit = (data: PaymentFormValues) => {
    // Combinar fecha y hora
    const combinedDateTime = new Date(`${data.paymentDate}T${data.paymentTime}:00`);

    registerPayment.mutate(
      {
        clubId: club.id,
        data: {
          newPriceId: data.newPriceId,
          amount: data.amount,
          method: data.method,
          transactionId: data.transactionId,
          periodMonth: data.periodMonth,
          periodYear: data.periodYear,
          notes: data.notes,
          reason: data.reason,
          paymentDate: combinedDateTime.toISOString(),
        }
      },
      {
        onSuccess: () => {
          toast.success('Pago registrado y plan migrado');
          onClose();
        },
        onError: () => {
          toast.error('Error al registrar el pago');
        }
      }
    );
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <Dialog.Title className="text-lg font-semibold text-text">Registrar Pago Manual</Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary mt-1">
                {club.name}
              </Dialog.Description>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Plan Pagado (Se migrará al club)</label>
                {plansLoading ? (
                  <div className="h-10 animate-pulse bg-bg rounded-md"></div>
                ) : (
                  <select
                    {...register('newPriceId')}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Selecciona un plan</option>
                    {plansData?.map((plan) => (
                      <optgroup key={plan.id} label={plan.name}>
                        {plan.pricing.map((price) => (
                          <option key={price.id} value={price.id}>
                            {plan.name} - ${price.price} {price.currency}/{price.interval}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
                {errors.newPriceId && <p className="text-xs text-danger">{errors.newPriceId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Monto Recibido</label>
                  <Input
                    type="number"
                    {...register('amount', { valueAsNumber: true })}
                    error={errors.amount?.message}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Método de Pago</label>
                  <select
                    {...register('method')}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="TRANSFER">Transferencia</option>
                    <option value="CASH">Efectivo</option>
                    <option value="LINK">Link de Pago</option>
                    <option value="CARD">Tarjeta (Manual)</option>
                  </select>
                  {errors.method && <p className="text-xs text-danger">{errors.method.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Fecha del Pago</label>
                  <Input type="date" {...register('paymentDate')} error={errors.paymentDate?.message} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Hora del Pago</label>
                  <Input type="time" {...register('paymentTime')} error={errors.paymentTime?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text">N° de Transacción / Comprobante</label>
                <Input
                  {...register('transactionId')}
                  placeholder="Ej: TXN-492942"
                  error={errors.transactionId?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Mes Cubierto</label>
                  <Input
                    type="number"
                    min="1" max="12"
                    {...register('periodMonth', { valueAsNumber: true })}
                    error={errors.periodMonth?.message}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">Año Cubierto</label>
                  <Input
                    type="number"
                    min="2020"
                    {...register('periodYear', { valueAsNumber: true })}
                    error={errors.periodYear?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Razón del cambio</label>
                <Input
                  {...register('reason')}
                  placeholder="Razón que quedará en el historial"
                  error={errors.reason?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text">Notas adicionales (opcional)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Notas sobre el comprobante o el pago"
                />
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-border flex justify-end gap-3 bg-bg/50">
            <Button variant="outline" onClick={onClose} disabled={registerPayment.isPending}>
              Cancelar
            </Button>
            <Button type="submit" form="payment-form" disabled={registerPayment.isPending}>
              {registerPayment.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrar Pago'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
