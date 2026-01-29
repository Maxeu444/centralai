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
  contenu: z.string().max(10000).optional().nullable(),
  // Champs spécifiques RS
  descriptionPost: z.string().max(2200).optional().nullable(), // Limite Instagram
  texteStory: z.string().max(500).optional().nullable(),
})

export const changeStatutSchema = z.object({
  action: z.enum(['DEMANDER_VALIDATION', 'VALIDER', 'REFUSER']),
  commentaire: z.string().max(500).optional(),
})

// Schéma pour les suggestions de contenu
export const createSuggestionSchema = z.object({
  supportId: z.string().cuid(),
  champCible: z.enum(['contenu', 'descriptionPost', 'texteStory']),
  contenuSuggere: z.string().min(1).max(10000),
  commentaire: z.string().max(500).optional(),
})

export const moderateSuggestionSchema = z.object({
  suggestionId: z.string().cuid(),
  action: z.enum(['ACCEPTER', 'REFUSER']),
})

export type CreateSupportInput = z.infer<typeof createSupportSchema>
export type UpdateSupportInput = z.infer<typeof updateSupportSchema>
export type ChangeStatutInput = z.infer<typeof changeStatutSchema>
export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>
export type ModerateSuggestionInput = z.infer<typeof moderateSuggestionSchema>
