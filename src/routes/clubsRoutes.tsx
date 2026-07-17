import type { RouteObject } from 'react-router-dom';
import { ClubsPage } from '../pages/clubs/ClubsPage';
import { ClubDetailPage } from '../pages/clubs/ClubDetailPage';
import { ClubRegisterPaymentPage } from '../pages/clubs/ClubRegisterPaymentPage';

export const clubsRoutes: RouteObject[] = [
  {
    path: 'clubs',
    element: <ClubsPage />,
  },
  {
    path: 'clubs/:id',
    element: <ClubDetailPage />,
  },
  {
    path: 'clubs/:id/register-payment',
    element: <ClubRegisterPaymentPage />,
  }
];
