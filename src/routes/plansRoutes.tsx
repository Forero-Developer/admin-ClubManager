import type { RouteObject } from 'react-router-dom';
import { PlansPage } from '../pages/plans/PlansPage';

export const plansRoutes: RouteObject[] = [
  {
    path: 'plans',
    element: <PlansPage />,
  },
];
