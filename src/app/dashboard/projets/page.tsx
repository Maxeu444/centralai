import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateProjetDialog, ProjetCard } from '@/features/projets'

export default async function ProjetsPage() {
  const session = await auth()
  if (!session?.user) return null

  const { entrepriseId, role, id: userId } = session.user

  // Admin voit tous les projets, les autres voient seulement ceux où ils sont membres
  const projets = await prisma.projet.findMany({
    where: {
      entrepriseId,
      archived: false,
      ...(role !== 'ADMIN' && {
        membres: {
          some: { userId },
        },
      }),
    },
    include: {
      _count: {
        select: {
          membres: true,
          supports: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const canCreate = role === 'ADMIN' || role === 'MANAGER'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600">Gérez vos projets et leurs supports</p>
        </div>
        {canCreate && <CreateProjetDialog />}
      </div>

      {projets.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-12 text-center">
          <h3 className="mb-2 text-lg font-medium">Aucun projet</h3>
          <p className="mb-4 text-gray-500">
            {canCreate
              ? 'Créez votre premier projet pour commencer.'
              : "Vous n'êtes membre d'aucun projet pour le moment."}
          </p>
          {canCreate && <CreateProjetDialog />}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projets.map((projet: typeof projets[number]) => (
            <ProjetCard key={projet.id} projet={projet} />
          ))}
        </div>
      )}
    </div>
  )
}
