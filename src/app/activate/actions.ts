'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const activateSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type ActionResult = 
  | { success: true }
  | { success: false; error: string }

export async function activateAccount(formData: FormData): Promise<ActionResult> {
  try {
    const validated = activateSchema.parse({
      token: formData.get('token'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    // Trouver l'invitation avec ce token
    const invitation = await prisma.invitation.findUnique({
      where: { token: validated.token },
      include: {
        entreprise: { select: { nom: true } },
      },
    })

    if (!invitation) {
      return { success: false, error: 'Lien d\'activation invalide' }
    }

    if (invitation.statut !== 'EN_ATTENTE') {
      return { success: false, error: 'Ce lien a déjà été utilisé' }
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: 'Ce lien a expiré. Contactez votre administrateur pour recevoir un nouveau lien.' }
    }

    // Trouver l'utilisateur associé
    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (!user) {
      return { success: false, error: 'Compte non trouvé. Contactez votre administrateur.' }
    }

    if (user.passwordHash && user.passwordHash !== '') {
      return { success: false, error: 'Ce compte a déjà été activé. Connectez-vous avec votre mot de passe.' }
    }

    // Hasher le mot de passe et mettre à jour l'utilisateur
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    await prisma.$transaction(async (tx) => {
      // Mettre à jour le mot de passe de l'utilisateur
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      })

      // Marquer l'invitation comme acceptée
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { statut: 'ACCEPTEE' },
      })

      // Enregistrer dans l'historique
      await tx.historiqueAction.create({
        data: {
          type: 'COMPTE_ACTIVE',
          description: `${user.prenom} ${user.nom} a activé son compte`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
        },
      })
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur activation:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

export async function getInvitationByToken(token: string) {
  if (!token) return null

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      entreprise: { select: { nom: true } },
    },
  })

  if (!invitation) return null

  // Trouver l'utilisateur associé
  const user = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { prenom: true, nom: true, passwordHash: true },
  })

  return {
    ...invitation,
    user,
    isExpired: invitation.expiresAt < new Date(),
    isUsed: invitation.statut !== 'EN_ATTENTE',
    isAlreadyActivated: user?.passwordHash && user.passwordHash !== '',
  }
}
