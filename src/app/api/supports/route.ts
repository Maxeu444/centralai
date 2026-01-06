/**
 * API Routes pour les supports
 * 
 * GET /api/supports - Liste des supports accessibles
 * POST /api/supports - Créer un support (Collab+)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireSupportCreate,
  createErrorResponse,
} from '@/lib/guards'
import { isRoleAtLeast } from '@/lib/rbac'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const createSupportSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(200),
  description: z.string().optional(),
  projetId: z.string().cuid('ID projet invalide'),
  type: z.enum(['PRINT', 'WEB', 'VIDEO', 'SOCIAL', 'AUTRE']).default('AUTRE'),
})

// =============================================================================
// GET /api/supports - Liste des supports accessibles
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const projetId = searchParams.get('projetId')
    const statut = searchParams.get('statut')
    
    // Construire le filtre de base
    const whereClause: Record<string, unknown> = {
      projet: {
        entrepriseId: user.entrepriseId,
      },
    }
    
    // Filtrer par projet si spécifié
    if (projetId) {
      whereClause.projetId = projetId
    }
    
    // Filtrer par statut si spécifié (utilise l'enum StatutSupport)
    if (statut) {
      whereClause.statut = statut
    }
    
    // Si pas admin, filtrer selon les projets dont l'utilisateur est membre
    if (!isRoleAtLeast(user.role, 'ADMIN')) {
      whereClause.projet = {
        ...whereClause.projet as object,
        membres: {
          some: { userId: user.id },
        },
      }
    }
    
    const supports = await prisma.support.findMany({
      where: whereClause,
      include: {
        projet: {
          select: { id: true, nom: true, slug: true },
        },
        createur: {
          select: { id: true, nom: true, prenom: true },
        },
        _count: {
          select: {
            fichiers: true,
            commentaires: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
    
    return Response.json({ supports })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// =============================================================================
// POST /api/supports - Créer un support
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createSupportSchema.parse(body)
    
    // Vérifier la permission de créer un support dans ce projet
    const { user } = await requireSupportCreate(validated.projetId)
    
    // Créer le support (statut BROUILLON par défaut via le schéma Prisma)
    const support = await prisma.$transaction(async (tx) => {
      const newSupport = await tx.support.create({
        data: {
          nom: validated.nom,
          description: validated.description,
          projetId: validated.projetId,
          createurId: user.id,
          entrepriseId: user.entrepriseId,
          type: validated.type,
          // statut: 'BROUILLON' est la valeur par défaut dans le schéma
        },
        include: {
          projet: {
            select: { id: true, nom: true, slug: true },
          },
          createur: {
            select: { id: true, nom: true, prenom: true },
          },
        },
      })
      
      // Audit
      await tx.historiqueAction.create({
        data: {
          type: 'CREATION',
          description: `Création du support "${validated.nom}"`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          projetId: validated.projetId,
          supportId: newSupport.id,
        },
      })
      
      return newSupport
    })
    
    return Response.json({ support }, { status: 201 })
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
