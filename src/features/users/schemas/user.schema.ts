import { z } from 'zod'

const PASSWORD_REGEX = /(?:(?=.*\d)|(?=.*\W+))(?=.*[A-Z])(?=.*[a-z])/

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Requerido'),
  email:    z.string().min(1, 'Requerido').email('Email inválido'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(50)
    .regex(PASSWORD_REGEX, 'Debe tener mayúscula, minúscula y un número'),
  roles: z.array(z.enum(['admin', 'mailMasivo'])).min(1, 'Selecciona al menos un rol'),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const editUserSchema = z.object({
  fullName: z.string().min(1, 'Requerido'),
  email:    z.string().min(1, 'Requerido').email('Email inválido'),
  roles:    z.array(z.enum(['admin', 'mailMasivo'])).min(1, 'Selecciona al menos un rol'),
  password: z
    .union([
      z.string().length(0), // vacío = no cambiar
      z.string().min(6, 'Mínimo 6 caracteres').max(50).regex(PASSWORD_REGEX, 'Debe tener mayúscula, minúscula y un número'),
    ])
    .optional(),
  isActive: z.boolean(),
})

export type EditUserFormValues = z.infer<typeof editUserSchema>
