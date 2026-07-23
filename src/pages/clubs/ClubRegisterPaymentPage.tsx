import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClubDetail } from './hooks/useClubs';
import { ArrowLeft, CreditCard, Building2, Package, AlertTriangle, Minus, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubscriptionActions, usePlans, useAddOns } from '../subscriptions/hooks/useSubscriptions';
import { toast } from 'sonner';
import { format } from 'date-fns';

const paymentSchema = z.object({
  newPriceId: z.string().optional(),
  amount: z.number({ error: 'Debe ser un número' }).min(0, 'No puede ser negativo'),
  method: z.enum(['TRANSFER', 'CARD', 'CASH', 'LINK'], { error: 'Método inválido' }),
  transactionId: z.string().min(1, 'N° de transacción requerido'),
  paymentDate: z.string().min(1, 'La fecha es requerida'),
  paymentTime: z.string().min(1, 'La hora es requerida'),
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2020),
  notes: z.string().optional(),
  reason: z.string().optional(),
  addOns: z.array(z.object({
    addOnId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
  isGift: z.boolean().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function ClubRegisterPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: club, isLoading: clubLoading } = useClubDetail(id || '');
  const { registerPayment } = useSubscriptionActions();
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { data: addOnsData, isLoading: addOnsLoading } = useAddOns();

  const now = new Date();
  const defaultDate = format(now, 'yyyy-MM-dd');
  const defaultTime = format(now, 'HH:mm');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      newPriceId: '',
      amount: 0,
      method: 'TRANSFER',
      transactionId: '',
      paymentDate: defaultDate,
      paymentTime: defaultTime,
      periodMonth: now.getMonth() + 1,
      periodYear: now.getFullYear(),
      reason: 'Pago manual registrado por admin',
      addOns: [],
      isGift: false,
    }
  });

  const selectedPriceId = watch('newPriceId');
  const selectedAddOns = watch('addOns') || [];
  const selectedAmount = watch('amount');

  const [hasAutoCalculated, setHasAutoCalculated] = useState(false);
  const [baseCapacity, setBaseCapacity] = useState(30);

  // Derivar el intervalo actual del plan (para mostrar precios correctos de AddOns)
  let currentInterval = 'MONTHLY';
  if (plansData && club) {
    if (selectedPriceId) {
      for (const plan of plansData) {
        const price = plan.pricing?.find((p: any) => p.id === selectedPriceId);
        if (price) {
          currentInterval = price.interval;
          break;
        }
      }
    } else if (club.subscriptionPrice) {
      currentInterval = club.subscriptionPrice.interval;
    }
  }

  // Initialize newPriceId and amount when club loads
  useEffect(() => {
    if (club && !selectedPriceId && club.subscriptionPrice) {
      setValue('newPriceId', club.subscriptionPrice.id);
      setValue('amount', Number(club.subscriptionPrice.price) || 0);
    }
  }, [club, setValue, selectedPriceId]);

  // Auto-calcular AddOns requeridos según los jugadores activos y el plan seleccionado
  useEffect(() => {
    if (!addOnsData || !plansData || !club) return;

    let capacity = 30;
    
    // Buscar el plan seleccionado o el actual del club
    let targetPlan = null;
    if (selectedPriceId) {
      targetPlan = plansData.find((p: any) => p.pricing?.some((pr: any) => pr.id === selectedPriceId));
    } else {
      targetPlan = plansData.find((p: any) => p.id === club.subscriptionPrice?.plan?.id);
    }

    if (targetPlan) {
      const maxPlayersFeature = targetPlan.features?.find((f: any) => f.feature.code === 'max_players');
      if (maxPlayersFeature && maxPlayersFeature.value) {
        capacity = parseInt(maxPlayersFeature.value);
      }
    }
    setBaseCapacity(capacity);

    // Solo autocalculamos la primera vez que se carga la data
    if (!hasAutoCalculated) {
      const currentPlayers = club._count?.players || 0;
      
      // 1. Inicializar con los addons que YA tiene activos el club y que NO son de pago único
      let initialAddOns = (club.addOns || [])
        .filter((a: any) => a.status === 'ACTIVE')
        .filter((a: any) => {
          const addOnDef = addOnsData.find((ad: any) => ad.id === (a.addOnId || a.addOn?.id));
          const isOneTime = addOnDef?.pricing?.[0]?.interval === 'ONE_TIME';
          return !isOneTime;
        })
        .map((a: any) => ({
          addOnId: a.addOnId || a.addOn?.id,
          quantity: a.quantity
        }));
      
      // 2. Si excede la capacidad, asegurar que al menos tenga los paquetes de jugadores necesarios
      if (currentPlayers > capacity) {
        const extraPlayers = currentPlayers - capacity;
        const requiredQuantity = Math.ceil(extraPlayers / 10);
        
        const playerPackAddOn = addOnsData.find((a: any) => a.code === 'player_pack_10') || addOnsData[0];
        
        if (playerPackAddOn) {
          const existingPackIndex = initialAddOns.findIndex((a: any) => a.addOnId === playerPackAddOn.id);
          
          if (existingPackIndex >= 0) {
            // Actualizar cantidad si es menor a la requerida
            if (initialAddOns[existingPackIndex].quantity < requiredQuantity) {
              initialAddOns[existingPackIndex].quantity = requiredQuantity;
            }
          } else {
            // Agregar el paquete si no lo tenía
            initialAddOns.push({ addOnId: playerPackAddOn.id, quantity: requiredQuantity });
          }
        }
      }
      
      setValue('addOns', initialAddOns);
      setHasAutoCalculated(true);
    }
  }, [addOnsData, plansData, club, setValue, hasAutoCalculated, selectedPriceId]);

  // Actualizar el monto automáticamente si cambian el plan o los addons
  useEffect(() => {
    if (!hasAutoCalculated) return;
    
    let totalAmount = 0;
    
    // Base plan
    let intervalMultiplier = 1;
    let discountPercent = 0;

    if (plansData) {
      if (selectedPriceId) {
        for (const plan of plansData) {
          const price = plan.pricing.find((p: any) => p.id === selectedPriceId);
          if (price) {
            totalAmount += Number(price.price) || 0;
            if (price.interval === 'QUARTERLY') intervalMultiplier = 3;
            else if (price.interval === 'SEMIANNUAL') intervalMultiplier = 6;
            else if (price.interval === 'YEARLY') intervalMultiplier = 12;
            
            if (price.discount) discountPercent = Number(price.discount);
            break;
          }
        }
      } else if (club?.subscriptionPrice) {
        totalAmount += Number(club.subscriptionPrice.price) || 0;
        const interval = club.subscriptionPrice.interval;
        if (interval === 'QUARTERLY') intervalMultiplier = 3;
        else if (interval === 'SEMIANNUAL') intervalMultiplier = 6;
        else if (interval === 'YEARLY') intervalMultiplier = 12;

        if (club.subscriptionPrice.discount) discountPercent = Number(club.subscriptionPrice.discount);
      }
    }

    // AddOns
    if (addOnsData && selectedAddOns.length > 0) {
      const discountFactor = discountPercent > 0 ? (100 - discountPercent) / 100 : 1;

      selectedAddOns.forEach(selectedAddOn => {
        const addon = addOnsData.find((a: any) => a.id === selectedAddOn.addOnId);
        if (!addon) return;

        let activePrice = 0;
        let finalMultiplier = 1;

        const matchingPricing = addon.pricing?.find((p: any) => p.interval === currentInterval);
        if (matchingPricing) {
          activePrice = Number(matchingPricing.price);
          // Si hace match exacto (ej. QUARTERLY), el precio ya es por el trimestre, no multiplicamos más.
          finalMultiplier = 1; 
        } else {
          const monthlyPricing = addon.pricing?.find((p: any) => p.interval === 'MONTHLY');
          if (monthlyPricing) {
            activePrice = Number(monthlyPricing.price);
            finalMultiplier = intervalMultiplier;
          } else {
            const firstPricing = addon.pricing?.[0];
            if (firstPricing) {
              activePrice = Number(firstPricing.price);
              if (firstPricing.interval === 'ONE_TIME') {
                finalMultiplier = 1;
              } else {
                finalMultiplier = intervalMultiplier;
              }
            } else {
              activePrice = Number(addon.price || 0);
              finalMultiplier = intervalMultiplier;
            }
          }
        }

        if (activePrice > 0) {
          const rawTotal = activePrice * (selectedAddOn.quantity || 1) * finalMultiplier;
          totalAmount += rawTotal * discountFactor;
        }
      });
    }

    if (totalAmount > 0) {
      setValue('amount', totalAmount, { shouldValidate: true });
    }
  }, [selectedPriceId, selectedAddOns, plansData, addOnsData, setValue, hasAutoCalculated, club]);

  const onSubmit = (data: PaymentFormValues) => {
    if (!club) return;
    
    // Combinar fecha y hora
    const combinedDateTime = new Date(`${data.paymentDate}T${data.paymentTime}:00`);

    registerPayment.mutate(
      {
        clubId: club.id,
        data: {
          newPriceId: data.newPriceId || undefined,
          amount: data.amount,
          method: data.method,
          transactionId: data.transactionId,
          periodMonth: data.periodMonth,
          periodYear: data.periodYear,
          notes: data.notes,
          reason: data.reason,
          paymentDate: combinedDateTime.toISOString(),
          addOns: data.addOns?.filter(a => a.addOnId && a.quantity > 0),
          isGift: data.isGift,
        }
      },
      {
        onSuccess: () => {
          toast.success('Pago y renovación registrados correctamente');
          navigate(`/clubs/${club.id}`);
        },
        onError: () => {
          toast.error('Error al registrar el pago');
        }
      }
    );
  };

  const handleAddOnToggle = (addOnId: string, checked: boolean) => {
    const currentAddOns = watch('addOns') || [];
    if (checked) {
      setValue('addOns', [...currentAddOns, { addOnId, quantity: 1 }]);
    } else {
      setValue('addOns', currentAddOns.filter(a => a.addOnId !== addOnId));
    }
  };

  const handleAddOnQuantityChange = (addOnId: string, quantity: number) => {
    const currentAddOns = watch('addOns') || [];
    setValue('addOns', currentAddOns.map(a => a.addOnId === addOnId ? { ...a, quantity } : a));
  };

  const handleDecreaseCapacity = (addOnId: string) => {
    const currentAddOns = watch('addOns') || [];
    const existing = currentAddOns.find(a => a.addOnId === addOnId);
    if (existing && existing.quantity > 0) {
      if (existing.quantity === 1) {
        setValue('addOns', currentAddOns.filter(a => a.addOnId !== addOnId));
      } else {
        setValue('addOns', currentAddOns.map(a => a.addOnId === addOnId ? { ...a, quantity: existing.quantity - 1 } : a));
      }
    }
  };

  const handleIncreaseCapacity = (addOnId: string) => {
    const currentAddOns = watch('addOns') || [];
    const existing = currentAddOns.find(a => a.addOnId === addOnId);
    if (!existing) {
      setValue('addOns', [...currentAddOns, { addOnId, quantity: 1 }]);
    } else {
      setValue('addOns', currentAddOns.map(a => a.addOnId === addOnId ? { ...a, quantity: existing.quantity + 1 } : a));
    }
  };

  const formatCurrency = (amount: number, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  };

  if (clubLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-border rounded-lg w-48" />
        <div className="h-64 bg-border rounded-xl" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-8 text-center text-text-secondary">Club no encontrado</div>
    );
  }

  const currentPlayers = club._count?.players || 0;
  
  // Calcular capacidad adicional de los addons seleccionados
  let additionalCapacity = 0;
  if (addOnsData) {
    selectedAddOns.forEach(selectedAddOn => {
      const addon = addOnsData.find((a: any) => a.id === selectedAddOn.addOnId);
      // Asumimos que cualquier AddOn con 'player_pack' da 10 jugadores. 
      // Si a futuro hay de 20, se puede parsear el código o usar el Feature asociado
      if (addon && addon.code === 'player_pack_10') {
        additionalCapacity += 10 * (selectedAddOn.quantity || 1);
      }
    });
  }

  const totalCapacity = baseCapacity + additionalCapacity;
  const isExceeding = currentPlayers > totalCapacity;

  let uiDiscountPercent = 0;

  if (plansData) {
    if (selectedPriceId) {
      for (const plan of plansData) {
        const price = plan.pricing?.find((p: any) => p.id === selectedPriceId);
        if (price) {
          if (price.discount) uiDiscountPercent = Number(price.discount);
          break;
        }
      }
    } else if (club?.subscriptionPrice) {
      if (club.subscriptionPrice.discount) uiDiscountPercent = Number(club.subscriptionPrice.discount);
    }
  }

  let uiDiscountFactor = uiDiscountPercent > 0 ? (100 - uiDiscountPercent) / 100 : 1;

  return (
    <>
      <div className="p-8 pb-32 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
        <Link 
          to={`/clubs/${club.id}`} 
          className="p-2 hover:bg-bg rounded-lg text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <CreditCard className="text-primary" /> Registrar Pago
          </h1>
          <p className="text-text-secondary mt-1">{club.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Resumen y Contexto */}
        <div className="space-y-6">
          <div className="bg-surface border border-border p-6 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              Estado Actual
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Estado</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  club.status === 'TRIAL' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  club.status === 'ACTIVE' ? 'bg-success/10 text-success border border-success/20' :
                  'bg-surface text-text border border-border'
                }`}>
                  {club.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Plan Actual</span>
                <span className="font-medium text-text">{club.subscriptionPrice?.plan?.name || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-text-secondary">Jugadores Activos</span>
                <span className="font-medium text-text">{currentPlayers}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">Límite del Plan</span>
                <span className="font-medium text-text">{baseCapacity}</span>
              </div>
            </div>

            {isExceeding && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mt-4">
                <div className="flex gap-3">
                  <AlertTriangle className="text-warning shrink-0" size={20} />
                  <div>
                    <h3 className="font-medium text-warning text-sm">Excede límite de jugadores</h3>
                    <p className="text-xs text-warning/80 mt-1">
                      El club tiene {currentPlayers - baseCapacity} jugador(es) por encima de su plan base.
                      Se recomienda cobrar AddOns adicionales.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Central: Formulario principal */}
        <div className="lg:col-span-2">
          <form id="register-payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Selección de Plan y AddOns */}
            <div className="bg-surface border border-border p-6 rounded-xl space-y-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <Package size={20} className="text-primary" />
                Configuración del Cobro
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text block mb-2">Plan a Renovar (Opcional si cambia)</label>
                  {plansLoading ? (
                    <div className="h-10 animate-pulse bg-bg rounded-md"></div>
                  ) : (
                    <select
                      {...register('newPriceId')}
                      className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Mantener plan actual</option>
                      {plansData?.map((plan: any) => (
                        <optgroup key={plan.id} label={plan.name}>
                          {plan.pricing?.map((price: any) => (
                            <option key={price.id} value={price.id}>
                              {plan.name} - {formatCurrency(Number(price.price), price.currency)} / {price.interval}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-2">Paquetes Adicionales (AddOns)</label>
                  {addOnsLoading ? (
                    <div className="h-20 animate-pulse bg-bg rounded-md"></div>
                  ) : (
                    <div className="space-y-4">
                      {/* Control de Capacidad (Stepper) */}
                      {(() => {
                        const playerPackAddOn = addOnsData?.find((a: any) => a.code === 'player_pack_10');
                        if (!playerPackAddOn) return null;

                        const selectedPlayerPack = selectedAddOns.find(a => a.addOnId === playerPackAddOn.id);
                        const quantity = selectedPlayerPack?.quantity || 0;
                        const addedCapacity = quantity * 10;
                        const price = playerPackAddOn?.pricing?.[0]?.price || playerPackAddOn.price || 0;

                        return (
                          <div className="bg-surface border border-border p-5 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-text">Capacidad de Jugadores</h3>
                                <p className="text-sm text-text-secondary">
                                  Plan Base ({baseCapacity}) + Paquetes Extra ({addedCapacity})
                                </p>
                              </div>
                              <div className="flex items-center gap-4 bg-bg p-1.5 rounded-lg border border-border">
                                <button 
                                  type="button" 
                                  onClick={() => handleDecreaseCapacity(playerPackAddOn.id)}
                                  disabled={quantity === 0}
                                  className="p-1.5 rounded-md hover:bg-surface text-text disabled:opacity-50 transition-colors"
                                >
                                  <Minus size={18} />
                                </button>
                                <div className="w-12 text-center font-semibold text-text">
                                  {totalCapacity}
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => handleIncreaseCapacity(playerPackAddOn.id)}
                                  className="p-1.5 rounded-md hover:bg-surface text-text transition-colors"
                                >
                                  <Plus size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {quantity > 0 && (
                              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                <div className="text-sm text-text-secondary">
                                  Costo por paquetes extra ({quantity} x {formatCurrency(price, playerPackAddOn.currency)})
                                </div>
                                <div className="flex items-center gap-2">
                                  {uiDiscountPercent > 0 ? (
                                    <>
                                      <span className="text-text-secondary line-through text-sm">
                                        {formatCurrency(price * quantity, playerPackAddOn.currency)}
                                      </span>
                                      <span className="font-bold text-success">
                                        {formatCurrency((price * quantity) * uiDiscountFactor, playerPackAddOn.currency)} / mes
                                      </span>
                                      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                                        {uiDiscountPercent}% dcto aplicado
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-medium text-text">
                                      {formatCurrency(price * quantity, playerPackAddOn.currency)} / mes
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Otros AddOns */}
                      {addOnsData?.filter((a: any) => a.code !== 'player_pack_10').map((addon: any) => {
                        const isSelected = selectedAddOns.some(a => a.addOnId === addon.id);
                        const selectedQuantity = selectedAddOns.find(a => a.addOnId === addon.id)?.quantity || 1;
                        
                        // Determinar el precio para mostrar
                        let displayPrice = 0;
                        const matchingPricing = addon.pricing?.find((p: any) => p.interval === currentInterval);
                        if (matchingPricing) {
                          displayPrice = Number(matchingPricing.price);
                        } else {
                          const monthlyPricing = addon.pricing?.find((p: any) => p.interval === 'MONTHLY');
                          if (monthlyPricing) {
                             displayPrice = Number(monthlyPricing.price);
                             if (currentInterval === 'QUARTERLY') displayPrice *= 3;
                             else if (currentInterval === 'SEMIANNUAL') displayPrice *= 6;
                             else if (currentInterval === 'YEARLY') displayPrice *= 12;
                          } else {
                             const firstPricing = addon.pricing?.[0];
                             if (firstPricing) {
                               displayPrice = Number(firstPricing.price);
                             } else {
                               displayPrice = Number(addon.price || 0);
                             }
                          }
                        }

                        const isOneTime = addon.pricing?.some((p: any) => p.interval === 'ONE_TIME');
                        const intervalLabel = isOneTime ? 'pago único' : 'periodo';

                        return (
                          <div key={addon.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            isSelected ? 'bg-primary/5 border-primary/30' : 'bg-surface border-border'
                          }`}>
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleAddOnToggle(addon.id, e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                              />
                              <div>
                                <span className="font-medium text-text">{addon.name}</span>
                                <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  {uiDiscountPercent > 0 && !isOneTime ? (
                                    <>
                                      <span className="line-through opacity-70">
                                        {formatCurrency(displayPrice, addon.currency)}
                                      </span>
                                      <span className="font-bold text-success">
                                        {formatCurrency(displayPrice * uiDiscountFactor, addon.currency)} / {intervalLabel} c/u
                                      </span>
                                      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                                        {uiDiscountPercent}% dcto aplicado
                                      </span>
                                    </>
                                  ) : (
                                    <span>
                                      {formatCurrency(displayPrice, addon.currency)} / {intervalLabel} c/u
                                    </span>
                                  )}
                                </p>
                              </div>
                            </label>
                            
                            {isSelected && (
                              <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                                <span className="text-sm text-text-secondary">Cantidad:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  value={selectedQuantity}
                                  onChange={(e) => handleAddOnQuantityChange(addon.id, parseInt(e.target.value) || 1)}
                                  className="w-20 text-center"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles de la Transacción */}
            <div className="bg-surface border border-border p-6 rounded-xl space-y-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <CreditCard size={20} className="text-primary" />
                Detalles del Pago
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text block mb-1.5">Método de Pago</label>
                  <select
                    {...register('method')}
                    className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="TRANSFER">Transferencia / Consignación</option>
                    <option value="CARD">Tarjeta de Crédito / Débito</option>
                    <option value="CASH">Efectivo</option>
                    <option value="LINK">Link de Pago Manual</option>
                  </select>
                  {errors.method && <span className="text-xs text-danger mt-1 block">{errors.method.message}</span>}
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-1.5">N° Transacción / Recibo</label>
                  <Input {...register('transactionId')} placeholder="Ej. TR-123456" />
                  {errors.transactionId && <span className="text-xs text-danger mt-1 block">{errors.transactionId.message}</span>}
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-1.5">Fecha de Pago</label>
                  <Input type="date" {...register('paymentDate')} />
                  {errors.paymentDate && <span className="text-xs text-danger mt-1 block">{errors.paymentDate.message}</span>}
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-1.5">Hora de Pago</label>
                  <Input type="time" {...register('paymentTime')} />
                  {errors.paymentTime && <span className="text-xs text-danger mt-1 block">{errors.paymentTime.message}</span>}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text block mb-1.5">Mes del Período</label>
                  <Input type="number" min="1" max="12" {...register('periodMonth', { valueAsNumber: true })} />
                  {errors.periodMonth && <span className="text-xs text-danger mt-1 block">{errors.periodMonth.message}</span>}
                </div>

                <div>
                  <label className="text-sm font-medium text-text block mb-1.5">Año del Período</label>
                  <Input type="number" min="2020" {...register('periodYear', { valueAsNumber: true })} />
                  {errors.periodYear && <span className="text-xs text-danger mt-1 block">{errors.periodYear.message}</span>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text block mb-1.5">Monto Total a Registrar</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                  <Input 
                    type="number" 
                    {...register('amount', { valueAsNumber: true })} 
                    className="pl-8 text-lg font-medium"
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1.5">Este monto se calcula automáticamente, pero puedes ajustarlo si hubo descuentos o pagos parciales.</p>
                {errors.amount && <span className="text-xs text-danger mt-1 block">{errors.amount.message}</span>}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isGift')}
                    className="w-4 h-4 text-primary bg-white border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-text font-medium">Es un obsequio / suscripción de cortesía</span>
                </label>
                <p className="text-[11px] text-text-secondary mt-1 pl-6">
                  Si marcas esta opción, el monto cobrado será $0 en la auditoría y se activará el plan completo al club sin inflar tus ingresos.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-text block mb-1.5">Notas Adicionales</label>
                <textarea
                  {...register('notes')}
                  className="w-full bg-bg border border-border rounded-lg p-3 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  placeholder="Detalles sobre el pago, quién autorizó, etc."
                />
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>

    {/* Barra Inferior Sticky */}
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:pl-64">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-end sm:justify-between items-center gap-4 px-4 sm:px-8">
        <div className="flex-1 w-full">
          {isExceeding && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span>La capacidad ({totalCapacity} jug.) no cubre los {currentPlayers} jugadores actuales.</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <p className="text-sm text-text-secondary">Total a Pagar</p>
            <p className="text-2xl font-bold text-text">{formatCurrency(selectedAmount || 0)}</p>
          </div>
          <Button
            type="submit"
            form="register-payment-form"
            disabled={registerPayment.isPending || isExceeding}
            className={`px-8 py-3 text-base shadow-md ${isExceeding ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {registerPayment.isPending ? 'Procesando...' : 'Registrar Pago'}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
