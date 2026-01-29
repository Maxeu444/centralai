'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { roleHasPermission, PERMISSIONS } from '@/lib/rbac'
import { sendInvitationEmail } from '@/lib/email'

// =============================================================================
// SCHEMAS
// =============================================================================

const inviteUserSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis'),
  nom: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['COLLABORATEUR', 'MANAGER', 'ADMIN']),
  projetId: z.string().cuid().optional(),
  equipeId: z.string().cuid().optional(),
})

const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['COLLABORATEUR', 'MANAGER', 'ADMIN']),
})

const deleteUserSchema = z.object({
  userId: z.string().cuid(),
})

// =============================================================================
// TYPES
// =============================================================================

type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string }

// =============================================================================
// HELPERS
// =============================================================================

function generateInvitationToken(): string {
  return randomBytes(32).toString('hex')
}

function getExpirationDate(days: number = 7): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// =============================================================================
// INVITER UN UTILISATEUR (Admin uniquement)
// Crée le compte directement et envoie un email pour définir le mot de passe
// =============================================================================

export async function inviteUser(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier permission
    if (!roleHasPermission(session.user.role, PERMISSIONS.USER_INVITE)) {
      return { success: false, error: 'Permission refusée. Seul un Admin peut inviter des utilisateurs.' }
    }

    // Gérer la valeur spéciale __none__ pour projetId et equipeId
    const rawProjetId = formData.get('projetId')
    const projetId = rawProjetId && rawProjetId !== '__none__' ? rawProjetId : undefined
    const rawEquipeId = formData.get('equipeId')
    const equipeId = rawEquipeId && rawEquipeId !== '__none__' ? rawEquipeId : undefined

    const validated = inviteUserSchema.parse({
      prenom: formData.get('prenom'),
      nom: formData.get('nom'),
      email: formData.get('email'),
      role: formData.get('role'),
      projetId,
      equipeId,
    })

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { success: false, error: 'Un utilisateur avec cet email existe déjà' }
    }

    // Vérifier le projet si spécifié
    if (validated.projetId) {
      const projet = await prisma.projet.findUnique({
        where: { id: validated.projetId },
      })
      if (!projet || projet.entrepriseId !== session.user.entrepriseId) {
        return { success: false, error: 'Projet invalide' }
      }
    }

    console.log(validated.equipeId);

    // Vérifier l'équipe si spécifiée
    if (validated.equipeId) {
      const equipe = await prisma.equipe.findUnique({
        where: { id: validated.equipeId },
      })
      if (!equipe || equipe.entrepriseId !== session.user.entrepriseId) {
        return { success: false, error: 'Équipe invalide' }
      }
    }

    // Récupérer les infos de l'entreprise pour l'email (avec logo)
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: session.user.entrepriseId },
      select: { nom: true, logoUrl: true },
    })

    const token = generateInvitationToken()
    const expiresAt = getExpirationDate(7)

    // Créer le compte utilisateur et l'invitation en une transaction
    await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur sans mot de passe (sera défini via le lien)
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          prenom: validated.prenom,
          nom: validated.nom,
          role: validated.role,
          passwordHash: '', // Pas de mot de passe - sera défini via le token
          entrepriseId: session.user.entrepriseId,
        },
      })

      // Créer l'invitation (pour le token de définition de mot de passe)
      await tx.invitation.create({
        data: {
          email: validated.email,
          role: validated.role,
          token,
          expiresAt,
          entrepriseId: session.user.entrepriseId,
          envoyeurId: session.user.id,
          projetId: validated.projetId,
          statut: 'EN_ATTENTE',
        },
      })

      // Ajouter au projet si spécifié
      if (validated.projetId) {
        await tx.membreProjet.create({
          data: {
            userId: newUser.id,
            projetId: validated.projetId,
            role: validated.role,
          },
        })
      }

      // Ajouter à l'équipe si spécifiée
      if (validated.equipeId) {
        await tx.membreEquipe.create({
          data: {
            userId: newUser.id,
            equipeId: validated.equipeId,
          },
        })
      }

      await tx.historiqueAction.create({
        data: {
          type: 'MEMBRE_AJOUTE',
          description: `${validated.prenom} ${validated.nom} ajouté à l'équipe (${validated.role})`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
        },
      })
    })

    // Envoyer l'email pour définir le mot de passe
    await sendInvitationEmail({
      email: validated.email,
      inviterName: `${session.user.prenom} ${session.user.nom}`,
      entrepriseName: entreprise?.nom || 'votre entreprise',
      entrepriseLogoUrl: entreprise?.logoUrl,
      role: validated.role,
      token,
      expiresAt,
    })

    revalidatePath('/dashboard/invitations')
    revalidatePath('/dashboard/equipe')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur invitation:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// MODIFIER LE RÔLE D'UN UTILISATEUR (Admin uniquement)
// =============================================================================

export async function updateUserRole(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier permission
    if (!roleHasPermission(session.user.role, PERMISSIONS.ROLE_ASSIGN)) {
      return { success: false, error: 'Permission refusée. Seul un Admin peut modifier les rôles.' }
    }

    const validated = updateUserRoleSchema.parse({
      userId: formData.get('userId'),
      role: formData.get('role'),
    })

    // Empêcher de se modifier soi-même
    if (validated.userId === session.user.id) {
      return { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' }
    }

    // Vérifier que l'utilisateur appartient au même tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: validated.userId },
      select: { id: true, entrepriseId: true, nom: true, prenom: true, role: true },
    })

    if (!targetUser) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    if (targetUser.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Accès refusé' }
    }

    // Mettre à jour le rôle
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: validated.userId },
        data: { role: validated.role },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'MODIFICATION',
          description: `Modification du rôle de ${targetUser.prenom} ${targetUser.nom}: ${targetUser.role} → ${validated.role}`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
        },
      })
    })

    revalidatePath('/dashboard/equipe')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur modification rôle:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// SUPPRIMER UN UTILISATEUR (Admin uniquement)
// =============================================================================

export async function deleteUser(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier permission
    if (!roleHasPermission(session.user.role, PERMISSIONS.USER_MANAGE)) {
      return { success: false, error: 'Permission refusée. Seul un Admin peut supprimer des utilisateurs.' }
    }

    const validated = deleteUserSchema.parse({
      userId: formData.get('userId'),
    })

    // Empêcher de se supprimer soi-même
    if (validated.userId === session.user.id) {
      return { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' }
    }

    // Vérifier que l'utilisateur appartient au même tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: validated.userId },
      select: { id: true, entrepriseId: true, nom: true, prenom: true, role: true },
    })

    if (!targetUser) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    if (targetUser.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Accès refusé' }
    }

    // Empêcher de supprimer un autre Admin
    if (targetUser.role === 'ADMIN') {
      return { success: false, error: 'Impossible de supprimer un autre administrateur' }
    }

    // Supprimer l'utilisateur et ses données associées
    await prisma.$transaction(async (tx) => {
      // Supprimer les commentaires de l'utilisateur
      await tx.commentaire.deleteMany({
        where: { auteurId: validated.userId },
      })

      // Supprimer les fichiers uploadés
      await tx.fichier.deleteMany({
        where: { uploadeurId: validated.userId },
      })

      // Supprimer les membres d'équipe
      await tx.membreEquipe.deleteMany({
        where: { userId: validated.userId },
      })

      // Supprimer les membres de projet
      await tx.membreProjet.deleteMany({
        where: { userId: validated.userId },
      })

      // Supprimer les invitations envoyées
      await tx.invitation.deleteMany({
        where: { envoyeurId: validated.userId },
      })

      // Supprimer l'historique des actions de l'utilisateur
      await tx.historiqueAction.deleteMany({
        where: { userId: validated.userId },
      })

      // Supprimer l'utilisateur
      await tx.user.delete({
        where: { id: validated.userId },
      })

      // Créer l'entrée d'historique avec l'admin qui a fait la suppression
      await tx.historiqueAction.create({
        data: {
          type: 'SUPPRESSION',
          description: `Suppression de l'utilisateur ${targetUser.prenom} ${targetUser.nom}`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
        },
      })
    })

    revalidatePath('/dashboard/equipe')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur suppression utilisateur:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// ANNULER UNE INVITATION (Admin uniquement)
// =============================================================================

export async function cancelInvitation(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!roleHasPermission(session.user.role, PERMISSIONS.USER_INVITE)) {
      return { success: false, error: 'Permission refusée' }
    }

    const invitationId = formData.get('invitationId') as string
    if (!invitationId) {
      return { success: false, error: 'ID invitation manquant' }
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation || invitation.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Invitation non trouvée' }
    }

    if (invitation.statut !== 'EN_ATTENTE') {
      return { success: false, error: 'Cette invitation ne peut plus être annulée' }
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { statut: 'ANNULEE' },
    })

    revalidatePath('/dashboard/invitations')
    return { success: true }
  } catch (error) {
    console.error('Erreur annulation invitation:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// RENVOYER UNE INVITATION (Admin uniquement)
// =============================================================================

export async function resendInvitation(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!roleHasPermission(session.user.role, PERMISSIONS.USER_INVITE)) {
      return { success: false, error: 'Permission refusée' }
    }

    const invitationId = formData.get('invitationId') as string
    if (!invitationId) {
      return { success: false, error: 'ID invitation manquant' }
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation || invitation.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Invitation non trouvée' }
    }

    // Récupérer les infos de l'entreprise pour l'email (avec logo)
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: session.user.entrepriseId },
      select: { nom: true, logoUrl: true },
    })

    const token = generateInvitationToken()
    const expiresAt = getExpirationDate(7)

    // Créer une nouvelle invitation et annuler l'ancienne
    await prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitationId },
        data: { statut: 'ANNULEE' },
      })

      await tx.invitation.create({
        data: {
          email: invitation.email,
          role: invitation.role,
          token,
          expiresAt,
          entrepriseId: session.user.entrepriseId,
          envoyeurId: session.user.id,
          projetId: invitation.projetId,
        },
      })
    })

    // Envoyer l'email d'invitation
    await sendInvitationEmail({
      email: invitation.email,
      inviterName: `${session.user.prenom} ${session.user.nom}`,
      entrepriseName: entreprise?.nom || 'votre entreprise',
      entrepriseLogoUrl: entreprise?.logoUrl,
      role: invitation.role,
      token,
      expiresAt,
    })

    revalidatePath('/dashboard/invitations')
    return { success: true }
  } catch (error) {
    console.error('Erreur renvoi invitation:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}
