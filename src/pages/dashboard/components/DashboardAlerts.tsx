import type { DashboardStats } from '@/services/dashboard/dashboard.types';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';

interface DashboardAlertsProps {
  alerts: DashboardStats['alerts'];
}

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-red-800">Clubes PAST_DUE</p>
          <p className="text-2xl font-bold text-red-900">{alerts.pastDueClubs}</p>
        </div>
        <div className="bg-red-100 p-3 rounded-full">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-orange-800">Trials por vencer (7 días)</p>
          <p className="text-2xl font-bold text-orange-900">{alerts.trialsEndingSoon}</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full">
          <Clock className="text-orange-600" size={24} />
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-800">Pagos Pendientes</p>
          <p className="text-2xl font-bold text-yellow-900">{alerts.pendingSaasPayments}</p>
        </div>
        <div className="bg-yellow-100 p-3 rounded-full">
          <CreditCard className="text-yellow-600" size={24} />
        </div>
      </div>
    </div>
  );
}
