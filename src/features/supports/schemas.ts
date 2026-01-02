import { z } from 'zod'

export const typesSupportEnum = z.enum(['PRINT', 'WEB', 'VIDEO', 'SOCIAL', 'AUTRE'])

export const createSupportSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  description: z.string().max(1000).optional(),
  type: typesSupportEnum,
  projetId: z.string().cuid(),
})

export const updateSupportSchema = z.object({
  nom: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  type: typesSupportEnum.optional(),
})

export const changeStatutSchema = z.object({
  action: z.enum(['DEMANDER_VALIDATION', 'VALIDER', 'REFUSER']),
  commentaire: z.string().max(500).optional(),
})

export type CreateSupportInput = z.infer<typeof createSupportSchema>
export type UpdateSupportInput = z.infer<typeof updateSupportSchema>
export type ChangeStatutInput = z.infer<typeof changeStatutSchema>
