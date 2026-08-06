import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({ data, columns, isLoading, emptyMessage = 'No hay datos' }: Props<T>) {
  if (isLoading) {
    return <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">Cargando...</div>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => <TableHead key={String(col.key)}>{col.label}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground h-32">{emptyMessage}</TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}