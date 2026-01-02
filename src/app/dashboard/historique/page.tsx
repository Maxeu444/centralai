import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  SUPPRESSION: 'Suppression',
  UPLOAD_VERSION: 'Upload',
  DEMANDE_VALIDATION: 'Demande validation',
  VALIDATION: 'Validation',
  REFUS: 'Refus',
  COMMENTAIRE: 'Commentaire',
  INVITATION_ENVOYEE: 'Invitation envoyée',
  INVITATION_ACCEPTEE: 'Invitation acceptée',
}

const typeColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CREATION: 'default',
  MODIFICATION: 'secondary',
  SUPPRESSION: 'destructive',
  UPLOAD_VERSION: 'outline',
  DEMANDE_VALIDATION: 'secondary',
  VALIDATION: 'default',
  REFUS: 'destructive',
  COMMENTAIRE: 'outline',
  INVITATION_ENVOYEE: 'secondary',
  INVITATION_ACCEPTEE: 'default',
}

export default async function HistoriquePage() {
  const session = await auth()
  if (!session?.user) return null

  const historique = await prisma.historiqueAction.findMany({
    where: { entrepriseId: session.user.entrepriseId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { prenom: true, nom: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
        <p className="text-gray-600">Toutes les actions effectuées dans votre entreprise</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {historique.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucune action enregistrée
            </p>
          ) : (
            <div className="space-y-4">
              {historique.map((action: typeof historique[number]) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <Badge variant={typeColors[action.type] || 'outline'}>
                    {typeLabels[action.type] || action.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">
                      {action.user.prenom} {action.user.nom}
                    </p>
                    <p className="text-sm text-gray-600">
                      {action.description || typeLabels[action.type]}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(action.createdAt)}
                    </p>
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
