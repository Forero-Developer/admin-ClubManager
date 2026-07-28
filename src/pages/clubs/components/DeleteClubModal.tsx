import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useDeleteClub } from '../hooks/useClubs';
import { toast } from 'sonner';

interface DeleteClubModalProps {
  clubId: string;
  clubName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteClubModal({ clubId, clubName, isOpen, onClose, onSuccess }: DeleteClubModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const { mutateAsync: deleteClub, isPending } = useDeleteClub();

  if (!isOpen) return null;

  const isMatch = confirmName === clubName;

  const handleDelete = async () => {
    if (!isMatch) return;
    try {
      await deleteClub(clubId);
      toast.success('Club eliminado correctamente');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar el club');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <AlertTriangle className="text-danger" size={20} />
            Eliminar Club
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="bg-red-50 text-danger p-3 rounded-lg text-sm border border-red-100 flex items-start gap-3">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-semibold mb-1">¡Esta acción es irreversible!</p>
              <p className="text-red-700/80">
                Se eliminarán en cascada todos los datos de este club, incluyendo jugadores, torneos, archivos en S3 y toda la información asociada.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Para confirmar, escribe el nombre del club: <strong className="select-all bg-gray-100 px-1 py-0.5 rounded">{clubName}</strong>
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={clubName}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-bg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text bg-white border border-border rounded-lg transition-colors hover:bg-gray-50"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={!isMatch || isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg transition-colors hover:bg-danger/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? 'Eliminando...' : (
              <>
                <Trash2 size={16} /> Eliminar definitivamente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
