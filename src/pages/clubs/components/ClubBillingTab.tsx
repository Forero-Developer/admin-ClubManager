import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreditCard, Gift, ArrowRightLeft, PlayCircle, XCircle, CheckCircle2, Check, Undo2, ChevronRight, Receipt } from 'lucide-react';
import { useClubPayments, useSubscriptionActions } from '../../subscriptions/hooks/useSubscriptions';
import { ExtendSubscriptionModal } from '../../subscriptions/components/modals/ExtendSubscriptionModal';
import { AssignAddOnModal } from './AssignAddOnModal';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, SectionTitle } from '@/components/ui/Card';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BILLING_METHOD, BILLING_STATUS, PAYMENT_STATUS } from '@/lib/status';
import { formatCurrency, formatDate, formatDateTime, formatPeriod, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import type { ClubDetail } from '@/services/clubs/clubs.types';

interface ClubBillingTabProps {
  club: ClubDetail;
}

type Dialog =
  | { type: 'extend' }
  | { type: 'addons' }
  | { type: 'trial' }
  | { type: 'cancelProfile' }
  | { type: 'approve'; paymentId: string }
  | { type: 'revert'; paymentId: string }
  | null;


function ActionTile({
  icon,
  title,
  description,
  accent,
  onClick,
  to,
  danger,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  accent: string;
  onClick?: () => void;
  to?: string;
  danger?: boolean;
}) {
  const cls = cn(
    'group flex w-full items-center gap-3 rounded-2xl border bg-surface p-4 text-left transition hover:shadow-md active:scale-[0.99]',
    danger ? 'border-rose-200 hover:border-rose-300' : 'border-border/70 hover:border-primary/40',
  );
  const content = (
    <>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', accent)}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold', danger ? 'text-rose-600' : 'text-text')}>{title}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-text-secondary/40 transition group-hover:translate-x-0.5" />
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {content}
    </button>
  );
}

export function ClubBillingTab({ club }: ClubBillingTabProps) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [trialDays, setTrialDays] = useState('30');
  const [revertReason, setRevertReason] = useState('');
  const { data: payments, isLoading: paymentsLoading } = useClubPayments(club.id);
  const { cancelSubscription, approveTransaction, revertPayment, assignTrial } = useSubscriptionActions();

  const currency = club.subscriptionPrice?.currency ?? 'COP';
  const base = Number(club.currentBaseAmount) || 0;
  const addons = Number(club.currentAddonAmount) || 0;
  const recentPayments = payments?.data?.slice(0, 5) ?? [];

  // El detalle del club y sus pagos también deben refrescarse
  const refreshClub = () => {
    queryClient.invalidateQueries({ queryKey: ['clubs'] });
    queryClient.invalidateQueries({ queryKey: ['clubPayments', club.id] });
  };
  const handlers = (msg: string) => ({
    onSuccess: () => {
      toast.success(msg);
      refreshClub();
      setDialog(null);
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e, 'No se pudo completar la acción')),
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <SectionTitle>Lo que paga</SectionTitle>
            <InfoList>
              <InfoRow label="Estado" value={<StatusBadge map={BILLING_STATUS} value={club.billingStatus} />} />
              <InfoRow label="Plan" value={formatCurrency(base, currency)} sub="por mes" />
              <InfoRow label="Packs y extras" value={formatCurrency(addons, currency)} sub="por mes" />
              <InfoRow
                label={<span className="font-semibold text-text">Total del mes</span>}
                value={<span className="text-base font-bold">{formatCurrency(base + addons, currency)}</span>}
                sub="Se recalcula con los deportistas al pagar"
                className="bg-bg/60"
              />
            </InfoList>
          </div>

          <div>
            <SectionTitle>Fechas</SectionTitle>
            <InfoList>
              <InfoRow
                label="Mes pagado hasta"
                value={formatDate(club.subscriptionEnd)}
                sub={club.subscriptionEnd ? formatRelative(club.subscriptionEnd) : undefined}
              />
              <InfoRow
                label="Último pago"
                value={club.lastChargeAt ? formatDate(club.lastChargeAt) : 'Sin pagos'}
                sub={club.lastChargeAt ? formatRelative(club.lastChargeAt) : undefined}
              />
              <InfoRow label="Método" value={BILLING_METHOD[club.billingMethod] ?? club.billingMethod ?? '—'} />
              {club.gracePeriodEndsAt && club.status === 'PAST_DUE' && (
                <InfoRow label="Gracia hasta" value={formatDate(club.gracePeriodEndsAt)} sub={formatRelative(club.gracePeriodEndsAt)} />
              )}
            </InfoList>
          </div>
        </div>

        <div>
          <SectionTitle>Acciones</SectionTitle>
          <div className="space-y-2.5">
            <ActionTile
              to={`/clubs/${club.id}/register-payment`}
              icon={<CreditCard size={18} />}
              accent="bg-primary-light text-primary-hover"
              title="Registrar pago"
              description="Pago por transferencia, efectivo u otro medio."
            />
            <ActionTile
              onClick={() => setDialog({ type: 'addons' })}
              icon={<ArrowRightLeft size={18} />}
              accent="bg-sky-50 text-sky-600"
              title="Ajustar packs"
              description="Subir o bajar paquetes sin cobrar ahora."
            />
            <ActionTile
              onClick={() => setDialog({ type: 'extend' })}
              icon={<Gift size={18} />}
              accent="bg-violet-50 text-violet-600"
              title={club.status === 'TRIAL' ? 'Extender prueba' : 'Regalar días'}
              description={club.status === 'TRIAL' ? 'Más días de prueba gratis.' : 'Días de cortesía sin cobro.'}
            />
            <ActionTile
              onClick={() => setDialog({ type: 'trial' })}
              icon={<PlayCircle size={18} />}
              accent="bg-amber-50 text-amber-600"
              title="Asignar prueba"
              description="Reactiva el club con días gratis."
            />
            {club.paymentProfile?.status === 'AVAILABLE' ? (
              <ActionTile
                onClick={() => setDialog({ type: 'cancelProfile' })}
                icon={<XCircle size={18} />}
                accent="bg-rose-50 text-rose-600"
                title="Desactivar método de pago"
                description="Pagará manualmente cada mes."
                danger
              />
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-bg p-4 text-sm text-text-secondary">
                <CheckCircle2 size={18} className="shrink-0" />
                Sin método de pago guardado: paga manualmente cada mes.
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Últimos pagos</SectionTitle>
        {paymentsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-bg" />
            ))}
          </div>
        ) : recentPayments.length === 0 ? (
          <EmptyState icon={<Receipt size={22} />} title="Sin pagos registrados" description="Cuando el club pague, aparecerá aquí." />
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-surface">
            {recentPayments.map((payment) => (
              <li key={payment.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text">{formatCurrency(payment.amount, currency)}</p>
                    <StatusBadge map={PAYMENT_STATUS} value={payment.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-secondary" title={payment.notes ?? undefined}>
                    {formatPeriod(payment.periodMonth, payment.periodYear)} · {BILLING_METHOD[payment.method] ?? payment.method} ·{' '}
                    <span title={formatDateTime(payment.createdAt)}>{formatRelative(payment.createdAt)}</span>
                    {payment.notes ? ` · ${payment.notes}` : ''}
                  </p>
                </div>
                {payment.status === 'PENDING' && (
                  <button
                    onClick={() => setDialog({ type: 'approve', paymentId: payment.id })}
                    className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Check size={14} /> Aprobar
                  </button>
                )}
                {payment.status === 'SUCCESS' && (
                  <button
                    onClick={() => {
                      setRevertReason('');
                      setDialog({ type: 'revert', paymentId: payment.id });
                    }}
                    aria-label="Revertir pago"
                    className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl px-3 text-xs font-medium text-text-secondary transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Undo2 size={14} /> <span className="hidden sm:inline">Revertir</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {dialog?.type === 'extend' && (
        <ExtendSubscriptionModal
          club={club}
          onClose={() => {
            refreshClub();
            setDialog(null);
          }}
        />
      )}
      {dialog?.type === 'addons' && (
        <AssignAddOnModal
          isOpen
          clubId={club.id}
          onClose={() => {
            refreshClub();
            setDialog(null);
          }}
        />
      )}

      <ConfirmDialog
        open={dialog?.type === 'trial'}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          const days = parseInt(trialDays, 10);
          if (!days || days <= 0) return toast.error('Ingresa un número de días válido');
          assignTrial.mutate({ clubId: club.id, data: { days, reason: 'Asignado manualmente por admin' } }, handlers(`Prueba de ${days} días asignada`));
        }}
        title="Asignar período de prueba"
        description="El club quedará en prueba gratis por los días que indiques."
        confirmLabel="Asignar prueba"
        loading={assignTrial.isPending}
      >
        <label className="block text-sm font-medium text-text">
          Días de prueba
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={trialDays}
            onChange={(e) => setTrialDays(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </label>
        <div className="mt-3 flex gap-2">
          {['7', '15', '30'].map((d) => (
            <button
              key={d}
              onClick={() => setTrialDays(d)}
              className={cn('h-9 flex-1 rounded-xl text-sm font-medium transition', trialDays === d ? 'bg-primary-light text-primary-hover ring-1 ring-primary/30' : 'bg-bg text-text-secondary hover:text-text')}
            >
              {d} días
            </button>
          ))}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog?.type === 'cancelProfile'}
        onClose={() => setDialog(null)}
        onConfirm={() => cancelSubscription.mutate({ clubId: club.id }, handlers('Método de pago desactivado'))}
        title="Desactivar método de pago"
        description="Se quita el método guardado en Wompi. El club deberá pagar manualmente su próximo mes."
        confirmLabel="Desactivar"
        danger
        loading={cancelSubscription.isPending}
      />

      <ConfirmDialog
        open={dialog?.type === 'approve'}
        onClose={() => setDialog(null)}
        onConfirm={() =>
          dialog?.type === 'approve' &&
          approveTransaction.mutate({ clubId: club.id, transactionId: dialog.paymentId }, handlers('Pago aprobado y club activado'))
        }
        title="Aprobar pago"
        description="Se marcará como pagado y el club quedará activo con su nuevo mes."
        confirmLabel="Aprobar pago"
        loading={approveTransaction.isPending}
      />

      <ConfirmDialog
        open={dialog?.type === 'revert'}
        onClose={() => setDialog(null)}
        onConfirm={() =>
          dialog?.type === 'revert' &&
          revertPayment.mutate({ clubId: club.id, paymentId: dialog.paymentId, reason: revertReason || undefined }, handlers('Pago revertido'))
        }
        title="Revertir pago"
        description="El pago quedará como fallido y se ajustarán las fechas del club."
        confirmLabel="Revertir pago"
        danger
        loading={revertPayment.isPending}
      >
        <label className="block text-sm font-medium text-text">
          Motivo (opcional)
          <textarea
            value={revertReason}
            onChange={(e) => setRevertReason(e.target.value)}
            rows={3}
            placeholder="Ej. el banco reversó la transferencia"
            className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </label>
      </ConfirmDialog>
    </div>
  );
}
