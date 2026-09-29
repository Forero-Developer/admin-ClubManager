import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Building2, MapPin, Users, Phone, Mail, CreditCard, AlertTriangle, Ban, Clock,
  Package, History, Layers, MessageCircle, PlayCircle, Trash2, XCircle, CalendarClock, Wallet,
  ChevronRight, UserRound, FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';
import { useClubDetail, useClubPlanHistory, useReleaseAccess, useCancelAndRevert, useCancelRecurring, useSetClubInternal } from './hooks/useClubs';
import { ClubPlayersTab } from './components/ClubPlayersTab';
import { ClubBillingTab } from './components/ClubBillingTab';
import { AssignAddOnModal } from './components/AssignAddOnModal';
import { DeleteClubModal } from './components/DeleteClubModal';
import { ClubActionsMenu, type ClubAction } from './components/ClubActionsMenu';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, EmptyState } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ADDON_STATUS, BILLING_METHOD, CLUB_STATUS } from '@/lib/status';
import { daysUntil, formatCurrency, formatDate, formatDateLong, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ClubDetail, ClubPlanHistoryItem } from '@/services/clubs/clubs.types';
import { getErrorMessage } from '@/lib/errors';

type TabKey = 'billing' | 'players' | 'addons' | 'history';
type PendingAction = 'release' | 'suspend' | 'cancelRecurring' | null;

function Fact({ icon, label, value, sub, tone }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div className="rounded-2xl bg-bg p-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
        {icon} {label}
      </p>
      <p className={cn('mt-1 text-sm font-semibold text-text sm:text-base', tone)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

/** Aviso según el estado del club, con el siguiente paso claro. */
function StatusBanner({ club, onRelease, releasing }: { club: ClubDetail; onRelease: () => void; releasing: boolean }) {
  const registerLink = (
    <Link
      to={`/clubs/${club.id}/register-payment`}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-text shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
    >
      <CreditCard size={15} /> Registrar pago
    </Link>
  );

  if (club.status === 'PAST_DUE') {
    const until = club.gracePeriodEndsAt;
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900 ring-1 ring-inset ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">En período de gracia</p>
            <p className="mt-0.5 text-sm text-amber-800">
              Venció su mes y aún tiene acceso
              {until ? <> hasta el <b>{formatDate(until)}</b> ({formatRelative(until)})</> : ''}. Si ya pagó por otro
              medio, registra el pago.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {registerLink}
          <button
            onClick={onRelease}
            disabled={releasing}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            <PlayCircle size={15} /> Liberar
          </button>
        </div>
      </div>
    );
  }

  if (club.status === 'SUSPENDED') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-rose-50 p-4 text-rose-900 ring-1 ring-inset ring-rose-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Ban size={20} className="mt-0.5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">Suspendido</p>
            <p className="mt-0.5 text-sm text-rose-800">
              No tiene acceso hasta que pague su mes. Al pagar empieza de nuevo desde ese día, sin cobrar meses
              atrasados.
            </p>
          </div>
        </div>
        {registerLink}
      </div>
    );
  }

  if (club.status === 'TRIAL') {
    const end = club.trialEndsAt ?? club.subscriptionEnd;
    return (
      <div className="flex gap-3 rounded-2xl bg-violet-50 p-4 text-violet-900 ring-1 ring-inset ring-violet-200">
        <Clock size={20} className="mt-0.5 shrink-0 text-violet-600" />
        <div>
          <p className="font-semibold">En período de prueba</p>
          <p className="mt-0.5 text-sm text-violet-800">
            Termina el <b>{formatDate(end)}</b> ({formatRelative(end)}). Después tendrá 5 días de gracia para pagar.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/** Cuenta con la que se registró el club y los otros clubes que administra. */
function AccountCard({ club }: { club: ClubDetail }) {
  const owner = club.owner;
  const email = club.registeredEmail ?? club.users?.[0]?.email ?? null;
  const isGoogle = club.authProvider ? club.authProvider === 'GOOGLE' : !!club.users?.[0]?.googleId;
  const otherClubs = owner?.clubs.filter((c) => c.id !== club.id) ?? [];
  const otherAdmins = (club.admins ?? []).filter((a) => a.id !== owner?.id);

  return (
    <Card className="p-4 sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Cuenta de registro</p>

      {email ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <UserRound size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <a href={`mailto:${email}`} className="truncate text-sm font-semibold text-text hover:text-primary-hover">
                {email}
              </a>
              <CopyButton value={email} label="Copiar correo" />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
              <Badge tone={isGoogle ? 'info' : 'neutral'}>{isGoogle ? 'Google' : 'Correo y contraseña'}</Badge>
              {owner?.createdAt && <span>Cuenta creada {formatRelative(owner.createdAt)}</span>}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">Este club no tiene un administrador vinculado.</p>
      )}

      {(club.email && club.email !== email) || club.phone ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          {club.email && club.email !== email && (
            <a href={`mailto:${club.email}`} className="inline-flex items-center gap-1.5 rounded-xl bg-bg px-3 py-2 text-xs font-medium text-text hover:text-primary-hover">
              <Mail size={13} /> {club.email}
            </a>
          )}
          {club.phone && (
            <a href={`tel:${club.phone}`} className="inline-flex items-center gap-1.5 rounded-xl bg-bg px-3 py-2 text-xs font-medium text-text hover:text-primary-hover">
              <Phone size={13} /> {club.phone}
            </a>
          )}
        </div>
      ) : null}

      {otherClubs.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-xs font-semibold text-text-secondary">También administra {otherClubs.length} club{otherClubs.length > 1 ? 'es' : ''} más</p>
          <ul className="mt-2 space-y-1.5">
            {otherClubs.map((c) => (
              <li key={c.id}>
                <Link to={`/clubs/${c.id}`} className="group flex items-center gap-2.5 rounded-xl p-2 transition hover:bg-bg">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary-hover">
                      <Building2 size={15} />
                    </div>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{c.name}</span>
                  <StatusBadge map={CLUB_STATUS} value={c.status} />
                  <ChevronRight size={15} className="text-text-secondary/50 transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {otherAdmins.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="text-xs font-semibold text-text-secondary">Otros administradores</p>
          <ul className="mt-2 space-y-1">
            {otherAdmins.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-text">{a.email}</span>
                <span className="shrink-0 text-xs text-text-secondary">desde {formatDate(a.linkedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function AddOnsTab({ club, onAssign }: { club: ClubDetail; onAssign: () => void }) {
  const payments =
    club.addOns
      ?.flatMap((a) => (a.paymentDetails ?? []).map((p) => ({ ...p, addonName: a.addOn.name })))
      .sort((a, b) => new Date(b.periodStart ?? 0).getTime() - new Date(a.periodStart ?? 0).getTime()) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">Paquetes y extras del club.</p>
        <button
          onClick={onAssign}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
        >
          <Package size={15} /> Asignar
        </button>
      </div>

      {!club.addOns || club.addOns.length === 0 ? (
        <EmptyState icon={<Package size={22} />} title="Sin add-ons" description="Este club no tiene paquetes activos." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {club.addOns.map((addon) => (
            <div key={addon.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Layers size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-text">{addon.addOn.name}</p>
                  <StatusBadge map={ADDON_STATUS} value={addon.status} />
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Cantidad {addon.quantity}
                  {addon.addOn.code === 'player_pack_10' && ` · +${addon.quantity * 10} deportistas`}
                  {addon.expiresAt && ` · vence ${formatDate(addon.expiresAt)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-text">Historial de cobros de add-ons</p>
        {payments.length === 0 ? (
          <p className="text-sm text-text-secondary">No hay cobros registrados.</p>
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-surface">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{p.addonName}</p>
                  <p className="truncate text-xs text-text-secondary">{formatDate(p.periodStart)}{p.description ? ` · ${p.description}` : ''}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-text">{formatCurrency(p.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function HistoryTab({ history }: { history: ClubPlanHistoryItem[] | undefined }) {
  if (!history || history.length === 0) {
    return <EmptyState icon={<History size={22} />} title="Sin historial" description="Aquí verás los cambios de plan y renovaciones." />;
  }
  return (
    <ol className="relative space-y-4 border-l-2 border-border/70 pl-5">
      {history.map((h) => {
        const paid = h.saasPayments?.[0]?.amount;
        const notes = h.saasPayments?.[0]?.notes;
        return (
          <li key={h.id} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-surface bg-primary ring-4 ring-primary-light" />
            <div className="rounded-2xl border border-border/70 bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-text">{h.toPrice?.plan?.name ?? 'Plan'}</p>
                <p className="text-xs text-text-secondary" title={formatDateLong(h.changedAt)}>
                  {formatDate(h.changedAt)} · {formatRelative(h.changedAt)}
                </p>
              </div>
              <p className="mt-1 text-sm text-text">
                {formatCurrency(paid ?? h.toPrice?.price, h.toPrice?.currency)}
                {paid !== undefined && <span className="ml-1 text-xs text-text-secondary">pagado (plan + packs)</span>}
              </p>
              {(notes || h.reason) && <p className="mt-1 text-xs italic text-text-secondary">{notes || h.reason}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: club, isLoading, isError } = useClubDetail(id || '');
  const { data: planHistory } = useClubPlanHistory(id || '');
  const [activeTab, setActiveTab] = useState<TabKey>('billing');
  const [isAssignAddOnOpen, setIsAssignAddOnOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

  const releaseMutation = useReleaseAccess();
  const cancelAndRevertMutation = useCancelAndRevert();
  const cancelRecurringMutation = useCancelRecurring();
  const setInternalMutation = useSetClubInternal();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-border/60" />
        <div className="h-44 animate-pulse rounded-3xl bg-border/60" />
        <div className="h-96 animate-pulse rounded-3xl bg-border/60" />
      </div>
    );
  }

  if (isError || !club) {
    return <div className="rounded-2xl bg-rose-50 py-12 text-center text-rose-700">Error al cargar el detalle del club.</div>;
  }

  const runAction = () => {
    const done = (msg: string) => ({
      onSuccess: () => {
        toast.success(msg);
        setPending(null);
      },
      onError: (e: unknown) => toast.error(getErrorMessage(e, 'No se pudo completar la acción')),
    });
    if (pending === 'release') releaseMutation.mutate(club.id, done('Acceso liberado: se registró el pago del mes'));
    if (pending === 'suspend') cancelAndRevertMutation.mutate(club.id, done('Club suspendido'));
    if (pending === 'cancelRecurring') cancelRecurringMutation.mutate(club.id, done('Método de pago desactivado'));
  };

  const toggleInternal = () =>
    setInternalMutation.mutate(
      { id: club.id, isInternal: !club.isInternal },
      {
        onSuccess: (res) =>
          toast.success(res.isInternal ? 'Marcado como club propio' : 'Ahora cuenta como cliente', {
            description: res.isInternal
              ? 'Sus pagos ya no cuentan en las métricas de clientes.'
              : 'Sus pagos vuelven a contar en las métricas.',
          }),
        onError: (e: unknown) => toast.error(getErrorMessage(e, 'No se pudo actualizar el club')),
      },
    );

  const actions: ClubAction[] = [
    ...(club.status === 'PAST_DUE' || club.status === 'SUSPENDED'
      ? [{ label: 'Liberar acceso', description: 'Registra el pago del mes con el monto de hoy', icon: <PlayCircle size={16} />, onSelect: () => setPending('release') }]
      : []),
    ...(club.paymentProfile?.status === 'AVAILABLE'
      ? [{ label: 'Desactivar método de pago', description: 'Sigue activo hasta que termine su mes', icon: <XCircle size={16} />, onSelect: () => setPending('cancelRecurring') }]
      : []),
    ...(club.status !== 'SUSPENDED'
      ? [{ label: 'Suspender ahora', description: 'Bloquea el acceso inmediatamente', icon: <Ban size={16} />, onSelect: () => setPending('suspend'), danger: true }]
      : []),
    {
      label: club.isInternal ? 'Contar como cliente' : 'Marcar como club propio',
      description: club.isInternal ? 'Sus pagos vuelven a las métricas' : 'Club tuyo o de prueba: no cuenta en métricas',
      icon: <FlaskConical size={16} />,
      onSelect: toggleInternal,
      disabled: setInternalMutation.isPending,
    },
    { label: 'Eliminar club', description: 'Borra el club y sus datos', icon: <Trash2 size={16} />, onSelect: () => setIsDeleteModalOpen(true), danger: true },
  ];

  const billable = club.billablePlayersCount ?? club.playerStats?.billable ?? club._count.players;
  const endDate = club.status === 'TRIAL' ? club.trialEndsAt ?? club.subscriptionEnd : club.subscriptionEnd;
  const days = daysUntil(endDate);
  const endTone = days !== null && days < 0 ? 'text-rose-600' : days !== null && days <= 3 ? 'text-amber-600' : undefined;
  const location = [club.city?.name, club.city?.department?.name, club.country?.name].filter(Boolean).join(', ');

  const tabs: { key: TabKey; label: string; icon: ReactNode; count?: number }[] = [
    { key: 'billing', label: 'Facturación', icon: <CreditCard size={15} /> },
    { key: 'players', label: 'Deportistas', icon: <Users size={15} />, count: club._count?.players ?? 0 },
    { key: 'addons', label: 'Add-ons', icon: <Package size={15} />, count: club.addOns?.length ?? 0 },
    { key: 'history', label: 'Historial', icon: <History size={15} />, count: planHistory?.length ?? 0 },
  ];

  const confirmCopy: Record<Exclude<PendingAction, null>, { title: string; description: string; label: string; danger?: boolean; loading: boolean }> = {
    release: {
      title: 'Liberar acceso',
      description: 'Se registrará el pago del mes con el monto de hoy (plan + packs según sus deportistas) y el club quedará activo.',
      label: 'Liberar acceso',
      loading: releaseMutation.isPending,
    },
    suspend: {
      title: `Suspender ${club.name}`,
      description: 'El club perderá el acceso de inmediato hasta que pague su mes.',
      label: 'Suspender',
      danger: true,
      loading: cancelAndRevertMutation.isPending,
    },
    cancelRecurring: {
      title: 'Desactivar método de pago',
      description: 'Se quita el método guardado en Wompi. El club conserva su acceso hasta que termine su mes.',
      label: 'Desactivar',
      danger: true,
      loading: cancelRecurringMutation.isPending,
    },
  };

  return (
    <div className="space-y-5">
      {/* Barra superior */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/clubs'))}
          aria-label="Volver"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:text-text"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-secondary">Club</p>
          <p className="truncate font-semibold text-text">{club.name}</p>
        </div>
        <Link
          to={`/clubs/${club.id}/register-payment`}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm shadow-primary/30 transition hover:bg-primary-hover active:scale-[0.98]"
        >
          <CreditCard size={16} />
          <span className="hidden sm:inline">Registrar pago</span>
          <span className="sm:hidden">Pago</span>
        </Link>
        <ClubActionsMenu actions={actions} />
      </div>

      <StatusBanner club={club} onRelease={() => setPending('release')} releasing={releaseMutation.isPending} />

      {/* Encabezado del club */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-4 sm:p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            {club.logoUrl ? (
              <img src={club.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-2xl border border-border object-cover sm:h-20 sm:w-20" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-hover sm:h-20 sm:w-20">
                <Building2 size={30} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">{club.name}</h1>
                <StatusBadge map={CLUB_STATUS} value={club.status} size="md" />
                {club.isInternal && (
                  <Badge tone="trial" size="md" title="No cuenta en las métricas de clientes">
                    <FlaskConical size={12} /> Club propio
                  </Badge>
                )}
              </div>
              {location && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin size={14} className="shrink-0" /> {location}
                </p>
              )}
              <p className="mt-1 text-sm text-text-secondary" title={formatDateLong(club.createdAt)}>
                Cliente desde el <span className="font-medium text-text">{formatDate(club.createdAt)}</span> · {formatRelative(club.createdAt)}
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Fact
              icon={<CreditCard size={12} />}
              label="Plan"
              value={club.subscriptionPrice?.plan.name ?? 'Sin plan'}
              sub={club.subscriptionPrice ? `${formatCurrency(club.subscriptionPrice.price, club.subscriptionPrice.currency)}/mes` : undefined}
            />
            <Fact
              icon={<Users size={12} />}
              label="Deportistas"
              value={<>{billable} <span className="text-xs font-normal text-text-secondary">/ {club._count.players}</span></>}
              sub={club.playerStats ? `${club.playerStats.active} activos · ${club.playerStats.suspended} susp.` : 'a cobrar / total'}
            />
            <Fact
              icon={<CalendarClock size={12} />}
              label={club.status === 'TRIAL' ? 'Prueba hasta' : 'Mes pagado hasta'}
              value={formatDate(endDate)}
              sub={days === null ? undefined : days < 0 ? `venció ${formatRelative(endDate)}` : formatRelative(endDate)}
              tone={endTone}
            />
            <Fact
              icon={<Wallet size={12} />}
              label="Último pago"
              value={club.lastChargeAt ? formatDate(club.lastChargeAt) : 'Sin pagos'}
              sub={club.lastChargeAt ? `${formatRelative(club.lastChargeAt)} · ${BILLING_METHOD[club.billingMethod] ?? club.billingMethod}` : undefined}
            />
          </div>

          <div className="relative mt-2.5 flex items-center gap-2 rounded-2xl bg-bg px-3.5 py-2.5 text-xs text-text-secondary">
            <MessageCircle size={14} className="shrink-0" />
            WhatsApp: {club.whatsappMonthlyLimit ?? 0} mensajes/mes · Billetera {club.wallets?.[0]?.balance ?? 0}
          </div>
        </Card>

        <AccountCard club={club} />
      </div>

      {/* Pestañas */}
      <Card className="overflow-hidden">
        <div className="-mb-px flex gap-1 overflow-x-auto border-b border-border/70 px-2 pt-2 [scrollbar-width:none]">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 rounded-t-xl px-4 py-3 text-sm font-medium transition-colors',
                  active ? 'text-primary-hover' : 'text-text-secondary hover:text-text',
                )}
              >
                {tab.icon}
                {tab.label}
                {typeof tab.count === 'number' && (
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', active ? 'bg-primary-light text-primary-hover' : 'bg-bg text-text-secondary')}>
                    {tab.count}
                  </span>
                )}
                {active && <motion.span layoutId="club-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'billing' && <ClubBillingTab club={club} />}
              {activeTab === 'players' && <ClubPlayersTab clubId={club.id} />}
              {activeTab === 'addons' && <AddOnsTab club={club} onAssign={() => setIsAssignAddOnOpen(true)} />}
              {activeTab === 'history' && <HistoryTab history={planHistory} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {pending && (
        <ConfirmDialog
          open
          onClose={() => setPending(null)}
          onConfirm={runAction}
          title={confirmCopy[pending].title}
          description={confirmCopy[pending].description}
          confirmLabel={confirmCopy[pending].label}
          danger={confirmCopy[pending].danger}
          loading={confirmCopy[pending].loading}
        />
      )}

      <AssignAddOnModal isOpen={isAssignAddOnOpen} onClose={() => setIsAssignAddOnOpen(false)} clubId={club.id} />
      <DeleteClubModal
        clubId={club.id}
        clubName={club.name}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => navigate('/clubs')}
      />
    </div>
  );
}
