import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { api, getErrorMessage } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { User, UserRole } from '@/shared/types'

const QUERY_KEY = ['users']

interface UsersResponse {
  count: number
  pages: number
  users: User[]
}

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      api.get<UsersResponse>(ENDPOINTS.auth.users, { params: { limit: 200 } }).then((r) => r.data),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { fullName: string; email: string; password: string; roles: UserRole[] }) =>
      api.post(ENDPOINTS.auth.createUser, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({ title: 'Usuario creado' })
    },
    onError: (err) => sileo.error({ title: 'Error al crear el usuario', description: getErrorMessage(err) }),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      fullName: string
      email: string
      roles: UserRole[]
      isActive: boolean
      password?: string
    }) => {
      const { password, ...rest } = data
      const payload = password ? { ...rest, password } : rest
      return api.patch(ENDPOINTS.auth.updateUser(id), payload).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({ title: 'Usuario actualizado' })
    },
    onError: (err) => sileo.error({ title: 'Error al actualizar el usuario', description: getErrorMessage(err) }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(ENDPOINTS.auth.deleteUser(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      sileo.success({ title: 'Usuario eliminado' })
    },
    onError: (err) => sileo.error({ title: 'Error al eliminar el usuario', description: getErrorMessage(err) }),
  })
}
