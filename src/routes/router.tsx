import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { authRoutes } from './authRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { clubsRoutes } from './clubsRoutes';
import { playersRoutes } from './playersRoutes';
import { subscriptionsRoutes } from './subscriptionsRoutes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      ...dashboardRoutes,
      ...clubsRoutes,
      ...playersRoutes,
      ...subscriptionsRoutes,
    ],
  },
  ...authRoutes,
]);
