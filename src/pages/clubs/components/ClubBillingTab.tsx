import { useState } from 'react';
import { CreditCard, Calendar, Gift, Settings, ArrowRightLeft, CheckCircle2, History, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useClubPayments, useSubscriptionActions } from '../../subscriptions/hooks/useSubscriptions';
import { Link } from 'react-router-dom';
import { ExtendSubscriptionModal } from '../../subscriptions/components/modals/ExtendSubscriptionModal';
import { AssignAddOnModal } from '../../subscriptions/components/modals/AssignAddOnModal';

interface ClubBillingTabProps {
  club: any;
}

export function ClubBillingTab({ club }: ClubBillingTabProps) {
  const [activeModal, setActiveModal] = useState<'payment' | 'extend' | 'addons' | null>(null);
  const { data: payments, isLoading: paymentsLoading } = useClubPayments(club.id);
  const { cancelSubscription } = useSubscriptionActions();

  const formatCurrency = (amount?: number | null, currency = 'COP') => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount));
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  const handleCancelMP = () => {
    if (confirm('¿Estás seguro de cancelar la suscripción automática en Mercado Pago? El club pasará a pago manual.')) {
      cancelSubscription.mutate(club.id);
    }
  };

  // Últimas 3 facturas
  const recentPayments = payments?.data?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Información y Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Información Actual */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text flex items-center gap-2 mb-4">
              <CreditCard size={17} className="text-primary" /> Datos de Suscripción
            </h3>
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {[
                { label: 'Estado de Facturación', value: club.billingStatus },
                { label: 'Método de Pago', value: club.billingMethod ?? 'N/A' },
                { label: 'Monto Base', value: formatCurrency(club.currentBaseAmount, club.subscriptionPrice?.currency) },
                { label: 'Monto AddOns', value: formatCurrency(club.currentAddonAmount, club.subscriptionPrice?.currency) },
                { label: 'Total Estimado', value: formatCurrency((Number(club.currentBaseAmount) || 0) + (Number(club.currentAddonAmount) || 0), club.subscriptionPrice?.currency) },
              ].map((row, i) => (
                <div key={row.label} className={`flex justify-between items-center px-4 py-3 ${i !== 0 ? 'border-t border-border/50' : ''}`}>
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <span className="text-sm font-medium text-text">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-text flex items-center gap-2 mb-4">
              <Calendar size={17} className="text-primary" /> Fechas Importantes
            </h3>
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {[
                { 
                  label: club.billingMethod === 'CARD' ? 'Próximo Cobro (MP)' : 'Vencimiento del Plan', 
                  value: formatDate(club.billingMethod === 'CARD' ? club.nextChargeDate : (club.subscriptionEnd || club.nextChargeDate)) 
                },
                { 
                  label: 'Último Pago Registrado', 
                  value: formatDate(club.lastChargeAt || club.subscriptionStart) 
                },
              ].map((row, i) => (
                <div key={row.label} className={`flex justify-between items-center px-4 py-3 ${i !== 0 ? 'border-t border-border/50' : ''}`}>
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <span className="text-sm font-medium text-text">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Acciones Rápidas */}
        <div>
          <h3 className="text-base font-bold text-text flex items-center gap-2 mb-4">
            <Settings size={17} className="text-primary" /> Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Acción 1: Renovar / Registrar Pago */}
            <Link 
              to={`/clubs/${club.id}/register-payment`}
              className="flex flex-col items-start p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-left group"
            >
              <div className="p-2 bg-green-50 text-green-600 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <CreditCard size={20} />
              </div>
              <h4 className="font-bold text-text text-sm mb-1">Registrar Pago / Renovar</h4>
              <p className="text-xs text-text-secondary">Renovar ciclo, ajustar addons y reportar pago recibido.</p>
            </Link>

            {/* Acción 2: Modificar AddOns sin pago */}
            <button 
              onClick={() => setActiveModal('addons')}
              className="flex flex-col items-start p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all text-left group"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <ArrowRightLeft size={20} />
              </div>
              <h4 className="font-bold text-text text-sm mb-1">Ajustar Capacidad (AddOns)</h4>
              <p className="text-xs text-text-secondary">Bajar o subir paquetes sin generar cobro inmediato.</p>
            </button>

            {/* Acción 3: Extender Suscripción / Trial */}
            <button 
              onClick={() => setActiveModal('extend')}
              className="flex flex-col items-start p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all text-left group"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                <Gift size={20} />
              </div>
              <h4 className="font-bold text-text text-sm mb-1">
                {club.status === 'TRIAL' ? 'Extender Trial' : 'Extender Suscripción'}
              </h4>
              <p className="text-xs text-text-secondary">
                {club.status === 'TRIAL' ? 'Regalar días adicionales de prueba gratuita.' : 'Regalar días o meses adicionales por cortesía.'}
              </p>
            </button>

            {/* Acción 4: Cancelar MP */}
            {club.mpSubscriptionId && club.mpStatus !== 'cancelled' ? (
              <button 
                onClick={handleCancelMP}
                className="flex flex-col items-start p-4 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md hover:border-red-500/50 transition-all text-left group"
              >
                <div className="p-2 bg-red-50 text-red-600 rounded-lg mb-3 group-hover:scale-110 transition-transform">
                  <XCircle size={20} />
                </div>
                <h4 className="font-bold text-danger text-sm mb-1">Cancelar MercadoPago</h4>
                <p className="text-xs text-text-secondary">Desactivar débito automático para pasar a manual.</p>
              </button>
            ) : (
              <div className="flex flex-col items-start p-4 bg-gray-50 rounded-xl border border-border opacity-70 text-left">
                <div className="p-2 bg-gray-200 text-gray-500 rounded-lg mb-3">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-bold text-text text-sm mb-1">Sin Débito Automático</h4>
                <p className="text-xs text-text-secondary">El club ya está en modalidad de pago manual.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Historial de Pagos Recientes */}
      <div className="pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <History size={17} className="text-primary" /> Últimas 3 Facturas
          </h3>
          <span className="text-xs text-text-secondary bg-bg px-2 py-1 rounded-md">Historial Visual</span>
        </div>
        
        {paymentsLoading ? (
          <div className="animate-pulse flex gap-4">
            <div className="h-24 bg-bg rounded-xl flex-1"></div>
            <div className="h-24 bg-bg rounded-xl flex-1"></div>
            <div className="h-24 bg-bg rounded-xl flex-1"></div>
          </div>
        ) : recentPayments.length === 0 ? (
          <div className="p-8 text-center bg-bg/50 rounded-xl border border-border border-dashed">
            <AlertTriangle className="mx-auto text-text-secondary/50 mb-2" size={32} />
            <p className="text-sm text-text-secondary">No hay pagos registrados para este club.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentPayments.map((payment: any, index: number) => (
              <div key={payment.id} className="relative p-4 bg-white rounded-xl border border-border shadow-sm flex flex-col">
                {index === 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Último
                  </span>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-0.5">
                      {payment.periodMonth}/{payment.periodYear}
                    </p>
                    <p className="font-bold text-text text-lg">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className={`p-1.5 rounded-md ${
                    payment.status === 'SUCCESS' ? 'bg-success/10 text-success' : 
                    payment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {payment.status === 'SUCCESS' ? <CheckCircle2 size={16} /> : 
                     payment.status === 'PENDING' ? <Clock size={16} /> : <XCircle size={16} />}
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-border/50 text-xs text-text-secondary flex items-center justify-between">
                  <span className="truncate">{payment.method}</span>
                  <span className="opacity-70">{formatDate(payment.createdAt)}</span>
                </div>
              </div>
            ))}
            
            {/* Si hay menos de 3, rellenar visualmente */}
            {Array.from({ length: Math.max(0, 3 - recentPayments.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="p-4 bg-bg/30 rounded-xl border border-border border-dashed flex items-center justify-center opacity-50">
                <p className="text-xs text-text-secondary">Sin más facturas</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals invisibles hasta activarse */}
      {activeModal === 'extend' && <ExtendSubscriptionModal club={club} onClose={() => setActiveModal(null)} />}
      {activeModal === 'addons' && <AssignAddOnModal club={club} onClose={() => setActiveModal(null)} />}
      
    </div>
  );
}
