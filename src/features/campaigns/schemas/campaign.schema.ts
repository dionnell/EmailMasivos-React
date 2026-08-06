import { z } from 'zod'

export const DOMAINS = ['elavellano.cl', 'globalterrenos.cl'] as const
export type Domain = typeof DOMAINS[number]

export const campaignSchema = z.object({
  name:       z.string().min(1, 'Requerido'),
  subject:    z.string().min(1, 'Requerido'),
  body:       z.string().min(10, 'El cuerpo es muy corto'),
  templateId: z.string().optional(),
  fromName:   z.string().min(1, 'Escribe el nombre del remitente').optional(),
  fromDomain: z.enum(DOMAINS).optional(),
})

export type CampaignFormValues = z.infer<typeof campaignSchema>
