import type { RouteObject } from 'react-router-dom';
import { SubscriptionsPage } from '../pages/subscriptions/SubscriptionsPage';
import { TrialsPage } from '../pages/subscriptions/TrialsPage';
import { GracePeriodPage } from '../pages/subscriptions/GracePeriodPage';
import { CollectionsPage } from '../pages/subscriptions/CollectionsPage';

export const subscriptionsRoutes: RouteObject[] = [
  {
    path: 'subscriptions',
    element: <SubscriptionsPage />,
  },
  {
    path: 'subscriptions/trials',
    element: <TrialsPage />,
  },
  {
    path: 'collections',
    element: <CollectionsPage />,
  },
  {
    path: 'subscriptions/grace',
    element: <GracePeriodPage />,
  },
];
