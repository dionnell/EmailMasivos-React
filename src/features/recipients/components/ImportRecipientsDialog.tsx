import { useRef, useState } from 'react'
import { Upload, FileText, X, TriangleAlert, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useImportRecipients } from '../hooks/use-recipients'
import { parseCsvText, parseExcelFile, downloadExampleExcel, type ParsedRecipient } from '../lib/parse-recipients'

const EXCEL_EXTENSIONS = ['.xlsx', '.xls']

function isExcelFile(name: string) {
  return EXCEL_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))
}

function isCsvFile(name: string) {
  return name.toLowerCase().endsWith('.csv')
}

export function ImportRecipientsDialog() {
  const [open, setOpen]           = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [file, setFile]           = useState<File | null>(null)
  const [preview, setPreview]     = useState<ParsedRecipient[]>([])
  const [dragging, setDragging]   = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef              = useRef<HTMLInputElement>(null)
  const { mutate: importRecipients, isPending } = useImportRecipients()

  async function handleFile(f: File) {
    if (!isCsvFile(f.name) && !isExcelFile(f.name)) {
      setParseError('Formato no soportado. Usa .csv, .xlsx o .xls')
      return
    }

    setFile(f)
    setParseError(null)
    setIsParsing(true)

    try {
      if (isExcelFile(f.name)) {
        setPreview(await parseExcelFile(f))
      } else {
        const text = await f.text()
        setPreview(parseCsvText(text))
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'No se pudo leer el archivo')
      setPreview([])
    } finally {
      setIsParsing(false)
    }
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
    setPreview([])
    setParseError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const pastePreview = parseCsvText(pasteText)
  const activePreview = file ? preview : pastePreview
  const canImport = activePreview.length > 0 && !isParsing

  function handleImport() {
    if (!canImport) return
    const recipients = activePreview.map((r) => ({ ...r, isActive: true }))
    importRecipients(recipients, {
      onSuccess: () => {
        setPasteText('')
        clearFile()
        setOpen(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload size={14} className="mr-2" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar destinatarios</DialogTitle>
        </DialogHeader>

        <button
          type="button"
          onClick={downloadExampleExcel}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline w-fit -mt-1"
        >
          <Download size={12} />
          Descargar Excel de ejemplo
        </button>

        <Tabs defaultValue="file" className="pt-2" onValueChange={clearFile}>
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1">Subir archivo</TabsTrigger>
            <TabsTrigger value="paste" className="flex-1">Pegar texto</TabsTrigger>
          </TabsList>

          {/* Tab: subir archivo (CSV o Excel) */}
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
                  Arrastra tu archivo Excel o CSV aquí
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  o haz clic para seleccionar (.xlsx, .xls, .csv)
                </p>
                <p className="text-xs text-muted-foreground">
                  Columnas: <code className="bg-muted px-1 py-0.5 rounded">nombre, email, tag</code>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
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

                {isParsing && (
                  <p className="text-xs text-muted-foreground">Leyendo archivo...</p>
                )}

                {parseError && (
                  <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-md p-2">
                    <TriangleAlert size={14} className="shrink-0 mt-0.5" />
                    <span>{parseError}</span>
                  </div>
                )}

                {!isParsing && !parseError && preview.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No se detectaron filas válidas (falta nombre o email).
                  </p>
                )}

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
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={7}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={'nombre,email\nJuan García,juan@empresa.com\nAna López,ana@empresa.com,vip'}
            />
            {pastePreview.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {pastePreview.length} destinatarios detectados
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
              ? `Importar ${activePreview.length} destinatarios`
              : 'Importar'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
