import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth/auth.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { ApiError } from '@/api/client';

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success(`Bienvenido de nuevo, ${data.user.email}`);
    },
    onError: (error: ApiError) => {
      toast.error('Error de autenticación', {
        description: error.message || 'Credenciales inválidas',
      });
    },
  });
}
