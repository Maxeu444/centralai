import { z } from 'zod'

export const createInvitationSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['ADMIN', 'MANAGER', 'COLLABORATEUR']),
  projetId: z.string().cuid().optional(),
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
})

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
