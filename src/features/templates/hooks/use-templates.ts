import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { Template } from '@/shared/types'

const QUERY_KEY = ['templates']

export function useTemplates() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<Template[]>(ENDPOINTS.templates.list).then((r) => r.data),
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
    onError: () => sileo.error({title: 'Error al crear la plantilla'}),
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
    onError: () => sileo.error({title: 'Error al actualizar'}),
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
    onError: () => sileo.error({title: 'Error al eliminar la plantilla'}),
  })
}
