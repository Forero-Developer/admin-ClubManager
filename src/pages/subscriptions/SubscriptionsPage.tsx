import { useState } from 'react';
import { useSubscriptions } from './hooks/useSubscriptions';
import { Loader2, Search, Building2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SubscriptionActions } from './components/SubscriptionActions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSubscriptions({ page, limit: 10 });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d 'de' MMM, yyyy", { locale: es });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Gestión de Suscripciones</h1>
          <p className="text-text-secondary">Administra los planes, fechas de corte y periodos de prueba de todos los clubes.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Buscar club por nombre..." 
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-danger">Error al cargar las suscripciones.</div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text">
              <thead className="text-xs text-text-secondary uppercase bg-bg/50 border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Club</th>
                  <th scope="col" className="px-6 py-4 font-medium">Estado</th>
                  <th scope="col" className="px-6 py-4 font-medium">Plan Actual</th>
                  <th scope="col" className="px-6 py-4 font-medium">Vencimiento Susc.</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data.map((sub) => (
                  <tr key={sub.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {sub.logoUrl ? (
                          <img src={sub.logoUrl} alt={sub.name} className="h-10 w-10 rounded-md object-cover border border-border" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary-light text-primary flex items-center justify-center border border-border/50">
                            <Building2 size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-text">{sub.name}</p>
                          <p className="text-xs text-text-secondary">{sub.countryCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.billingStatus === 'ACTIVE' ? 'bg-primary-light text-primary-dark' :
                          sub.billingStatus === 'TRIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sub.billingStatus}
                        </span>
                        {sub.billingStatus === 'TRIAL' && (
                          <span className="text-xs text-text-secondary">Hasta {formatDate(sub.trialEndsAt)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.subscriptionPrice ? (
                        <div>
                          <p className="font-medium text-text">{sub.subscriptionPrice.plan.name}</p>
                          <p className="text-xs text-text-secondary">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: sub.subscriptionPrice.currency, minimumFractionDigits: 0 }).format(sub.subscriptionPrice.price)}/{sub.subscriptionPrice.interval}
                          </p>
                        </div>
                      ) : (
                        <span className="text-text-secondary">Sin plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Calendar size={14} />
                        <span>{formatDate(sub.subscriptionEnd)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <SubscriptionActions club={sub} />
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                      No hay clubes registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-text-secondary">
            <span>Mostrando {data?.data.length || 0} de {data?.total || 0} clubes</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!data || data.page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={!data || data.page === data.lastPage} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
