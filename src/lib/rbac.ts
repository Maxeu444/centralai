/**
 * RBAC - Role-Based Access Control pour CentralIA
 * 
 * Ce fichier définit :
 * - Les rôles disponibles (COLLABORATEUR, MANAGER, ADMIN)
 * - Les permissions granulaires
 * - La matrice rôle/permissions
 * - Les helpers pour vérifier les permissions
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Rôles globaux au niveau entreprise
 * Stocké dans User.role et MembreProjet.role
 */
export type Role = 'COLLABORATEUR' | 'MANAGER' | 'ADMIN'

/**
 * Permissions granulaires du système
 * Format : domaine:action
 */
export const PERMISSIONS = {
  // Authentification
  AUTH_LOGIN: 'auth:login',
  
  // Projets
  PROJECT_READ: 'project:read',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',
  
  // Supports
  SUPPORT_READ: 'support:read',
  SUPPORT_CREATE: 'support:create',
  SUPPORT_UPDATE: 'support:update',
  SUPPORT_DELETE: 'support:delete',
  SUPPORT_REQUEST_VALIDATION: 'support:request_validation',
  SUPPORT_VALIDATE: 'support:validate',
  
  // Fichiers
  FILE_UPLOAD: 'file:upload',
  FILE_DOWNLOAD: 'file:download',
  FILE_DELETE: 'file:delete',
  
  // Commentaires
  COMMENT_CREATE: 'comment:create',
  COMMENT_DELETE: 'comment:delete',
  
  // Équipes / Membres
  TEAM_READ: 'team:read',
  TEAM_CREATE: 'team:create',
  TEAM_MANAGE: 'team:manage',
  
  // Utilisateurs
  USER_READ: 'user:read',
  USER_INVITE: 'user:invite',
  USER_MANAGE: 'user:manage',
  USER_DELETE: 'user:delete',
  
  // Rôles
  ROLE_ASSIGN: 'role:assign',
  
  // Entreprise
  ENTERPRISE_READ: 'enterprise:read',
  ENTERPRISE_UPDATE: 'enterprise:update',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// =============================================================================
// MATRICE RÔLE/PERMISSIONS
// =============================================================================

/**
 * Définit les permissions accordées à chaque rôle.
 * Un rôle supérieur hérite des permissions des rôles inférieurs.
 */
const COLLABORATEUR_PERMISSIONS: Permission[] = [
  PERMISSIONS.AUTH_LOGIN,
  PERMISSIONS.PROJECT_READ,
  PERMISSIONS.SUPPORT_READ,
  PERMISSIONS.SUPPORT_CREATE,
  PERMISSIONS.SUPPORT_REQUEST_VALIDATION,
  PERMISSIONS.FILE_UPLOAD,
  PERMISSIONS.FILE_DOWNLOAD,
  PERMISSIONS.COMMENT_CREATE,
  PERMISSIONS.TEAM_READ,
  PERMISSIONS.USER_READ,
  PERMISSIONS.ENTERPRISE_READ,
]

const MANAGER_PERMISSIONS: Permission[] = [
  ...COLLABORATEUR_PERMISSIONS,
  PERMISSIONS.PROJECT_CREATE,
  PERMISSIONS.PROJECT_UPDATE,
  PERMISSIONS.PROJECT_MANAGE_MEMBERS,
  PERMISSIONS.SUPPORT_UPDATE,
  PERMISSIONS.SUPPORT_DELETE,
  PERMISSIONS.SUPPORT_VALIDATE,
  PERMISSIONS.FILE_DELETE,
  PERMISSIONS.COMMENT_DELETE,
  PERMISSIONS.TEAM_MANAGE,
]

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  PERMISSIONS.PROJECT_DELETE,
  PERMISSIONS.TEAM_CREATE,
  PERMISSIONS.USER_INVITE,
  PERMISSIONS.USER_MANAGE,
  PERMISSIONS.USER_DELETE,
  PERMISSIONS.ROLE_ASSIGN,
  PERMISSIONS.ENTERPRISE_UPDATE,
]

/**
 * Map des permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  COLLABORATEUR: COLLABORATEUR_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
}

// =============================================================================
// HIÉRARCHIE DES RÔLES
// =============================================================================

/**
 * Hiérarchie des rôles (plus le nombre est élevé, plus le rôle est puissant)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  COLLABORATEUR: 1,
  MANAGER: 2,
  ADMIN: 3,
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Vérifie si un rôle possède une permission donnée
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.includes(permission)
}

/**
 * Vérifie si un rôle est supérieur ou égal à un autre
 */
export function isRoleAtLeast(role: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole]
}

/**
 * Obtient le rôle le plus élevé entre le rôle global et le rôle projet
 * Utile pour les actions qui dépendent du contexte projet
 */
export function getEffectiveRole(globalRole: Role, projectRole?: Role): Role {
  if (!projectRole) return globalRole
  return ROLE_HIERARCHY[globalRole] >= ROLE_HIERARCHY[projectRole] ? globalRole : projectRole
}

/**
 * Obtient toutes les permissions d'un rôle
 */
export function getRolePermissions(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]]
}

/**
 * Vérifie si un utilisateur peut voir un projet
 * - ADMIN peut tout voir dans son entreprise
 * - Autres doivent être membres du projet
 */
export function canViewProject(globalRole: Role, isProjectMember: boolean): boolean {
  return globalRole === 'ADMIN' || isProjectMember
}

/**
 * Vérifie si un utilisateur peut gérer les membres d'un projet
 */
export function canManageProjectMembers(globalRole: Role, projectRole?: Role): boolean {
  const effectiveRole = getEffectiveRole(globalRole, projectRole)
  return roleHasPermission(effectiveRole, PERMISSIONS.PROJECT_MANAGE_MEMBERS)
}

/**
 * Vérifie si un utilisateur peut valider un support
 */
export function canValidateSupport(globalRole: Role, projectRole?: Role): boolean {
  const effectiveRole = getEffectiveRole(globalRole, projectRole)
  return roleHasPermission(effectiveRole, PERMISSIONS.SUPPORT_VALIDATE)
}

/**
 * Vérifie si un utilisateur peut demander la validation d'un support
 * - Le créateur du support peut toujours demander validation
 * - Les managers/admins peuvent demander pour n'importe quel support
 */
export function canRequestValidation(
  globalRole: Role,
  projectRole: Role | undefined,
  isCreator: boolean
): boolean {
  if (isCreator) {
    const effectiveRole = getEffectiveRole(globalRole, projectRole)
    return roleHasPermission(effectiveRole, PERMISSIONS.SUPPORT_REQUEST_VALIDATION)
  }
  // Non-créateur : doit être manager ou admin
  return isRoleAtLeast(getEffectiveRole(globalRole, projectRole), 'MANAGER')
}

/**
 * Vérifie si un utilisateur peut modifier un support
 * - Le créateur peut modifier son support (si pas validé)
 * - Les managers/admins peuvent modifier tout support
 */
export function canUpdateSupport(
  globalRole: Role,
  projectRole: Role | undefined,
  isCreator: boolean,
  supportStatus: string
): boolean {
  const effectiveRole = getEffectiveRole(globalRole, projectRole)
  
  // Le support validé ne peut être modifié que par admin
  if (supportStatus === 'VALIDE' && effectiveRole !== 'ADMIN') {
    return false
  }
  
  // Créateur peut modifier son propre support
  if (isCreator) {
    return roleHasPermission(effectiveRole, PERMISSIONS.SUPPORT_CREATE)
  }
  
  // Managers/admins peuvent modifier
  return roleHasPermission(effectiveRole, PERMISSIONS.SUPPORT_UPDATE)
}

/**
 * Vérifie si un utilisateur peut supprimer un support
 */
export function canDeleteSupport(globalRole: Role, projectRole?: Role): boolean {
  const effectiveRole = getEffectiveRole(globalRole, projectRole)
  return roleHasPermission(effectiveRole, PERMISSIONS.SUPPORT_DELETE)
}

/**
 * Vérifie si un utilisateur peut inviter des membres dans l'entreprise
 */
export function canInviteUsers(globalRole: Role): boolean {
  return roleHasPermission(globalRole, PERMISSIONS.USER_INVITE)
}

/**
 * Vérifie si un utilisateur peut gérer les utilisateurs (CRUD)
 */
export function canManageUsers(globalRole: Role): boolean {
  return roleHasPermission(globalRole, PERMISSIONS.USER_MANAGE)
}

/**
 * Vérifie si un utilisateur peut attribuer des rôles
 */
export function canAssignRoles(globalRole: Role): boolean {
  return roleHasPermission(globalRole, PERMISSIONS.ROLE_ASSIGN)
}

/**
 * Vérifie si un utilisateur peut créer/gérer des équipes
 */
export function canManageTeams(globalRole: Role): boolean {
  return roleHasPermission(globalRole, PERMISSIONS.TEAM_CREATE) || 
         roleHasPermission(globalRole, PERMISSIONS.TEAM_MANAGE)
}

// =============================================================================
// UTILITAIRES POUR L'UI
// =============================================================================

/**
 * Retourne la liste des permissions pour un utilisateur
 * Combine rôle global et rôle projet si applicable
 */
export function getUserPermissions(globalRole: Role, projectRole?: Role): Permission[] {
  const effectiveRole = getEffectiveRole(globalRole, projectRole)
  return getRolePermissions(effectiveRole)
}

/**
 * Labels français pour les rôles
 */
export const ROLE_LABELS: Record<Role, string> = {
  COLLABORATEUR: 'Collaborateur',
  MANAGER: 'Manager',
  ADMIN: 'Administrateur',
}

/**
 * Descriptions des rôles
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  COLLABORATEUR: 'Peut voir et créer des supports, commenter et demander des validations.',
  MANAGER: 'Peut gérer les projets, valider les supports et gérer les membres.',
  ADMIN: 'Accès complet : gestion des utilisateurs, équipes, invitations et paramètres.',
}
