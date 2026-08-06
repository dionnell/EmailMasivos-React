import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Send, Trash2, CheckCircle, XCircle, Users, MailOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCampaign, useSendCampaign, useDeleteCampaign, useCampaignLogs } from '../hooks/use-campaigns'
import { useRecipients } from '@/features/recipients/hooks/use-recipients'
import { AttachmentUploader, type AttachmentFile } from '../components/AttachmentUploader'
import type { CampaignStatus } from '@/shared/types'

const statusConfig: Record<CampaignStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:   { label: 'Borrador',  variant: 'secondary' },
  sending: { label: 'Enviando',  variant: 'default' },
  sent:    { label: 'Enviado',   variant: 'default' },
  failed:  { label: 'Fallido',   variant: 'destructive' },
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: campaign, isLoading } = useCampaign(id!)
  const { data: logs = [] } = useCampaignLogs(id!)
  const { data: recipients = [] } = useRecipients()
  const { mutate: sendCampaign, isPending: isSending } = useSendCampaign()
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign()

  const [attachments, setAttachments] = useState<AttachmentFile[]>([])

  if (isLoading) return (
    <div className="p-6 flex items-center justify-center h-60 text-sm text-muted-foreground">
      Cargando campaña...
    </div>
  )

  if (!campaign) return (
    <div className="p-6 text-sm text-muted-foreground">Campaña no encontrada.</div>
  )

  const cfg = statusConfig[campaign.status]
  const canSend = campaign.status === 'draft' || campaign.status === 'failed'
  const deliveryRate = campaign.totalRecipients > 0
    ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
    : 0

  function handleDelete() {
    if (!confirm('¿Eliminar esta campaña?')) return
    deleteCampaign(id!, { onSuccess: () => navigate('/campaigns') })
  }

  function handleSend() {
    sendCampaign({
      id: id!,
      attachments: attachments.map(({ filename, content, contentType }) => ({
        filename, content, contentType,
      })),
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
          <ArrowLeft size={16} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{campaign.name}</h1>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{campaign.subject}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 size={14} className="mr-1" /> {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
          {canSend && (
            <Button size="sm" onClick={handleSend} disabled={isSending}>
              <Send size={14} className="mr-1" />
              {isSending ? 'Enviando...' : 'Enviar campaña'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-semibold">{campaign.totalRecipients}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Enviados</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-semibold text-green-600">{campaign.sentCount}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Abrieron</CardTitle></CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-blue-600">{campaign.openedCount}</span>
            {campaign.sentCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {Math.round((campaign.openedCount / campaign.sentCount) * 100)}%
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Fallidos</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-semibold text-red-500">{campaign.failedCount}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Tasa entrega</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-semibold">{deliveryRate}%</span></CardContent>
        </Card>
      </div>

      {/* Adjuntos */}
      {canSend && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Adjuntos del envío</CardTitle>
          </CardHeader>
          <CardContent>
            <AttachmentUploader attachments={attachments} onChange={setAttachments} />
          </CardContent>
        </Card>
      )}

      {/* Destinatarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users size={14} />
              Destinatarios
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {recipients.length} en total
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recipients.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 pb-4">
              No hay destinatarios. Agrégalos desde la sección Destinatarios.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {recipients.map((recipient, i) => (
                <div
                  key={recipient.id}
                  className={`flex items-center gap-3 px-6 py-2.5 text-sm ${
                    i < recipients.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {recipient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{recipient.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                  </div>
                  {recipient.tags?.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                      {recipient.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recipient.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{recipient.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  <Badge
                    variant={recipient.isActive ? 'default' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {recipient.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview del correo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Vista previa del correo</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-lg">
          <iframe
            srcDoc={`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; font-size:14px; line-height:1.6;
         color:#1a1a1a; padding:20px 24px; margin:0; }
  h1,h2,h3 { line-height:1.3; }
  a { color:#3B82F6; }
  ul,ol { padding-left:20px; }
  code { background:#f3f4f6; padding:2px 4px; border-radius:3px; font-size:13px; }
  blockquote { border-left:3px solid #d1d5db; margin:0; padding-left:12px; color:#6b7280; }
  p { margin:0 0 1em; }
  table { border-collapse:collapse; width:100%; }
</style></head>
<body>${campaign.body || '<p style="color:#9ca3af">Sin contenido</p>'}</body>
</html>`}
            className="w-full border-0"
            style={{ minHeight: 300 }}
            onLoad={(e) => {
              const iframe = e.currentTarget
              const h = iframe.contentDocument?.body?.scrollHeight
              if (h) iframe.style.height = h + 40 + 'px'
            }}
            title="Vista previa del correo"
            sandbox="allow-same-origin"
          />
        </CardContent>
      </Card>

      {/* Logs de envío */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Log de envíos ({logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm py-1.5 border-b last:border-0">
                  {log.status === 'sent'
                    ? <CheckCircle size={14} className="text-green-500 shrink-0" />
                    : <XCircle size={14} className="text-red-500 shrink-0" />
                  }
                  <span className="flex-1 font-mono text-xs">{log.email}</span>
                  {log.openedAt && (
                    <span className="flex items-center gap-1 text-xs text-blue-500 shrink-0">
                      <MailOpen size={12} />
                      {log.openCount > 1 ? `${log.openCount}x` : 'Abrió'}
                    </span>
                  )}
                  {log.error && (
                    <span className="text-xs text-red-400 truncate max-w-48">{log.error}</span>
                  )}
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(log.sentAt).toLocaleTimeString('es-GT')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}