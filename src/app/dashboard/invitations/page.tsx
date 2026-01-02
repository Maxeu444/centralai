import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

export default async function InvitationsPage() {
  const session = await auth()
  if (!session?.user) return null

  const invitations = await prisma.invitation.findMany({
    where: { entrepriseId: session.user.entrepriseId },
    orderBy: { createdAt: 'desc' },
    include: {
      envoyeur: { select: { prenom: true, nom: true } },
      projet: { select: { nom: true } },
    },
  })

  const canInvite = session.user.role === 'ADMIN' || session.user.role === 'MANAGER'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-600">Gérez les invitations à rejoindre votre entreprise</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitations ({invitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucune invitation envoyée
            </p>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation: typeof invitations[number]) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-gray-500">
                      Invité par {invitation.envoyeur.prenom} {invitation.envoyeur.nom}
                      {invitation.projet && ` • Projet: ${invitation.projet.nom}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(invitation.createdAt)} • Expire le {formatDateTime(invitation.expiresAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        invitation.statut === 'ACCEPTEE'
                          ? 'default'
                          : invitation.statut === 'EXPIREE'
                            ? 'destructive'
                            : invitation.statut === 'ANNULEE'
                              ? 'outline'
                              : 'secondary'
                      }
                    >
                      {invitation.statut.replace('_', ' ')}
                    </Badge>
                    <p className="mt-1 text-xs text-gray-400">Rôle: {invitation.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
