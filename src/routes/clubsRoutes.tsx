import type { RouteObject } from 'react-router-dom';
import { ClubsPage } from '../pages/clubs/ClubsPage';
import { ClubDetailPage } from '../pages/clubs/ClubDetailPage';

export const clubsRoutes: RouteObject[] = [
  {
    path: 'clubs',
    element: <ClubsPage />,
  },
  {
    path: 'clubs/:id',
    element: <ClubDetailPage />,
  }
];
