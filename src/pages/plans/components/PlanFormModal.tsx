import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreatePlan, useUpdatePlan, useFeatures } from '../hooks/usePlansData';
import type { SubscriptionPlan, BaseFeature } from '@/services/plans/plans.types';

const planSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  pricing: z.array(z.object({
    id: z.string().optional(),
    price: z.number({ error: 'El precio debe ser un número' }).min(0, 'El precio debe ser 0 o mayor'),
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

// Detecta el tipo de input según el código del feature
function getInputTypeForFeature(feature: BaseFeature | undefined): 'boolean' | 'number' | 'text' {
  if (!feature) return 'text';
  const code = feature.code.toLowerCase();
  if (code.includes('max_') || code.includes('limit') || code.includes('count')) return 'number';
  if (code.includes('enable') || code.includes('allow') || code.includes('advanced') || code.includes('active')) return 'boolean';
  return 'text';
}

// Input inteligente según el tipo de feature
function FeatureValueInput({
  feature,
  value,
  onChange,
  error,
}: {
  feature: BaseFeature | undefined;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const inputType = getInputTypeForFeature(feature);

  if (inputType === 'boolean') {
    return (
      <div>
        <label className="block text-xs font-medium mb-1">Valor</label>
        <select
          className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seleccione...</option>
          <option value="true">✅ Habilitado (true)</option>
          <option value="false">❌ Deshabilitado (false)</option>
        </select>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    );
  }

  if (inputType === 'number') {
    return (
      <div>
        <label className="block text-xs font-medium mb-1">
          Valor <span className="text-text-secondary font-normal">(número o "ilimitado")</span>
        </label>
        <Input
          type="text"
          placeholder="Ej. 100, 9999, ilimitado"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1">Valor</label>
      <Input
        type="text"
        placeholder="Ej. basico, premium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function PlanFormModal({ plan, onClose }: Props) {
  const isEditing = !!plan;
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const { data: features, isLoading: loadingFeatures } = useFeatures();

  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      pricing: [{ price: 0, interval: 'MONTHLY', currency: 'COP', countryCode: 'CO' }],
      features: [],
    }
  });

  // Watch the features array to get featureId per row for smart inputs
  const watchedFeatures = useWatch({ control, name: 'features' });

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
        description: plan.description ?? '',
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

  const onSubmit: SubmitHandler<PlanFormValues> = (data) => {
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
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Plan</label>
              <Input {...register('name')} placeholder="Ej. Premium" className={errors.name ? 'border-danger' : ''} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-1">Descripción <span className="text-text-secondary font-normal">(opcional)</span></label>
              <textarea
                {...register('description')}
                placeholder="Describe brevemente este plan y para quién está orientado..."
                rows={2}
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Pricing Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-text">Precios</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendPricing({ price: 0, interval: 'MONTHLY', currency: 'COP', countryCode: 'CO' })}>
                  <Plus size={14} className="mr-1" /> Añadir Precio
                </Button>
              </div>
              
              {pricingFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start border border-border p-3 rounded-md bg-bg/30">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Precio</label>
                      <Input type="number" {...register(`pricing.${index}.price`, { valueAsNumber: true })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Intervalo</label>
                      <select className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" {...register(`pricing.${index}.interval`)}>
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
                  <Button type="button" variant="ghost" className="text-danger mt-5 shrink-0" onClick={() => removePricing(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {errors.pricing?.root && <p className="text-xs text-danger">{errors.pricing.root.message}</p>}
            </div>

            {/* Features Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-text">
                  Características (Features)
                  {loadingFeatures && <Loader2 size={12} className="inline ml-2 animate-spin text-text-secondary" />}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!features || features.length === 0}
                  onClick={() => appendFeature({ featureId: '', value: '' })}
                >
                  <Plus size={14} className="mr-1" /> Añadir Feature
                </Button>
              </div>

              {!loadingFeatures && (!features || features.length === 0) && (
                <p className="text-xs text-text-secondary border border-dashed border-border p-3 rounded-md">
                  No hay características base registradas en la base de datos. Crea primero las "Features" en la base de datos.
                </p>
              )}
              
              {featuresFields.map((field, index) => {
                const selectedFeatureId = watchedFeatures?.[index]?.featureId;
                const selectedFeature = features?.find((f: BaseFeature) => f.id === selectedFeatureId);
                
                return (
                  <div key={field.id} className="flex gap-2 items-start border border-border p-3 rounded-md bg-bg/30">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Característica</label>
                        <select
                          className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          {...register(`features.${index}.featureId`)}
                          onChange={(e) => {
                            setValue(`features.${index}.featureId`, e.target.value);
                            setValue(`features.${index}.value`, ''); // Limpiar valor al cambiar feature
                          }}
                        >
                          <option value="">Seleccione...</option>
                          {features?.map((f: BaseFeature) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.code})
                            </option>
                          ))}
                        </select>
                        {errors.features?.[index]?.featureId && (
                          <p className="text-xs text-danger mt-1">{errors.features[index]?.featureId?.message}</p>
                        )}
                        {selectedFeature?.description && (
                          <p className="text-xs text-text-secondary mt-1">{selectedFeature.description}</p>
                        )}
                      </div>
                      <FeatureValueInput
                        feature={selectedFeature}
                        value={watchedFeatures?.[index]?.value ?? ''}
                        onChange={(v) => setValue(`features.${index}.value`, v)}
                        error={errors.features?.[index]?.value?.message}
                      />
                    </div>
                    <Button type="button" variant="ghost" className="text-danger mt-5 shrink-0" onClick={() => removeFeature(index)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                );
              })}
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
