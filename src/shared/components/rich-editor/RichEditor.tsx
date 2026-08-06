import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import {TextStyle} from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Link from '@tiptap/extension-link'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered,
  Link as LinkIcon, Eye, Code2,
  Heading2, Heading3,
  Undo, Redo, PenLine, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const VARIABLES = ['{nombre}', '{email}', '{empresa}', '{ciudad}']

const FONTS = [
  { label: 'Por defecto', value: '' },
  { label: 'Arial',     value: 'Arial, sans-serif' },
  { label: 'Georgia',   value: 'Georgia, serif' },
  { label: 'Verdana',   value: 'Verdana, sans-serif' },
  { label: 'Courier',   value: 'Courier New, monospace' },
]

const COLORS = [
  '#000000', '#374151', '#6B7280',
  '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#3B82F6', '#8B5CF6',
  '#EC4899', '#ffffff',
]

type Mode = 'visual' | 'html' | 'preview'

interface Props {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  minHeight?: number
  error?: string
}

function ToolBtn({ onClick, active, disabled, title, children }: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded text-sm transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />
}

const PREVIEW_STYLES = `
  body { font-family: Arial, sans-serif; font-size:14px; line-height:1.6;
         color:#1a1a1a; padding:20px 24px; margin:0; max-width:600px; }
  h1,h2,h3 { line-height:1.3; }
  a { color:#3B82F6; }
  ul,ol { padding-left:20px; }
  code { background:#f3f4f6; padding:2px 4px; border-radius:3px; font-size:13px; }
  blockquote { border-left:3px solid #d1d5db; margin:0; padding-left:12px; color:#6b7280; }
  p { margin:0 0 1em; }
`

function isComplexHtml(html: string): boolean {
  if (!html) return false
  return (
    /<table/i.test(html) ||
    /<tr/i.test(html) ||
    /<td/i.test(html) ||
    /style\s*=\s*["'][^"']{30,}/i.test(html) ||
    /<img/i.test(html)
  )
}

export function RichEditor({ value = '', onChange, placeholder, minHeight = 240, error }: Props) {
  const complex = isComplexHtml(value)
  const [mode, setMode]         = useState<Mode>(complex ? 'html' : 'visual')
  const [htmlCode, setHtmlCode] = useState(value)
  const [htmlMode, setHtmlMode] = useState(complex)
  const [linkUrl, setLinkUrl]   = useState('')
  const [showLink, setShowLink] = useState(false)
  const [color, setColor]       = useState('#000000')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!htmlMode) {
        const html = editor.getHTML()
        setHtmlCode(html)
        onChange?.(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'outline-none prose prose-sm max-w-none px-3 py-2',
        style: `min-height:${minHeight}px`,
      },
    },
  })

  // Sync external value (ej: cuando se aplica una plantilla) — solo si no estamos en htmlMode
  useEffect(() => {
    if (!editor || htmlMode) return
    if (value !== editor.getHTML()) {
      // Si el nuevo valor es HTML complejo, cambiar a modo HTML en vez de cargarlo en Tiptap
      if (isComplexHtml(value)) {
        setHtmlCode(value)
        setHtmlMode(true)
        setMode('html')
        onChange?.(value)
        return
      }
      editor.commands.setContent(value ?? '', { emitUpdate: false })
      setHtmlCode(value ?? '')
    }
  }, [value, editor, htmlMode])

  if (!editor) return null

  // ── Mode switching ──────────────────────────────────────────────────────────

  function switchToVisual() {
    if (htmlMode) {
      const ok = window.confirm(
        'Al pasar a modo Visual, el HTML complejo (tablas, estilos inline avanzados) puede perder formato.\n\n¿Continuar de todas formas?'
      )
      if (!ok) return
      editor.commands.setContent(htmlCode, { emitUpdate: false })
      setHtmlMode(false)
      onChange?.(htmlCode)
    }
    setMode('visual')
  }

  function switchToHtml() {
    if (!htmlMode) {
      setHtmlCode(editor.getHTML())
    }
    setHtmlMode(true)
    setMode('html')
  }

  function switchToPreview() {
    if (!htmlMode) {
      setHtmlCode(editor.getHTML())
    }
    setMode('preview')
  }

  function handleHtmlChange(raw: string) {
    setHtmlCode(raw)
    onChange?.(raw)
  }

  function insertVariable(v: string) {
    editor.chain().focus().insertContent(v).run()
  }

  function applyLink() {
    if (!linkUrl) return
    editor.chain().focus().setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setShowLink(false)
  }

  function applyColor(hex: string) {
    setColor(hex)
    editor.chain().focus().setColor(hex).run()
  }

  const ModeTab = ({ m, label, icon: Icon }: { m: Mode; label: string; icon: React.ElementType }) => (
    <button
      type="button"
      onClick={() => m === 'visual' ? switchToVisual() : m === 'html' ? switchToHtml() : switchToPreview()}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors',
        mode === m
          ? 'bg-background text-foreground font-medium shadow-sm border border-border'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon size={12} />
      {label}
    </button>
  )

  return (
    <div className={cn('rounded-md border bg-background', error && 'border-destructive')}>

      {/* Mode switcher + Variables */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-1 bg-muted/60 rounded-md p-0.5">
          <ModeTab m="visual"  label="Visual"  icon={PenLine} />
          <ModeTab m="html"    label="HTML"     icon={Code2}   />
          <ModeTab m="preview" label="Preview"  icon={Eye}     />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground hidden sm:block">Variables:</span>
          {VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                if (mode === 'visual' && !htmlMode) {
                  insertVariable(v)
                } else if (mode === 'html') {
                  const next = htmlCode + v
                  setHtmlCode(next)
                  onChange?.(next)
                }
              }}
              className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-accent font-mono transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Aviso cuando htmlMode está activo y el usuario está en Visual */}
      {htmlMode && mode === 'visual' && (
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle size={13} className="shrink-0" />
          Estás usando HTML complejo. Volver a Visual puede simplificar el formato.
        </div>
      )}

      {/* Toolbar — solo en modo visual y sin htmlMode activo */}
      {mode === 'visual' && !htmlMode && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40">
          <ToolBtn title="Deshacer" onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}><Undo size={13} /></ToolBtn>
          <ToolBtn title="Rehacer" onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}><Redo size={13} /></ToolBtn>
          <Divider />
          <ToolBtn title="Título 2" active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={13} /></ToolBtn>
          <ToolBtn title="Título 3" active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={13} /></ToolBtn>
          <Divider />
          <ToolBtn title="Negrita" active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={13} /></ToolBtn>
          <ToolBtn title="Cursiva" active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={13} /></ToolBtn>
          <ToolBtn title="Subrayado" active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={13} /></ToolBtn>
          <ToolBtn title="Tachado" active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={13} /></ToolBtn>
          <Divider />
          <ToolBtn title="Izquierda" active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={13} /></ToolBtn>
          <ToolBtn title="Centro" active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={13} /></ToolBtn>
          <ToolBtn title="Derecha" active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={13} /></ToolBtn>
          <Divider />
          <ToolBtn title="Lista" active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={13} /></ToolBtn>
          <ToolBtn title="Lista numerada" active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={13} /></ToolBtn>
          <Divider />
          <label title="Color" className="relative cursor-pointer">
            <div className="h-7 w-7 flex flex-col items-center justify-center rounded hover:bg-accent transition-colors">
              <span className="font-bold text-xs leading-none" style={{ color }}>A</span>
              <div className="w-4 h-1 rounded-full mt-0.5" style={{ backgroundColor: color }} />
            </div>
            <input type="color" value={color} onChange={(e) => applyColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
          </label>
          <div className="flex items-center gap-0.5">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => applyColor(c)}
                className="w-4 h-4 rounded-sm border border-border/50 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <Divider />
          <select title="Fuente"
            onChange={(e) => e.target.value
              ? editor.chain().focus().setFontFamily(e.target.value).run()
              : editor.chain().focus().unsetFontFamily().run()}
            className="h-7 text-xs bg-transparent border border-border rounded px-1 text-muted-foreground hover:border-foreground focus:outline-none">
            {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <Divider />
          <ToolBtn title="Enlace" active={editor.isActive('link')}
            onClick={() => setShowLink((v) => !v)}><LinkIcon size={13} /></ToolBtn>
        </div>
      )}

      {/* Link input */}
      {showLink && mode === 'visual' && !htmlMode && (
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
          <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://ejemplo.com"
            className="flex-1 text-sm bg-transparent outline-none"
            onKeyDown={(e) => e.key === 'Enter' && applyLink()} autoFocus />
          <Button type="button" size="sm" variant="outline" className="h-6 text-xs" onClick={applyLink}>
            Aplicar
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-6 text-xs"
            onClick={() => { editor.chain().focus().unsetLink().run(); setShowLink(false) }}>
            Quitar
          </Button>
        </div>
      )}

      {/* Visual */}
      {mode === 'visual' && (
        <div className="relative">
          {!editor.getText() && placeholder && (
            <p className="absolute top-2 left-3 text-sm text-muted-foreground pointer-events-none select-none">
              {placeholder}
            </p>
          )}
          <EditorContent editor={editor} />
        </div>
      )}

      {/* HTML */}
      {mode === 'html' && (
        <div className="relative">
          <div className="absolute top-2 right-3 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded z-10">
            HTML
          </div>
          <textarea
            value={htmlCode}
            onChange={(e) => handleHtmlChange(e.target.value)}
            spellCheck={false}
            className="w-full font-mono text-xs px-3 py-3 bg-[#1e1e2e] text-[#cdd6f4] focus:outline-none resize-none rounded-b-md"
            style={{ minHeight: minHeight, tabSize: 2 }}
            placeholder="<p>Escribe o pega tu HTML aquí...</p>"
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault()
                const el    = e.currentTarget
                const start = el.selectionStart
                const end   = el.selectionEnd
                const next  = htmlCode.substring(0, start) + '  ' + htmlCode.substring(end)
                handleHtmlChange(next)
                requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2 })
              }
            }}
          />
        </div>
      )}

      {/* Preview */}
      {mode === 'preview' && (
        <div className="relative">
          <div className="absolute top-2 right-3 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded z-10">
            Vista previa
          </div>
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PREVIEW_STYLES}</style></head><body>${htmlCode}</body></html>`}
            className="w-full border-0 rounded-b-md"
            style={{ minHeight: minHeight }}
            onLoad={(e) => {
              const iframe = e.currentTarget
              const h = iframe.contentDocument?.body?.scrollHeight
              if (h) iframe.style.height = h + 40 + 'px'
            }}
            title="Vista previa del correo"
            sandbox="allow-same-origin"
          />
        </div>
      )}

      {error && <p className="text-xs text-destructive px-3 pb-2">{error}</p>}
    </div>
  )
}