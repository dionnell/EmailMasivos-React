import { Outlet } from 'react-router'
import { useAuthStore } from '../store/auth-store'
import { AccessDenied } from './AccessDenied'

/** Restringe una sección a usuarios con rol admin (ej: /users). */
export function RequireAdmin() {
  const user = useAuthStore((s) => s.user)

  if (!user?.roles.includes('admin')) {
    return <AccessDenied message="Esta sección es solo para administradores." />
  }

  return <Outlet />
}
