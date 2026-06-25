import { Menu, Bell } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export function Topbar() {
  const { toggleSidebar } = useUiStore();
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10">
      {/* Izquierda: Botón móvil para Sidebar y Título/Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-text-secondary hover:text-text transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold text-text hidden sm:block">Panel de Administración</h1>
      </div>

      {/* Derecha: Acciones y Usuario */}
      <div className="flex items-center gap-4">
        <button className="text-text-secondary hover:text-primary transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </button>

        <div className="h-8 w-px bg-border"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-text">{user?.email || 'SuperAdmin'}</span>
            <span className="text-xs text-text-secondary capitalize">{user?.role?.toLowerCase() || 'Administrador'}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold shadow-sm">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
