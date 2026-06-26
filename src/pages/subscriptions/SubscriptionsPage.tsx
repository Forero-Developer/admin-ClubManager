import { useSubscriptionOverview } from './hooks/useSubscriptions';
import { Loader2, Plus, Users, AlertCircle, TrendingUp, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatsBar } from './components/StatsBar';
import { Link } from 'react-router-dom';

export function SubscriptionsPage() {
  const { data: plans, isLoading, isError } = useSubscriptionOverview();

  const formatCurrency = (amount: number, currency: string = 'COP') => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Suscripciones y Planes</h1>
          <p className="text-text-secondary">Visión global de los planes como producto y métricas de adopción.</p>
        </div>
        <Link to="/plans">
          <Button>
            <Plus size={16} className="mr-2" />
            Crear Plan
          </Button>
        </Link>
      </div>

      <StatsBar />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-danger">Error al cargar el resumen de planes.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {plans?.map((plan) => (
            <div 
              key={plan.id} 
              className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
            >
              <div className="p-6 border-b border-border/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text flex items-center gap-2">
                      <Tag size={18} className="text-primary" />
                      {plan.name}
                    </h3>
                    {plan.isActive ? (
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {plan.pricing.length > 0 ? (
                      <div>
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(plan.pricing[0].price, plan.pricing[0].currency)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          /{plan.pricing[0].interval === 'MONTHLY' ? 'mes' : plan.pricing[0].interval}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-text-secondary">Sin precio</p>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-text-secondary line-clamp-2 min-h-[40px]">
                  {plan.description || "Sin descripción"}
                </p>
              </div>

              <div className="p-6 bg-bg/30 grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <Users size={14} /> Activos
                  </p>
                  <p className="text-2xl font-semibold text-text">{plan._count.activeClubs}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle size={14} /> Trial
                  </p>
                  <p className="text-2xl font-semibold text-text">{plan._count.trialClubs}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider text-danger/80 flex items-center gap-1">
                    <AlertCircle size={14} /> En Mora
                  </p>
                  <p className="text-2xl font-semibold text-text">{plan._count.pastDueClubs}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider text-success/80 flex items-center gap-1">
                    <TrendingUp size={14} /> Ingresos (Mes)
                  </p>
                  <p className="text-lg font-semibold text-text truncate">
                    {formatCurrency(plan.revenueThisMonth)}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-border bg-surface mt-auto">
                <Link to={`/plans`} className="w-full">
                  <Button variant="outline" className="w-full justify-between hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors">
                    <span>Gestionar Plan</span>
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
          
          {(!plans || plans.length === 0) && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
              <p className="text-text-secondary">No hay planes disponibles en el resumen.</p>
              <Link to="/plans" className="mt-4 inline-block">
                <Button variant="outline">Crear un plan</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
