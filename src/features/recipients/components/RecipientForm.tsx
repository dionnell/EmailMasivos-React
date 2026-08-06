import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recipientSchema, type RecipientFormValues } from '../schemas/recipient.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  onSubmit: (values: RecipientFormValues) => void
  isLoading?: boolean
}

export function RecipientForm({ onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientSchema),
  })
 
  function handleValid(values: RecipientFormValues) {
    onSubmit(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nombre</Label>
        <Input {...register('name')} placeholder="Juan García" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Email</Label>
        <Input {...register('email')} type="email" placeholder="juan@empresa.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Tags <span className="text-muted-foreground">(opcional, separados por coma)</span></Label>
        <Input {...register('tags')} placeholder="clientes, vip, newsletter" />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Agregando...' : 'Agregar destinatario'}
      </Button>
    </form>
  )
}
