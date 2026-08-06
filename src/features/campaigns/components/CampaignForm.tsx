import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WandSparkles } from 'lucide-react'
import { campaignSchema, DOMAINS, type CampaignFormValues } from '../schemas/campaign.schema'
import { useTemplates } from '@/features/templates/hooks/use-templates'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RichEditor } from '@/shared/components/rich-editor/RichEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  defaultValues?: Partial<CampaignFormValues>
  onSubmit: (values: CampaignFormValues) => void
  isLoading?: boolean
}

export function CampaignForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { data: templates = [] } = useTemplates()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      fromDomain: 'elavellano.cl',
      ...defaultValues,
    },
  })

  const selectedTemplateId = watch('templateId')
  const fromName           = watch('fromName') ?? ''
  const fromDomain         = watch('fromDomain') ?? 'elavellano.cl'

  // Preview del remitente en tiempo real
  const fromPreview = fromName
    ? `${fromName} <${fromName.toLowerCase().replace(/\s+/g, '')}@${fromDomain}>`
    : `(escribe un nombre)`

  function handleTemplateSelect(templateId: string) {
    if (templateId === 'none') {
      setValue('templateId', undefined)
      return
    }
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    setValue('templateId', templateId)
    setValue('subject', template.subject)
    setValue('body', template.body, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Plantilla */}
      {templates.length > 0 && (
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5">
            <WandSparkles size={13} className="text-muted-foreground" />
            Usar plantilla{' '}
            <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
          </Label>
          <Select
            value={selectedTemplateId ?? 'none'}
            onValueChange={handleTemplateSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una plantilla..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin plantilla</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Remitente */}
      <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
        <Label className="text-sm font-medium">Remitente</Label>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nombre</Label>
            <Input
              {...register('fromName')}
              placeholder="ej: El Avellano, Ventas, Info"
            />
            {errors.fromName && (
              <p className="text-xs text-destructive">{errors.fromName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dominio</Label>
            <Controller
              name="fromDomain"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>@{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Preview del remitente */}
        <p className="text-xs text-muted-foreground">
          El correo se enviará como:{' '}
          <span className="font-mono text-foreground">{fromPreview}</span>
        </p>
      </div>

      {/* Nombre campaña */}
      <div className="space-y-1">
        <Label>Nombre de campaña</Label>
        <Input {...register('name')} placeholder="Ej: Newsletter Junio" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Asunto */}
      <div className="space-y-1">
        <Label>Asunto</Label>
        <Input {...register('subject')} placeholder="Asunto del correo" />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      {/* Cuerpo */}
      <div className="space-y-1">
        <Label>Cuerpo</Label>
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <RichEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Hola {nombre}, ..."
              minHeight={280}
              error={errors.body?.message}
            />
          )}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Guardando...' : 'Guardar campaña'}
      </Button>
    </form>
  )
}
