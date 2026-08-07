import { z } from 'zod'

export const campaignSchema = z.object({
  name:       z.string().min(1, 'Requerido'),
  subject:    z.string().min(1, 'Requerido'),
  body:       z.string().min(10, 'El cuerpo es muy corto'),
  templateId: z.string().optional(),
  fromName:   z.string().min(1, 'Escribe el nombre del remitente').optional(),
})

export type CampaignFormValues = z.infer<typeof campaignSchema>

/** Lo que efectivamente se envía al backend: el form + el email del remitente ya armado */
export type CampaignSubmitValues = CampaignFormValues & { fromEmail?: string }
