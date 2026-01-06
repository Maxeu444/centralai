'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { type Role, type Permission, roleHasPermission, getEffectiveRole } from '@/lib/rbac'

// =============================================================================
// TYPES
// =============================================================================

export type UserPermissionContext = {
  role: Role
  permissions: Permission[]
  userId: string
  entrepriseId: string
  // Contexte projet optionnel (pour les pages projet/support)
  projectRole?: Role
  isProjectMember?: boolean
}

type PermissionContextValue = UserPermissionContext | null

// =============================================================================
// CONTEXT
// =============================================================================

const PermissionContext = createContext<PermissionContextValue>(null)

// =============================================================================
// PROVIDER
// =============================================================================

interface PermissionProviderProps {
  children: ReactNode
  value: UserPermissionContext
}

/**
 * Provider pour fournir le contexte des permissions à toute l'application
 * À utiliser dans le layout ou les pages
 */
export function PermissionProvider({ children, value }: PermissionProviderProps) {
  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook pour accéder au contexte des permissions
 */
export function usePermissions(): UserPermissionContext {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions doit être utilisé dans un PermissionProvider')
  }
  return context
}

/**
 * Hook pour vérifier si l'utilisateur a une permission
 */
export function useHasPermission(permission: Permission): boolean {
  const { role, projectRole } = usePermissions()
  const effectiveRole = getEffectiveRole(role, projectRole)
  return roleHasPermission(effectiveRole, permission)
}

/**
 * Hook pour vérifier si l'utilisateur a au moins un certain rôle
 */
export function useIsRole(minRole: Role): boolean {
  const { role, projectRole } = usePermissions()
  const effectiveRole = getEffectiveRole(role, projectRole)
  
  const roleHierarchy: Record<Role, number> = {
    COLLABORATEUR: 1,
    MANAGER: 2,
    ADMIN: 3,
  }
  
  return roleHierarchy[effectiveRole] >= roleHierarchy[minRole]
}

/**
 * Hook pour vérifier si l'utilisateur est membre du projet courant
 */
export function useIsProjectMember(): boolean {
  const { isProjectMember } = usePermissions()
  return isProjectMember ?? false
}

// =============================================================================
// COMPOSANT CAN
// =============================================================================

interface CanProps {
  /**
   * Permission requise pour afficher le contenu
   */
  permission?: Permission
  
  /**
   * Rôle minimum requis (alternative à permission)
   */
  role?: Role
  
  /**
   * Contenu à afficher si la condition est remplie
   */
  children: ReactNode
  
  /**
   * Contenu alternatif si la condition n'est pas remplie
   */
  fallback?: ReactNode
  
  /**
   * Condition personnalisée additionnelle
   */
  condition?: boolean
}

/**
 * Composant pour afficher conditionnellement du contenu basé sur les permissions
 * 
 * @example
 * // Afficher seulement si l'utilisateur peut créer des supports
 * <Can permission={PERMISSIONS.SUPPORT_CREATE}>
 *   <Button>Créer un support</Button>
 * </Can>
 * 
 * @example
 * // Afficher seulement pour les managers+
 * <Can role="MANAGER">
 *   <Button>Valider</Button>
 * </Can>
 * 
 * @example
 * // Avec fallback et condition personnalisée
 * <Can 
 *   permission={PERMISSIONS.SUPPORT_VALIDATE} 
 *   condition={support.statut === 'EN_VALIDATION'}
 *   fallback={<span>Non autorisé</span>}
 * >
 *   <Button>Valider</Button>
 * </Can>
 */
export function Can({ 
  permission, 
  role, 
  children, 
  fallback = null,
  condition = true 
}: CanProps) {
  const context = useContext(PermissionContext)
  
  // Si pas de contexte, ne rien afficher
  if (!context) {
    return null
  }
  
  // Vérifier la condition personnalisée
  if (!condition) {
    return <>{fallback}</>
  }
  
  const effectiveRole = getEffectiveRole(context.role, context.projectRole)
  
  // Vérifier le rôle si spécifié
  if (role) {
    const roleHierarchy: Record<Role, number> = {
      COLLABORATEUR: 1,
      MANAGER: 2,
      ADMIN: 3,
    }
    
    if (roleHierarchy[effectiveRole] < roleHierarchy[role]) {
      return <>{fallback}</>
    }
  }
  
  // Vérifier la permission si spécifiée
  if (permission && !roleHasPermission(effectiveRole, permission)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// =============================================================================
// COMPOSANTS SPÉCIALISÉS
// =============================================================================

interface CanCreateSupportProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu si l'utilisateur peut créer des supports
 */
export function CanCreateSupport({ children, fallback }: CanCreateSupportProps) {
  return (
    <Can permission="support:create" fallback={fallback}>
      {children}
    </Can>
  )
}

interface CanValidateSupportProps {
  children: ReactNode
  fallback?: ReactNode
  supportStatut?: string
}

/**
 * Affiche le contenu si l'utilisateur peut valider des supports
 */
export function CanValidateSupport({ children, fallback, supportStatut }: CanValidateSupportProps) {
  const isEnValidation = supportStatut === 'EN_VALIDATION'
  return (
    <Can 
      permission="support:validate" 
      condition={supportStatut ? isEnValidation : true}
      fallback={fallback}
    >
      {children}
    </Can>
  )
}

interface CanRequestValidationProps {
  children: ReactNode
  fallback?: ReactNode
  isCreator: boolean
  supportStatut?: string
}

/**
 * Affiche le contenu si l'utilisateur peut demander la validation
 */
export function CanRequestValidation({ 
  children, 
  fallback, 
  isCreator,
  supportStatut 
}: CanRequestValidationProps) {
  const context = useContext(PermissionContext)
  
  if (!context) return null
  
  // Vérifier le statut
  const canRequestByStatus = supportStatut 
    ? (supportStatut === 'BROUILLON' || supportStatut === 'REFUSE')
    : true
  
  if (!canRequestByStatus) {
    return <>{fallback}</>
  }
  
  const effectiveRole = getEffectiveRole(context.role, context.projectRole)
  
  // Le créateur peut toujours demander s'il a la permission de base
  if (isCreator && roleHasPermission(effectiveRole, 'support:request_validation')) {
    return <>{children}</>
  }
  
  // Sinon, manager/admin peuvent demander pour n'importe quel support
  const roleHierarchy: Record<Role, number> = {
    COLLABORATEUR: 1,
    MANAGER: 2,
    ADMIN: 3,
  }
  
  if (roleHierarchy[effectiveRole] >= roleHierarchy['MANAGER']) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

interface CanManageProjectMembersProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu si l'utilisateur peut gérer les membres du projet
 */
export function CanManageProjectMembers({ children, fallback }: CanManageProjectMembersProps) {
  return (
    <Can permission="project:manage_members" fallback={fallback}>
      {children}
    </Can>
  )
}

interface CanInviteUsersProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu si l'utilisateur peut inviter des utilisateurs (admin only)
 */
export function CanInviteUsers({ children, fallback }: CanInviteUsersProps) {
  return (
    <Can permission="user:invite" fallback={fallback}>
      {children}
    </Can>
  )
}

interface CanManageUsersProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu si l'utilisateur peut gérer les utilisateurs (admin only)
 */
export function CanManageUsers({ children, fallback }: CanManageUsersProps) {
  return (
    <Can permission="user:manage" fallback={fallback}>
      {children}
    </Can>
  )
}

interface CanManageTeamsProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu si l'utilisateur peut gérer les équipes (admin only)
 */
export function CanManageTeams({ children, fallback }: CanManageTeamsProps) {
  return (
    <Can permission="team:manage" fallback={fallback}>
      {children}
    </Can>
  )
}

interface CanAssignRolesProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu si l'utilisateur peut attribuer des rôles (admin only)
 */
export function CanAssignRoles({ children, fallback }: CanAssignRolesProps) {
  return (
    <Can permission="role:assign" fallback={fallback}>
      {children}
    </Can>
  )
}

interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu uniquement pour les admins
 */
export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  return (
    <Can role="ADMIN" fallback={fallback}>
      {children}
    </Can>
  )
}

interface ManagerOrAboveProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Affiche le contenu pour les managers et admins
 */
export function ManagerOrAbove({ children, fallback }: ManagerOrAboveProps) {
  return (
    <Can role="MANAGER" fallback={fallback}>
      {children}
    </Can>
  )
}
