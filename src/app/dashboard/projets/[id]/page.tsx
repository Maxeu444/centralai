import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { canAccessProject } from '@/lib/auth-utils'
import { CreateSupportDialog, SupportCard } from '@/features/supports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, formatDate } from '@/lib/utils'
import { ArrowLeft, Users } from 'lucide-react'

interface ProjetDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjetDetailPage({ params }: ProjetDetailPageProps) {
  const { id } = await params

  try {
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membres du projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projet.membres.map((membre: typeof projet.membres[number]) => (
                    <div
                      key={membre.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(membre.user.prenom, membre.user.nom)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {membre.user.prenom} {membre.user.nom}
                          </p>
                          <p className="text-sm text-gray-500">{membre.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{membre.role}</Badge>
                    </div>
                  ))}
                </div>
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
