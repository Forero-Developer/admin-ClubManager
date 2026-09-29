import { Clock } from 'lucide-react';
import { StatusClubList } from './components/StatusClubList';

export function TrialsPage() {
  return (
    <StatusClubList
      title="Clubes en prueba"
      description="Clubes probando la plataforma. Al terminar la prueba tienen 5 días de gracia para pagar."
      filter={{ status: 'TRIAL' }}
      emptyTitle="No hay clubes en prueba"
      dateOf={(club) => club.trialEndsAt ?? club.subscriptionEnd}
      dateLabel={(when) => (when === 'past' ? 'Prueba terminó' : 'Prueba termina')}
      accent="bg-violet-50 text-violet-600"
      icon={<Clock size={18} />}
    />
  );
}
