import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserFormValues } from '../schemas/user.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { RoleToggle } from './RoleToggle'

interface Props {
  onSubmit: (values: CreateUserFormValues) => void
  isLoading?: boolean
}

export function CreateUserForm({ onSubmit, isLoading }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { fullName: '', email: '', password: '', roles: [] },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nombre</Label>
        <Input {...register('fullName')} placeholder="Ej: Ana López" />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Correo</Label>
        <Input type="email" {...register('email')} placeholder="ana@empresa.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Contraseña</Label>
        <PasswordInput {...register('password')} placeholder="Mínimo 6 caracteres" />
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creando...' : 'Crear usuario'}
      </Button>
    </form>
  )
}
