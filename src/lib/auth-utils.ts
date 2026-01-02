import { auth, type Role } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export type { Role }

export type SessionUser = {
  id: string
  email: string
  nom: string
  prenom: string
  role: Role
  entrepriseId: string
}

/**
 * Récupère la session utilisateur courante
 * Retourne null si non authentifié
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null
  return session.user as SessionUser
}

/**
 * Exige une authentification. Redirige vers /login si non connecté.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

/**
 * Exige un rôle minimum. Lève une erreur si rôle insuffisant.
 */
const roleHierarchy: Record<Role, number> = {
  COLLABORATEUR: 1,
  MANAGER: 2,
  ADMIN: 3,
}

export async function requireRole(minRole: Role): Promise<SessionUser> {
  const user = await requireAuth()
  if (roleHierarchy[user.role] < roleHierarchy[minRole]) {
    throw new Error('Permission refusée')
  }
  return user
}

/**
 * Vérifie que l'utilisateur a accès au tenant (entreprise)
 */
export async function requireTenant(entrepriseId: string): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.entrepriseId !== entrepriseId) {
    throw new Error('Accès refusé à cette entreprise')
  }
  return user
}

/**
 * Vérifie l'accès à un projet
 * - ADMIN du tenant : accès à tous les projets du tenant
 * - Autres : doivent être membre du projet
 */
export async function canAccessProject(
  projetId: string
): Promise<{ user: SessionUser; projet: { id: string; entrepriseId: string }; roleProjet: Role }> {
  const user = await requireAuth()

  const projet = await prisma.projet.findUnique({
    where: { id: projetId },
    select: { id: true, entrepriseId: true },
  })

  if (!projet) {
    throw new Error('Projet non trouvé')
  }

  // Vérification tenant
  if (projet.entrepriseId !== user.entrepriseId) {
    throw new Error('Accès refusé')
  }

  // Admin a accès à tout
  if (user.role === 'ADMIN') {
    return { user, projet, roleProjet: 'ADMIN' }
  }

  // Vérifier l'appartenance au projet
  const membre = await prisma.membreProjet.findUnique({
    where: {
      userId_projetId: {
        userId: user.id,
        projetId: projet.id,
      },
    },
  })

  if (!membre) {
    throw new Error('Vous n\'êtes pas membre de ce projet')
  }

  return { user, projet, roleProjet: membre.role }
}

/**
 * Vérifie l'accès à un support
 */
export async function canAccessSupport(supportId: string): Promise<{
  user: SessionUser
  support: { id: string; projetId: string; entrepriseId: string }
  roleProjet: Role
}> {
  const user = await requireAuth()

  const support = await prisma.support.findUnique({
    where: { id: supportId },
    select: { id: true, projetId: true, entrepriseId: true },
  })

  if (!support) {
    throw new Error('Support non trouvé')
  }

  // Vérification tenant
  if (support.entrepriseId !== user.entrepriseId) {
    throw new Error('Accès refusé')
  }

  // Admin a accès à tout
  if (user.role === 'ADMIN') {
    return { user, support, roleProjet: 'ADMIN' }
  }

  // Vérifier l'appartenance au projet
  const membre = await prisma.membreProjet.findUnique({
    where: {
      userId_projetId: {
        userId: user.id,
        projetId: support.projetId,
      },
    },
  })

  if (!membre) {
    throw new Error('Vous n\'avez pas accès à ce support')
  }

  return { user, support, roleProjet: membre.role }
}

/**
 * Vérifie qu'un rôle projet permet une action
 */
export function hasProjectPermission(roleProjet: Role, minRole: Role): boolean {
  return roleHierarchy[roleProjet] >= roleHierarchy[minRole]
}
