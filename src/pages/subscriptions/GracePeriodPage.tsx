import { useState } from 'react';
import { useSubscriptions } from './hooks/useSubscriptions';
import { Loader2, Search, Building2, AlertOctagon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce';

export function GracePeriodPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isError } = useSubscriptions({ 
    page, 
    limit: 10,
    search: debouncedSearch || undefined,
    billingStatus: 'PAST_DUE',
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d 'de' MMM, yyyy", { locale: es });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Periodo de Gracia (Mora)</h1>
          <p className="text-text-secondary">Clubes con pagos vencidos o fallidos que aún tienen acceso temporal.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Buscar club por nombre o email..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-danger">Error al cargar clubes en mora.</div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text">
              <thead className="text-xs text-text-secondary uppercase bg-bg/50 border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Club</th>
                  <th scope="col" className="px-6 py-4 font-medium">Plan Actual</th>
                  <th scope="col" className="px-6 py-4 font-medium">Fechas Críticas</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data.map((club) => {
                  // Para propósitos visuales, mostramos PAST_DUE
                  return (
                    <tr key={club.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {club.logoUrl ? (
                            <img src={club.logoUrl} alt={club.name} className="h-10 w-10 rounded-md object-cover border border-border" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
                              <Building2 size={18} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-text">{club.name}</p>
                            <p className="text-xs text-text-secondary">{club.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {club.subscriptionPrice ? (
                          <div>
                            <p className="font-medium text-text">{club.subscriptionPrice.plan.name}</p>
                            <p className="text-xs text-text-secondary">
                              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: club.subscriptionPrice.currency }).format(club.subscriptionPrice.price)}/{club.subscriptionPrice.interval}
                            </p>
                          </div>
                        ) : (
                          <span className="text-text-secondary">Sin plan</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <AlertOctagon size={12} className="text-danger" />
                            <span className="text-text-secondary w-20">Venció:</span>
                            <span className="font-medium text-danger">{formatDate(club.billingCycleEnd)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/clubs/${club.id}`} className="text-xs font-semibold text-primary hover:underline">
                          Gestionar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                      No hay clubes en mora actualmente.
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
