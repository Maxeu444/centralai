import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type Role, getRolePermissions } from '@/lib/rbac'
import type { UserPermissionContext } from '@/components/auth'

/**
 * Prépare le contexte des permissions pour le PermissionProvider
 * À utiliser dans les layouts et pages serveur
 */
export async function getPermissionContext(): Promise<UserPermissionContext | null> {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }
  
  const user = session.user
  const role = user.role as Role
  
  return {
    role,
    permissions: getRolePermissions(role),
    userId: user.id,
    entrepriseId: user.entrepriseId,
  }
}

/**
 * Prépare le contexte des permissions avec le contexte projet
 */
export async function getPermissionContextWithProject(
  projetId: string
): Promise<UserPermissionContext | null> {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }
  
  const user = session.user
  const role = user.role as Role
  
  // Récupérer le rôle dans le projet
  const membre = await prisma.membreProjet.findUnique({
    where: {
      userId_projetId: {
        userId: user.id,
        projetId,
      },
    },
  })
  
  const isProjectMember = !!membre
  const projectRole = membre?.role as Role | undefined
  
  // Admin a accès même sans être membre
  if (!isProjectMember && role !== 'ADMIN') {
    return null
  }
  
  return {
    role,
    permissions: getRolePermissions(role),
    userId: user.id,
    entrepriseId: user.entrepriseId,
    projectRole: projectRole || (role === 'ADMIN' ? 'ADMIN' : undefined),
    isProjectMember,
  }
}

/**
 * Prépare le contexte des permissions avec le contexte support
 */
export async function getPermissionContextWithSupport(
  supportId: string
): Promise<(UserPermissionContext & { isCreator: boolean; supportStatut: string }) | null> {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }
  
  const user = session.user
  const role = user.role as Role
  
  // Récupérer le support et vérifier l'accès
  const support = await prisma.support.findUnique({
    where: { id: supportId },
    select: {
      id: true,
      projetId: true,
      createurId: true,
      statut: true,
      entrepriseId: true,
    },
  })
  
  if (!support || support.entrepriseId !== user.entrepriseId) {
    return null
  }
  
  // Récupérer le rôle dans le projet
  const membre = await prisma.membreProjet.findUnique({
    where: {
      userId_projetId: {
        userId: user.id,
        projetId: support.projetId,
      },
    },
  })
  
  const isProjectMember = !!membre
  const projectRole = membre?.role as Role | undefined
  
  // Admin a accès même sans être membre
  if (!isProjectMember && role !== 'ADMIN') {
    return null
  }
  
  return {
    role,
    permissions: getRolePermissions(role),
    userId: user.id,
    entrepriseId: user.entrepriseId,
    projectRole: projectRole || (role === 'ADMIN' ? 'ADMIN' : undefined),
    isProjectMember,
    isCreator: support.createurId === user.id,
    supportStatut: support.statut,
  }
}
