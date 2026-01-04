/**
 * API Routes pour les projets
 * 
 * Routes protégées avec guards RBAC
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireProjectCreate,
  createErrorResponse,
} from '@/lib/guards'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

const createProjectSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  description: z.string().max(1000).optional(),
})

// =============================================================================
// GET /api/projects - Liste des projets accessibles
// =============================================================================

export async function GET() {
  try {
    const user = await requireAuth()
    
    // Admin voit tous les projets du tenant
    // Autres voient seulement ceux où ils sont membres
    const projets = await prisma.projet.findMany({
      where: {
        entrepriseId: user.entrepriseId,
        archived: false,
        ...(user.role !== 'ADMIN' && {
          membres: {
            some: { userId: user.id },
          },
        }),
      },
      include: {
        _count: {
          select: {
            membres: true,
            supports: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
    
    return Response.json({ projets })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// =============================================================================
// POST /api/projects - Créer un projet (Manager/Admin)
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Vérifier la permission de créer un projet
    const user = await requireProjectCreate()
    
    const body = await request.json()
    const validated = createProjectSchema.parse(body)
    
    // Générer un slug unique
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
    const projet = await prisma.$transaction(async (tx) => {
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
    
    return Response.json({ projet }, { status: 201 })
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
