/** Mensaje legible de un error de la API (axios / ApiError) o genérico. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const e = error as { response?: { data?: { message?: unknown } }; message?: unknown };
    const apiMessage = e.response?.data?.message;
    if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
    if (Array.isArray(apiMessage) && apiMessage.length) return apiMessage.join('. ');
    if (typeof e.message === 'string' && e.message) return e.message;
  }
  return fallback;
}
