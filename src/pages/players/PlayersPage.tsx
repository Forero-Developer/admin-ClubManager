import { useParams, Link } from 'react-router-dom';
import { usePlayers } from './hooks/usePlayers';
import { Loader2, Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function PlayersPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { data, isLoading, isError } = usePlayers(clubId!);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/clubs" className="text-primary hover:underline flex items-center gap-1 text-sm mb-2 font-medium">
            <ArrowLeft size={16} /> Volver a Clubes
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text">Jugadores del Club</h1>
          <p className="text-text-secondary">Visualiza los jugadores registrados bajo este club.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Buscar jugador..." 
            className="pl-9"
          />
        </div>
        <Button variant="outline">Filtrar</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-danger">Error al cargar los jugadores.</div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text">
              <thead className="text-xs text-text-secondary uppercase bg-bg/50 border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Jugador</th>
                  <th scope="col" className="px-6 py-4 font-medium">Documento</th>
                  <th scope="col" className="px-6 py-4 font-medium">Categoría</th>
                  <th scope="col" className="px-6 py-4 font-medium">Estado</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Patrocinado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data.map((player) => (
                  <tr key={player.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs border border-border/50 shrink-0">
                          {player.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-text">{player.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {player.documentType} {player.documentNumber}
                    </td>
                    <td className="px-6 py-4">
                      {player.category.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        player.status === 'ACTIVE' ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {player.sponsored ? (
                        <span className="text-success font-medium text-xs">Sí</span>
                      ) : (
                        <span className="text-text-secondary text-xs">No</span>
                      )}
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                      Este club aún no tiene jugadores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-text-secondary">
            <span>Mostrando {data?.data.length || 0} de {data?.total || 0} jugadores</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data?.page === 1}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={data?.page === data?.lastPage}>Siguiente</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
