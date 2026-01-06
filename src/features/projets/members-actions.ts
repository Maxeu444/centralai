'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const addMemberSchema = z.object({
  projetId: z.string().cuid(),
  userId: z.string().cuid(),
  role: z.enum(['COLLABORATEUR', 'MANAGER', 'ADMIN']),
})

const updateMemberRoleSchema = z.object({
  projetId: z.string().cuid(),
  userId: z.string().cuid(),
  role: z.enum(['COLLABORATEUR', 'MANAGER', 'ADMIN']),
})

const removeMemberSchema = z.object({
  projetId: z.string().cuid(),
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

async function canManageProjectMembers(projetId: string, userId: string, userRole: string) {
  // Admin global peut tout faire
  if (userRole === 'ADMIN') return true
  
  // Vérifier si l'utilisateur est Manager ou Admin du projet
  const membre = await prisma.membreProjet.findUnique({
    where: {
      userId_projetId: { userId, projetId },
    },
  })
  
  return membre && (membre.role === 'ADMIN' || membre.role === 'MANAGER')
}

// =============================================================================
// AJOUTER UN MEMBRE AU PROJET
// =============================================================================

export async function addProjectMember(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    const validated = addMemberSchema.parse({
      projetId: formData.get('projetId'),
      userId: formData.get('userId'),
      role: formData.get('role'),
    })

    // Vérifier que le projet appartient au même tenant
    const projet = await prisma.projet.findUnique({
      where: { id: validated.projetId },
    })

    if (!projet || projet.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Projet non trouvé' }
    }

    // Vérifier la permission
    if (!await canManageProjectMembers(validated.projetId, session.user.id, session.user.role)) {
      return { success: false, error: 'Permission refusée' }
    }

    // Vérifier que l'utilisateur cible appartient au même tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: validated.userId },
      select: { id: true, entrepriseId: true, nom: true, prenom: true },
    })

    if (!targetUser || targetUser.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // Vérifier si déjà membre
    const existingMembre = await prisma.membreProjet.findUnique({
      where: {
        userId_projetId: { userId: validated.userId, projetId: validated.projetId },
      },
    })

    if (existingMembre) {
      return { success: false, error: 'Cet utilisateur est déjà membre du projet' }
    }

    // Ajouter le membre
    await prisma.$transaction(async (tx) => {
      await tx.membreProjet.create({
        data: {
          userId: validated.userId,
          projetId: validated.projetId,
          role: validated.role,
        },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'MODIFICATION',
          description: `Ajout de ${targetUser.prenom} ${targetUser.nom} au projet "${projet.nom}"`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
          projetId: validated.projetId,
        },
      })
    })

    revalidatePath(`/dashboard/projets/${validated.projetId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur ajout membre:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// MODIFIER LE RÔLE D'UN MEMBRE
// =============================================================================

export async function updateProjectMemberRole(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    const validated = updateMemberRoleSchema.parse({
      projetId: formData.get('projetId'),
      userId: formData.get('userId'),
      role: formData.get('role'),
    })

    // Vérifier la permission
    if (!await canManageProjectMembers(validated.projetId, session.user.id, session.user.role)) {
      return { success: false, error: 'Permission refusée' }
    }

    // Empêcher de se modifier soi-même
    if (validated.userId === session.user.id) {
      return { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' }
    }

    // Vérifier que le membre existe
    const membre = await prisma.membreProjet.findUnique({
      where: {
        userId_projetId: { userId: validated.userId, projetId: validated.projetId },
      },
      include: {
        user: { select: { nom: true, prenom: true } },
        projet: { select: { nom: true, entrepriseId: true } },
      },
    })

    if (!membre || membre.projet.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Membre non trouvé' }
    }

    // Mettre à jour
    await prisma.$transaction(async (tx) => {
      await tx.membreProjet.update({
        where: {
          userId_projetId: { userId: validated.userId, projetId: validated.projetId },
        },
        data: { role: validated.role },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'MODIFICATION',
          description: `Modification du rôle de ${membre.user.prenom} ${membre.user.nom}: ${membre.role} → ${validated.role}`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
          projetId: validated.projetId,
        },
      })
    })

    revalidatePath(`/dashboard/projets/${validated.projetId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur modification rôle membre:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// RETIRER UN MEMBRE DU PROJET
// =============================================================================

export async function removeProjectMember(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    const validated = removeMemberSchema.parse({
      projetId: formData.get('projetId'),
      userId: formData.get('userId'),
    })

    // Vérifier la permission
    if (!await canManageProjectMembers(validated.projetId, session.user.id, session.user.role)) {
      return { success: false, error: 'Permission refusée' }
    }

    // Empêcher de se retirer soi-même
    if (validated.userId === session.user.id) {
      return { success: false, error: 'Vous ne pouvez pas vous retirer du projet' }
    }

    // Vérifier que le membre existe
    const membre = await prisma.membreProjet.findUnique({
      where: {
        userId_projetId: { userId: validated.userId, projetId: validated.projetId },
      },
      include: {
        user: { select: { nom: true, prenom: true } },
        projet: { select: { nom: true, entrepriseId: true } },
      },
    })

    if (!membre || membre.projet.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Membre non trouvé' }
    }

    // Supprimer
    await prisma.$transaction(async (tx) => {
      await tx.membreProjet.delete({
        where: {
          userId_projetId: { userId: validated.userId, projetId: validated.projetId },
        },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'SUPPRESSION',
          description: `Retrait de ${membre.user.prenom} ${membre.user.nom} du projet "${membre.projet.nom}"`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
          projetId: validated.projetId,
        },
      })
    })

    revalidatePath(`/dashboard/projets/${validated.projetId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur retrait membre:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}
