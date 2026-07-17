import { useState } from 'react';
import { usePlans, useTogglePlan, useDeletePlan } from './hooks/usePlansData';
import {
  Plus, Edit, Power, PowerOff, Tag, DollarSign, CheckCircle2,
  Zap, Layers, ChevronRight, Loader2, Trash2, AlertTriangle,
} from 'lucide-react';
import { PlanFormModal } from './components/PlanFormModal';
import type { SubscriptionPlan } from '@/services/plans/plans.types';

const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: 'Mensual', QUARTERLY: 'Trimestral', SEMIANNUAL: 'Semestral', YEARLY: 'Anual',
};

const formatCurrency = (amount: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

// ── Individual plan card ──────────────────────────────────────────────────────
function PlanCard({
  plan,
  onEdit,
  onToggle,
  onDelete,
  toggling,
  deleting,
}: {
  plan: SubscriptionPlan;
  onEdit: (p: SubscriptionPlan) => void;
  onToggle: (p: SubscriptionPlan) => void;
  onDelete: (p: SubscriptionPlan) => void;
  toggling: boolean;
  deleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lowestPrice = plan.pricing.length
    ? [...plan.pricing].sort((a, b) => a.price - b.price)[0]
    : null;

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${
      plan.isActive ? 'border-border' : 'border-border opacity-60'
    }`}>
      {/* Color strip + status */}
      <div className={`h-1.5 w-full ${plan.isActive ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-border'}`} />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                plan.isActive ? 'bg-primary/10' : 'bg-bg'
              }`}>
                <Tag size={15} className={plan.isActive ? 'text-primary' : 'text-text-secondary'} />
              </div>
              <div>
                <h3 className="font-bold text-text leading-tight">{plan.name}</h3>
                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 ${
                  plan.isActive
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-bg text-text-secondary border-border'
                }`}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            {plan.description && (
              <p className="text-xs text-text-secondary mt-2 line-clamp-2">{plan.description}</p>
            )}
          </div>

          {/* Price badge */}
          {lowestPrice && (
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-primary">
                {formatCurrency(lowestPrice.price, lowestPrice.currency)}
              </p>
              <p className="text-[10px] text-text-secondary">
                /{INTERVAL_LABELS[lowestPrice.interval] ?? lowestPrice.interval}
              </p>
            </div>
          )}
        </div>

        {/* Pricing grid */}
        {plan.pricing.length > 1 && (
          <div className="grid grid-cols-2 gap-1.5">
            {plan.pricing.map((p) => (
              <div key={p.id} className="bg-bg rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-1">
                <span className="text-[10px] text-text-secondary">{INTERVAL_LABELS[p.interval] ?? p.interval}</span>
                <span className="text-xs font-semibold text-text">{formatCurrency(p.price, p.currency)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        {plan.features.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1">
              <Zap size={10} className="text-primary" /> Características
            </p>
            <div className="flex flex-wrap gap-1.5">
              {plan.features.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 bg-bg border border-border px-2 py-0.5 rounded-md text-[10px] text-text"
                  title={f.feature?.code}
                >
                  <CheckCircle2 size={9} className="text-success flex-shrink-0" />
                  <span className="font-medium">{f.feature?.code}</span>
                  <span className="text-text-secondary">· {f.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {plan.features.length === 0 && (
          <p className="text-xs text-text-secondary italic">Sin características configuradas</p>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-border bg-bg/40 space-y-2">
        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <span className="text-xs text-danger flex items-center gap-1">
              <AlertTriangle size={11} /> ¿Eliminar "{plan.name}"?
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setConfirmDelete(false)} className="text-[10px] px-2 py-1 rounded border border-border text-text-secondary hover:bg-white transition">Cancelar</button>
              <button
                onClick={() => { onDelete(plan); setConfirmDelete(false); }}
                disabled={deleting}
                className="text-[10px] px-2 py-1 rounded bg-danger text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1"
              >
                {deleting ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />} Eliminar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onToggle(plan)}
            disabled={toggling}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
              plan.isActive
                ? 'border-danger/30 text-danger hover:bg-red-50'
                : 'border-success/30 text-success hover:bg-green-50'
            }`}
          >
            {toggling
              ? <Loader2 size={12} className="animate-spin" />
              : plan.isActive ? <PowerOff size={12} /> : <Power size={12} />
            }
            {plan.isActive ? 'Desactivar' : 'Activar'}
          </button>

          <div className="flex gap-1.5">
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-200 text-danger hover:bg-red-50 transition-all"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={() => onEdit(plan)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border text-text hover:border-primary/40 hover:text-primary transition-all"
            >
              <Edit size={12} /> Editar <ChevronRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
import { AddOnsTab } from './components/AddOnsTab';

export function PlansPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'addons'>('plans');
  
  const { data: plans, isLoading, isError } = usePlans();
  const togglePlan  = useTogglePlan();
  const deletePlan  = useDeletePlan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  const handleCreate = () => { setSelectedPlan(null); setIsModalOpen(true); };
  const handleEdit   = (plan: SubscriptionPlan) => { setSelectedPlan(plan); setIsModalOpen(true); };

  const handleToggle = (plan: SubscriptionPlan) => {
    setTogglingId(plan.id);
    togglePlan.mutate(
      { id: plan.id, isActive: !plan.isActive },
      { onSettled: () => setTogglingId(null) },
    );
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    setDeletingId(plan.id);
    deletePlan.mutate(
      plan.id,
      { onSettled: () => setDeletingId(null) },
    );
  };

  const activePlans   = plans?.filter(p => p.isActive)  ?? [];
  const inactivePlans = plans?.filter(p => !p.isActive) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Planes y Paquetes</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Gestiona los planes de suscripción y paquetes adicionales.
          </p>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'plans' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          Planes Base
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'addons' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          Paquetes Adicionales (AddOns)
        </button>
      </div>

      {activeTab === 'plans' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition shadow-sm"
            >
              <Plus size={16} /> Crear Plan
            </button>
          </div>

          {/* Summary bar */}
          {!isLoading && plans && plans.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Layers size={16} className="text-primary" />, label: 'Total planes', value: plans.length },
                { icon: <CheckCircle2 size={16} className="text-success" />, label: 'Activos', value: activePlans.length },
                { icon: <DollarSign size={16} className="text-blue-500" />, label: 'Variantes de precio', value: plans.reduce((s, p) => s + p.pricing.length, 0) },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="h-9 w-9 rounded-lg bg-bg flex items-center justify-center">{icon}</div>
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-xl font-bold text-text">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-danger">Error al cargar los planes.</div>
      ) : plans && plans.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <Tag size={32} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text font-semibold">No hay planes registrados</p>
          <p className="text-sm text-text-secondary mb-4">Crea el primer plan de suscripción para empezar.</p>
          <button onClick={handleCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition">
            <Plus size={15} /> Crear plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active plans */}
          {activePlans.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 size={13} className="text-success" /> Planes activos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activePlans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    toggling={togglingId === plan.id}
                    deleting={deletingId === plan.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive plans */}
          {inactivePlans.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <PowerOff size={13} className="text-text-secondary" /> Planes inactivos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {inactivePlans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    toggling={togglingId === plan.id}
                    deleting={deletingId === plan.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

          {/* Modal */}
          {isModalOpen && (
            <PlanFormModal plan={selectedPlan} onClose={() => setIsModalOpen(false)} />
          )}
        </div>
      ) : (
        <AddOnsTab />
      )}
    </div>
  );
}
