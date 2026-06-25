import { useState } from 'react';
import { usePlans } from './hooks/usePlansData';
import { Loader2, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlanFormModal } from './components/PlanFormModal';
import type { SubscriptionPlan } from '@/services/plans/plans.types';

export function PlansPage() {
  const { data: plans, isLoading, isError } = usePlans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  console.log(plans)
  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Planes de Suscripción</h1>
          <p className="text-text-secondary">Gestiona los planes, características y precios.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-2" />
          Crear Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-danger">Error al cargar los planes.</div>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text">
              <thead className="text-xs text-text-secondary uppercase bg-bg/50 border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Nombre del Plan</th>
                  <th scope="col" className="px-6 py-4 font-medium">Estado</th>
                  <th scope="col" className="px-6 py-4 font-medium">Precios</th>
                  <th scope="col" className="px-6 py-4 font-medium">Características</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans?.map((plan) => (
                  <tr key={plan.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text">{plan.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      }`}>
                        {plan.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {plan.pricing.map((p) => (
                          <div key={p.id} className="text-xs text-text-secondary">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: p.currency, minimumFractionDigits: 0 }).format(p.price)} / {p.interval}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {plan.features.map((f) => (
                          <span key={f.id} className="inline-flex bg-bg px-2 py-1 rounded text-xs border border-border">
                            {f.feature?.name || f.featureId}: <strong>{f.value}</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                        <Edit size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!plans || plans.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                      No hay planes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <PlanFormModal 
          plan={selectedPlan} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
