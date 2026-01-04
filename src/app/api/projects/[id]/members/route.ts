/**
 * API Routes pour la gestion des membres d'un projet
 * 
 * Routes protégées avec guards RBAC
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireProjectMembersManagement,
  requireProjectAccess,
  createErrorResponse,
  ForbiddenError,
  NotFoundError,
} from '@/lib/guards'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const addMemberSchema = z.object({
  userId: z.string().cuid('ID utilisateur invalide'),
  role: z.enum(['COLLABORATEUR', 'MANAGER', 'ADMIN']).default('COLLABORATEUR'),
})

// =============================================================================
// TYPES
// =============================================================================

type RouteContext = {
  params: Promise<{ id: string }>
}

// =============================================================================
// GET /api/projects/[id]/members - Liste des membres du projet
// =============================================================================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projetId } = await context.params
    
    // Vérifier l'accès au projet
    await requireProjectAccess(projetId)
    
    const membres = await prisma.membreProjet.findMany({
      where: { projetId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    
    return Response.json({ membres })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// =============================================================================
// POST /api/projects/[id]/members - Ajouter un membre (Manager/Admin)
// =============================================================================

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: projetId } = await context.params
    
    // Vérifier la permission de gérer les membres
    const { user } = await requireProjectMembersManagement(projetId)
    
    const body = await request.json()
    const validated = addMemberSchema.parse(body)
    
    // Vérifier que l'utilisateur cible appartient au même tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: validated.userId },
      select: { id: true, entrepriseId: true, nom: true, prenom: true },
    })
    
    if (!targetUser) {
      throw new NotFoundError('Utilisateur non trouvé')
    }
    
    if (targetUser.entrepriseId !== user.entrepriseId) {
      throw new ForbiddenError('Cet utilisateur n\'appartient pas à votre entreprise')
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
      return Response.json(
        { error: 'Cet utilisateur est déjà membre du projet' },
        { status: 409 }
      )
    }
    
    // Ajouter le membre
    const membre = await prisma.membreProjet.create({
      data: {
        userId: validated.userId,
        projetId,
        role: validated.role,
      },
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
        description: `Ajout de ${targetUser.prenom} ${targetUser.nom} au projet`,
        entrepriseId: user.entrepriseId,
        userId: user.id,
        projetId,
      },
    })
    
    return Response.json({ membre }, { status: 201 })
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
