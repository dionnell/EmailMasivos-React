import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { useCampaigns, useDeleteCampaign } from '../hooks/use-campaigns'
import type { Campaign, CampaignStatus } from '@/shared/types'

const statusConfig: Record<CampaignStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:     { label: 'Borrador',   variant: 'secondary' },
  sending:   { label: 'Enviando',   variant: 'default' },
  sent:      { label: 'Enviado',    variant: 'default' },
  failed:    { label: 'Fallido',    variant: 'destructive' },
}

export function CampaignListPage() {
  const navigate = useNavigate()
  const { data: campaigns = [], isLoading } = useCampaigns()
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign()
   
  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta campaña?')) return
    deleteCampaign(id!, { onSuccess: () => navigate('/campaigns') })
  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Campañas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona y envía tus campañas de correo
          </p>
        </div>
        <Button onClick={() => navigate('/campaigns/new')}>
          <Plus size={16} className="mr-2" />
          Nueva campaña
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Todas las campañas ({campaigns.length})
          </CardTitle>
        </CardHeader> 
        <CardContent>
          <DataTable<Campaign>
            data={campaigns}
            isLoading={isLoading}
            emptyMessage="No hay campañas. ¡Crea tu primera campaña!"
            columns={[
              { key: 'name', label: 'Nombre' },
              { key: 'subject', label: 'Asunto' },
              {
                key: 'status',
                label: 'Estado',
                render: (row) => {
                  const cfg = statusConfig[row.status]
                  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
                },
              },
              {
                key: 'stats',
                label: 'Progreso',
                render: (row) =>
                  row.totalRecipients > 0
                    ? `${row.sentCount} / ${row.totalRecipients}`
                    : '—',
              },
              {
                key: 'createdAt',
                label: 'Creada',
                render: (row) =>
                  new Date(row.createdAt).toLocaleDateString('es-GT'),
              },
              {
                key: 'actions',
                label: '',
                render: (row) => (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/campaigns/${row.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant='destructive'
                      size="sm"
                      onClick={() => handleDelete(row.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                  </>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
