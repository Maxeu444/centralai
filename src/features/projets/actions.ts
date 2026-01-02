'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, canAccessProject, hasProjectPermission, type Role } from '@/lib/auth-utils'
import { createProjetSchema, updateProjetSchema, addMembreSchema } from './schemas'
import { slugify } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

export type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

export async function createProjet(data: {
  nom: string
  description?: string
}): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const user = await requireAuth()
    const validated = createProjetSchema.parse(data)

    // Vérifier que l'utilisateur peut créer un projet (au moins manager)
    if (user.role === 'COLLABORATEUR') {
      return { success: false, error: 'Permission refusée' }
    }

    // Générer le slug
    let slug = slugify(validated.nom)
    const existing = await prisma.projet.findUnique({
      where: {
        entrepriseId_slug: {
          entrepriseId: user.entrepriseId,
          slug,
        },
      },
    })

    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    // Créer le projet et ajouter l'utilisateur comme membre admin
    const projet = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newProjet = await tx.projet.create({
        data: {
          nom: validated.nom,
          description: validated.description,
          slug,
          entrepriseId: user.entrepriseId,
        },
      })

      // Ajouter le créateur comme admin du projet
      await tx.membreProjet.create({
        data: {
          userId: user.id,
          projetId: newProjet.id,
          role: 'ADMIN',
        },
      })

      // Audit
      await tx.historiqueAction.create({
        data: {
          type: 'CREATION',
          description: `Création du projet "${newProjet.nom}"`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId: newProjet.id,
        },
      })

      return newProjet
    })

    revalidatePath('/dashboard/projets')
    return { success: true, data: { id: projet.id, slug: projet.slug } }
  } catch (error) {
    console.error('Erreur création projet:', error)
    return { success: false, error: 'Erreur lors de la création du projet' }
  }
}

export async function updateProjet(
  projetId: string,
  data: { nom?: string; description?: string }
): Promise<ActionResult> {
  try {
    const { user, roleProjet } = await canAccessProject(projetId)

    if (!hasProjectPermission(roleProjet, 'MANAGER')) {
      return { success: false, error: 'Permission refusée' }
    }

    const validated = updateProjetSchema.parse(data)

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.projet.update({
        where: { id: projetId },
        data: validated,
      })

      await tx.historiqueAction.create({
        data: {
          type: 'MODIFICATION',
          description: `Modification du projet`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId,
        },
      })
    })

    revalidatePath('/dashboard/projets')
    revalidatePath(`/dashboard/projets/${projetId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur modification projet:', error)
    return { success: false, error: 'Erreur lors de la modification' }
  }
}

export async function deleteProjet(projetId: string): Promise<ActionResult> {
  try {
    const { user, roleProjet } = await canAccessProject(projetId)

    if (!hasProjectPermission(roleProjet, 'ADMIN')) {
      return { success: false, error: 'Seul un admin peut supprimer le projet' }
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.historiqueAction.create({
        data: {
          type: 'SUPPRESSION',
          description: `Suppression du projet`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId,
        },
      })

      await tx.projet.delete({
        where: { id: projetId },
      })
    })

    revalidatePath('/dashboard/projets')
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression projet:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

export async function archiveProjet(projetId: string): Promise<ActionResult> {
  try {
    const { user, roleProjet } = await canAccessProject(projetId)

    if (!hasProjectPermission(roleProjet, 'ADMIN')) {
      return { success: false, error: 'Seul un admin peut archiver le projet' }
    }

    await prisma.projet.update({
      where: { id: projetId },
      data: { archived: true },
    })

    revalidatePath('/dashboard/projets')
    return { success: true }
  } catch (error) {
    console.error('Erreur archivage projet:', error)
    return { success: false, error: 'Erreur lors de l\'archivage' }
  }
}

export async function addMembre(
  projetId: string,
  data: { userId: string; role: Role }
): Promise<ActionResult> {
  try {
    const { user, roleProjet } = await canAccessProject(projetId)

    if (!hasProjectPermission(roleProjet, 'MANAGER')) {
      return { success: false, error: 'Permission refusée' }
    }

    const validated = addMembreSchema.parse(data)

    // Vérifier que l'utilisateur cible appartient au même tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: validated.userId },
      select: { entrepriseId: true },
    })

    if (!targetUser || targetUser.entrepriseId !== user.entrepriseId) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMembre = await prisma.membreProjet.findUnique({
      where: {
        userId_projetId: {
          userId: validated.userId,
          projetId,
        },
      },
    })

    if (existingMembre) {
      return { success: false, error: 'Cet utilisateur est déjà membre du projet' }
    }

    await prisma.membreProjet.create({
      data: {
        userId: validated.userId,
        projetId,
        role: validated.role,
      },
    })

    revalidatePath(`/dashboard/projets/${projetId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur ajout membre:', error)
    return { success: false, error: 'Erreur lors de l\'ajout du membre' }
  }
}

export async function removeMembre(projetId: string, userId: string): Promise<ActionResult> {
  try {
    const { roleProjet } = await canAccessProject(projetId)

    if (!hasProjectPermission(roleProjet, 'MANAGER')) {
      return { success: false, error: 'Permission refusée' }
    }

    await prisma.membreProjet.delete({
      where: {
        userId_projetId: {
          userId,
          projetId,
        },
      },
    })

    revalidatePath(`/dashboard/projets/${projetId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression membre:', error)
    return { success: false, error: 'Erreur lors de la suppression du membre' }
  }
}

export async function updateMembreRole(
  projetId: string,
  userId: string,
  role: Role
): Promise<ActionResult> {
  try {
    const { roleProjet } = await canAccessProject(projetId)

    if (!hasProjectPermission(roleProjet, 'ADMIN')) {
      return { success: false, error: 'Seul un admin peut modifier les rôles' }
    }

    await prisma.membreProjet.update({
      where: {
        userId_projetId: {
          userId,
          projetId,
        },
      },
      data: { role },
    })

    revalidatePath(`/dashboard/projets/${projetId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur modification rôle:', error)
    return { success: false, error: 'Erreur lors de la modification du rôle' }
  }
}
