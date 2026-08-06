import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignForm } from '../components/CampaignForm'
import { useCreateCampaign } from '../hooks/use-campaigns'
import type { CampaignFormValues } from '../schemas/campaign.schema'

export function CampaignCreatePage() {
  const navigate = useNavigate()
  const { mutate: createCampaign, isPending } = useCreateCampaign()

  function handleSubmit(values: CampaignFormValues) {
    createCampaign(values, {
      onSuccess: () => navigate('/campaigns'),
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nueva campaña</h1>
          <p className="text-sm text-muted-foreground">
            Configura tu campaña de correo masivo
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Detalles de la campaña</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignForm onSubmit={handleSubmit} isLoading={isPending} />
        </CardContent>
      </Card>
    </div>
  )
}
