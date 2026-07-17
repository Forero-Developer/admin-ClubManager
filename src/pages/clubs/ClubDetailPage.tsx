import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClubDetail } from './hooks/useClubs';
import { 
  ArrowLeft, Building2, MapPin, Users, Phone, Mail, Calendar, CreditCard,
  CheckCircle2, Clock, AlertTriangle, XCircle, Package, History,
  Layers, ShieldAlert } from 'lucide-react'

import { ClubPlayersTab } from './components/ClubPlayersTab';
import { ClubBillingTab } from './components/ClubBillingTab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  ACTIVE: { label: 'Activo', class: 'bg-success/10 text-success border-success/20', icon: <CheckCircle2 size={14} /> },
  TRIAL: { label: 'Trial', class: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock size={14} /> },
  PAST_DUE: { label: 'En Mora', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle size={14} /> },
  SUSPENDED: { label: 'Suspendido', class: 'bg-red-50 text-danger border-red-200', icon: <XCircle size={14} /> },
};

type TabKey = 'billing' | 'addons' | 'history' | 'players';

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: club, isLoading, isError } = useClubDetail(id || '');
  const [activeTab, setActiveTab] = useState<TabKey>('billing');

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatCurrency = (amount?: number | null, currency = 'COP') => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-border rounded-lg w-48" />
        <div className="h-48 bg-border rounded-xl" />
        <div className="h-96 bg-border rounded-xl" />
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="text-center py-16 text-danger">Error al cargar el detalle del club.</div>
    );
  }

  const statusCfg = STATUS_CONFIG[club.status] ?? STATUS_CONFIG.ACTIVE;
  const isPendingMP = (club as any).mpStatus === 'pending';
  const isPastDue = club.status === 'PAST_DUE';

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'billing', label: 'Suscripción y Facturación', icon: <CreditCard size={15} /> },
    { key: 'addons', label: 'Add-Ons', icon: <Package size={15} />, count: club.addOns?.length ?? 0 },
    { key: 'players', label: 'Jugadores', icon: <Users size={15} />, count: club._count?.players ?? 0 },
    { key: 'history', label: 'Historial de Planes', icon: <History size={15} />, count: club.planHistory?.length ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            if (window.history.length > 2) navigate(-1);
            else navigate('/clubs');
          }} 
          className="p-2 rounded-lg border border-border hover:bg-bg text-text-secondary hover:text-text transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Detalle del Club</h1>
          <p className="text-sm text-text-secondary">{club.name}</p>
        </div>
      </div>

      {/* Alert banners */}
      {isPastDue && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Club en mora</p>
            <p className="text-xs">El club tiene pagos pendientes o fallidos. Usa las acciones en la esquina superior derecha para resolver.</p>
          </div>
        </div>
      )}
      {isPendingMP && !isPastDue && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-orange-200 bg-orange-50 text-orange-800">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Pago de Mercado Pago pendiente</p>
            <p className="text-xs">La suscripción está en estado "pending" en MP. Si el cliente ya pagó, usa "Liberar acceso" para reactivarle.</p>
          </div>
        </div>
      )}

      {/* Main Info Card */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary" />
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {club.logoUrl ? (
              <img src={club.logoUrl} alt={club.name} className="h-20 w-20 rounded-xl object-cover border border-border flex-shrink-0" />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-primary-light text-primary flex items-center justify-center border border-primary/10 flex-shrink-0">
                <Building2 size={36} />
              </div>
            )}

            <div className="flex-1 space-y-5 w-full">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-3xl font-extrabold text-text tracking-tight">{club.name}</h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${statusCfg.class}`}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                    <MapPin size={14} className="text-primary/70" />
                    <span>{(club as any).city}, {club.country.name}</span>
                    <span className="text-border mx-2">•</span>
                    <Calendar size={14} className="text-primary/70" />
                    <span>Registrado {formatDate(club.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info Row */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 border-t border-border">
                {club.users && club.users.length > 0 && (
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1.5">Cuenta Admin</p>
                    <a href={`mailto:${club.users[0].email}`} className="flex items-center gap-2 text-sm text-text hover:text-primary transition-colors font-medium">
                      <div className="p-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-md">
                        <Mail size={14} /> 
                      </div>
                      {club.users[0].email}
                      {club.users[0].googleId && (
                        <span className="bg-blue-100 border border-blue-200 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Google
                        </span>
                      )}
                    </a>
                  </div>
                )}
                
                {club.email && (
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1.5">Email Contacto</p>
                    <a href={`mailto:${club.email}`} className="flex items-center gap-2 text-sm text-text hover:text-primary transition-colors font-medium">
                      <div className="p-1.5 bg-gray-50 border border-border text-gray-600 rounded-md">
                        <Mail size={14} /> 
                      </div>
                      {club.email}
                    </a>
                  </div>
                )}

                {club.phone && (
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1.5">Teléfono</p>
                    <a href={`tel:${club.phone}`} className="flex items-center gap-2 text-sm text-text hover:text-primary transition-colors font-medium">
                      <div className="p-1.5 bg-green-50 border border-green-100 text-green-600 rounded-md">
                        <Phone size={14} /> 
                      </div>
                      {club.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="bg-bg/60 rounded-lg p-3">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide mb-1">Plan Actual</p>
                  <p className="font-semibold text-text text-sm">{club.subscriptionPrice?.plan.name ?? 'Sin plan'}</p>
                  {club.subscriptionPrice && (
                    <p className="text-[10px] text-text-secondary">
                      {formatCurrency(club.subscriptionPrice.price, club.subscriptionPrice.currency)}/mes
                    </p>
                  )}
                </div>
                <div className="bg-bg/60 rounded-lg p-3">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide mb-1 flex items-center gap-1"><Users size={10} /> Jugadores</p>
                  <p className="font-semibold text-text text-sm">{club._count.players}</p>
                  <p className="text-[10px] text-text-secondary">{club._count.coaches ?? 0} entrenadores</p>
                </div>
                <div className="bg-bg/60 rounded-lg p-3">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide mb-1 flex items-center gap-1"><Calendar size={10} /> Vence</p>
                  <p className="font-semibold text-text text-sm">{formatDate(club.subscriptionEnd)}</p>
                </div>
                <div className="bg-bg/60 rounded-lg p-3">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide mb-1">Método</p>
                  <p className="font-semibold text-text text-sm">{club.billingMethod ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-border bg-bg/30 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              {tab.icon}
              {tab.label}
              {typeof tab.count === 'number' && (
                <span className="ml-1 text-[10px] bg-border text-text-secondary rounded-full px-1.5 py-0.5 font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Tab: Billing */}
          {activeTab === 'billing' && (
            <ClubBillingTab club={club as any} />
          )}

          {/* Tab: AddOns */}
          {activeTab === 'addons' && (
            <div>
              {!club.addOns || club.addOns.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={36} className="mx-auto text-text-secondary/30 mb-3" />
                  <p className="text-text-secondary text-sm">Este club no tiene AddOns activos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {club.addOns.map((addon) => (
                    <div key={addon.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg/40 hover:border-primary/30 transition">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Layers size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text text-sm">{addon.addOn.name}</p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wide">{addon.addOn.code}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            addon.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-red-100 text-red-600'
                          }`}>{addon.status}</span>
                          <span className="text-[10px] text-text-secondary">Cant: {addon.quantity}</span>
                          {addon.expiresAt && (
                            <span className="text-[10px] text-text-secondary">Vence: {formatDate(addon.expiresAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {!club.planHistory || club.planHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History size={36} className="mx-auto text-text-secondary/30 mb-3" />
                  <p className="text-text-secondary text-sm">No hay un historial de planes registrado.</p>
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {club.planHistory.map((hist, i) => (
                    <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <History size={16} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-text">{hist.toPrice.plan.name}</span>
                          <span className="text-[10px] text-text-secondary">{formatDate(hist.changedAt)}</span>
                        </div>
                        <div className="text-xs text-text-secondary space-y-1">
                          <p>Precio: <span className="font-medium text-text">{formatCurrency(hist.toPrice.price, hist.toPrice.currency)}</span></p>
                          {hist.reason && <p className="italic">"{hist.reason}"</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Players */}
          {activeTab === 'players' && (
            <ClubPlayersTab clubId={club.id} />
          )}
        </div>
      </div>
    </div>
  );
}
