import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useMrrClubs } from '../hooks/useMrrClubs';

interface MrrDetailsModalProps {
  onClose: () => void;
}

export function MrrDetailsModal({ onClose }: MrrDetailsModalProps) {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useMrrClubs(page);

  const clubs = response?.data;
  const meta = response?.meta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text">Detalle de MRR (Clubes Activos)</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text">
            ✕
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <p className="text-center text-text-secondary">Cargando clubes...</p>
          ) : clubs && clubs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="p-2 font-medium text-sm text-text-secondary">Club</th>
                  <th className="p-2 font-medium text-sm text-text-secondary">Base</th>
                  <th className="p-2 font-medium text-sm text-text-secondary">Addons</th>
                  <th className="p-2 font-medium text-sm text-text-secondary">Total</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club: any) => (
                  <tr key={club.id} className="border-b border-border hover:bg-background/50">
                    <td className="p-2 text-sm text-text">
                      <div className="font-medium">{club.name}</div>
                      {club.email && (
                        <div className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          {club.email}
                          {club.isGoogleAuth && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-medium">
                              Google
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-sm text-text-secondary">{formatCurrency(club.baseAmount)}</td>
                    <td className="p-2 text-sm text-text-secondary">{formatCurrency(club.addonAmount)}</td>
                    <td className="p-2 text-sm font-semibold text-text">{formatCurrency(club.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-text-secondary">No hay clubes contribuyendo al MRR.</p>
          )}
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-border">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-gray-100 text-sm rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-text-secondary">Página {meta.page} de {meta.totalPages}</span>
            <button 
              disabled={page === meta.totalPages} 
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-gray-100 text-sm rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
