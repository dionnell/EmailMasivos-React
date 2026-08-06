import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button';
import { DataTable } from '@/shared/components/data-table/DataTable'
import type { Campaign, CampaignStatus } from '@/shared/types'
import { useNavigate } from 'react-router';

const statusConfig: Record<CampaignStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:   { label: 'Borrador',  variant: 'secondary' },
  sending: { label: 'Enviando',  variant: 'default' },
  sent:    { label: 'Enviado',   variant: 'default' },
  failed:  { label: 'Fallido',   variant: 'destructive' },
}

export function RecentCampaignsTable({ campaigns, isLoading }: { campaigns: Campaign[]; isLoading?: boolean }) {

  const navigate = useNavigate()

  return (
    <DataTable
      data={campaigns}
      isLoading={isLoading}
      emptyMessage="No hay campañas recientes"
      columns={[
        { key: 'name', label: 'Campaña' },
        { key: 'subject', label: 'Asunto' },
        { key: 'status', label: 'Estado', render: (row) => { const cfg = statusConfig[row.status]; return <Badge variant={cfg.variant}>{cfg.label}</Badge> } },
        { key: 'sentCount', label: 'Enviados', render: (row) => row.totalRecipients > 0 ? `${row.sentCount} / ${row.totalRecipients}` : '—' },
        { key: 'createdAt', label: 'Fecha', render: (row) => new Date(row.createdAt).toLocaleDateString('es-GT') },
        { key: 'actions', label: '',
            render: (row) => (
                  <Button
                    variant='ghost'
                    className='w-10 border-2 border-gray-300 rounded-md'
                    size="sm"
                    onClick={() => navigate(`/campaigns/${row.id}`)}
                  >
                    Ver
                  </Button>
            ),
        }
      ]}
    />
  )
}