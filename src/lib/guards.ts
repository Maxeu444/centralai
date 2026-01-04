/**
 * Guards - Fonctions de protection pour routes API et server actions
 * 
 * Ces guards vérifient l'authentification, les permissions et l'accès
 * aux ressources avant d'exécuter une action.
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  type Role, 
  type Permission,
  roleHasPermission,
  getEffectiveRole,
  PERMISSIONS,
  canRequestValidation as rbacCanRequestValidation,
  canUpdateSupport as rbacCanUpdateSupport,
} from '@/lib/rbac'

// =============================================================================
// TYPES
// =============================================================================

export type SessionUser = {
  id: string
  email: string
  nom: string
  prenom: string
  role: Role
  entrepriseId: string
}

export type ProjectAccessResult = {
  user: SessionUser
  projet: {
    id: string
    entrepriseId: string
    nom: string
  }
  roleProjet: Role
  isProjectMember: boolean
}

export type SupportAccessResult = {
  user: SessionUser
  support: {
    id: string
    projetId: string
    entrepriseId: string
    createurId: string
    statut: string
    nom: string
  }
  projet: {
    id: string
    entrepriseId: string
    nom: string
  }
  roleProjet: Role
  isCreator: boolean
}

// =============================================================================
// ERREURS PERSONNALISÉES
// =============================================================================

export class AuthError extends Error {
  constructor(message: string = 'Non authentifié') {
    super(message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Accès refusé') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Ressource non trouvée') {
    super(message)
    this.name = 'NotFoundError'
  }
}

// =============================================================================
// GUARDS DE BASE
// =============================================================================

/**
 * Récupère l'utilisateur de la session courante
 * @returns SessionUser ou null si non connecté
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user) return null
  return session.user as SessionUser
}

/**
 * Exige une authentification
 * @throws AuthError si non connecté
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    throw new AuthError()
  }
  return user
}

/**
 * Vérifie qu'un utilisateur possède une permission
 * @throws ForbiddenError si permission manquante
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAuth()
  
  if (!roleHasPermission(user.role, permission)) {
    throw new ForbiddenError(`Permission requise : ${permission}`)
  }
  
  return user
}

/**
 * Vérifie qu'un utilisateur a un rôle minimum
 * @throws ForbiddenError si rôle insuffisant
 */
export async function requireRole(minRole: Role): Promise<SessionUser> {
  const user = await requireAuth()
  
  const roleHierarchy: Record<Role, number> = {
    COLLABORATEUR: 1,
    MANAGER: 2,
    ADMIN: 3,
  }
  
  if (roleHierarchy[user.role] < roleHierarchy[minRole]) {
    throw new ForbiddenError(`Rôle minimum requis : ${minRole}`)
  }
  
  return user
}

// =============================================================================
// GUARDS DE RESSOURCES
// =============================================================================

/**
 * Vérifie l'accès à un projet
 * - ADMIN du tenant : accès à tous les projets
 * - Autres : doivent être membres
 * 
 * @throws NotFoundError si projet inexistant
 * @throws ForbiddenError si pas d'accès
 */
export async function requireProjectAccess(
  projetId: string,
  minRole?: Role
): Promise<ProjectAccessResult> {
  const user = await requireAuth()
  
  const projet = await prisma.projet.findUnique({
    where: { id: projetId },
    select: { id: true, entrepriseId: true, nom: true },
  })
  
  if (!projet) {
    throw new NotFoundError('Projet non trouvé')
  }
  
  // Vérification tenant
  if (projet.entrepriseId !== user.entrepriseId) {
    throw new ForbiddenError('Accès refusé à ce projet')
  }
  
  // Récupérer le membership
  const membre = await prisma.membreProjet.findUnique({
    where: {
      userId_projetId: {
        userId: user.id,
        projetId: projet.id,
      },
    },
  })
  
  const isProjectMember = !!membre
  
  // Admin a accès à tout
  if (user.role === 'ADMIN') {
    const roleProjet = membre?.role || 'ADMIN'
    return { user, projet, roleProjet: roleProjet as Role, isProjectMember }
  }
  
  // Non-admin doit être membre
  if (!membre) {
    throw new ForbiddenError('Vous n\'êtes pas membre de ce projet')
  }
  
  const roleProjet = membre.role as Role
  
  // Vérifier le rôle minimum si spécifié
  if (minRole) {
    const effectiveRole = getEffectiveRole(user.role, roleProjet)
    const roleHierarchy: Record<Role, number> = {
      COLLABORATEUR: 1,
      MANAGER: 2,
      ADMIN: 3,
    }
    
    if (roleHierarchy[effectiveRole] < roleHierarchy[minRole]) {
      throw new ForbiddenError(`Rôle ${minRole} requis pour cette action`)
    }
  }
  
  return { user, projet, roleProjet, isProjectMember }
}

/**
 * Vérifie l'accès à un support
 * @throws NotFoundError si support inexistant
 * @throws ForbiddenError si pas d'accès
 */
export async function requireSupportAccess(supportId: string): Promise<SupportAccessResult> {
  const user = await requireAuth()
  
  const support = await prisma.support.findUnique({
    where: { id: supportId },
    select: {
      id: true,
      projetId: true,
      entrepriseId: true,
      createurId: true,
      statut: true,
      nom: true,
      projet: {
        select: { id: true, entrepriseId: true, nom: true }
      }
    },
  })
  
  if (!support) {
    throw new NotFoundError('Support non trouvé')
  }
  
  // Vérification tenant
  if (support.entrepriseId !== user.entrepriseId) {
    throw new ForbiddenError('Accès refusé à ce support')
  }
  
  // Récupérer le membership projet
  const membre = await prisma.membreProjet.findUnique({
    where: {
      userId_projetId: {
        userId: user.id,
        projetId: support.projetId,
      },
    },
  })
  
  // Admin a accès à tout
  if (user.role === 'ADMIN') {
    const roleProjet = membre?.role as Role || 'ADMIN'
    return {
      user,
      support: {
        id: support.id,
        projetId: support.projetId,
        entrepriseId: support.entrepriseId,
        createurId: support.createurId,
        statut: support.statut,
        nom: support.nom,
      },
      projet: support.projet,
      roleProjet,
      isCreator: support.createurId === user.id,
    }
  }
  
  // Non-admin doit être membre du projet
  if (!membre) {
    throw new ForbiddenError('Vous n\'avez pas accès à ce support')
  }
  
  return {
    user,
    support: {
      id: support.id,
      projetId: support.projetId,
      entrepriseId: support.entrepriseId,
      createurId: support.createurId,
      statut: support.statut,
      nom: support.nom,
    },
    projet: support.projet,
    roleProjet: membre.role as Role,
    isCreator: support.createurId === user.id,
  }
}

// =============================================================================
// GUARDS SPÉCIFIQUES AUX ACTIONS
// =============================================================================

/**
 * Vérifie qu'un utilisateur peut créer un support dans un projet
 */
export async function requireSupportCreate(projetId: string): Promise<ProjectAccessResult> {
  const result = await requireProjectAccess(projetId)
  
  if (!roleHasPermission(result.user.role, PERMISSIONS.SUPPORT_CREATE)) {
    throw new ForbiddenError('Vous n\'avez pas la permission de créer des supports')
  }
  
  return result
}

/**
 * Vérifie qu'un utilisateur peut demander la validation d'un support
 */
export async function requireSupportRequestValidation(supportId: string): Promise<SupportAccessResult> {
  const result = await requireSupportAccess(supportId)
  
  const canRequest = rbacCanRequestValidation(
    result.user.role,
    result.roleProjet,
    result.isCreator
  )
  
  if (!canRequest) {
    throw new ForbiddenError('Vous ne pouvez pas demander la validation de ce support')
  }
  
  // Vérifier le statut
  if (result.support.statut !== 'BROUILLON' && result.support.statut !== 'REFUSE') {
    throw new ForbiddenError('Ce support ne peut pas être soumis à validation dans son état actuel')
  }
  
  return result
}

/**
 * Vérifie qu'un utilisateur peut valider/refuser un support
 */
export async function requireSupportValidation(supportId: string): Promise<SupportAccessResult> {
  const result = await requireSupportAccess(supportId)
  
  const effectiveRole = getEffectiveRole(result.user.role, result.roleProjet)
  
  if (!roleHasPermission(effectiveRole, PERMISSIONS.SUPPORT_VALIDATE)) {
    throw new ForbiddenError('Seuls les managers et admins peuvent valider les supports')
  }
  
  // Vérifier le statut
  if (result.support.statut !== 'EN_VALIDATION') {
    throw new ForbiddenError('Ce support n\'est pas en attente de validation')
  }
  
  return result
}

/**
 * Vérifie qu'un utilisateur peut modifier un support
 */
export async function requireSupportUpdate(supportId: string): Promise<SupportAccessResult> {
  const result = await requireSupportAccess(supportId)
  
  const canUpdate = rbacCanUpdateSupport(
    result.user.role,
    result.roleProjet,
    result.isCreator,
    result.support.statut
  )
  
  if (!canUpdate) {
    throw new ForbiddenError('Vous ne pouvez pas modifier ce support')
  }
  
  return result
}

/**
 * Vérifie qu'un utilisateur peut supprimer un support
 */
export async function requireSupportDelete(supportId: string): Promise<SupportAccessResult> {
  const result = await requireSupportAccess(supportId)
  
  const effectiveRole = getEffectiveRole(result.user.role, result.roleProjet)
  
  if (!roleHasPermission(effectiveRole, PERMISSIONS.SUPPORT_DELETE)) {
    throw new ForbiddenError('Vous n\'avez pas la permission de supprimer ce support')
  }
  
  return result
}

/**
 * Vérifie qu'un utilisateur peut gérer les membres d'un projet
 */
export async function requireProjectMembersManagement(projetId: string): Promise<ProjectAccessResult> {
  const result = await requireProjectAccess(projetId)
  
  const effectiveRole = getEffectiveRole(result.user.role, result.roleProjet)
  
  if (!roleHasPermission(effectiveRole, PERMISSIONS.PROJECT_MANAGE_MEMBERS)) {
    throw new ForbiddenError('Vous n\'avez pas la permission de gérer les membres de ce projet')
  }
  
  return result
}

/**
 * Vérifie qu'un utilisateur peut inviter des utilisateurs
 */
export async function requireUserInvite(): Promise<SessionUser> {
  return requirePermission(PERMISSIONS.USER_INVITE)
}

/**
 * Vérifie qu'un utilisateur peut gérer les utilisateurs
 */
export async function requireUserManagement(): Promise<SessionUser> {
  return requirePermission(PERMISSIONS.USER_MANAGE)
}

/**
 * Vérifie qu'un utilisateur peut attribuer des rôles
 */
export async function requireRoleAssignment(): Promise<SessionUser> {
  return requirePermission(PERMISSIONS.ROLE_ASSIGN)
}

/**
 * Vérifie qu'un utilisateur peut gérer les équipes
 */
export async function requireTeamManagement(): Promise<SessionUser> {
  return requirePermission(PERMISSIONS.TEAM_MANAGE)
}

/**
 * Vérifie qu'un utilisateur peut créer un projet
 */
export async function requireProjectCreate(): Promise<SessionUser> {
  return requirePermission(PERMISSIONS.PROJECT_CREATE)
}

/**
 * Vérifie qu'un utilisateur peut modifier les paramètres de l'entreprise
 */
export async function requireEnterpriseUpdate(): Promise<SessionUser> {
  return requirePermission(PERMISSIONS.ENTERPRISE_UPDATE)
}

// =============================================================================
// UTILITAIRES POUR API RESPONSES
// =============================================================================

/**
 * Crée une réponse d'erreur standardisée pour les API Routes
 */
export function createErrorResponse(error: unknown): Response {
  if (error instanceof AuthError) {
    return Response.json(
      { error: error.message, code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }
  
  if (error instanceof ForbiddenError) {
    return Response.json(
      { error: error.message, code: 'FORBIDDEN' },
      { status: 403 }
    )
  }
  
  if (error instanceof NotFoundError) {
    return Response.json(
      { error: error.message, code: 'NOT_FOUND' },
      { status: 404 }
    )
  }
  
  console.error('Erreur non gérée:', error)
  return Response.json(
    { error: 'Erreur interne du serveur', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

/**
 * Wrapper pour les Route Handlers avec gestion d'erreurs
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>
): () => Promise<T | Response> {
  return async () => {
    try {
      return await handler()
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}
