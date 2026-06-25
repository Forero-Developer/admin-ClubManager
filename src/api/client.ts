import { useAuthStore } from '@/store/authStore';
import axios, { AxiosError } from 'axios';

// Clase de error estructurada para atrapar errores de la API limpios
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// Interceptor de Peticiones: inyecta el token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuestas: hace unboxing del data y formatea errores
apiClient.interceptors.response.use(
  (res) => {
    const data = res.data;

    // Desempaquetar el campo 'data' de NestJS si existe, PERO NO si es paginado
    const isPaginated =
      data &&
      typeof data === 'object' &&
      'data' in data &&
      ('total' in data || 'lastPage' in data);

    if (data && typeof data === 'object' && 'data' in data && !isPaginated) {
      return data.data;
    }

    return data;
  },
  (error: AxiosError<any>) => {
    // Solo formatear el error y relanzarlo.
    // El AppShell protege las rutas verificando el token en Zustand.
    // El logout explícito (clearAuth) es la única forma de limpiar la sesión.
    // No hacemos auto-redirect aquí para evitar loops cuando el backend está caído.
    if (error.response) {
      const data = error.response.data;
      const message = Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message ?? error.message;

      throw new ApiError(error.response.status, message, data);
    }

    throw error;
  }
);
