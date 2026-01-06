import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { InviteUserDialog } from '@/features/equipe'
import { InvitationActions } from './InvitationActions'
import { Mail, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default async function InvitationsPage() {
  const session = await auth()
  if (!session?.user) return null

  // Seuls les admins peuvent voir cette page
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Accès restreint</h2>
            <p className="text-muted-foreground">
              Seuls les administrateurs peuvent gérer les invitations.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const invitations = await prisma.invitation.findMany({
    where: { entrepriseId: session.user.entrepriseId },
    orderBy: { createdAt: 'desc' },
    include: {
      envoyeur: { select: { prenom: true, nom: true } },
      projet: { select: { nom: true } },
    },
  })

  const projets = await prisma.projet.findMany({
    where: { entrepriseId: session.user.entrepriseId, archived: false },
    select: { id: true, nom: true },
    orderBy: { nom: 'asc' },
  })

  const equipes = await prisma.equipe.findMany({
    where: { entrepriseId: session.user.entrepriseId },
    select: { id: true, nom: true, couleur: true },
    orderBy: { nom: 'asc' },
  })

  const now = new Date()
  const stats = {
    total: invitations.length,
    enAttente: invitations.filter(i => i.statut === 'EN_ATTENTE' && i.expiresAt > now).length,
    acceptees: invitations.filter(i => i.statut === 'ACCEPTEE').length,
    expirees: invitations.filter(i => i.statut === 'EXPIREE' || (i.statut === 'EN_ATTENTE' && i.expiresAt <= now)).length,
  }

  const statusConfig = {
    EN_ATTENTE: { 
      variant: 'secondary' as const, 
      icon: Clock, 
      label: 'En attente',
      color: 'text-yellow-600'
    },
    ACCEPTEE: { 
      variant: 'default' as const, 
      icon: CheckCircle, 
      label: 'Acceptée',
      color: 'text-green-600'
    },
    EXPIREE: { 
      variant: 'destructive' as const, 
      icon: AlertCircle, 
      label: 'Expirée',
      color: 'text-red-600'
    },
    ANNULEE: { 
      variant: 'outline' as const, 
      icon: XCircle, 
      label: 'Annulée',
      color: 'text-gray-600'
    },
  }

  function getInvitationStatus(invitation: typeof invitations[number]) {
    if (invitation.statut === 'EN_ATTENTE' && invitation.expiresAt <= now) {
      return 'EXPIREE'
    }
    return invitation.statut
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-600">Gérez les invitations à rejoindre votre entreprise</p>
        </div>
        <InviteUserDialog projets={projets} equipes={equipes} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enAttente}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.acceptees}</p>
                <p className="text-sm text-muted-foreground">Acceptées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expirees}</p>
                <p className="text-sm text-muted-foreground">Expirées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune invitation
              </h3>
              <p className="text-gray-500 mb-4">
                Invitez des collaborateurs à rejoindre votre entreprise
              </p>
              <InviteUserDialog projets={projets} />
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const status = getInvitationStatus(invitation)
                const config = statusConfig[status]
                const StatusIcon = config.icon
                const isActionable = status === 'EN_ATTENTE'

                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        status === 'EN_ATTENTE' ? 'bg-yellow-100' :
                        status === 'ACCEPTEE' ? 'bg-green-100' :
                        status === 'EXPIREE' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Mail className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Invité par {invitation.envoyeur.prenom} {invitation.envoyeur.nom}
                          {invitation.projet && (
                            <span className="ml-2">
                              • Projet: <span className="font-medium">{invitation.projet.nom}</span>
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Envoyée le {formatDateTime(invitation.createdAt)}
                          {status === 'EN_ATTENTE' && (
                            <span className="ml-2">
                              • Expire le {formatDateTime(invitation.expiresAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant={config.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                        <p className="mt-1 text-xs text-gray-400">
                          Rôle: {invitation.role}
                        </p>
                      </div>
                      {isActionable && (
                        <InvitationActions invitationId={invitation.id} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
