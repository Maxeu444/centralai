'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { roleHasPermission, PERMISSIONS } from '@/lib/rbac'

// =============================================================================
// SCHEMAS
// =============================================================================

const createEquipeSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
  couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide').optional(),
})

const updateEquipeSchema = z.object({
  equipeId: z.string().cuid(),
  nom: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
  couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide').optional(),
})

const addMemberSchema = z.object({
  equipeId: z.string().cuid(),
  userId: z.string().cuid(),
})

const removeMemberSchema = z.object({
  equipeId: z.string().cuid(),
  userId: z.string().cuid(),
})

// =============================================================================
// TYPES
// =============================================================================

type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string }

// =============================================================================
// CRÉER UNE ÉQUIPE (Admin/Manager)
// =============================================================================

export async function createEquipe(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier permission (Admin ou Manager peuvent créer des équipes)
    if (!roleHasPermission(session.user.role, PERMISSIONS.PROJECT_CREATE)) {
      return { success: false, error: 'Permission refusée' }
    }

    const validated = createEquipeSchema.parse({
      nom: formData.get('nom'),
      description: formData.get('description') || undefined,
      couleur: formData.get('couleur') || undefined,
    })

    // Vérifier si une équipe avec ce nom existe déjà
    const existing = await prisma.equipe.findUnique({
      where: {
        entrepriseId_nom: {
          entrepriseId: session.user.entrepriseId,
          nom: validated.nom,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Une équipe avec ce nom existe déjà' }
    }

    const equipe = await prisma.$transaction(async (tx) => {
      const newEquipe = await tx.equipe.create({
        data: {
          nom: validated.nom,
          description: validated.description,
          couleur: validated.couleur || '#6366f1',
          entrepriseId: session.user.entrepriseId,
        },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'CREATION',
          description: `Équipe "${validated.nom}" créée`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
        },
      })

      return newEquipe
    })

    revalidatePath('/dashboard/equipe')
    return { success: true, data: { id: equipe.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur création équipe:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// MODIFIER UNE ÉQUIPE (Admin/Manager)
// =============================================================================

export async function updateEquipe(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!roleHasPermission(session.user.role, PERMISSIONS.PROJECT_CREATE)) {
      return { success: false, error: 'Permission refusée' }
    }

    const validated = updateEquipeSchema.parse({
      equipeId: formData.get('equipeId'),
      nom: formData.get('nom'),
      description: formData.get('description') || undefined,
      couleur: formData.get('couleur') || undefined,
    })

    // Vérifier que l'équipe appartient à l'entreprise
    const equipe = await prisma.equipe.findUnique({
      where: { id: validated.equipeId },
    })

    if (!equipe || equipe.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Équipe non trouvée' }
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé
    if (validated.nom !== equipe.nom) {
      const existing = await prisma.equipe.findUnique({
        where: {
          entrepriseId_nom: {
            entrepriseId: session.user.entrepriseId,
            nom: validated.nom,
          },
        },
      })

      if (existing) {
        return { success: false, error: 'Une équipe avec ce nom existe déjà' }
      }
    }

    await prisma.equipe.update({
      where: { id: validated.equipeId },
      data: {
        nom: validated.nom,
        description: validated.description,
        couleur: validated.couleur,
      },
    })

    revalidatePath('/dashboard/equipe')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur modification équipe:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// SUPPRIMER UNE ÉQUIPE (Admin uniquement)
// =============================================================================

export async function deleteEquipe(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!roleHasPermission(session.user.role, PERMISSIONS.USER_DELETE)) {
      return { success: false, error: 'Permission refusée. Seul un Admin peut supprimer une équipe.' }
    }

    const equipeId = formData.get('equipeId') as string
    if (!equipeId) {
      return { success: false, error: 'ID équipe manquant' }
    }

    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
    })

    if (!equipe || equipe.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Équipe non trouvée' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.equipe.delete({
        where: { id: equipeId },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'SUPPRESSION',
          description: `Équipe "${equipe.nom}" supprimée`,
          entrepriseId: session.user.entrepriseId,
          userId: session.user.id,
        },
      })
    })

    revalidatePath('/dashboard/equipe')
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression équipe:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// AJOUTER UN MEMBRE À UNE ÉQUIPE (Admin/Manager)
// =============================================================================

export async function addEquipeMember(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!roleHasPermission(session.user.role, PERMISSIONS.PROJECT_CREATE)) {
      return { success: false, error: 'Permission refusée' }
    }

    const validated = addMemberSchema.parse({
      equipeId: formData.get('equipeId'),
      userId: formData.get('userId'),
    })

    // Vérifier que l'équipe appartient à l'entreprise
    const equipe = await prisma.equipe.findUnique({
      where: { id: validated.equipeId },
    })

    if (!equipe || equipe.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Équipe non trouvée' }
    }

    // Vérifier que l'utilisateur appartient à la même entreprise
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
    })

    if (!user || user.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // Vérifier si déjà membre
    const existingMember = await prisma.membreEquipe.findUnique({
      where: {
        userId_equipeId: {
          userId: validated.userId,
          equipeId: validated.equipeId,
        },
      },
    })

    if (existingMember) {
      return { success: false, error: 'Cet utilisateur est déjà membre de cette équipe' }
    }

    await prisma.membreEquipe.create({
      data: {
        userId: validated.userId,
        equipeId: validated.equipeId,
      },
    })

    revalidatePath('/dashboard/equipe')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Erreur ajout membre équipe:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// RETIRER UN MEMBRE D'UNE ÉQUIPE (Admin/Manager)
// =============================================================================

export async function removeEquipeMember(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!roleHasPermission(session.user.role, PERMISSIONS.PROJECT_CREATE)) {
      return { success: false, error: 'Permission refusée' }
    }

    const validated = removeMemberSchema.parse({
      equipeId: formData.get('equipeId'),
      userId: formData.get('userId'),
    })

    // Vérifier que l'équipe appartient à l'entreprise
    const equipe = await prisma.equipe.findUnique({
      where: { id: validated.equipeId },
    })

    if (!equipe || equipe.entrepriseId !== session.user.entrepriseId) {
      return { success: false, error: 'Équipe non trouvée' }
    }

    // Supprimer le membre
    await prisma.membreEquipe.delete({
      where: {
        userId_equipeId: {
          userId: validated.userId,
          equipeId: validated.equipeId,
        },
      },
    })

    revalidatePath('/dashboard/equipe')
    return { success: true }
  } catch (error) {
    console.error('Erreur retrait membre équipe:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}
