import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getInitials, formatDate } from '@/lib/utils'
import { InviteUserDialog, UserActions } from '@/features/equipe'
import { CreateEquipeDialog, EquipeCard } from '@/features/equipes'
import { AdminOnly, ManagerOrAbove } from '@/components/auth'
import { Users, ShieldCheck, Shield, User, UsersRound } from 'lucide-react'

type UserWithCount = {
  id: string
  email: string
  nom: string
  prenom: string
  role: 'ADMIN' | 'MANAGER' | 'COLLABORATEUR'
  createdAt: Date
  _count: {
    membresProjet: number
    supportsCreated: number
  }
}

export default async function EquipePage() {
  const session = await auth()
  if (!session?.user) return null

  const users: UserWithCount[] = await prisma.user.findMany({
    where: { entrepriseId: session.user.entrepriseId },
    orderBy: [{ role: 'asc' }, { nom: 'asc' }],
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          membresProjet: true,
          supportsCreated: true,
        },
      },
    },
  })

  const projets = await prisma.projet.findMany({
    where: { entrepriseId: session.user.entrepriseId, archived: false },
    select: { id: true, nom: true },
    orderBy: { nom: 'asc' },
  })

  // Fetch equipes (teams)
  const equipes = await prisma.equipe.findMany({
    where: { entrepriseId: session.user.entrepriseId },
    include: {
      membres: {
        include: {
          user: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { nom: 'asc' },
  })

  const isAdmin = session.user.role === 'ADMIN'
  const isManager = session.user.role === 'MANAGER'
  const canEditEquipes = isAdmin || isManager
  const canDeleteEquipes = isAdmin
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    managers: users.filter(u => u.role === 'MANAGER').length,
    collaborateurs: users.filter(u => u.role === 'COLLABORATEUR').length,
    equipes: equipes.length,
  }

  const roleConfig = {
    ADMIN: { 
      variant: 'default' as const, 
      icon: ShieldCheck, 
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    MANAGER: { 
      variant: 'secondary' as const, 
      icon: Shield, 
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    COLLABORATEUR: { 
      variant: 'outline' as const, 
      icon: User, 
      color: 'text-gray-600',
      bg: 'bg-gray-50'
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipe</h1>
          <p className="text-gray-600">Gérez les membres et les équipes de votre entreprise</p>
        </div>
        <div className="flex gap-2">
          <ManagerOrAbove>
            <CreateEquipeDialog />
          </ManagerOrAbove>
          <AdminOnly>
            <InviteUserDialog projets={projets} />
          </AdminOnly>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total membres</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Administrateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.managers}</p>
                <p className="text-sm text-muted-foreground">Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.collaborateurs}</p>
                <p className="text-sm text-muted-foreground">Collaborateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <UsersRound className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.equipes}</p>
                <p className="text-sm text-muted-foreground">Équipes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Membres / Équipes */}
      <Tabs defaultValue="membres" className="space-y-4">
        <TabsList>
          <TabsTrigger value="membres" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Membres ({users.length})
          </TabsTrigger>
          <TabsTrigger value="equipes" className="flex items-center gap-2">
            <UsersRound className="h-4 w-4" />
            Équipes ({equipes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="membres">
          {/* Liste des membres */}
          <Card>
            <CardHeader>
              <CardTitle>Membres ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => {
                  const config = roleConfig[user.role]
                  const RoleIcon = config.icon
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={config.bg}>
                            {getInitials(user.prenom, user.nom)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {user.prenom} {user.nom}
                            </p>
                            {user.id === session.user.id && (
                              <Badge variant="outline" className="text-xs">vous</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {user._count.membresProjet} projet{user._count.membresProjet > 1 ? 's' : ''} • {user._count.supportsCreated} support{user._count.supportsCreated > 1 ? 's' : ''} créé{user._count.supportsCreated > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge variant={config.variant} className="flex items-center gap-1">
                            <RoleIcon className="h-3 w-3" />
                            {user.role}
                          </Badge>
                          <p className="mt-1 text-xs text-gray-400">
                            Depuis {formatDate(user.createdAt)}
                          </p>
                        </div>
                        <UserActions 
                          user={user}
                          currentUserId={session.user.id}
                          canManage={isAdmin}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipes">
          {equipes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune équipe</h3>
                <p className="text-muted-foreground mb-4">
                  Créez des équipes pour organiser vos collaborateurs.
                </p>
                {canEditEquipes && <CreateEquipeDialog />}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {equipes.map((equipe) => (
                <EquipeCard
                  key={equipe.id}
                  equipe={equipe}
                  availableUsers={users.map(u => ({
                    id: u.id,
                    prenom: u.prenom,
                    nom: u.nom,
                    email: u.email,
                  }))}
                  canEdit={canEditEquipes}
                  canDelete={canDeleteEquipes}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
