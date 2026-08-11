import { useState } from 'react'
import { UserPlus, Pencil, Trash2, ShieldCheck, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/use-users'
import { CreateUserForm } from '../components/CreateUserForm'
import { EditUserForm } from '../components/EditUserForm'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { User } from '@/shared/types'
import type { CreateUserFormValues, EditUserFormValues } from '../schemas/user.schema'

function RoleBadges({ roles }: { roles: string[] }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {roles.includes('admin') && (
        <Badge variant="secondary" className="gap-1 text-xs">
          <ShieldCheck size={11} /> Admin
        </Badge>
      )}
      {roles.includes('mailMasivo') && (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Send size={11} /> MailMasivo
        </Badge>
      )}
    </div>
  )
}

export function UserListPage() {
  const currentUser = useAuthStore((s) => s.user)
  const { data, isLoading } = useUsers()
  const users = data?.users ?? []

  const { mutate: createUser, isPending: isCreating } = useCreateUser()
  const { mutate: deleteUser, isPending: isDeleting }  = useDeleteUser()

  const [createOpen, setCreateOpen]           = useState(false)
  const [editingUser, setEditingUser]         = useState<User | null>(null)
  const [deletingUser, setDeletingUser]       = useState<User | null>(null)

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(editingUser?.id ?? '')

  function handleCreate(values: CreateUserFormValues) {
    createUser(values, { onSuccess: () => setCreateOpen(false) })
  }

  function handleUpdate(values: EditUserFormValues) {
    updateUser(values, { onSuccess: () => setEditingUser(null) })
  }

  function handleConfirmDelete() {
    if (!deletingUser) return
    deleteUser(deletingUser.id, { onSuccess: () => setDeletingUser(null) })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra quién puede acceder a MailMasivo
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus size={14} className="mr-2" />
          Nuevo usuario
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground h-24">
                  Cargando...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground h-24">
                  No hay usuarios todavía.
                </TableCell>
              </TableRow>
            )}

            {users.map((user) => {
              const isSelf = user.id === currentUser?.id
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName}
                    {isSelf && <span className="text-xs text-muted-foreground ml-1.5">(tú)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell><RoleBadges roles={user.roles} /></TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingUser(user)}>
                        <Pencil size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                        onClick={() => setDeletingUser(user)}
                        disabled={isSelf}
                        title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Crear usuario */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>Crea una cuenta con acceso a MailMasivo.</DialogDescription>
          </DialogHeader>
          <CreateUserForm onSubmit={handleCreate} isLoading={isCreating} />
        </DialogContent>
      </Dialog>

      {/* Editar usuario */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Modifica su información, rol o contraseña.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <EditUserForm
              defaultValues={{
                fullName: editingUser.fullName,
                email:    editingUser.email,
                roles:    editingUser.roles,
                isActive: editingUser.isActive,
                password: '',
              }}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              Estás a punto de eliminar a{' '}
              <span className="font-medium text-foreground">"{deletingUser?.fullName}"</span>.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingUser(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
