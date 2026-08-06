import { useRef, useState } from 'react'
import { Paperclip, X, FileText, File } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface AttachmentFile {
  filename: string
  content: string    // base64
  contentType: string
  size: number       // bytes — solo para mostrar en UI, no se envía al backend
}

const ACCEPTED = {
  'application/pdf':                                                    '.pdf',
  'application/msword':                                                 '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain':                                                         '.txt',
}

const MAX_SIZE_MB = 10

interface Props {
  attachments: AttachmentFile[]
  onChange: (attachments: AttachmentFile[]) => void
}

function fileIcon(contentType: string) {
  if (contentType === 'application/pdf') return <FileText size={16} className="text-red-500" />
  return <File size={16} className="text-blue-500" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => {
      // FileReader devuelve "data:mime;base64,XXXX" — solo queremos la parte base64
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AttachmentUploader({ attachments, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    setLoading(true)

    const newAttachments: AttachmentFile[] = []

    for (const file of Array.from(files)) {
      // Validar tipo
      if (!Object.keys(ACCEPTED).includes(file.type)) {
        setError(`"${file.name}" — tipo no permitido. Solo PDF, DOC, DOCX o TXT.`)
        continue
      }
      // Validar tamaño
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${file.name}" supera el límite de ${MAX_SIZE_MB}MB.`)
        continue
      }
      // Verificar duplicado
      if (attachments.some((a) => a.filename === file.name)) {
        setError(`"${file.name}" ya está adjunto.`)
        continue
      }

      const content = await toBase64(file)
      newAttachments.push({
        filename:    file.name,
        content,
        contentType: file.type,
        size:        file.size,
      })
    }

    onChange([...attachments, ...newAttachments])
    setLoading(false)

    // Reset input para permitir subir el mismo archivo de nuevo si se quitó
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAttachment(filename: string) {
    onChange(attachments.filter((a) => a.filename !== filename))
  }

  const totalSize = attachments.reduce((acc, a) => acc + a.size, 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Adjuntos</span>
        {attachments.length > 0 && (
          <span className="text-xs text-muted-foreground">{formatSize(totalSize)} en total</span>
        )}
      </div>

      {/* Lista de adjuntos */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((att) => (
            <div
              key={att.filename}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md border bg-muted/30 text-sm"
            >
              {fileIcon(att.contentType)}
              <span className="flex-1 truncate font-medium">{att.filename}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatSize(att.size)}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.filename)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón de subir */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <Paperclip size={14} />
        {loading ? 'Cargando...' : 'Adjuntar archivo'}
      </Button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={Object.values(ACCEPTED).join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        PDF, DOC, DOCX o TXT · máx. {MAX_SIZE_MB}MB por archivo · hasta 40MB en total
      </p>
    </div>
  )
}
