import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

export interface MailStatus {
  configured: boolean
  /** Remitente REAL que usará el backend al enviar (MAIL_FROM o su fallback @resend.dev) */
  from: string
  /** true si el backend tiene un dominio propio configurado (MAIL_FROM seteado) */
  hasCustomDomain: boolean
}

export function useMailStatus() {
  return useQuery({
    queryKey: ['mail-status'],
    queryFn: () => api.get<MailStatus>(ENDPOINTS.mail.status).then((r) => r.data),
    staleTime: 5 * 60 * 1000, // no cambia seguido, se puede cachear unos minutos
  })
}
