import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WandSparkles, PenLine } from 'lucide-react'
import { campaignSchema, type CampaignFormValues, type CampaignSubmitValues } from '../schemas/campaign.schema'
import { extractDomain, buildFromEmail } from '@/shared/config/mail'
import { useMailStatus } from '../hooks/use-mail-status'
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
  onSubmit: (values: CampaignSubmitValues) => void
  isLoading?: boolean
}

export function CampaignForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { data: templates = [] } = useTemplates('template')
  const { data: signatures = [] } = useTemplates('signature')
  const { data: mailStatus } = useMailStatus()

  // El dominio real sale del backend (MAIL_FROM). Si el backend no lo manda
  // (versión vieja desplegada, o falla la request), se cae a resend.dev como
  // último resorte para que el formulario nunca quede roto.
  const domain = mailStatus ? (extractDomain(mailStatus.from) ?? 'resend.dev') : null

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues,
  })

  const selectedTemplateId = watch('templateId')
  const fromName           = watch('fromName') ?? ''
  const [signatureSelectValue, setSignatureSelectValue] = useState('')

  // Preview del remitente en tiempo real (mismo dominio que usa el backend)
  const fromPreview = fromName && domain
    ? `${fromName} <${buildFromEmail(fromName, domain)}>`
    : fromName
      ? '(cargando dominio del remitente...)'
      : '(escribe un nombre)'

  function handleTemplateSelect(templateId: string) {
    if (templateId === 'none') {
      setValue('templateId', undefined)
      return
    }
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    setValue('templateId', templateId)
    setValue('subject', template.subject ?? '')
    setValue('body', template.body, { shouldValidate: true })
  }

  function handleInsertSignature(signatureId: string) {
    setSignatureSelectValue('') // es una acción, no una selección persistente
    if (!signatureId) return
    const signature = signatures.find((s) => s.id === signatureId)
    if (!signature) return
    const currentBody = watch('body') ?? ''
    setValue('body', currentBody + signature.body, { shouldValidate: true })
  }

  function handleFormSubmit(values: CampaignFormValues) {
    onSubmit({
      ...values,
      fromEmail: values.fromName && domain ? buildFromEmail(values.fromName, domain) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

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

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nombre</Label>
          <div className="flex items-center gap-1.5">
            <Input
              {...register('fromName')}
              placeholder="ej: Ventas, Info, Soporte"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              @{domain ?? '...'}
            </span>
          </div>
          {errors.fromName && (
            <p className="text-xs text-destructive">{errors.fromName.message}</p>
          )}
        </div>

        {/* Preview del remitente */}
        <p className="text-xs text-muted-foreground">
          El correo se enviará como:{' '}
          <span className="font-mono text-foreground">{fromPreview}</span>
        </p>

        {mailStatus && !mailStatus.hasCustomDomain && (
          <p className="text-xs text-amber-600">
            No hay un dominio propio configurado en el backend (MAIL_FROM) — se está usando
            el dominio de pruebas de Resend, que solo entrega a la cuenta dueña del API key.
          </p>
        )}
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
        <div className="flex items-center justify-between">
          <Label>Cuerpo</Label>

          {signatures.length > 0 && (
            <Select value={signatureSelectValue} onValueChange={handleInsertSignature}>
              <SelectTrigger className="h-7 w-auto text-xs gap-1.5 px-2.5">
                <PenLine size={12} className="text-muted-foreground" />
                <SelectValue placeholder="Insertar firma" />
              </SelectTrigger>
              <SelectContent>
                {signatures.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
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
