import { useState } from 'react';
import { useClubs } from './hooks/useClubs';
import { Link } from 'react-router-dom';
import { Loader2, Search, MoreHorizontal, Building2, Users } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ClubsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useClubs({ page, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Gestión de Clubes</h1>
          <p className="text-text-secondary">Visualiza y administra todos los clubes registrados en la plataforma.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Buscar club por nombre o email..." 
            className="pl-9"
          />
        </div>
        <Button variant="outline">Filtros</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-danger">Error al cargar los clubes.</div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text">
              <thead className="text-xs text-text-secondary uppercase bg-bg/50 border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Club</th>
                  <th scope="col" className="px-6 py-4 font-medium">País</th>
                  <th scope="col" className="px-6 py-4 font-medium">Estado SaaS</th>
                  <th scope="col" className="px-6 py-4 font-medium">Suscripción</th>
                  <th scope="col" className="px-6 py-4 font-medium">Jugadores</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data.map((club) => (
                  <tr key={club.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {club.logoUrl ? (
                          <img src={club.logoUrl} alt={club.name} className="h-10 w-10 rounded-md object-cover border border-border" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary-light text-primary flex items-center justify-center border border-border/50">
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
                      <div className="flex items-center gap-2">
                        <span>{club.country.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        club.billingStatus === 'ACTIVE' ? 'bg-primary-light text-primary-dark' :
                        club.billingStatus === 'TRIAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {club.billingStatus}
                      </span>
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
                    <td className="px-6 py-4 font-medium">
                      {club._count.players}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/clubs/${club.id}/players`}>
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-text-secondary">
                            <Users size={14} /> Jugadores
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                          <MoreHorizontal size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                      No hay clubes registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación simple footer */}
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
