import type { RouteObject } from 'react-router-dom';
import { SubscriptionsPage } from '../pages/subscriptions/SubscriptionsPage';

export const subscriptionsRoutes: RouteObject[] = [
  {
    path: 'subscriptions',
    element: <SubscriptionsPage />,
  },
];
