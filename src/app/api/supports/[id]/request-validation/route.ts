/**
 * API Route pour demander une validation sur un support
 * 
 * POST /api/supports/[id]/request-validation
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireSupportRequestValidation,
  createErrorResponse,
  ForbiddenError,
} from '@/lib/guards'

// =============================================================================
// TYPES
// =============================================================================

type RouteContext = {
  params: Promise<{ id: string }>
}

// =============================================================================
// POST /api/supports/[id]/request-validation
// =============================================================================

export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: supportId } = await context.params
    
    // Vérifier la permission de demander une validation
    const { user, support } = await requireSupportRequestValidation(supportId)
    
    // Vérifier que le support est bien en brouillon
    if (support.statut !== 'BROUILLON') {
      throw new ForbiddenError(
        `Ce support ne peut pas être soumis à validation (statut actuel: ${support.statut})`
      )
    }
    
    // Mettre à jour le statut vers EN_VALIDATION
    const updatedSupport = await prisma.$transaction(async (tx) => {
      const updated = await tx.support.update({
        where: { id: supportId },
        data: { statut: 'EN_VALIDATION' },
        include: {
          projet: {
            select: { id: true, nom: true },
          },
        },
      })
      
      // Audit
      await tx.historiqueAction.create({
        data: {
          type: 'DEMANDE_VALIDATION',
          description: `Demande de validation pour le support "${support.nom}"`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId: support.projetId,
          supportId,
        },
      })
      
      return updated
    })
    
    return Response.json({ 
      support: updatedSupport,
      message: 'Demande de validation envoyée' 
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
