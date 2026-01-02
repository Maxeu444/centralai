import { z } from 'zod'

export const ancrageSchema = z.object({
  page: z.number().int().positive().optional(),
  x: z.number().min(0).max(100).optional(), // pourcentage
  y: z.number().min(0).max(100).optional(), // pourcentage
})

export const createCommentaireSchema = z.object({
  contenu: z.string().min(1, 'Le commentaire ne peut pas être vide').max(2000),
  supportId: z.string().cuid(),
  ancrage: ancrageSchema.optional(),
  parentId: z.string().cuid().optional(),
})

export const updateCommentaireSchema = z.object({
  contenu: z.string().min(1).max(2000),
})

export type CreateCommentaireInput = z.infer<typeof createCommentaireSchema>
export type UpdateCommentaireInput = z.infer<typeof updateCommentaireSchema>
export type Ancrage = z.infer<typeof ancrageSchema>
