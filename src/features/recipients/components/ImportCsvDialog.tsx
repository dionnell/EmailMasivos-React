import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useImportRecipients } from '../hooks/use-recipients'

function parseCsv(raw: string) {
  const lines = raw.trim().split('\n').filter(Boolean)
  return lines
    .filter((line) => !line.toLowerCase().startsWith('nombre') && !line.toLowerCase().startsWith('name'))
    .map((line) => {
      const [name, email, ...rest] = line.split(',').map((s) => s.trim())
      return { name, email, tags: rest.filter(Boolean) }
    })
    .filter((r) => r.name && r.email)
}

export function ImportCsvDialog() {
  const [open, setOpen]         = useState(false)
  const [csv, setCsv]           = useState('')
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef            = useRef<HTMLInputElement>(null)
  const { mutate: importRecipients, isPending } = useImportRecipients()

  function handleFile(f: File) {
    if (!f.name.endsWith('.csv')) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setCsv(e.target?.result as string ?? '')
    reader.readAsText(f)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function clearFile() {
    setFile(null)
    setCsv('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleImport() {
    const recipients = parseCsv(csv).map((r) => ({ ...r, isActive: true }))
    if (!recipients.length) return
    importRecipients(recipients, {
      onSuccess: () => {
        setCsv('')
        setFile(null)
        setOpen(false)
      },
    })
  }

  const preview = parseCsv(csv)
  const canImport = preview.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload size={14} className="mr-2" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar destinatarios desde CSV</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="file" className="pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1">Subir archivo</TabsTrigger>
            <TabsTrigger value="paste" className="flex-1">Pegar texto</TabsTrigger>
          </TabsList>

          {/* Tab: subir archivo */}
          <TabsContent value="file" className="space-y-3 pt-3">
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <Upload size={28} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Arrastra tu archivo CSV aquí
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Formato: <code className="bg-muted px-1 py-0.5 rounded">nombre,email,tag1,tag2</code>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={clearFile}>
                    <X size={14} />
                  </Button>
                </div>
                {preview.length > 0 && (
                  <div className="bg-muted/50 rounded-md p-3 space-y-1 max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Vista previa — {preview.length} destinatarios detectados
                    </p>
                    {preview.slice(0, 5).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="font-medium w-28 truncate">{r.name}</span>
                        <span className="text-muted-foreground flex-1 truncate">{r.email}</span>
                        {r.tags.length > 0 && (
                          <span className="text-muted-foreground shrink-0">{r.tags.join(', ')}</span>
                        )}
                      </div>
                    ))}
                    {preview.length > 5 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        y {preview.length - 5} más...
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Tab: pegar texto */}
          <TabsContent value="paste" className="space-y-3 pt-3">
            <p className="text-xs text-muted-foreground">
              Formato: <code className="bg-muted px-1 py-0.5 rounded">nombre,email,tag1,tag2</code>
            </p>
            <textarea
              value={csv}
              onChange={(e) => { setCsv(e.target.value); setFile(null) }}
              rows={7}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={'nombre,email\nJuan García,juan@empresa.com\nAna López,ana@empresa.com,vip'}
            />
            {canImport && (
              <p className="text-xs text-muted-foreground">
                {preview.length} destinatarios detectados
              </p>
            )}
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleImport}
          disabled={isPending || !canImport}
          className="w-full mt-2"
        >
          {isPending
            ? 'Importando...'
            : canImport
              ? `Importar ${preview.length} destinatarios`
              : 'Importar'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
