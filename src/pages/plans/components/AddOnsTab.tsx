import { useState } from 'react';
import { Plus, Edit, Package, Trash2, Loader2 } from 'lucide-react';
import { useAddOns, useDeleteAddOn } from '../hooks/usePlansData';
import { AddOnFormModal } from './AddOnFormModal';

const formatCurrency = (amount: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

export function AddOnsTab() {
  const { data: addons, isLoading, isError } = useAddOns();
  const deleteAddOn = useDeleteAddOn();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedAddOn(null);
    setIsModalOpen(true);
  };

  const handleEdit = (addon: any) => {
    setSelectedAddOn(addon);
    setIsModalOpen(true);
  };

  const handleDelete = (addon: any) => {
    if (confirm(`¿Estás seguro de desactivar el AddOn "${addon.name}"?`)) {
      setDeletingId(addon.id);
      deleteAddOn.mutate(addon.id, {
        onSettled: () => setDeletingId(null)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center py-16 text-danger">Error al cargar los AddOns.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-text">Paquetes Adicionales (AddOns)</h2>
          <p className="text-sm text-text-secondary">Gestiona los paquetes extra que se cobran junto con la suscripción.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition shadow-sm"
        >
          <Plus size={16} /> Crear AddOn
        </button>
      </div>

      {!addons || addons.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
          <Package size={32} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text font-semibold">No hay AddOns registrados</p>
          <p className="text-sm text-text-secondary mb-4">Crea un paquete adicional (ej. Jugadores Extra).</p>
          <button onClick={handleCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition">
            <Plus size={15} /> Crear AddOn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addons.map((addon: any) => {
            const activePrice = addon.pricing?.[0];
            const price = activePrice?.price || addon.price || 0;
            const currency = activePrice?.currency || addon.currency || 'COP';
            
            // Checking if pricing is active. If no pricing array, assume true for legacy data.
            const isActive = activePrice ? activePrice.isActive : true;

            return (
              <div key={addon.id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${!isActive ? 'opacity-60' : ''}`}>
                <div className={`h-1.5 w-full ${isActive ? 'bg-primary' : 'bg-border'}`} />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                          <Package size={15} />
                        </div>
                        <div>
                          <h3 className="font-bold text-text leading-tight truncate">{addon.name}</h3>
                          <span className="text-xs text-text-secondary">{addon.code}</span>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-2 line-clamp-2">{addon.description || 'Sin descripción'}</p>
                    </div>
                  </div>

                  <div className="bg-bg rounded-lg px-3 py-2 flex justify-between items-center">
                    <span className="text-xs font-medium text-text-secondary">Precio Base (Mensual)</span>
                    <span className="font-bold text-primary">{formatCurrency(price, currency)}</span>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex justify-end gap-2 mt-auto">
                    <button
                      onClick={() => handleDelete(addon)}
                      disabled={deletingId === addon.id}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-danger hover:bg-red-50 transition-all"
                    >
                      {deletingId === addon.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                    <button
                      onClick={() => handleEdit(addon)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-text hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <Edit size={12} /> Editar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <AddOnFormModal addon={selectedAddOn} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
