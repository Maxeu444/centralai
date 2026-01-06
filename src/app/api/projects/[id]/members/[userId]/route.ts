/**
 * API Route pour modifier/supprimer un membre spécifique d'un projet
 * 
 * PUT/DELETE /api/projects/[id]/members/[userId]
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireProjectMembersManagement,
  createErrorResponse,
  ForbiddenError,
  NotFoundError,
} from '@/lib/guards'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const updateMemberSchema = z.object({
  role: z.enum(['COLLABORATEUR', 'MANAGER', 'ADMIN']),
})

// =============================================================================
// TYPES
// =============================================================================

type RouteContext = {
  params: Promise<{ id: string; userId: string }>
}

// =============================================================================
// PUT /api/projects/[id]/members/[userId] - Modifier le rôle d'un membre
// =============================================================================

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projetId, userId: targetUserId } = await context.params
    
    // Vérifier la permission de gérer les membres
    const { user } = await requireProjectMembersManagement(projetId)
    
    const body = await request.json()
    const validated = updateMemberSchema.parse(body)
    
    // Vérifier que le membre existe
    const membre = await prisma.membreProjet.findUnique({
      where: {
        userId_projetId: {
          userId: targetUserId,
          projetId,
        },
      },
      include: {
        user: {
          select: { nom: true, prenom: true },
        },
      },
    })
    
    if (!membre) {
      throw new NotFoundError('Membre non trouvé dans ce projet')
    }
    
    // Empêcher de se modifier soi-même (éviter de perdre ses droits)
    if (targetUserId === user.id) {
      throw new ForbiddenError('Vous ne pouvez pas modifier votre propre rôle')
    }
    
    // Mettre à jour le rôle
    const updatedMembre = await prisma.membreProjet.update({
      where: {
        userId_projetId: {
          userId: targetUserId,
          projetId,
        },
      },
      data: { role: validated.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
      },
    })
    
    // Audit
    await prisma.historiqueAction.create({
      data: {
        type: 'MODIFICATION',
        description: `Modification du rôle de ${membre.user.prenom} ${membre.user.nom} en ${validated.role}`,
        entrepriseId: user.entrepriseId,
        userId: user.id,
        projetId,
      },
    })
    
    return Response.json({ membre: updatedMembre })
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

// =============================================================================
// DELETE /api/projects/[id]/members/[userId] - Retirer un membre du projet
// =============================================================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projetId, userId: targetUserId } = await context.params
    
    // Vérifier la permission de gérer les membres
    const { user } = await requireProjectMembersManagement(projetId)
    
    // Vérifier que le membre existe
    const membre = await prisma.membreProjet.findUnique({
      where: {
        userId_projetId: {
          userId: targetUserId,
          projetId,
        },
      },
      include: {
        user: {
          select: { nom: true, prenom: true },
        },
      },
    })
    
    if (!membre) {
      throw new NotFoundError('Membre non trouvé dans ce projet')
    }
    
    // Empêcher de se retirer soi-même
    if (targetUserId === user.id) {
      throw new ForbiddenError('Vous ne pouvez pas vous retirer vous-même du projet')
    }
    
    // Supprimer le membre
    await prisma.membreProjet.delete({
      where: {
        userId_projetId: {
          userId: targetUserId,
          projetId,
        },
      },
    })
    
    // Audit
    await prisma.historiqueAction.create({
      data: {
        type: 'SUPPRESSION',
        description: `Retrait de ${membre.user.prenom} ${membre.user.nom} du projet`,
        entrepriseId: user.entrepriseId,
        userId: user.id,
        projetId,
      },
    })
    
    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
