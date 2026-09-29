import { AlertTriangle } from 'lucide-react';
import { StatusClubList } from './components/StatusClubList';

export function GracePeriodPage() {
  return (
    <StatusClubList
      title="Clubes en gracia"
      description="Venció su mes y aún tienen acceso (7 días; 5 si venían de prueba). Si no pagan, se suspenden."
      filter={{ billingStatus: 'PAST_DUE' }}
      emptyTitle="No hay clubes en gracia"
      dateOf={(club) => club.gracePeriodEndsAt ?? club.subscriptionEnd ?? club.billingCycleEnd}
      dateLabel={(when) => (when === 'past' ? 'Gracia terminó' : 'Se suspende')}
      accent="bg-amber-50 text-amber-600"
      icon={<AlertTriangle size={18} />}
    />
  );
}
