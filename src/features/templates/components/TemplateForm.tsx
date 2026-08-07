import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PenLine, FileText } from 'lucide-react'
import { templateSchema, type TemplateFormValues } from '../schemas/template.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichEditor } from '@/shared/components/rich-editor/RichEditor'
import { cn } from '@/lib/utils'

interface Props {
  defaultValues?: Partial<TemplateFormValues>
  onSubmit: (values: TemplateFormValues) => void
  isLoading?: boolean
  submitLabel?: string
  /** Si viene fijo (ej: desde la pestaña de Firmas), no se muestra el selector de tipo */
  lockType?: 'template' | 'signature'
}

export function TemplateForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Guardar', lockType }: Props) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { type: lockType ?? 'template', ...defaultValues },
  })

  const type = lockType ?? watch('type')
  const isSignature = type === 'signature'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Selector de tipo: Plantilla vs Firma (oculto si viene fijo por props) */}
      {!lockType && (
        <div className="space-y-1">
          <Label>Tipo</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue('type', 'template')}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                type === 'template'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50',
              )}
            >
              <FileText size={14} />
              Plantilla
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'signature')}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                type === 'signature'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50',
              )}
            >
              <PenLine size={14} />
              Firma
            </button>
          </div>
          <p className="text-xs text-muted-foreground pt-0.5">
            {isSignature
              ? 'Una firma se inserta al final del cuerpo de una campaña, no lleva asunto propio.'
              : 'Una plantilla completa rellena el asunto y el cuerpo de una campaña.'}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <Label>{isSignature ? 'Nombre de la firma' : 'Nombre de la plantilla'}</Label>
        <Input
          {...register('name')}
          placeholder={isSignature ? 'Ej: Firma equipo de ventas' : 'Ej: Newsletter mensual'}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {!isSignature && (
        <div className="space-y-1">
          <Label>Asunto</Label>
          <Input {...register('subject')} placeholder="Asunto del correo" />
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>
      )}

      <div className="space-y-1">
        <Label>
          {isSignature ? 'Firma' : 'Cuerpo'}{' '}
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
              placeholder={
                isSignature
                  ? 'Saludos,\nEquipo de Ventas\n{empresa}'
                  : 'Hola {nombre}, escribe el contenido aquí...'
              }
              minHeight={isSignature ? 140 : 280}
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
