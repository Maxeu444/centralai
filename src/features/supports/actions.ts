'use server'

import { prisma } from '@/lib/prisma'
import { canAccessProject, canAccessSupport, hasProjectPermission } from '@/lib/auth-utils'
import {
  createSupportSchema,
  updateSupportSchema,
  changeStatutSchema,
  type CreateSupportInput,
  type UpdateSupportInput,
  type ChangeStatutInput,
} from './schemas'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

type StatutSupport = 'BROUILLON' | 'EN_VALIDATION' | 'VALIDE' | 'REFUSE'

export type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

export async function createSupport(data: CreateSupportInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, projet } = await canAccessProject(data.projetId)
    const validated = createSupportSchema.parse(data)

    const support = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newSupport = await tx.support.create({
        data: {
          nom: validated.nom,
          description: validated.description,
          type: validated.type,
          statut: 'BROUILLON',
          projetId: projet.id,
          createurId: user.id,
          entrepriseId: user.entrepriseId,
        },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'CREATION',
          description: `Création du support "${newSupport.nom}"`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId: projet.id,
          supportId: newSupport.id,
        },
      })

      return newSupport
    })

    revalidatePath(`/dashboard/projets/${projet.id}`)
    revalidatePath('/dashboard/supports')
    return { success: true, data: { id: support.id } }
  } catch (error) {
    console.error('Erreur création support:', error)
    return { success: false, error: 'Erreur lors de la création du support' }
  }
}

export async function updateSupport(
  supportId: string,
  data: UpdateSupportInput
): Promise<ActionResult> {
  try {
    const { user, support, roleProjet } = await canAccessSupport(supportId)
    const validated = updateSupportSchema.parse(data)

    // Seul le créateur ou un manager+ peut modifier
    const supportFull = await prisma.support.findUnique({
      where: { id: supportId },
      select: { createurId: true },
    })

    if (supportFull?.createurId !== user.id && !hasProjectPermission(roleProjet, 'MANAGER')) {
      return { success: false, error: 'Permission refusée' }
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.support.update({
        where: { id: supportId },
        data: validated,
      })

      await tx.historiqueAction.create({
        data: {
          type: 'MODIFICATION',
          description: `Modification du support`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          supportId,
          projetId: support.projetId,
        },
      })
    })

    revalidatePath(`/dashboard/supports/${supportId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur modification support:', error)
    return { success: false, error: 'Erreur lors de la modification' }
  }
}

export async function deleteSupport(supportId: string): Promise<ActionResult> {
  try {
    const { user, support, roleProjet } = await canAccessSupport(supportId)

    if (!hasProjectPermission(roleProjet, 'MANAGER')) {
      return { success: false, error: 'Permission refusée' }
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.historiqueAction.create({
        data: {
          type: 'SUPPRESSION',
          description: `Suppression du support`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId: support.projetId,
        },
      })

      await tx.support.delete({
        where: { id: supportId },
      })
    })

    revalidatePath(`/dashboard/projets/${support.projetId}`)
    revalidatePath('/dashboard/supports')
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression support:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

export async function changeStatut(
  supportId: string,
  data: ChangeStatutInput
): Promise<ActionResult> {
  try {
    const { user, support, roleProjet } = await canAccessSupport(supportId)
    const validated = changeStatutSchema.parse(data)

    const currentSupport = await prisma.support.findUnique({
      where: { id: supportId },
      select: { statut: true, createurId: true },
    })

    if (!currentSupport) {
      return { success: false, error: 'Support non trouvé' }
    }

    let newStatut: StatutSupport
    let actionType: 'DEMANDE_VALIDATION' | 'VALIDATION' | 'REFUS'

    switch (validated.action) {
      case 'DEMANDER_VALIDATION':
        // Seul le créateur ou un membre peut demander la validation
        if (currentSupport.statut !== 'BROUILLON' && currentSupport.statut !== 'REFUSE') {
          return { success: false, error: 'Le support doit être en brouillon ou refusé' }
        }
        newStatut = 'EN_VALIDATION'
        actionType = 'DEMANDE_VALIDATION'
        break

      case 'VALIDER':
        // Seul un manager+ peut valider
        if (!hasProjectPermission(roleProjet, 'MANAGER')) {
          return { success: false, error: 'Seul un manager peut valider' }
        }
        if (currentSupport.statut !== 'EN_VALIDATION') {
          return { success: false, error: 'Le support doit être en validation' }
        }
        newStatut = 'VALIDE'
        actionType = 'VALIDATION'
        break

      case 'REFUSER':
        // Seul un manager+ peut refuser
        if (!hasProjectPermission(roleProjet, 'MANAGER')) {
          return { success: false, error: 'Seul un manager peut refuser' }
        }
        if (currentSupport.statut !== 'EN_VALIDATION') {
          return { success: false, error: 'Le support doit être en validation' }
        }
        newStatut = 'REFUSE'
        actionType = 'REFUS'
        break

      default:
        return { success: false, error: 'Action non reconnue' }
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.support.update({
        where: { id: supportId },
        data: { statut: newStatut },
      })

      await tx.historiqueAction.create({
        data: {
          type: actionType,
          description: validated.commentaire || `Changement de statut: ${currentSupport.statut} → ${newStatut}`,
          metadata: {
            ancienStatut: currentSupport.statut,
            nouveauStatut: newStatut,
            commentaire: validated.commentaire,
          },
          entrepriseId: user.entrepriseId,
          userId: user.id,
          supportId,
          projetId: support.projetId,
        },
      })
    })

    revalidatePath(`/dashboard/supports/${supportId}`)
    revalidatePath(`/dashboard/projets/${support.projetId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur changement statut:', error)
    return { success: false, error: 'Erreur lors du changement de statut' }
  }
}
