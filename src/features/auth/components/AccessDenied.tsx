import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogout } from '../hooks/use-auth'
import { useAuthStore } from '../store/auth-store'

export function AccessDenied({ message }: { message?: string }) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <div className="text-center max-w-sm space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert size={22} className="text-destructive" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Acceso denegado</h1>
          <p className="text-sm text-muted-foreground">
            {message ?? 'Tu cuenta no tiene permiso para acceder a MailMasivo.'}
          </p>
          {user && (
            <p className="text-xs text-muted-foreground pt-1">
              Sesión actual: {user.email}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
