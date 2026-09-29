import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCircle, ChevronRight, X, Cake, CalendarPlus, ClipboardCheck, Receipt, Phone, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import { usePlayers, usePlayerDetail } from '../hooks/usePlayers';
import { useDebounce } from '@/hooks/useDebounce';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Card';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PLAYER_STATUS, TONE_CLASSES } from '@/lib/status';
import { ageFrom, formatBirthDate, formatDate, formatDateLong, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PlayerDetail, PlayerListItem, PlayerListQuery } from '@/services/players/players.types';

const STATUS_OPTIONS = ['', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'DROPPED_OUT', 'PENDING', 'REJECTED'];

const hasPhoto = (url?: string | null) => !!url && !url.includes('via.placeholder.com');

function Avatar({ player, size = 'md' }: { player: Pick<PlayerListItem, 'fullName' | 'photoUrl'>; size?: 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false);
  const cls = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-11 w-11 text-sm';
  if (hasPhoto(player.photoUrl) && !failed) {
    return <img src={player.photoUrl} alt="" onError={() => setFailed(true)} className={cn('shrink-0 rounded-full object-cover ring-2 ring-surface', cls)} />;
  }
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-secondary-light font-bold text-primary-hover', cls)}>
      {player.fullName.charAt(0).toUpperCase()}
    </div>
  );
}

function ageLabel(birthDate?: string | null) {
  const age = ageFrom(birthDate);
  return age === null ? null : `${age} año${age === 1 ? '' : 's'}`;
}

export function ClubPlayersTab({ clubId }: { clubId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching } = usePlayers(clubId, {
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    status: (status || undefined) as PlayerListQuery['status'],
  });
  const players = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          placeholder="Buscar por nombre o documento…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
        {search && (
          <button onClick={() => setSearch('')} aria-label="Limpiar" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary hover:bg-bg">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {STATUS_OPTIONS.map((s) => {
          const active = status === s;
          const meta = s ? PLAYER_STATUS[s] : null;
          return (
            <button
              key={s || 'all'}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                active
                  ? meta
                    ? cn(TONE_CLASSES[meta.tone].badge, 'ring-2 ring-inset')
                    : 'bg-sidebar text-white'
                  : 'bg-surface text-text-secondary ring-1 ring-border hover:text-text',
              )}
            >
              {meta && <span className={cn('h-1.5 w-1.5 rounded-full', TONE_CLASSES[meta.tone].dot)} />}
              {meta?.label ?? 'Todos'}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-bg" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <EmptyState icon={<UserCircle size={22} />} title="No hay deportistas" description="Prueba con otro nombre o estado." />
      ) : (
        <div className={cn('grid grid-cols-1 gap-2.5 transition-opacity md:grid-cols-2 xl:grid-cols-3', isFetching && 'opacity-70')}>
          {players.map((player, i) => {
            const age = ageLabel(player.birthDate);
            return (
              <motion.button
                key={player.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.025 }}
                onClick={() => setSelectedPlayerId(player.id)}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3 text-left transition hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
              >
                <Avatar player={player} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text">{player.fullName}</p>
                    <StatusBadge map={PLAYER_STATUS} value={player.status} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">
                    {player.category?.name ?? 'Sin categoría'}
                    {age && ` · ${age}`}
                  </p>
                  <p className="truncate text-[11px] text-text-secondary/80" title={formatDateLong(player.createdAt)}>
                    Ingresó {formatRelative(player.createdAt)}
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-text-secondary/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </motion.button>
            );
          })}
        </div>
      )}

      {data && (
        <Pagination
          page={data.page}
          lastPage={data.lastPage}
          total={data.total}
          itemLabel="deportistas"
          onChange={setPage}
          className="border-t border-border/60 pt-4"
        />
      )}

      <PlayerDetailModal clubId={clubId} playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-bg p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
        {icon} {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-text">{value}</p>
      {sub && <p className="text-[11px] text-text-secondary">{sub}</p>}
    </div>
  );
}

function PhoneLinks({ prefix, phone }: { prefix?: string | null; phone?: string | null }) {
  if (!phone) return <span className="text-text-secondary">—</span>;
  const digits = `${prefix ?? ''}${phone}`.replace(/[^\d]/g, '');
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{prefix} {phone}</span>
      <a href={`tel:+${digits}`} aria-label="Llamar" className="rounded-lg p-1.5 text-text-secondary transition hover:bg-bg hover:text-primary-hover">
        <Phone size={14} />
      </a>
      <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-lg p-1.5 text-text-secondary transition hover:bg-emerald-50 hover:text-emerald-600">
        <MessageCircle size={14} />
      </a>
    </span>
  );
}

function PlayerDetailContent({ player }: { player: PlayerDetail }) {
  const age = ageLabel(player.birthDate);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar player={player} size="lg" />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-text">{player.fullName}</h3>
          <p className="text-sm text-text-secondary">
            {player.documentType} {player.documentNumber}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge map={PLAYER_STATUS} value={player.status} />
            <Badge tone="info">{player.category?.name ?? 'Sin categoría'}</Badge>
            {player.sponsored && <Badge tone="trial">Patrocinado</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat icon={<Cake size={12} />} label="Edad" value={age ?? '—'} sub={formatBirthDate(player.birthDate)} />
        <Stat icon={<CalendarPlus size={12} />} label="Ingresó" value={formatDate(player.createdAt)} sub={formatRelative(player.createdAt)} />
        <Stat icon={<ClipboardCheck size={12} />} label="Asistencias" value={player._count?.attendances ?? 0} sub="registradas" />
        <Stat icon={<Receipt size={12} />} label="Pagos" value={player._count?.payments ?? 0} sub="registrados" />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-text-secondary">Información personal</p>
        <InfoList>
          <InfoRow label="Nacimiento" value={formatBirthDate(player.birthDate)} />
          <InfoRow label="Sangre / EPS" value={`${player.bloodType || '—'} / ${player.eps || '—'}`} />
          <InfoRow label="Colegio" value={[player.school, player.grade].filter(Boolean).join(' · ') || '—'} />
          <InfoRow label="Dirección" value={[player.address, player.neighborhood].filter(Boolean).join(', ') || '—'} />
        </InfoList>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-text-secondary">Acudientes</p>
        <InfoList>
          <InfoRow
            label={player.guardian1Relation || 'Acudiente 1'}
            value={player.guardian1Name || '—'}
            sub={player.guardian1Occupation || undefined}
          />
          <InfoRow label="Teléfono" value={<PhoneLinks prefix={player.phone1Prefix} phone={player.phone1} />} />
          {player.guardian2Name && (
            <InfoRow label={player.guardian2Relation || 'Acudiente 2'} value={player.guardian2Name} sub={player.guardian2Occupation || undefined} />
          )}
          {player.phone2 && <InfoRow label="Teléfono 2" value={<PhoneLinks prefix={player.phone2Prefix} phone={player.phone2} />} />}
        </InfoList>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-text-secondary">Documentos</p>
        {player.documents?.length ? (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-surface">
            {player.documents.map((doc) => (
              <li key={doc.id}>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 transition hover:bg-bg">
                  <FileText size={16} className="shrink-0 text-text-secondary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-text">{doc.type}</span>
                    <span className="block text-xs text-text-secondary">Subido {formatRelative(doc.createdAt)}</span>
                  </span>
                  <ExternalLink size={14} className="shrink-0 text-text-secondary" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">No tiene documentos cargados.</p>
        )}
      </div>
    </div>
  );
}

function PlayerDetailModal({ clubId, playerId, onClose }: { clubId: string; playerId: string | null; onClose: () => void }) {
  const { data: player, isLoading } = usePlayerDetail(clubId, playerId ?? '');

  return (
    <Modal open={!!playerId} onClose={onClose} title="Deportista" size="lg">
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-bg" />
          <div className="h-24 animate-pulse rounded-2xl bg-bg" />
          <div className="h-40 animate-pulse rounded-2xl bg-bg" />
        </div>
      ) : !player ? (
        <p className="py-10 text-center text-sm text-rose-600">No se pudo cargar el deportista.</p>
      ) : (
        <PlayerDetailContent player={player} />
      )}
    </Modal>
  );
}
