import { ShieldCheck, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/shared/types'

const ROLES: { value: UserRole; label: string; icon: typeof ShieldCheck }[] = [
  { value: 'admin',      label: 'Admin',      icon: ShieldCheck },
  { value: 'mailMasivo', label: 'MailMasivo', icon: Send },
]

interface Props {
  value: UserRole[]
  onChange: (value: UserRole[]) => void
}

/** Selector de roles multi-selección (un usuario puede tener uno o los dos roles). */
export function RoleToggle({ value, onChange }: Props) {
  function toggle(role: UserRole) {
    onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role])
  }

  return (
    <div className="flex gap-2">
      {ROLES.map(({ value: role, label, icon: Icon }) => (
        <button
          key={role}
          type="button"
          onClick={() => toggle(role)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
            value.includes(role)
              ? 'border-primary bg-primary/5 text-foreground'
              : 'text-muted-foreground hover:bg-muted/50',
          )}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  )
}
