import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useOrganizerTournaments } from '../hooks/useOrganizers';
import { Card, EmptyState, SectionTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { TOURNAMENT_STATUS } from '@/lib/status';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Torneos de un organizador, paginados en el servidor */
export function OrganizerTournaments({ organizerId, total }: { organizerId: string; total: number }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useOrganizerTournaments(organizerId, page);
  const tournaments = data?.data ?? [];

  return (
    <section>
      <SectionTitle>Torneos ({total})</SectionTitle>
      {isLoading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-border/50" />
      ) : isError ? (
        <div className="rounded-2xl bg-rose-50 py-8 text-center text-sm text-rose-700">No se pudieron cargar los torneos.</div>
      ) : tournaments.length === 0 ? (
        <EmptyState icon={<Trophy size={22} />} title="Todavía no ha creado torneos" />
      ) : (
        <Card className={cn('divide-y divide-border/60 transition-opacity', isFetching && 'opacity-70')}>
          {tournaments.map((t) => (
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
      <Pagination
        page={data?.page ?? page}
        lastPage={data?.lastPage ?? 1}
        total={data?.total ?? total}
        itemLabel="torneos"
        onChange={setPage}
        className="pt-3"
      />
    </section>
  );
}
