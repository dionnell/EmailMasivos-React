import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { Campaign, SendLog } from '@/shared/types'

const QUERY_KEY = ['campaigns']

// ─── Queries ──────────────────────────────────────────────────────

export function useCampaigns() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<Campaign[]>(ENDPOINTS.campaigns.list).then((r) => r.data),
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => api.get<Campaign>(ENDPOINTS.campaigns.detail(id)).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCampaignLogs(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'logs'],
    queryFn: () => api.get<SendLog[]>(ENDPOINTS.campaigns.logs(id)).then((r) => r.data),
    enabled: !!id,
  })
}

// ─── Mutations ────────────────────────────────────────────────────

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Pick<Campaign, 'name' | 'subject' | 'body'> & { templateId?: string }) =>
      api.post<Campaign>(ENDPOINTS.campaigns.create, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({title: 'Campaña creada'})
    },
    onError: () => sileo.error({title:'Error al crear la campaña'}),
  })
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Pick<Campaign, 'name' | 'subject' | 'body'>>) =>
      api.patch<Campaign>(ENDPOINTS.campaigns.update(id), data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
      sileo.success({title: 'Campaña actualizada'})
    },
    onError: () => sileo.error({title: 'Error al actualizar la campaña'}),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(ENDPOINTS.campaigns.delete(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({title: 'Campaña eliminada'})
    },
    onError: () => sileo.error({title: 'Error al eliminar'}),
  })
}

export function useSendCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, recipientIds, attachments }: {
      id: string
      recipientIds?: string[]
      attachments?: { filename: string; content: string; contentType: string }[]
    }) =>
      api.post(ENDPOINTS.campaigns.send(id), { recipientIds, attachments }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, id, 'logs'] })
      sileo.success({title: 'Campaña enviada correctamente'})
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message
      sileo.error({ title: Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al enviar la campaña') })
    },
  })
}
