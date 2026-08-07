import { z } from 'zod'

export const templateSchema = z
  .object({
    name:    z.string().min(1, 'El nombre es requerido'),
    type:    z.enum(['template', 'signature']),
    subject: z.string().optional(),
    body:    z.string().min(1, 'El cuerpo es muy corto'),
  })
  .refine(
    (data) => data.type !== 'template' || (data.subject && data.subject.length > 0),
    { message: 'El asunto es requerido', path: ['subject'] },
  )

export type TemplateFormValues = z.infer<typeof templateSchema>
