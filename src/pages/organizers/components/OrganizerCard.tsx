import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ChevronRight, MapPin, Phone, Trash2, Trophy } from 'lucide-react';
import type { OrganizerListItem } from '@/services/organizers/organizers.types';
import { StatusBadge } from '@/components/ui/Badge';
import { ACCOUNT_STATUS, TONE_CLASSES, statusMeta } from '@/lib/status';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

interface OrganizerCardProps {
  organizer: OrganizerListItem;
  index: number;
  onDelete: (organizer: OrganizerListItem) => void;
}

export function OrganizerCard({ organizer, index, onDelete }: OrganizerCardProps) {
  const tone = TONE_CLASSES[statusMeta(ACCOUNT_STATUS, organizer.status).tone];
  const name = organizer.companyName ?? 'Sin nombre';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      className="group relative"
    >
      <Link
        to={`/organizers/${organizer.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-[0_1px_2px_rgba(15,31,18,0.04)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
      >
        <div className={cn('h-1 w-full', tone.dot)} />

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start gap-3">
            {organizer.logoUrl ? (
              <img src={organizer.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-hover">
                <Trophy size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1 pr-7">
              <p className="truncate font-semibold text-text">{name}</p>
              <div className="mt-1">
                <StatusBadge map={ACCOUNT_STATUS} value={organizer.status} />
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-text-secondary">
            <p className="truncate">{organizer.email}</p>
            {organizer.phone && (
              <p className="flex items-center gap-1">
                <Phone size={12} className="shrink-0" /> {organizer.phone}
              </p>
            )}
            {organizer.city && (
              <p className="flex items-center gap-1 truncate">
                <MapPin size={12} className="shrink-0" /> {organizer.city}
              </p>
            )}
            <p title={formatDate(organizer.createdAt)}>Desde {formatRelative(organizer.createdAt)}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-bg p-2.5">
              <p className="flex items-center gap-1 text-[11px] text-text-secondary">
                <Trophy size={11} /> Torneos
              </p>
              <p className="text-sm font-semibold text-text">{organizer.tournamentsCount}</p>
            </div>
            <div className="rounded-xl bg-bg p-2.5">
              <p className="flex items-center gap-1 text-[11px] text-text-secondary">
                <Building2 size={11} /> Clubes
              </p>
              <p className="text-sm font-semibold text-text">{organizer.clubsCount}</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end border-t border-border/60 pt-3 text-xs">
            <span className="flex items-center gap-0.5 font-semibold text-primary-hover">
              Ver <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={() => onDelete(organizer)}
        aria-label={`Eliminar ${name}`}
        className="absolute right-3 top-4 rounded-lg p-1.5 text-text-secondary/50 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
}
