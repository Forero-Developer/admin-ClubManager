import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useClubPayments, useSubscriptionActions } from '../../hooks/useSubscriptions';
import type { SubscriptionListItem } from '@/services/subscriptions/subscriptions.types';
import { formatCurrency, formatDate, MONTH_NAMES } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  club: SubscriptionListItem;
  onClose: () => void;
}

export function PaymentHistoryModal({ club, onClose }: Props) {
  // En la implementación real del hook useClubPayments se debe pasar page y limit,
  // pero para no cambiar toda la firma del hook si no es necesario, filtramos / paginamos en cliente,
  // o asumimos que devuelve los más recientes (que usualmente son pocos).
  const { data, isLoading } = useClubPayments(club.id);
  const { revertPayment } = useSubscriptionActions();

  // Si la data viene paginada del backend:
  const payments = data?.data || [];
  
  const handleRevert = (paymentId: string) => {
    if (confirm('¿Estás seguro de revertir este pago? Esto lo marcará como fallido y retrocederá las fechas de cobro del club al periodo anterior.')) {
      revertPayment.mutate({ clubId: club.id, paymentId }, {
        onSuccess: () => toast.success('Pago revertido con éxito.'),
        onError: () => toast.error('Error al revertir el pago.')
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 size={16} className="text-success" />;
      case 'FAILED': return <XCircle size={16} className="text-danger" />;
      default: return <Loader2 size={16} className="text-amber-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-success/10 text-success border-success/20';
      case 'FAILED': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <Dialog.Root open onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] flex flex-col bg-bg border border-border shadow-xl rounded-xl z-50 animate-in zoom-in-95">
          
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <Dialog.Title className="text-lg font-semibold text-text">
                Historial de Pagos
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary mt-1">
                Pagos registrados para <span className="font-medium text-text">{club.name}</span>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text transition-colors p-2 rounded-lg hover:bg-bg-secondary">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                <Loader2 size={32} className="animate-spin mb-4 text-primary" />
                <p>Cargando historial...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <p className="text-text-secondary">No se encontraron pagos registrados para este club.</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg-secondary border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium text-text-secondary">Fecha</th>
                      <th className="px-4 py-3 font-medium text-text-secondary">Monto</th>
                      <th className="px-4 py-3 font-medium text-text-secondary">Periodo</th>
                      <th className="px-4 py-3 font-medium text-text-secondary">Método</th>
                      <th className="px-4 py-3 font-medium text-text-secondary">Estado</th>
                      <th className="px-4 py-3 font-medium text-text-secondary">Transacción / Notas</th>
                      <th className="px-4 py-3 font-medium text-text-secondary text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-bg/50 transition-colors">
                        <td className="px-4 py-3 text-text">
                          {p.createdAt ? formatDate(p.createdAt) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-medium text-text">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-3 text-text">
                          {p.periodMonth && p.periodYear 
                            ? `${MONTH_NAMES[p.periodMonth - 1]} ${p.periodYear}`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-bg font-medium border border-border">
                            {p.method}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(p.status)}`}>
                            {getStatusIcon(p.status)}
                            {p.status}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="font-mono text-text-secondary">{p.transactionId}</p>
                            {p.notes && <p className="text-[11px] text-text-secondary truncate max-w-[200px]" title={p.notes}>{p.notes}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.status === 'SUCCESS' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8"
                              onClick={() => handleRevert(p.id)}
                            >
                              <ArrowLeftRight size={13} className="mr-1.5" />
                              Revertir
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
