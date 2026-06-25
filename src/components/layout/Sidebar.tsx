import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clubes', href: '/clubs', icon: Users },
  { name: 'Suscripciones', href: '/subscriptions', icon: CreditCard },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { clearAuth } = useAuthStore();
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar text-white transition-all duration-300 relative",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-white/10 shrink-0">
        <span className="font-bold text-xl tracking-tight truncate px-4">
          {sidebarOpen ? 'SportAdmin' : 'SA'}
        </span>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-primary text-white p-1 rounded-full shadow-md hover:bg-primary-hover focus:outline-none z-10"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
              title={sidebarOpen ? undefined : item.name}
            >
              <item.icon className={cn("shrink-0", sidebarOpen ? "mr-3" : "mx-auto")} size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={clearAuth}
          className="flex items-center w-full rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          title={sidebarOpen ? undefined : 'Cerrar Sesión'}
        >
          <LogOut className={cn("shrink-0", sidebarOpen ? "mr-3" : "mx-auto")} size={20} />
          {sidebarOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
