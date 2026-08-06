import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { RecipientForm } from '../components/RecipientForm'
import { ImportCsvDialog } from '../components/ImportCsvDialog'
import {
  useRecipients,
  useCreateRecipient,
  useDeleteRecipient,
  useDeleteAllRecipients,
} from '../hooks/use-recipients'
import type { Recipient } from '@/shared/types'
import type { RecipientFormValues } from '../schemas/recipient.schema'

export function RecipientListPage() {
  const { data: recipients = [], isLoading } = useRecipients()
  const { mutate: createRecipient, isPending: isCreating }       = useCreateRecipient()
  const { mutate: deleteRecipient }                               = useDeleteRecipient()
  const { mutate: deleteAllRecipients, isPending: isDeletingAll } = useDeleteAllRecipients()

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  function handleSubmit(values: RecipientFormValues) {
    createRecipient({
      name:  values.name,
      email: values.email,
      tags:  values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
    })
  }

  function handleDeleteAll() {
    deleteAllRecipients(undefined, {
      onSuccess: () => setConfirmDeleteAll(false),
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Destinatarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tu lista de contactos
          </p>
        </div>
        <ImportCsvDialog />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lista */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Lista de contactos ({recipients.length})
                </CardTitle>
                {recipients.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                    onClick={() => setConfirmDeleteAll(true)}
                  >
                    <Trash2 size={13} />
                    Eliminar todos
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DataTable<Recipient>
                data={recipients}
                isLoading={isLoading}
                emptyMessage="No hay destinatarios. Agrega uno o importa un CSV."
                columns={[
                  { key: 'name', label: 'Nombre' },
                  { key: 'email', label: 'Email' },
                  {
                    key: 'tags',
                    label: 'Tags',
                    render: (row) =>
                      row.tags?.length ? (
                        <div className="flex gap-1 flex-wrap">
                          {row.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      ),
                  },
                  {
                    key: 'createdAt',
                    label: 'Agregado',
                    render: (row) =>
                      new Date(row.createdAt).toLocaleDateString('es-GT'),
                  },
                  {
                    key: 'actions',
                    label: '',
                    render: (row) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteRecipient(row.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Formulario */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Agregar destinatario</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipientForm onSubmit={handleSubmit} isLoading={isCreating} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog confirmación eliminar todos */}
      <Dialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar todos los destinatarios?</DialogTitle>
            <DialogDescription>
              Se eliminarán{' '}
              <span className="font-medium text-foreground">
                {recipients.length} destinatarios
              </span>{' '}
              de forma permanente. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteAll(false)}
              disabled={isDeletingAll}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
            >
              {isDeletingAll ? 'Eliminando...' : `Eliminar ${recipients.length}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
