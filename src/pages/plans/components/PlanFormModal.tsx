import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreatePlan, useUpdatePlan, useFeatures } from '../hooks/usePlansData';
import type { SubscriptionPlan, BaseFeature } from '@/services/plans/plans.types';

const planSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  pricing: z.array(z.object({
    id: z.string().optional(),
    price: z.coerce.number().min(0, 'El precio debe ser 0 o mayor'),
    interval: z.enum(['MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'YEARLY']),
    currency: z.string().min(1, 'Moneda requerida'),
    countryCode: z.string().min(1, 'País requerido'),
  })).min(1, 'Debe haber al menos un precio configurado'),
  features: z.array(z.object({
    featureId: z.string().min(1, 'Selecciona un feature'),
    value: z.string().min(1, 'Valor requerido'),
  })),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface Props {
  plan?: SubscriptionPlan | null;
  onClose: () => void;
}

export function PlanFormModal({ plan, onClose }: Props) {
  const isEditing = !!plan;
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const { data: features } = useFeatures();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      pricing: [{ price: 0, interval: 'MONTHLY', currency: 'COP', countryCode: 'CO' }],
      features: [],
    }
  });

  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({
    control,
    name: 'pricing'
  });

  const { fields: featuresFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'features'
  });

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        pricing: plan.pricing.map(p => ({
          id: p.id,
          price: p.price,
          interval: p.interval,
          currency: p.currency,
          countryCode: p.countryCode,
        })),
        features: plan.features.map(f => ({
          featureId: f.featureId,
          value: f.value,
        })),
      });
    }
  }, [plan, reset]);

  const onSubmit = (data: PlanFormValues) => {
    if (isEditing && plan) {
      updatePlan.mutate(
        { id: plan.id, data },
        { onSuccess: onClose }
      );
    } else {
      createPlan.mutate(data, { onSuccess: onClose });
    }
  };

  const isPending = createPlan.isPending || updatePlan.isPending;

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-border flex justify-between items-center">
            <Dialog.Title className="text-lg font-bold text-text">
              {isEditing ? 'Editar Plan' : 'Crear Nuevo Plan'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text"><X size={20} /></button>
            </Dialog.Close>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Plan</label>
              <Input {...register('name')} placeholder="Ej. Premium" className={errors.name ? 'border-danger' : ''} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-text">Precios</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendPricing({ price: 0, interval: 'MONTHLY', currency: 'COP', countryCode: 'CO' })}>
                  <Plus size={16} className="mr-1" /> Añadir Precio
                </Button>
              </div>
              
              {pricingFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start border border-border p-3 rounded-md bg-bg/30">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Precio</label>
                        <Input type="number" {...register(`pricing.${index}.price`)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Intervalo</label>
                        <select className="w-full border border-border rounded-md px-3 py-2 text-sm" {...register(`pricing.${index}.interval`)}>
                          <option value="MONTHLY">Mensual</option>
                          <option value="QUARTERLY">Trimestral</option>
                          <option value="SEMIANNUAL">Semestral</option>
                          <option value="YEARLY">Anual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Moneda</label>
                        <Input {...register(`pricing.${index}.currency`)} placeholder="COP" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">País</label>
                        <Input {...register(`pricing.${index}.countryCode`)} placeholder="CO" />
                      </div>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" className="text-danger mt-6" onClick={() => removePricing(index)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              {errors.pricing && <p className="text-xs text-danger">{errors.pricing.message}</p>}
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-text">Características (Features)</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ featureId: '', value: '' })}>
                  <Plus size={16} className="mr-1" /> Añadir Feature
                </Button>
              </div>
              
              {featuresFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start border border-border p-3 rounded-md bg-bg/30">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Característica</label>
                      <select className="w-full border border-border rounded-md px-3 py-2 text-sm" {...register(`features.${index}.featureId`)}>
                        <option value="">Seleccione...</option>
                        {features?.map((f: BaseFeature) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      {errors.features?.[index]?.featureId && <p className="text-xs text-danger mt-1">{errors.features[index]?.featureId?.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Valor</label>
                      <Input {...register(`features.${index}.value`)} placeholder="Ej. true, 100, ilimitado" />
                      {errors.features?.[index]?.value && <p className="text-xs text-danger mt-1">{errors.features[index]?.value?.message}</p>}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" className="text-danger mt-6" onClick={() => removeFeature(index)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Plan'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
