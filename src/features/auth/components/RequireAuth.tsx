import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/auth-store'
import { useCheckStatus } from '../hooks/use-auth'
import { AccessDenied } from './AccessDenied'

/**
 * Protege toda la app: sin token -> /login. Con token, valida contra el
 * backend en segundo plano (sin bloquear la primera pintura con la sesión
 * ya persistida) y cierra sesión si el token resultó inválido/vencido.
 * Además exige rol admin o mailMasivo para poder usar la app.
 */
export function RequireAuth() {
  const token   = useAuthStore((s) => s.token)
  const user    = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout  = useAuthStore((s) => s.logout)

  const { data, isError } = useCheckStatus()

  useEffect(() => {
    if (data) setAuth(data.user, data.token)
  }, [data, setAuth])

  useEffect(() => {
    if (isError) logout()
  }, [isError, logout])

  if (!token || !user) return <Navigate to="/login" replace />
  if (isError) return <Navigate to="/login" replace />

  const hasAccess = user.roles.includes('admin') || user.roles.includes('mailMasivo')
  if (!hasAccess) return <AccessDenied />

  return <Outlet />
}
