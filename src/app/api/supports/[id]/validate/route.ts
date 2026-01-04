/**
 * API Route pour valider ou refuser un support
 * 
 * POST /api/supports/[id]/validate - Valider le support (Manager/Admin)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireSupportValidation,
  createErrorResponse,
  ForbiddenError,
} from '@/lib/guards'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const validateSchema = z.object({
  action: z.enum(['approve', 'reject']),
  commentaire: z.string().optional(),
})

// =============================================================================
// TYPES
// =============================================================================

type RouteContext = {
  params: Promise<{ id: string }>
}

// =============================================================================
// POST /api/supports/[id]/validate
// =============================================================================

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: supportId } = await context.params
    
    // Vérifier la permission de valider
    const { user, support } = await requireSupportValidation(supportId)
    
    const body = await request.json()
    const validated = validateSchema.parse(body)
    
    // Vérifier que le support est en attente de validation
    if (support.statut !== 'EN_VALIDATION') {
      throw new ForbiddenError(
        `Ce support n'est pas en attente de validation (statut actuel: ${support.statut})`
      )
    }
    
    // Déterminer le nouveau statut selon l'action
    const newStatut = validated.action === 'approve' ? 'VALIDE' : 'REFUSE'
    const actionType = validated.action === 'approve' ? 'VALIDATION' : 'REFUS'
    
    // Mettre à jour le support
    const updatedSupport = await prisma.$transaction(async (tx) => {
      const updated = await tx.support.update({
        where: { id: supportId },
        data: { statut: newStatut },
        include: {
          projet: {
            select: { id: true, nom: true },
          },
        },
      })
      
      // Créer un commentaire si fourni (notamment pour le rejet)
      if (validated.commentaire) {
        await tx.commentaire.create({
          data: {
            contenu: validated.commentaire,
            supportId,
            auteurId: user.id,
          },
        })
      }
      
      // Audit
      const actionDescription = validated.action === 'approve'
        ? `Validation du support "${support.nom}"`
        : `Rejet du support "${support.nom}"${validated.commentaire ? ` - Motif: ${validated.commentaire}` : ''}`
      
      await tx.historiqueAction.create({
        data: {
          type: actionType,
          description: actionDescription,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId: support.projetId,
          supportId,
        },
      })
      
      return updated
    })
    
    const message = validated.action === 'approve'
      ? 'Support validé avec succès'
      : 'Support refusé'
    
    return Response.json({ 
      support: updatedSupport,
      message 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    return createErrorResponse(error)
  }
}
