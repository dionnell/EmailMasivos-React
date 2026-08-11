import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { api, getErrorMessage } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import { useAuthStore } from '../store/auth-store'
import type { User } from '@/shared/types'

interface AuthResponse {
  user: User
  token: string
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthResponse>(ENDPOINTS.auth.login, data).then((r) => r.data),
    onSuccess: (data) => setAuth(data.user, data.token),
    onError: (err) =>
      sileo.error({
        title: 'No se pudo iniciar sesión',
        description: getErrorMessage(err, 'Credenciales inválidas'),
      }),
  })
}

/** Valida el token contra el backend y refresca los datos del usuario (roles, etc). */
export function useCheckStatus() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: ['check-status'],
    queryFn: () => api.get<AuthResponse>(ENDPOINTS.auth.checkStatus).then((r) => r.data),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const qc = useQueryClient()

  return () => {
    logout()
    qc.clear()
  }
}
