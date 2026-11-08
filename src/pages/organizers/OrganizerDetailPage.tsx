import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, MapPin, Phone, Power, Trash2, Trophy } from 'lucide-react';
import { useOrganizerDetail } from './hooks/useOrganizers';
import { DeleteOrganizerDialog } from './components/DeleteOrganizerDialog';
import { OrganizerStatusDialog } from './components/OrganizerStatusDialog';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { ACCOUNT_STATUS, TOURNAMENT_STATUS } from '@/lib/status';
import { formatDate, formatRelative } from '@/lib/format';

export function OrganizerDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: organizer, isLoading, isError } = useOrganizerDetail(id);
  const [dialog, setDialog] = useState<'status' | 'delete' | null>(null);

  const goBack = () => (window.history.length > 2 ? navigate(-1) : navigate('/organizers'));

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-border/50" />;
  if (isError || !organizer) {
    return <div className="rounded-2xl bg-rose-50 py-12 text-center text-rose-700">No se encontró el organizador.</div>;
  }

  const name = organizer.companyName ?? 'Sin nombre';
  const isActive = organizer.status === 'ACTIVE';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={goBack}
          aria-label="Volver"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:text-text"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-secondary">Organizador</p>
          <p className="truncate font-semibold text-text">{name}</p>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {organizer.logoUrl ? (
            <img src={organizer.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-2xl border border-border object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-hover">
              <Trophy size={28} />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-text">{name}</h1>
              <StatusBadge map={ACCOUNT_STATUS} value={organizer.status} />
            </div>
            <div className="grid gap-1.5 text-sm text-text-secondary sm:grid-cols-2">
              <p className="flex min-w-0 items-center gap-2"><Mail size={14} className="shrink-0" /> <span className="truncate">{organizer.email}</span></p>
              {organizer.phone && <p className="flex items-center gap-2"><Phone size={14} /> {organizer.phone} <span className="text-xs">(cuenta)</span></p>}
              {organizer.contactPhone && organizer.contactPhone !== organizer.phone && (
                <p className="flex items-center gap-2"><Phone size={14} /> {organizer.contactPhone} <span className="text-xs">(torneos)</span></p>
              )}
              {(organizer.city || organizer.sport) && (
                <p className="flex items-center gap-2"><MapPin size={14} /> {[organizer.city, organizer.sport].filter(Boolean).join(' · ')}</p>
              )}
            </div>
            <p className="text-xs text-text-secondary" title={formatDate(organizer.createdAt)}>
              Organizador desde {formatRelative(organizer.createdAt)}
            </p>
          </div>
        </div>

        {/* Acciones: la reversible primero, la destructiva aparte */}
        <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
          <button
            onClick={() => setDialog('status')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text transition hover:bg-bg"
          >
            <Power size={16} /> {isActive ? 'Desactivar' : 'Reactivar'}
          </button>
          <button
            onClick={() => setDialog('delete')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <Trash2 size={16} /> Eliminar definitivo
          </button>
        </div>
      </Card>

      <section>
        <SectionTitle>Torneos ({organizer.tournaments.length})</SectionTitle>
        {organizer.tournaments.length === 0 ? (
          <EmptyState icon={<Trophy size={22} />} title="Todavía no ha creado torneos" />
        ) : (
          <Card className="divide-y divide-border/60">
            {organizer.tournaments.map((t) => (
              <div key={t.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text">{t.name}</p>
                  <p className="text-xs text-text-secondary">
                    {t.startDate ? `Empieza ${formatDate(t.startDate)}` : `Creado ${formatRelative(t.createdAt)}`} · {t.invitedClubs}{' '}
                    {t.invitedClubs === 1 ? 'club invitado' : 'clubes invitados'}
                  </p>
                </div>
                <StatusBadge map={TOURNAMENT_STATUS} value={t.status} />
              </div>
            ))}
          </Card>
        )}
      </section>

      {organizer.clubs.length > 0 && (
        <section>
          <SectionTitle>También administra</SectionTitle>
          <Card className="divide-y divide-border/60">
            {organizer.clubs.map((c) => (
              <Link key={c.id} to={`/clubs/${c.id}`} className="flex items-center gap-3 p-4 transition hover:bg-bg">
                <Building2 size={18} className="text-text-secondary" />
                <span className="font-medium text-text">{c.name}</span>
              </Link>
            ))}
          </Card>
        </section>
      )}

      {dialog === 'status' && (
        <OrganizerStatusDialog
          organizerId={organizer.id}
          companyName={organizer.companyName}
          nextStatus={isActive ? 'INACTIVE' : 'ACTIVE'}
          clubsCount={organizer.clubsCount}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'delete' && (
        <DeleteOrganizerDialog
          organizerId={organizer.id}
          email={organizer.email}
          companyName={organizer.companyName}
          onClose={() => setDialog(null)}
          onDeleted={() => navigate('/organizers', { replace: true })}
        />
      )}
    </div>
  );
}
