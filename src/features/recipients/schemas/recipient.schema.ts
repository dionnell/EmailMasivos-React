import { z } from 'zod'

export const recipientSchema = z.object({
  name:  z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  tags:  z.string().optional(), // CSV de tags: "clientes,vip"
})

export type RecipientFormValues = z.infer<typeof recipientSchema>
