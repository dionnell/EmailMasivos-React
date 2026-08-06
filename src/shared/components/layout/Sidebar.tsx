import { NavLink } from 'react-router'
import { LayoutDashboard, Send, Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/campaigns',   label: 'Campañas',        icon: Send },
  { to: '/recipients',  label: 'Destinatarios',   icon: Users },
  { to: '/templates',   label: 'Plantillas',      icon: FileText },
]

export function Sidebar() {
  return (
    <aside className="w-60 border-r flex flex-col gap-1 p-3">
      <span className="px-3 py-4 text-sm font-semibold tracking-tight">
        MailMasivo
      </span>
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
    </aside>
  )
}