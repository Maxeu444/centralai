import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, FileText, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const { entrepriseId } = session.user

  // Récupérer les statistiques
  const [projetsCount, supportsStats, recentSupports] = await Promise.all([
    prisma.projet.count({
      where: { entrepriseId, archived: false },
    }),
    prisma.support.groupBy({
      by: ['statut'],
      where: { entrepriseId },
      _count: true,
    }),
    prisma.support.findMany({
      where: { entrepriseId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        projet: { select: { nom: true } },
        createur: { select: { prenom: true, nom: true } },
      },
    }),
  ])

  const statsMap = supportsStats.reduce(
    (acc: Record<string, number>, s: { statut: string; _count: number }) => {
      acc[s.statut] = s._count
      return acc
    },
    {} as Record<string, number>
  )

  const totalSupports =
    (statsMap['BROUILLON'] || 0) +
    (statsMap['EN_VALIDATION'] || 0) +
    (statsMap['VALIDE'] || 0) +
    (statsMap['REFUSE'] || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {session.user.prenom} 👋
        </h1>
        <p className="text-gray-600">Voici un aperçu de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projetsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total supports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSupports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En validation</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsMap['EN_VALIDATION'] || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsMap['VALIDE'] || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Supports */}
      <Card>
        <CardHeader>
          <CardTitle>Supports récents</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSupports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun support pour le moment.{' '}
              <Link href="/dashboard/projets" className="text-blue-600 hover:underline">
                Créez votre premier projet
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {recentSupports.map((support: typeof recentSupports[number]) => (
                <div
                  key={support.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <Link
                      href={`/dashboard/supports/${support.id}`}
                      className="font-medium hover:underline"
                    >
                      {support.nom}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {support.projet.nom} • Par {support.createur.prenom} {support.createur.nom}
                    </p>
                  </div>
                  <Badge
                    variant={
                      support.statut === 'VALIDE'
                        ? 'default'
                        : support.statut === 'EN_VALIDATION'
                          ? 'secondary'
                          : support.statut === 'REFUSE'
                            ? 'destructive'
                            : 'outline'
                    }
                  >
                    {support.statut.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
