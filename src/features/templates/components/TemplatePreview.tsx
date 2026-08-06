import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  subject: string
  body: string
}

export function TemplatePreview({ subject, body }: Props) {
  const preview = (str: string) =>
    str
      .replace(/\{nombre\}/g, 'Juan García')
      .replace(/\{empresa\}/g, 'Acme Corp')
      .replace(/\{ciudad\}/g, 'Guatemala')
      .replace(/\{email\}/g, 'juan@acme.com')

  const html = preview(body)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xs text-muted-foreground font-normal">Vista previa</CardTitle>
        <p className="text-sm font-medium mt-1">{preview(subject) || '(sin asunto)'}</p>
      </CardHeader>
      <CardContent className="pt-0 p-0">
        <iframe
          srcDoc={`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; font-size:14px; line-height:1.6;
         color:#1a1a1a; padding:20px 24px; margin:0; max-width:600px; }
  h1,h2,h3 { line-height:1.3; }
  a { color:#3B82F6; }
  ul,ol { padding-left:20px; }
  code { background:#f3f4f6; padding:2px 4px; border-radius:3px; font-size:13px; }
  blockquote { border-left:3px solid #d1d5db; margin:0; padding-left:12px; color:#6b7280; }
  p { margin:0 0 1em; }
</style></head><body>${html || '<p style="color:#9ca3af">El contenido aparecerá aquí...</p>'}</body></html>`}
          className="w-full border-0 rounded-b-lg"
          style={{ minHeight: 300 }}
          onLoad={(e) => {
            const iframe = e.currentTarget
            const h = iframe.contentDocument?.body?.scrollHeight
            if (h) iframe.style.height = h + 40 + 'px'
          }}
          title="Vista previa de la plantilla"
          sandbox="allow-same-origin"
        />
      </CardContent>
    </Card>
  )
}
