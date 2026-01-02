import { z } from 'zod'

export const createProjetSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  description: z.string().max(500).optional(),
})

export const updateProjetSchema = createProjetSchema.partial()

export const addMembreSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['ADMIN', 'MANAGER', 'COLLABORATEUR']),
})

export type CreateProjetInput = z.infer<typeof createProjetSchema>
export type UpdateProjetInput = z.infer<typeof updateProjetSchema>
export type AddMembreInput = z.infer<typeof addMembreSchema>
