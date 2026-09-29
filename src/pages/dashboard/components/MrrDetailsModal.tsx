import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Info, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import type { MrrClub } from '@/services/dashboard/dashboard.types';
import { useMrrClubs } from '../hooks/useMrrClubs';

interface MrrDetailsModalProps {
  open: boolean;
  onClose: () => void;
  mrr: number;
  currency: string;
}

function PackChange({ club }: { club: MrrClub }) {
  const { current, expected } = club.playerPacks;
  if (current === expected) return null;
  const up = expected > current;
  return (
    <Badge tone={up ? 'success' : 'warning'} className="gap-1">
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? `Creció: ${current} → ${expected} packs` : `Bajó: ${current} → ${expected} packs`}
    </Badge>
  );
}

function ClubRow({ club, index, onNavigate }: { club: MrrClub; index: number; onNavigate: () => void }) {
  const included = club.maxPlayers ?? 0;
  const packs = club.playerPacks.expected;

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <Link
        to={`/clubs/${club.id}`}
        onClick={onNavigate}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 rounded-2xl border border-border/70 bg-surface p-4 transition hover:border-primary/40 hover:shadow-md md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_auto] md:gap-4"
      >
        {/* Club */}
        <div className="min-w-0">
          <p className="truncate font-semibold text-text group-hover:text-primary-hover">{club.name}</p>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-text-secondary">
            <span className="truncate">{club.email ?? 'Sin correo'}</span>
            {club.isGoogleAuth && <Badge tone="info">Google</Badge>}
          </div>
        </div>

        {/* Total (en celular va arriba a la derecha) */}
        <div className="text-right md:order-last md:hidden">
          <p className="text-base font-bold text-text">{formatCurrency(club.total, club.currency)}</p>
          <p className="text-[11px] text-text-secondary">/ mes</p>
        </div>

        {/* Deportistas */}
        <div className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-1">
          <span className="inline-flex items-center gap-1.5 text-sm text-text">
            <Users size={14} className="text-text-secondary" />
            <span className="font-semibold">{club.billablePlayers}</span>
            <span className="text-text-secondary">deportistas</span>
          </span>
          <PackChange club={club} />
          <p className="w-full text-[11px] text-text-secondary">
            {included > 0 ? `${included} incluidos` : 'Ilimitado'}
            {packs > 0 && ` + ${packs} pack${packs > 1 ? 's' : ''} de 10`}
          </p>
        </div>

        {/* Montos (escritorio) */}
        <div className="hidden text-sm md:block">
          <p className="text-[11px] text-text-secondary">Plan</p>
          <p className="font-medium text-text">{formatCurrency(club.baseAmount, club.currency)}</p>
        </div>
        <div className="hidden text-sm md:block">
          <p className="text-[11px] text-text-secondary">Packs</p>
          <p className="font-medium text-text">{formatCurrency(club.addonAmount, club.currency)}</p>
        </div>
        <div className="hidden text-sm md:block">
          <p className="text-[11px] text-text-secondary">Total / mes</p>
          <p className="font-bold text-text">{formatCurrency(club.total, club.currency)}</p>
        </div>

        {/* Montos (celular) */}
        <p className="col-span-2 text-xs text-text-secondary md:hidden">
          Plan {formatCurrency(club.baseAmount, club.currency)} · Packs {formatCurrency(club.addonAmount, club.currency)}
        </p>

        <ChevronRight size={18} className="hidden text-text-secondary/50 transition group-hover:translate-x-0.5 group-hover:text-primary md:block" />
      </Link>
    </motion.li>
  );
}

export function MrrDetailsModal({ open, onClose, mrr, currency }: MrrDetailsModalProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMrrClubs(page, open);
  const clubs = data?.data ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="¿De dónde sale el MRR esperado?"
      description={
        <>
          {formatCurrency(mrr, currency)} al mes entre {data?.total ?? '…'} clubes al día. Toca un club para ver su
          detalle.
        </>
      }
      header={
        <div className="flex gap-3 rounded-2xl bg-primary-light/70 p-3.5 text-sm text-text">
          <Info size={18} className="mt-0.5 shrink-0 text-primary-hover" />
          <p className="leading-relaxed">
            <span className="font-semibold">Cómo se calcula:</span> plan PRO (incluye 30 deportistas) + un pack por
            cada 10 deportistas extra, con los activos y suspendidos de <span className="font-semibold">hoy</span>.
            Si un club creció desde su último pago, verás el cambio de packs marcado.
          </p>
        </div>
      }
      footer={<Pagination page={page} lastPage={data?.lastPage ?? 1} total={data?.total} itemLabel="clubes" onChange={setPage} />}
    >
      {isLoading ? (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-20 animate-pulse rounded-2xl bg-bg" />
          ))}
        </ul>
      ) : clubs.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">Todavía no hay clubes pagando.</p>
      ) : (
        <ul className="space-y-2">
          {clubs.map((club, i) => (
            <ClubRow key={club.id} club={club} index={i} onNavigate={onClose} />
          ))}
        </ul>
      )}
    </Modal>
  );
}
