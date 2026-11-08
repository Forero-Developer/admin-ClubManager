import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { OrganizerDetail, OrganizerListQuery, OrganizersPage } from './organizers.types';

export const organizersService = {
  getAll: (params?: OrganizerListQuery) =>
    apiClient.get<unknown, OrganizersPage>(ENDPOINTS.organizers.list, { params }),

  getById: (id: string) => apiClient.get<unknown, OrganizerDetail>(ENDPOINTS.organizers.byId(id)),

  /** INACTIVE = desactivar (no puede entrar, se conservan sus torneos) */
  setStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    apiClient.patch<unknown, { id: string; status: string }>(ENDPOINTS.organizers.status(id), { status }),

  /** Borrado definitivo de torneos y perfil de organizador; confirmEmail = correo de la cuenta */
  delete: (id: string, confirmEmail: string) =>
    apiClient.delete<unknown, { deleted: boolean; keptAccount: boolean }>(ENDPOINTS.organizers.byId(id), {
      data: { confirmEmail },
    }),
};
