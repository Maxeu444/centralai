import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default async function ParametresPage() {
  const session = await auth()
  if (!session?.user) return null

  const [user, entreprise] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.entreprise.findUnique({
      where: { id: session.user.entrepriseId },
      select: {
        id: true,
        nom: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            projets: true,
          },
        },
      },
    }),
  ])

  if (!user || !entreprise) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez votre profil et votre entreprise</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Prénom</label>
              <p className="text-gray-900">{user.prenom}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Nom</label>
              <p className="text-gray-900">{user.nom}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Rôle</label>
              <p className="text-gray-900">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Entreprise */}
        <Card>
          <CardHeader>
            <CardTitle>Entreprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nom</label>
              <p className="text-gray-900">{entreprise.nom}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Slug</label>
              <p className="text-gray-900">{entreprise.slug}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Membres</label>
              <p className="text-gray-900">{entreprise._count.users}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Projets</label>
              <p className="text-gray-900">{entreprise._count.projets}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
