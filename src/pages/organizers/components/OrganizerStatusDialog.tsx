import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSetOrganizerStatus } from '../hooks/useOrganizers';

interface OrganizerStatusDialogProps {
  organizerId: string;
  companyName: string | null;
  /** Estado al que se quiere pasar */
  nextStatus: 'ACTIVE' | 'INACTIVE';
  clubsCount: number;
  onClose: () => void;
}

/** Desactivar (reversible, conserva los torneos) o reactivar una cuenta de organizador */
export function OrganizerStatusDialog({ organizerId, companyName, nextStatus, clubsCount, onClose }: OrganizerStatusDialogProps) {
  const { mutateAsync: setStatus, isPending } = useSetOrganizerStatus();
  const deactivating = nextStatus === 'INACTIVE';
  const name = companyName ?? 'este organizador';

  const handleConfirm = async () => {
    try {
      await setStatus({ id: organizerId, status: nextStatus });
      toast.success(deactivating ? 'Cuenta desactivada' : 'Cuenta reactivada');
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo cambiar el estado'));
    }
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      danger={deactivating}
      loading={isPending}
      title={deactivating ? `Desactivar ${name}` : `Reactivar ${name}`}
      confirmLabel={deactivating ? 'Desactivar' : 'Reactivar'}
      description={
        deactivating
          ? 'No podrá entrar y se le cierra la sesión. Sus torneos se conservan y puedes reactivarla cuando quieras.'
          : 'Podrá volver a entrar con su correo o teléfono.'
      }
    >
      {deactivating && clubsCount > 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Esta cuenta también administra {clubsCount} {clubsCount === 1 ? 'club' : 'clubes'}: desactivarla le quita el acceso a
          ellos también. Si solo quieres quitar lo de organizador, usa “Eliminar definitivo”.
        </p>
      )}
    </ConfirmDialog>
  );
}
