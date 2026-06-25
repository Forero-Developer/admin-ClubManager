import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { AdminLoginDto, AdminAuthResponse, AdminProfile } from './auth.types';

export const authService = {
  // Notar que ya no necesitamos .then(res => res.data) porque el interceptor lo hace
  login: (data: AdminLoginDto) => apiClient.post<any, AdminAuthResponse>(ENDPOINTS.auth.login, data),
  getProfile: () => apiClient.get<any, AdminProfile>(ENDPOINTS.auth.profile),
  refreshToken: () => apiClient.post<any, AdminAuthResponse>(ENDPOINTS.auth.refresh),
};
