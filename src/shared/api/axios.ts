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
