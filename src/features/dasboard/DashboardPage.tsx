import { Send, Users, BarChart2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardMetrics } from './hooks/use-dashboard'
import { MetricCard } from './components/MetricCard'
import { RecentCampaignsTable } from './components/RecentCampaignsTable'

export function DashboardPage() {
  const { data, isLoading } = useDashboardMetrics()
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general de tus campañas</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Total enviados"   value={isLoading ? '—' : (data?.totalSent.toLocaleString() ?? '0')} description="Correos entregados" icon={Send} />
        <MetricCard title="Campañas"         value={isLoading ? '—' : (data?.totalCampaigns ?? '0')}             description="Campañas creadas"  icon={BarChart2} />
        <MetricCard title="Tasa de apertura" value={isLoading ? '—' : `${data?.avgOpenRate ?? 0}%`}              description="Promedio general"  icon={CheckCircle} />
        <MetricCard title="Tasa de entrega"  value={isLoading ? '—' : `${data?.avgDeliveryRate ?? 0}%`}          description="Promedio general"  icon={Users} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Campañas recientes</CardTitle></CardHeader>
        <CardContent>
          <RecentCampaignsTable campaigns={data?.recentCampaigns ?? []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}