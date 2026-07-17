import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateAddOn, useUpdateAddOn } from '../hooks/usePlansData';
import { useEffect } from 'react';

const addOnSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  code: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'No puede ser negativo'),
  interval: z.string().optional(),
});

type AddOnFormValues = z.infer<typeof addOnSchema>;

interface Props {
  addon?: any | null;
  onClose: () => void;
}

export function AddOnFormModal({ addon, onClose }: Props) {
  const isEditing = !!addon;
  const createAddOn = useCreateAddOn();
  const updateAddOn = useUpdateAddOn();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddOnFormValues>({
    resolver: zodResolver(addOnSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      price: 0,
      interval: 'MONTHLY',
    }
  });

  useEffect(() => {
    if (addon) {
      reset({
        name: addon.name,
        code: addon.code,
        description: addon.description || '',
        price: Number(addon.price || addon.pricing?.[0]?.price || 0),
        interval: addon.pricing?.[0]?.interval || 'MONTHLY',
      });
    }
  }, [addon, reset]);

  const onSubmit = (data: AddOnFormValues) => {
    if (isEditing) {
      updateAddOn.mutate({ id: addon.id, data }, {
        onSuccess: () => onClose()
      });
    } else {
      createAddOn.mutate(data, {
        onSuccess: () => onClose()
      });
    }
  };

  const isPending = createAddOn.isPending || updateAddOn.isPending;

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <Dialog.Title className="text-lg font-semibold text-text">
                {isEditing ? 'Editar AddOn' : 'Nuevo AddOn'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary mt-1">
                {isEditing ? 'Modifica los datos o precio base del paquete.' : 'Crea un nuevo paquete adicional.'}
              </Dialog.Description>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="addon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div>
                <label className="text-sm font-medium text-text block mb-1.5">Nombre del AddOn</label>
                <Input {...register('name')} placeholder="Ej. Paquete 10 Jugadores" />
                {errors.name && <span className="text-xs text-danger mt-1 block">{errors.name.message}</span>}
              </div>

              <div>
                <label className="text-sm font-medium text-text block mb-1.5">Código Único</label>
                <Input {...register('code')} placeholder="Ej. player_pack_10" />
                {errors.code && <span className="text-xs text-danger mt-1 block">{errors.code.message}</span>}
              </div>

              <div>
                <label className="text-sm font-medium text-text block mb-1.5">Descripción</label>
                <textarea
                  {...register('description')}
                  className="w-full bg-bg border border-border rounded-lg p-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                  placeholder="Detalles sobre este paquete..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text block mb-1.5">Precio Base (Mensual)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                  <Input 
                    type="number" 
                    {...register('price', { valueAsNumber: true })} 
                    className="pl-8"
                  />
                </div>
                {errors.price && <span className="text-xs text-danger mt-1 block">{errors.price.message}</span>}
                <p className="text-xs text-text-secondary mt-1">El sistema multiplicará este valor automáticamente si el club paga trimestral, semestral o anual.</p>
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-border bg-bg/50 flex justify-end gap-3 mt-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="addon-form" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar AddOn'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
