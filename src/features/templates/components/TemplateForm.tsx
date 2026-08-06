import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { templateSchema, type TemplateFormValues } from '../schemas/template.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichEditor } from '@/shared/components/rich-editor/RichEditor'

interface Props {
  defaultValues?: Partial<TemplateFormValues>
  onSubmit: (values: TemplateFormValues) => void
  isLoading?: boolean
  submitLabel?: string
}

export function TemplateForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Guardar plantilla' }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nombre de la plantilla</Label>
        <Input {...register('name')} placeholder="Ej: Newsletter mensual" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Asunto</Label>
        <Input {...register('subject')} placeholder="Asunto del correo" />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>
          Cuerpo{' '}
          <span className="text-muted-foreground text-xs font-normal">
            — usa las variables para personalizar
          </span>
        </Label>
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <RichEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Hola {nombre}, escribe el contenido aquí..."
              minHeight={280}
              error={errors.body?.message}
            />
          )}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  )
}
