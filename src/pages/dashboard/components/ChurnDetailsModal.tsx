import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { CLUB_STATUS } from '@/lib/status';
import { formatDate, formatRelative } from '@/lib/format';
import { useChurnedClubs } from '../hooks/useChurnedClubs';

interface ChurnDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChurnDetailsModal({ open, onClose }: ChurnDetailsModalProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useChurnedClubs(page, open);
  const clubs: Array<{ id: string; name: string; status: string; email: string | null; isGoogleAuth: boolean; lastChargeAt: string | null }> =
    data?.data ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Clubes que se fueron"
      description="Suspendidos y sin pagar hace más de 15 días. Toca uno para ver su detalle."
      footer={<Pagination page={page} lastPage={data?.lastPage ?? 1} total={data?.total} itemLabel="clubes" onChange={setPage} />}
    >
      {isLoading ? (
        <ul className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-16 animate-pulse rounded-2xl bg-bg" />
          ))}
        </ul>
      ) : clubs.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">No hay bajas recientes. 🎉</p>
      ) : (
        <ul className="space-y-2">
          {clubs.map((club) => (
            <li key={club.id}>
              <Link
                to={`/clubs/${club.id}`}
                onClick={onClose}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-4 transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-text">{club.name}</p>
                    <StatusBadge map={CLUB_STATUS} value={club.status} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="truncate">{club.email ?? 'Sin correo'}</span>
                    {club.isGoogleAuth && <Badge tone="info">Google</Badge>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-text-secondary">Último pago</p>
                  <p className="text-sm font-medium text-text">{formatDate(club.lastChargeAt)}</p>
                  <p className="text-[11px] text-text-secondary">{formatRelative(club.lastChargeAt)}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-text-secondary/50 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
