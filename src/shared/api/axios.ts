import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  // Aumentar timeout para campañas con muchos destinatarios o adjuntos grandes
  timeout: 120_000, // 2 minutos
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log del error completo para debugging
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        status:  err.response?.status,
        message: err.response?.data?.message,
        data:    err.response?.data,
        url:     err.config?.url,
      })
    }
    return Promise.reject(err)
  }
)

/**
 * Extrae un mensaje legible del error de NestJS: { statusCode, message, error }
 * donde 'message' puede ser un string o un array de errores de class-validator.
 */
export function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return fallback
}
