import * as XLSX from 'xlsx'

export interface ParsedRecipient {
  name: string
  email: string
  tags: string[]
}

const NAME_HEADERS  = ['nombre', 'name']
const EMAIL_HEADERS = ['email', 'correo', 'mail', 'e-mail']
const TAG_HEADERS   = ['tag', 'tags', 'etiqueta', 'etiquetas']

function normalizeHeader(h: unknown): string {
  return String(h ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
}

function findKey(headers: string[], candidates: string[]): string | undefined {
  return headers.find((h) => candidates.includes(normalizeHeader(h)))
}

function splitTags(raw: string): string[] {
  return raw
    ? raw.split(/[,;]/).map((t) => t.trim()).filter(Boolean)
    : []
}

/** Parsea texto CSV con encabezado nombre,email,tag (tag opcional, puede tener varios separados por ; o ,) */
export function parseCsvText(raw: string): ParsedRecipient[] {
  const lines = raw.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return []

  return lines
    .filter((line) => {
      const first = normalizeHeader(line.split(',')[0])
      return !NAME_HEADERS.includes(first) // salta la fila de encabezado si existe
    })
    .map((line) => {
      const [name, email, ...rest] = line.split(',').map((s) => s.trim())
      return { name, email, tags: splitTags(rest.filter(Boolean).join(',')) }
    })
    .filter((r) => r.name && r.email)
}

/** Parsea un archivo Excel (.xlsx/.xls). Detecta columnas nombre/email/tag por encabezado; si no encuentra encabezados, asume el orden nombre, email, tag. */
export function parseExcelFile(file: File): Promise<ParsedRecipient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data      = e.target?.result as ArrayBuffer
        const workbook  = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet     = workbook.Sheets[sheetName]
        const rows      = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

        if (rows.length === 0) return resolve([])

        const headers  = Object.keys(rows[0])
        const nameKey  = findKey(headers, NAME_HEADERS)
        const emailKey = findKey(headers, EMAIL_HEADERS)
        const tagKey   = findKey(headers, TAG_HEADERS)

        // Sin encabezados reconocibles: asumir orden de columnas nombre, email, tag
        if (!nameKey || !emailKey) {
          resolve(
            rows
              .map((row) => {
                const values = Object.values(row).map((v) => String(v ?? '').trim())
                return {
                  name:  values[0] ?? '',
                  email: values[1] ?? '',
                  tags:  splitTags(values[2] ?? ''),
                }
              })
              .filter((r) => r.name && r.email)
          )
          return
        }

        resolve(
          rows
            .map((row) => ({
              name:  String(row[nameKey] ?? '').trim(),
              email: String(row[emailKey] ?? '').trim(),
              tags:  splitTags(tagKey ? String(row[tagKey] ?? '').trim() : ''),
            }))
            .filter((r) => r.name && r.email)
        )
      } catch (err) {
        reject(err instanceof Error ? err : new Error('No se pudo leer el archivo Excel'))
      }
    }

    reader.onerror = () => reject(reader.error ?? new Error('Error leyendo el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

/** Genera y descarga un .xlsx de ejemplo con las columnas esperadas (nombre, email, tag) */
export function downloadExampleExcel() {
  const rows = [
    { nombre: 'Juan García',  email: 'juan@empresa.com',  tag: 'clientes' },
    { nombre: 'Ana López',    email: 'ana@empresa.com',   tag: 'vip' },
    { nombre: 'Carlos Pérez', email: 'carlos@empresa.com', tag: 'clientes,newsletter' },
  ]

  const sheet     = XLSX.utils.json_to_sheet(rows)
  sheet['!cols']  = [{ wch: 20 }, { wch: 28 }, { wch: 20 }] // ancho de columnas
  const workbook  = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Destinatarios')
  XLSX.writeFile(workbook, 'ejemplo-destinatarios.xlsx')
}
