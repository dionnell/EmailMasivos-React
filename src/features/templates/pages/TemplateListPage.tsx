import { useState } from 'react'
import { FileText, Pencil, Trash2, PenLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TemplateForm } from '../components/TemplateForm'
import { TemplatePreview } from '../components/TemplatePreview'
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '../hooks/use-templates'
import type { Template } from '@/shared/types'
import type { TemplateFormValues } from '../schemas/template.schema'

function TemplateGrid({
  items,
  isLoading,
  emptyLabel,
  onSelect,
  onEdit,
  onDelete,
}: {
  items: Template[]
  isLoading: boolean
  emptyLabel: string
  onSelect: (t: Template) => void
  onEdit: (t: Template) => void
  onDelete: (t: Template) => void
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-sm text-muted-foreground gap-3">
        <FileText size={32} className="opacity-30" />
        <p>{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((template) => (
        <Card
          key={template.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect(template)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <CardTitle className="text-sm truncate">{template.name}</CardTitle>
                {template.subject && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {template.subject}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); onEdit(template) }}
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); onDelete(template) }}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {template.body.replace(/<[^>]+>/g, ' ')}
            </p>
            <Badge variant="secondary" className="mt-3 text-xs">
              {new Date(template.createdAt).toLocaleDateString('es-GT')}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TemplateListPage() {
  const [tab, setTab] = useState<'template' | 'signature'>('template')

  const { data: templates = [], isLoading } = useTemplates(tab)
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate()
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate()

  const [editingTemplate, setEditingTemplate]   = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate]   = useState<Template | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null)
  const [createOpen, setCreateOpen]             = useState(false)

  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate(
    editingTemplate?.id ?? ''
  )

  function handleCreate(values: TemplateFormValues) {
    createTemplate(values, { onSuccess: () => setCreateOpen(false) })
  }

  function handleUpdate(values: TemplateFormValues) {
    updateTemplate(values, { onSuccess: () => setEditingTemplate(null) })
  }

  function handleConfirmDelete() {
    if (!deletingTemplate) return
    deleteTemplate(deletingTemplate.id, {
      onSuccess: () => setDeletingTemplate(null),
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Plantillas y firmas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reutiliza diseños y firmas de correo en tus campañas
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          {tab === 'signature' ? <PenLine size={14} className="mr-2" /> : <FileText size={14} className="mr-2" />}
          {tab === 'signature' ? 'Nueva firma' : 'Nueva plantilla'}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'template' | 'signature')}>
        <TabsList>
          <TabsTrigger value="template" className="gap-1.5">
            <FileText size={13} /> Plantillas
          </TabsTrigger>
          <TabsTrigger value="signature" className="gap-1.5">
            <PenLine size={13} /> Firmas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="pt-4">
          <TemplateGrid
            items={templates}
            isLoading={isLoading}
            emptyLabel="No hay plantillas. Crea tu primera plantilla."
            onSelect={setPreviewTemplate}
            onEdit={setEditingTemplate}
            onDelete={setDeletingTemplate}
          />
        </TabsContent>

        <TabsContent value="signature" className="pt-4">
          <TemplateGrid
            items={templates}
            isLoading={isLoading}
            emptyLabel="No hay firmas. Crea tu primera firma para usarla en tus campañas."
            onSelect={setPreviewTemplate}
            onEdit={setEditingTemplate}
            onDelete={setDeletingTemplate}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog para crear */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tab === 'signature' ? 'Nueva firma' : 'Nueva plantilla'}</DialogTitle>
            <DialogDescription>
              {tab === 'signature'
                ? 'Crea una firma reutilizable para insertar al final de tus campañas.'
                : 'Crea una plantilla reutilizable para tus campañas de correo.'}
            </DialogDescription>
          </DialogHeader>
          <TemplateForm onSubmit={handleCreate} isLoading={isCreating} lockType={tab} />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={!!deletingTemplate}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar {deletingTemplate?.type === 'signature' ? 'firma' : 'plantilla'}?</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar{' '}
              <span className="font-medium text-foreground">
                "{deletingTemplate?.name}"
              </span>
              . Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingTemplate(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar */}
      <Dialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate?.type === 'signature' ? 'Editar firma' : 'Editar plantilla'}</DialogTitle>
            <DialogDescription>
              Modifica el contenido.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <TemplateForm
              defaultValues={{
                name:    editingTemplate.name,
                type:    editingTemplate.type,
                subject: editingTemplate.subject,
                body:    editingTemplate.body,
              }}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              submitLabel={editingTemplate.type === 'signature' ? 'Actualizar firma' : 'Actualizar plantilla'}
              lockType={editingTemplate.type}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para preview */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            {previewTemplate?.subject && (
              <DialogDescription>{previewTemplate.subject}</DialogDescription>
            )}
          </DialogHeader>
          {previewTemplate && (
            <TemplatePreview
              subject={previewTemplate.subject ?? ''}
              body={previewTemplate.body}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
