import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { canAccessProject } from '@/lib/auth-utils'
import { auth } from '@/lib/auth'
import { CreateSupportDialog, SupportCard } from '@/features/supports'
import { AddProjectMemberDialog, ProjectMemberActions } from '@/features/projets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, formatDate } from '@/lib/utils'
import { ArrowLeft, Users, ShieldCheck, Shield, User } from 'lucide-react'

interface ProjetDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjetDetailPage({ params }: ProjetDetailPageProps) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user) {
      notFound()
    }

    const { roleProjet } = await canAccessProject(id)

    const projet = await prisma.projet.findUnique({
      where: { id },
      include: {
        membres: {
          include: {
            user: {
              select: { id: true, prenom: true, nom: true, email: true, role: true },
            },
          },
        },
        supports: {
          include: {
            createur: { select: { prenom: true, nom: true } },
            _count: { select: { commentaires: true, fichiers: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: { select: { supports: true, membres: true } },
      },
    })

    if (!projet) {
      notFound()
    }

    const canManage = roleProjet === 'ADMIN' || roleProjet === 'MANAGER'

    // Utilisateurs disponibles pour ajout (non encore membres)
    const memberUserIds = projet.membres.map(m => m.user.id)
    const availableUsers = await prisma.user.findMany({
      where: {
        entrepriseId: session.user.entrepriseId,
        id: { notIn: memberUserIds },
      },
      select: { id: true, nom: true, prenom: true, email: true },
      orderBy: [{ nom: 'asc' }],
    })

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
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{projet.nom}</h1>
            {projet.description && (
              <p className="text-gray-600">{projet.description}</p>
            )}
          </div>
          <CreateSupportDialog projetId={projet.id} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="supports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="supports">
              Supports ({projet._count.supports})
            </TabsTrigger>
            <TabsTrigger value="membres">
              Membres ({projet._count.membres})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supports" className="space-y-4">
            {projet.supports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">Aucun support dans ce projet</p>
                  <CreateSupportDialog projetId={projet.id} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projet.supports.map((support: typeof projet.supports[number]) => (
                  <SupportCard key={support.id} support={support} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="membres">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membres du projet ({projet.membres.length})
                </CardTitle>
                {canManage && availableUsers.length > 0 && (
                  <AddProjectMemberDialog 
                    projetId={projet.id} 
                    availableUsers={availableUsers}
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projet.membres.map((membre: typeof projet.membres[number]) => {
                    const config = roleConfig[membre.role]
                    const RoleIcon = config.icon
                    
                    return (
                      <div
                        key={membre.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={config.bg}>
                              {getInitials(membre.user.prenom, membre.user.nom)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {membre.user.prenom} {membre.user.nom}
                              </p>
                              {membre.user.id === session.user.id && (
                                <Badge variant="outline" className="text-xs">vous</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{membre.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={config.variant} className="flex items-center gap-1">
                            <RoleIcon className="h-3 w-3" />
                            {membre.role}
                          </Badge>
                          <ProjectMemberActions
                            projetId={projet.id}
                            member={{
                              userId: membre.user.id,
                              nom: membre.user.nom,
                              prenom: membre.user.prenom,
                              role: membre.role as 'ADMIN' | 'MANAGER' | 'COLLABORATEUR',
                            }}
                            currentUserId={session.user.id}
                            canManage={canManage}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {canManage && availableUsers.length > 0 && projet.membres.length === 1 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-800 mb-3">
                      Vous êtes le seul membre de ce projet. Ajoutez des collaborateurs pour travailler ensemble.
                    </p>
                    <AddProjectMemberDialog 
                      projetId={projet.id} 
                      availableUsers={availableUsers}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
