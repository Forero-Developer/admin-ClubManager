import type { RouteObject } from 'react-router-dom';
import { OrganizersPage } from '../pages/organizers/OrganizersPage';
import { OrganizerDetailPage } from '../pages/organizers/OrganizerDetailPage';

export const organizersRoutes: RouteObject[] = [
  { path: 'organizers', element: <OrganizersPage /> },
  { path: 'organizers/:id', element: <OrganizerDetailPage /> },
];
