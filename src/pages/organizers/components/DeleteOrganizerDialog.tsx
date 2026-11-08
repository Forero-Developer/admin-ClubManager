import { useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteOrganizer, useOrganizerDetail } from '../hooks/useOrganizers';

interface DeleteOrganizerDialogProps {
  organizerId: string;
  email: string;
  companyName: string | null;
  onClose: () => void;
  onDeleted?: () => void;
}

/**
 * Borrado definitivo. Muestra lo que se pierde (del detalle) y exige escribir el
 * correo de la cuenta, que el backend vuelve a validar.
 */
export function DeleteOrganizerDialog({ organizerId, email, companyName, onClose, onDeleted }: DeleteOrganizerDialogProps) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const { data: detail, isLoading } = useOrganizerDetail(organizerId);
  const { mutateAsync: deleteOrganizer, isPending } = useDeleteOrganizer();
  const impact = detail?.deleteImpact;
  const matches = confirmEmail.trim().toLowerCase() === email.toLowerCase();

  const handleConfirm = async () => {
    try {
      const result = await deleteOrganizer({ id: organizerId, confirmEmail: confirmEmail.trim() });
      toast.success(result.keptAccount ? 'Se quitó el modo organizador; la cuenta sigue con sus clubes' : 'Organizador eliminado');
      onClose();
      onDeleted?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo eliminar el organizador'));
    }
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      danger
      loading={isPending}
      confirmDisabled={!matches || isLoading}
      title={`Eliminar ${companyName ?? 'organizador'}`}
      confirmLabel="Eliminar definitivamente"
      description={
        impact?.keepsAccount
          ? 'Se borran sus torneos y su perfil de organizador. La cuenta sigue funcionando con sus clubes.'
          : 'Se borra la cuenta y todos sus torneos. No se puede deshacer.'
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Torneos', impact?.tournaments],
            ['Equipos', impact?.teams],
            ['Partidos', impact?.matches],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl bg-rose-50 p-3">
              <p className="text-lg font-bold text-rose-700">{isLoading ? '…' : value ?? 0}</p>
              <p className="text-xs text-rose-700/80">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-secondary">
          Los equipos y partidos incluyen los de los clubes inscritos en sus torneos.
        </p>
        <label className="block text-sm font-medium text-text">
          Escribe el correo de la cuenta para confirmar:{' '}
          <strong className="select-all rounded bg-bg px-1 py-0.5">{email}</strong>
          <input
            type="email"
            inputMode="email"
            autoComplete="off"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={email}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-text transition focus:border-danger focus:outline-none focus:ring-4 focus:ring-danger/15 sm:text-sm"
          />
        </label>
      </div>
    </ConfirmDialog>
  );
}
