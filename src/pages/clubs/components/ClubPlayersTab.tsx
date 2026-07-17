import { useState } from 'react';
import { usePlayers, usePlayerDetail } from '../hooks/usePlayers';
import { Loader2, Search, UserCircle, ChevronRight, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export function ClubPlayersTab({ clubId }: { clubId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data, isLoading } = usePlayers(clubId, { page, limit: 12, search, status: status || undefined } as any);
  const players = data?.data || [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 bg-bg/50 p-2 rounded-xl border border-border">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar jugador por nombre o documento..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="PENDING">Pendiente</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="SUSPENDED">Suspendido</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <UserCircle size={32} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-text-secondary text-sm">No se encontraron jugadores.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div 
              key={player.id} 
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-primary/40 cursor-pointer transition-colors shadow-sm"
              onClick={() => setSelectedPlayerId(player.id)}
            >
              {player.photoUrl && !player.photoUrl.includes('via.placeholder.com') ? (
                <img 
                  src={player.photoUrl} 
                  alt={player.fullName} 
                  className="w-10 h-10 rounded-full object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const next = (e.target as HTMLImageElement).nextElementSibling;
                    if (next) next.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              <div className={`w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ${
                (player.photoUrl && !player.photoUrl.includes('via.placeholder.com')) ? 'hidden' : ''
              }`}>
                {player.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text text-sm truncate">{player.fullName}</p>
                <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide truncate">
                  {player.category?.name ?? 'Sin Categoría'} • {player.documentType} {player.documentNumber}
                </p>
              </div>
              <ChevronRight size={16} className="text-text-secondary/50" />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.lastPage > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <span className="text-xs text-text-secondary">
            Página {data.page} de {data.lastPage} ({data.total} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-bg disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={page === data.lastPage}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-bg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlayerId && (
        <PlayerDetailModal 
          clubId={clubId} 
          playerId={selectedPlayerId} 
          onClose={() => setSelectedPlayerId(null)} 
        />
      )}
    </div>
  );
}

function PlayerDetailModal({ clubId, playerId, onClose }: { clubId: string; playerId: string; onClose: () => void }) {
  const { data: player, isLoading } = usePlayerDetail(clubId, playerId);

  return (
    <Dialog.Root open onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] flex flex-col bg-bg border border-border shadow-xl rounded-xl z-50 animate-in zoom-in-95">
          
          <div className="flex items-center justify-between p-5 border-b border-border">
            <Dialog.Title className="text-base font-bold text-text">
              Detalle del Jugador
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text p-1.5 rounded-lg hover:bg-bg-secondary">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : !player ? (
              <div className="text-center py-12 text-danger">Error al cargar jugador</div>
            ) : (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center gap-4">
                  {player.photoUrl && !player.photoUrl.includes('via.placeholder.com') ? (
                    <img 
                      src={player.photoUrl} 
                      alt={player.fullName} 
                      className="w-16 h-16 rounded-full object-cover border border-border shadow-sm" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const next = (e.target as HTMLImageElement).nextElementSibling;
                        if (next) next.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 ${
                    (player.photoUrl && !player.photoUrl.includes('via.placeholder.com')) ? 'hidden' : ''
                  }`}>
                    {player.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text leading-none">{player.fullName}</h3>
                    <p className="text-xs text-text-secondary mt-1">{player.documentType} {player.documentNumber}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                      {player.category?.name ?? 'Sin Categoría'}
                    </span>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase mb-3">Información Personal</p>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Nacimiento</span><span className="text-xs font-medium text-text">{player.birthDate || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Sangre / EPS</span><span className="text-xs font-medium text-text">{player.bloodType || '—'} / {player.eps || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Dirección</span><span className="text-xs font-medium text-text">{player.address || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Barrio</span><span className="text-xs font-medium text-text">{player.neighborhood || '—'}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase mb-3">Contacto / Acudiente</p>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Nombre</span><span className="text-xs font-medium text-text">{player.guardian1Name || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Parentesco</span><span className="text-xs font-medium text-text">{player.guardian1Relation || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Teléfono 1</span><span className="text-xs font-medium text-text">{player.phone1 ? `${player.phone1Prefix} ${player.phone1}` : '—'}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-text-secondary">Teléfono 2</span><span className="text-xs font-medium text-text">{player.phone2 ? `${player.phone2Prefix} ${player.phone2}` : '—'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
