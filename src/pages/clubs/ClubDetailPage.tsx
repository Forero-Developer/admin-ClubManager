import { useParams, Link } from 'react-router-dom';
import { useClubDetail } from './hooks/useClubs';
import { Loader2, ArrowLeft, Building2, MapPin, Users, Phone, Mail, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SubscriptionActions } from '../subscriptions/components/SubscriptionActions';

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: club, isLoading, isError } = useClubDetail(id || '');

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="text-center py-12 text-danger">Error al cargar el detalle del club.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/clubs">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Detalle del Club</h1>
          <p className="text-text-secondary">Vista 360° del club {club.name}</p>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {club.logoUrl ? (
            <img src={club.logoUrl} alt={club.name} className="h-24 w-24 rounded-lg object-cover border border-border" />
          ) : (
            <div className="h-24 w-24 rounded-lg bg-primary-light text-primary flex items-center justify-center border border-border/50 shrink-0">
              <Building2 size={40} />
            </div>
          )}
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-text">{club.name}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-1"><MapPin size={16} /> {club.city}, {club.country.name}</div>
                  <div className="flex items-center gap-1"><Mail size={16} /> {club.email}</div>
                  <div className="flex items-center gap-1"><Phone size={16} /> {club.phone || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  club.status === 'ACTIVE' ? 'bg-success/10 text-success' :
                  club.status === 'TRIAL' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-danger/10 text-danger'
                }`}>
                  {club.status}
                </span>
                <SubscriptionActions club={club as any} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-text-secondary uppercase">Plan Actual</p>
                <p className="font-medium text-text mt-1">{club.subscriptionPrice?.plan.name || 'Ninguno'}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase">Miembros</p>
                <p className="font-medium text-text mt-1 flex items-center gap-1">
                  <Users size={14} className="text-primary" /> {club._count.players} Jugadores
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase">Registro</p>
                <p className="font-medium text-text mt-1">{formatDate(club.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase">Próximo Cobro</p>
                <p className="font-medium text-text mt-1 flex items-center gap-1">
                  <Calendar size={14} /> {formatDate(club.nextChargeDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex border-b border-border bg-bg/50 overflow-x-auto">
          <button className="px-6 py-3 text-sm font-medium border-b-2 border-primary text-primary whitespace-nowrap">
            Suscripción y Facturación
          </button>
          <button className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text whitespace-nowrap">
            Add-Ons Activos ({club.addOns?.length || 0})
          </button>
          <button className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text whitespace-nowrap">
            Historial de Planes
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> Datos de Suscripción
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Estado de Facturación</span>
                  <span className="font-medium text-text">{club.billingStatus}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Método de Pago</span>
                  <span className="font-medium text-text">{club.billingMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Suscripción MP ID</span>
                  <span className="font-medium text-text">{club.mpSubscriptionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Estado en Mercado Pago</span>
                  <span className="font-medium text-text">{club.mpStatus || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Monto Base</span>
                  <span className="font-medium text-text">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: club.subscriptionPrice?.currency || 'COP' }).format(Number(club.currentBaseAmount || 0))}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Monto Addons</span>
                  <span className="font-medium text-text">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: club.subscriptionPrice?.currency || 'COP' }).format(Number(club.currentAddonAmount || 0))}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> Ciclos y Fechas
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Fin del Trial</span>
                  <span className="font-medium text-text">{formatDate(club.trialEndsAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Inicio Suscripción</span>
                  <span className="font-medium text-text">{formatDate(club.subscriptionStart)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Último Cargo</span>
                  <span className="font-medium text-text">{formatDate(club.lastChargeAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Fin Ciclo Facturación</span>
                  <span className="font-medium text-text">{formatDate(club.billingCycleEnd)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary">Fin Periodo de Gracia</span>
                  <span className="font-medium text-text">{formatDate(club.gracePeriodEndsAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
