import { Menu } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export function Topbar() {
  const { setMobileMenuOpen } = useUiStore();
  const { user } = useAuthStore();

  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú"
          className="-ml-1 rounded-xl p-2 text-text-secondary transition-colors hover:bg-bg hover:text-text lg:hidden"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-sm font-semibold text-text sm:text-base">Panel de administración</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-medium text-text">{user?.email || 'SuperAdmin'}</span>
          <span className="text-xs capitalize text-text-secondary">{user?.role?.toLowerCase() || 'administrador'}</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-sidebar shadow-sm">
          {user?.email?.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
