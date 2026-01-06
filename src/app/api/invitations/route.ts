/**
 * API Routes pour les invitations
 * 
 * GET /api/invitations - Liste des invitations (Admin)
 * POST /api/invitations - Créer une invitation (Admin)
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireUserInvite,
  requireAuth,
  createErrorResponse,
  ForbiddenError,
} from '@/lib/guards'
import { roleHasPermission, PERMISSIONS } from '@/lib/rbac'
import { z } from 'zod'
import { randomBytes } from 'crypto'

// =============================================================================
// SCHEMAS
// =============================================================================

const createInvitationSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['COLLABORATEUR', 'MANAGER', 'ADMIN']).default('COLLABORATEUR'),
  projetId: z.string().cuid().optional(),
})

// =============================================================================
// HELPERS
// =============================================================================

function generateInvitationToken(): string {
  return randomBytes(32).toString('hex')
}

function getExpirationDate(days: number = 7): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// =============================================================================
// GET /api/invitations - Liste des invitations
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Vérifier la permission de voir les invitations
    if (!roleHasPermission(user.role, PERMISSIONS.USER_INVITE)) {
      throw new ForbiddenError('Vous n\'avez pas la permission de voir les invitations')
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'EN_ATTENTE', 'ACCEPTEE', 'EXPIREE', 'all'
    
    // Construire le filtre
    const whereClause: Record<string, unknown> = {
      entrepriseId: user.entrepriseId,
    }
    
    // Filtrer par statut si spécifié
    if (status && status !== 'all') {
      whereClause.statut = status
    }
    
    const invitations = await prisma.invitation.findMany({
      where: whereClause,
      include: {
        envoyeur: {
          select: { id: true, nom: true, prenom: true, email: true },
        },
        projet: {
          select: { id: true, nom: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return Response.json({ invitations })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// =============================================================================
// POST /api/invitations - Créer une invitation
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Vérifier la permission d'inviter
    const user = await requireUserInvite()
    
    const body = await request.json()
    const validated = createInvitationSchema.parse(body)
    
    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })
    
    if (existingUser) {
      return Response.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      )
    }
    
    // Vérifier s'il existe déjà une invitation en attente
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: validated.email,
        entrepriseId: user.entrepriseId,
        statut: 'EN_ATTENTE',
        expiresAt: { gt: new Date() },
      },
    })
    
    if (existingInvitation) {
      return Response.json(
        { error: 'Une invitation est déjà en cours pour cet email' },
        { status: 409 }
      )
    }
    
    // Vérifier que le projet spécifié appartient au tenant
    if (validated.projetId) {
      const projet = await prisma.projet.findUnique({
        where: {
          id: validated.projetId,
        },
      })
      
      if (!projet || projet.entrepriseId !== user.entrepriseId) {
        throw new ForbiddenError('Le projet spécifié n\'existe pas ou ne vous appartient pas')
      }
    }
    
    // Créer l'invitation
    const invitation = await prisma.$transaction(async (tx) => {
      const newInvitation = await tx.invitation.create({
        data: {
          email: validated.email,
          role: validated.role,
          token: generateInvitationToken(),
          expiresAt: getExpirationDate(7),
          entrepriseId: user.entrepriseId,
          envoyeurId: user.id,
          projetId: validated.projetId,
        },
        include: {
          envoyeur: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
          projet: {
            select: { id: true, nom: true },
          },
        },
      })
      
      // Audit
      await tx.historiqueAction.create({
        data: {
          type: 'INVITATION_ENVOYEE',
          description: `Invitation envoyée à ${validated.email} (rôle: ${validated.role})`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
        },
      })
      
      return newInvitation
    })
    
    // TODO: Envoyer l'email d'invitation
    // await sendInvitationEmail(invitation.email, invitation.token)
    
    return Response.json({ 
      invitation,
      message: 'Invitation créée avec succès',
      // En dev, retourner le token pour les tests
      ...(process.env.NODE_ENV === 'development' && { token: invitation.token }),
    }, { status: 201 })
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
