import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, CreditCard, Wallet, LogOut, ChevronLeft, ChevronRight, Building2, Tags, X } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clubes', href: '/clubs', icon: Building2 },
  { name: 'Cobros del mes', href: '/collections', icon: Wallet },
  { name: 'Suscripciones', href: '/subscriptions', icon: CreditCard },
  { name: 'Planes', href: '/plans', icon: Tags },
];

function NavContent({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  const { clearAuth } = useAuthStore();
  const location = useLocation();

  return (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              title={compact ? item.name : undefined}
              className={cn(
                'relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={compact ? 'nav-active-compact' : 'nav-active'}
                  className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <item.icon className={cn('relative shrink-0', compact ? 'mx-auto' : 'mr-3')} size={19} />
              {!compact && <span className="relative">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          onClick={clearAuth}
          title={compact ? 'Cerrar sesión' : undefined}
          className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
        >
          <LogOut className={cn('shrink-0', compact ? 'mx-auto' : 'mr-3')} size={19} />
          {!compact && <span>Cerrar sesión</span>}
        </button>
      </div>
    </>
  );
}

function Logo({ compact }: { compact: boolean }) {
  return (
    <div className="flex items-center gap-2.5 truncate">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary font-black text-sidebar">
        SA
      </div>
      {!compact && <span className="text-base font-bold tracking-tight">SportAdmin</span>}
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const location = useLocation();

  // Cierra el menú del celular al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Bloquea el scroll del fondo mientras el menú del celular está abierto
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Cierra el menú móvil si se agranda la pantalla (evita que se quede bloqueado el scroll)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <>
      {/* Escritorio: fijo y compactable */}
      <aside
        className={cn(
          'relative hidden shrink-0 flex-col bg-sidebar text-white transition-[width] duration-300 lg:flex',
          sidebarOpen ? 'w-64' : 'w-20',
        )}
      >
        <div className={cn('flex h-16 shrink-0 items-center border-b border-white/10', sidebarOpen ? 'px-5' : 'justify-center')}>
          <Logo compact={!sidebarOpen} />
        </div>

        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Compactar menú' : 'Expandir menú'}
          className="absolute -right-3 top-20 z-10 rounded-full bg-primary p-1 text-white shadow-md transition hover:bg-primary-hover focus:outline-none"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <NavContent compact={!sidebarOpen} />
      </aside>

      {/* Celular / tablet: menú deslizable */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col bg-sidebar text-white shadow-2xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
                <Logo compact={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <NavContent compact={false} onNavigate={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
