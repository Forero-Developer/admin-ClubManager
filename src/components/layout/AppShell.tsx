import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/store/authStore';

export function AppShell() {
  const { token } = useAuthStore();
  const location = useLocation();

  // Protección de ruta: Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main id="app-main" className="flex-1 overflow-y-auto overscroll-contain">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
