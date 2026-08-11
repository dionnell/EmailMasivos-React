import { NavLink } from 'react-router'
import { LayoutDashboard, Send, Users, FileText, UserCog, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useLogout } from '@/features/auth/hooks/use-auth'

const links = [
  { to: '/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/campaigns',   label: 'Campañas',        icon: Send },
  { to: '/recipients',  label: 'Destinatarios',   icon: Users },
  { to: '/templates',   label: 'Plantillas',      icon: FileText },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const isAdmin = user?.roles.includes('admin')

  return (
    <aside className="w-60 border-r flex flex-col p-3">
      <span className="px-3 py-4 text-sm font-semibold tracking-tight">
        MailMasivo
      </span>

      <div className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )
            }
          >
            <UserCog size={16} />
            Usuarios
          </NavLink>
        )}
      </div>

      {user && (
        <div className="border-t pt-3 px-1 space-y-2">
          <div className="px-2">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  )
}
