'use server'

import { prisma } from '@/lib/prisma'
import { canAccessSupport } from '@/lib/auth-utils'
import { createCommentaireSchema, type CreateCommentaireInput } from './schemas'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

export type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

function extractMentions(contenu: string): string[] {
  const mentionRegex = /@(\w+)/g
  const matches = contenu.match(mentionRegex)
  return matches ? matches.map((m) => m.slice(1)) : []
}

export async function createCommentaire(
  data: CreateCommentaireInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, support } = await canAccessSupport(data.supportId)
    const validated = createCommentaireSchema.parse(data)

    // Extraire les mentions du contenu
    const mentionedUsernames = extractMentions(validated.contenu)

    // Trouver les IDs des utilisateurs mentionnés (dans le même tenant)
    let mentionedUserIds: string[] = []
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          entrepriseId: user.entrepriseId,
          OR: mentionedUsernames.map((username) => ({
            OR: [{ prenom: { contains: username } }, { nom: { contains: username } }],
          })),
        },
        select: { id: true },
      })
      mentionedUserIds = mentionedUsers.map((u: { id: string }) => u.id)
    }

    const commentaire = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newCommentaire = await tx.commentaire.create({
        data: {
          contenu: validated.contenu,
          ancrage: validated.ancrage ?? undefined,
          mentions: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
          parentId: validated.parentId,
          supportId: support.id,
          auteurId: user.id,
        },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'COMMENTAIRE',
          description: `Commentaire ajouté`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          supportId: support.id,
          projetId: support.projetId,
          commentaireId: newCommentaire.id,
        },
      })

      return newCommentaire
    })

    revalidatePath(`/dashboard/supports/${data.supportId}`)
    return { success: true, data: { id: commentaire.id } }
  } catch (error) {
    console.error('Erreur création commentaire:', error)
    return { success: false, error: 'Erreur lors de la création du commentaire' }
  }
}

export async function deleteCommentaire(commentaireId: string): Promise<ActionResult> {
  try {
    const commentaire = await prisma.commentaire.findUnique({
      where: { id: commentaireId },
      select: { supportId: true, auteurId: true },
    })

    if (!commentaire) {
      return { success: false, error: 'Commentaire non trouvé' }
    }

    const { user, roleProjet } = await canAccessSupport(commentaire.supportId)

    // Seul l'auteur ou un admin/manager peut supprimer
    if (commentaire.auteurId !== user.id && roleProjet === 'COLLABORATEUR') {
      return { success: false, error: 'Permission refusée' }
    }

    await prisma.commentaire.delete({
      where: { id: commentaireId },
    })

    revalidatePath(`/dashboard/supports/${commentaire.supportId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression commentaire:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
