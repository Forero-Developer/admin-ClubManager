import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Ban, Clock, CreditCard, ChevronRight } from 'lucide-react';
import type { DashboardStats } from '@/services/dashboard/dashboard.types';
import { cn } from '@/lib/utils';

interface DashboardAlertsProps {
  alerts: DashboardStats['alerts'];
}

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
  const items = [
    {
      label: 'En gracia',
      hint: 'Venció su mes, aún con acceso',
      value: alerts.pastDueClubs,
      icon: AlertTriangle,
      tone: 'bg-amber-50 text-amber-700 ring-amber-200/70',
      iconTone: 'bg-amber-100 text-amber-600',
      to: '/clubs?status=PAST_DUE',
    },
    {
      label: 'Suspendidos',
      hint: 'Sin acceso hasta pagar',
      value: alerts.suspendedClubs ?? 0,
      icon: Ban,
      tone: 'bg-rose-50 text-rose-700 ring-rose-200/70',
      iconTone: 'bg-rose-100 text-rose-600',
      to: '/clubs?status=SUSPENDED',
    },
    {
      label: 'Pruebas por vencer',
      hint: 'En los próximos 7 días',
      value: alerts.trialsEndingSoon,
      icon: Clock,
      tone: 'bg-violet-50 text-violet-700 ring-violet-200/70',
      iconTone: 'bg-violet-100 text-violet-600',
      to: '/clubs?status=TRIAL',
    },
    {
      label: 'Pagos pendientes',
      hint: 'Por aprobar o confirmar',
      value: alerts.pendingSaasPayments,
      icon: CreditCard,
      tone: 'bg-sky-50 text-sky-700 ring-sky-200/70',
      iconTone: 'bg-sky-100 text-sky-600',
      to: '/subscriptions',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Link
            to={item.to}
            className={cn(
              'group flex h-full flex-col rounded-2xl p-4 ring-1 ring-inset transition hover:shadow-md active:scale-[0.98]',
              item.tone,
              item.value === 0 && 'opacity-70',
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', item.iconTone)}>
                <item.icon size={16} />
              </div>
              <ChevronRight size={16} className="opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight">{item.value}</p>
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="mt-0.5 text-[11px] opacity-70">{item.hint}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
