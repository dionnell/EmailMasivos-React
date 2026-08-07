import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { api, getErrorMessage } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { Template } from '@/shared/types'

const QUERY_KEY = ['templates']

export function useTemplates(type?: 'template' | 'signature') {
  return useQuery({
    queryKey: [...QUERY_KEY, type ?? 'all'],
    queryFn: () =>
      api
        .get<Template[]>(ENDPOINTS.templates.list, { params: type ? { type } : undefined })
        .then((r) => r.data),
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Template, 'id' | 'createdAt'>) =>
      api.post<Template>(ENDPOINTS.templates.create, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({title: 'Plantilla creada'})
    },
    onError: (err) => sileo.error({ title: 'Error al crear la plantilla', description: getErrorMessage(err) }),
  })
}

export function useUpdateTemplate(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Template>) =>
      api.patch<Template>(ENDPOINTS.templates.update(id), data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({title: 'Plantilla actualizada'})
    },
    onError: (err) => sileo.error({ title: 'Error al actualizar', description: getErrorMessage(err) }),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(ENDPOINTS.templates.delete(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({title: 'Plantilla eliminada'})
    },
    onError: (err) => sileo.error({ title: 'Error al eliminar la plantilla', description: getErrorMessage(err) }),
  })
}
