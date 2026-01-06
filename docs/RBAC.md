# RBAC - Gestion des Rôles et Permissions

## Vue d'ensemble

CentralIA utilise un système RBAC (Role-Based Access Control) à deux niveaux :
1. **Rôle global** : défini sur l'utilisateur (`User.role`)
2. **Rôle projet** : défini via l'appartenance au projet (`MembreProjet.role`)

La permission finale pour une action liée à un projet est l'**intersection** des deux rôles.

## Rôles disponibles

| Rôle | Niveau | Description |
|------|--------|-------------|
| `COLLABORATEUR` | 1 | Accès de base : créer des supports, commenter, uploader |
| `MANAGER` | 2 | Gestion des projets, membres et validations |
| `ADMIN` | 3 | Accès complet à l'entreprise |

## Hiérarchie des permissions

Les rôles sont hiérarchiques : un rôle supérieur hérite des permissions des rôles inférieurs.

```
ADMIN > MANAGER > COLLABORATEUR
```

## Permissions granulaires

### Authentification
| Permission | COLLABORATEUR | MANAGER | ADMIN |
|------------|---------------|---------|-------|
| `auth:login` | ✓ | ✓ | ✓ |
| `auth:logout` | ✓ | ✓ | ✓ |

### Projets
| Permission | COLLABORATEUR | MANAGER | ADMIN |
|------------|---------------|---------|-------|
| `project:view` | ✓ | ✓ | ✓ |
| `project:create` | - | ✓ | ✓ |
| `project:update` | - | ✓ | ✓ |
| `project:delete` | - | - | ✓ |
| `project:manage_members` | - | ✓ | ✓ |

### Supports
| Permission | COLLABORATEUR | MANAGER | ADMIN |
|------------|---------------|---------|-------|
| `support:view` | ✓ | ✓ | ✓ |
| `support:create` | ✓ | ✓ | ✓ |
| `support:update` | ✓* | ✓ | ✓ |
| `support:delete` | - | ✓ | ✓ |
| `support:request_validation` | ✓ | ✓ | ✓ |
| `support:validate` | - | ✓ | ✓ |

\* Seul le créateur peut modifier, sauf Manager/Admin

### Commentaires
| Permission | COLLABORATEUR | MANAGER | ADMIN |
|------------|---------------|---------|-------|
| `comment:create` | ✓ | ✓ | ✓ |
| `comment:update` | ✓* | ✓ | ✓ |
| `comment:delete` | ✓* | ✓ | ✓ |

\* Seul l'auteur peut modifier/supprimer

### Gestion d'équipe
| Permission | COLLABORATEUR | MANAGER | ADMIN |
|------------|---------------|---------|-------|
| `team:view` | ✓ | ✓ | ✓ |
| `team:manage` | - | ✓ | ✓ |

### Utilisateurs & Rôles
| Permission | COLLABORATEUR | MANAGER | ADMIN |
|------------|---------------|---------|-------|
| `user:invite` | - | - | ✓ |
| `user:manage` | - | - | ✓ |
| `role:assign` | - | - | ✓ |

## Utilisation côté serveur

### Guards de base

```typescript
import { requireAuth, requirePermission, requireRole } from '@/lib/guards'
import { PERMISSIONS } from '@/lib/rbac'

// Vérifier l'authentification
const user = await requireAuth()

// Vérifier une permission spécifique
await requirePermission(PERMISSIONS.PROJECT_CREATE)

// Vérifier un rôle minimum
await requireRole('MANAGER')
```

### Guards pour ressources

```typescript
import { 
  requireProjectAccess,
  requireSupportAccess,
  requireSupportValidation,
  requireProjectMembersManagement,
} from '@/lib/guards'

// Vérifier l'accès à un projet
const { user, projet } = await requireProjectAccess(projetId)

// Vérifier l'accès à un support
const { user, support, projet } = await requireSupportAccess(supportId)

// Vérifier la permission de valider
const { user, support } = await requireSupportValidation(supportId)

// Vérifier la permission de gérer les membres
const { user, projet } = await requireProjectMembersManagement(projetId)
```

### Gestion des erreurs

```typescript
import { 
  AuthError, 
  ForbiddenError, 
  NotFoundError,
  createErrorResponse,
  withErrorHandling,
} from '@/lib/guards'

// Dans une API route
export async function POST(request: NextRequest) {
  try {
    // ... logique métier
  } catch (error) {
    return createErrorResponse(error)
  }
}

// Ou avec le wrapper
export const POST = withErrorHandling(async (request) => {
  // ... logique métier (les erreurs sont gérées automatiquement)
})
```

## Utilisation côté client

### Provider

Le `PermissionProvider` doit envelopper les composants qui utilisent les hooks de permission :

```tsx
// Dans layout.tsx (déjà configuré)
import { PermissionProvider } from '@/components/auth'
import { getPermissionContext } from '@/lib/permission-context'

const permissionContext = await getPermissionContext()

return (
  <PermissionProvider value={permissionContext}>
    {children}
  </PermissionProvider>
)
```

### Composants conditionnels

```tsx
import { 
  Can, 
  AdminOnly, 
  ManagerOrAbove,
  CanCreateSupport,
  CanValidateSupport,
  CanManageProjectMembers,
  CanInviteUsers,
} from '@/components/auth'
import { PERMISSIONS } from '@/lib/rbac'

// Par permission
<Can permission={PERMISSIONS.PROJECT_CREATE}>
  <Button>Créer un projet</Button>
</Can>

// Par rôle
<AdminOnly>
  <Button>Paramètres admin</Button>
</AdminOnly>

<ManagerOrAbove>
  <Button>Gérer l'équipe</Button>
</ManagerOrAbove>

// Composants spécialisés
<CanCreateSupport projetId={projetId}>
  <Button>Nouveau support</Button>
</CanCreateSupport>

<CanValidateSupport projetId={projetId}>
  <Button>Valider</Button>
</CanValidateSupport>

// Avec fallback
<Can 
  permission={PERMISSIONS.SUPPORT_DELETE}
  fallback={<span>Action non autorisée</span>}
>
  <Button variant="destructive">Supprimer</Button>
</Can>
```

### Hooks

```tsx
import { 
  usePermissions,
  useHasPermission,
  useIsRole,
  useIsProjectMember,
} from '@/components/auth'
import { PERMISSIONS } from '@/lib/rbac'

function MyComponent() {
  const { role, permissions, isProjectMember } = usePermissions()
  
  const canCreate = useHasPermission(PERMISSIONS.PROJECT_CREATE)
  const isAdmin = useIsRole('ADMIN')
  const isMember = useIsProjectMember('projet-id')
  
  if (!canCreate) {
    return <p>Vous n'avez pas la permission de créer</p>
  }
  
  // ...
}
```

## Isolation multi-tenant

Toutes les requêtes Prisma doivent inclure le filtre `entrepriseId` :

```typescript
// ✅ Correct
const projets = await prisma.projet.findMany({
  where: { entrepriseId: user.entrepriseId }
})

// ❌ Incorrect - accès cross-tenant possible
const projets = await prisma.projet.findMany()
```

Les guards vérifient automatiquement l'appartenance au tenant.

## Audit trail

Toutes les mutations importantes doivent créer une entrée d'audit :

```typescript
await prisma.historiqueAction.create({
  data: {
    type: 'CREATION', // | 'MODIFICATION' | 'SUPPRESSION' | 'VALIDATION' | 'CHANGEMENT_STATUT'
    description: 'Description de l\'action',
    entrepriseId: user.entrepriseId,
    userId: user.id,
    projetId: projetId, // optionnel
    supportId: supportId, // optionnel
  },
})
```

## API Routes protégées

| Route | Méthode | Permission requise |
|-------|---------|-------------------|
| `/api/projects` | GET | Auth |
| `/api/projects` | POST | `project:create` |
| `/api/projects/[id]/members` | GET | Membre du projet |
| `/api/projects/[id]/members` | POST | `project:manage_members` |
| `/api/projects/[id]/members/[userId]` | PUT/DELETE | `project:manage_members` |
| `/api/supports` | GET | Auth |
| `/api/supports` | POST | `support:create` + membre projet |
| `/api/supports/[id]/request-validation` | POST | `support:request_validation` |
| `/api/supports/[id]/validate` | POST | `support:validate` |
| `/api/invitations` | GET/POST | `user:invite` (Admin) |

## Tests

Pour tester le RBAC :

```typescript
// Créer des utilisateurs avec différents rôles
const admin = await createUser({ role: 'ADMIN' })
const manager = await createUser({ role: 'MANAGER' })
const collab = await createUser({ role: 'COLLABORATEUR' })

// Tester l'isolation
expect(await canAccessProject(collab, otherTenantProject)).toBe(false)

// Tester les permissions
expect(roleHasPermission('COLLABORATEUR', PERMISSIONS.PROJECT_CREATE)).toBe(false)
expect(roleHasPermission('MANAGER', PERMISSIONS.PROJECT_CREATE)).toBe(true)
```
