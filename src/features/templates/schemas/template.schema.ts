import { z } from 'zod'

export const templateSchema = z.object({
  name:    z.string().min(1, 'El nombre es requerido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  body:    z.string().min(10, 'El cuerpo es muy corto'),
})

export type TemplateFormValues = z.infer<typeof templateSchema>
