import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, formatDate } from '@/lib/utils'

type UserWithCount = {
  id: string
  email: string
  nom: string
  prenom: string
  role: string
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Équipe</h1>
        <p className="text-gray-600">Membres de votre entreprise</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membres ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(user.prenom, user.nom)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.prenom} {user.nom}
                      {user.id === session.user.id && (
                        <span className="ml-2 text-xs text-gray-400">(vous)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {user._count.membresProjet} projets • {user._count.supportsCreated} supports créés
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      user.role === 'ADMIN'
                        ? 'default'
                        : user.role === 'MANAGER'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {user.role}
                  </Badge>
                  <p className="mt-1 text-xs text-gray-400">
                    Membre depuis {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
