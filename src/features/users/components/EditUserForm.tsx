import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editUserSchema, type EditUserFormValues } from '../schemas/user.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { RoleToggle } from './RoleToggle'
import { cn } from '@/lib/utils'

interface Props {
  defaultValues: EditUserFormValues
  onSubmit: (values: EditUserFormValues) => void
  isLoading?: boolean
}

export function EditUserForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues,
  })

  const isActive = watch('isActive')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nombre</Label>
        <Input {...register('fullName')} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Correo</Label>
        <Input type="email" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>
          Nueva contraseña{' '}
          <span className="text-muted-foreground text-xs font-normal">(dejar en blanco para no cambiarla)</span>
        </Label>
        <PasswordInput {...register('password')} placeholder="••••••••" />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Rol</Label>
        <Controller
          name="roles"
          control={control}
          render={({ field }) => <RoleToggle value={field.value} onChange={field.onChange} />}
        />
        {errors.roles && <p className="text-xs text-destructive">{errors.roles.message}</p>}
      </div>

      <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Cuenta activa</p>
          <p className="text-xs text-muted-foreground">Si se desactiva, no podrá iniciar sesión</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setValue('isActive', !isActive)}
          className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', isActive ? 'bg-primary' : 'bg-muted')}
        >
          <span
            className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform',
              isActive ? 'translate-x-4' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
