import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SupportCard } from '@/features/supports'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function SupportsPage() {
  const session = await auth()
  if (!session?.user) return null

  const { entrepriseId, role, id: userId } = session.user

  // Récupérer les supports accessibles
  const supports = await prisma.support.findMany({
    where: {
      entrepriseId,
      ...(role !== 'ADMIN' && {
        projet: {
          membres: {
            some: { userId },
          },
        },
      }),
    },
    include: {
      projet: { select: { nom: true } },
      createur: { select: { prenom: true, nom: true } },
      _count: { select: { commentaires: true, fichiers: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supports</h1>
        <p className="text-gray-600">Tous vos supports à travers les projets</p>
      </div>

      {supports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Aucun support pour le moment</p>
            <Link href="/dashboard/projets" className="text-blue-600 hover:underline">
              Créez un projet pour commencer
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supports.map((support: typeof supports[number]) => (
            <SupportCard key={support.id} support={support} />
          ))}
        </div>
      )}
    </div>
  )
}
