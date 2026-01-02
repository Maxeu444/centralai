import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { canAccessSupport } from '@/lib/auth-utils'
import { StatutActions } from '@/features/supports'
import { CommentairesList, CreateCommentaire } from '@/features/commentaires'
import { FilesList, UploadFichier } from '@/features/fichiers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, FileText, MessageSquare, History } from 'lucide-react'

interface SupportDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SupportDetailPage({ params }: SupportDetailPageProps) {
  const { id } = await params

  try {
    const { user, roleProjet } = await canAccessSupport(id)

    const support = await prisma.support.findUnique({
      where: { id },
      include: {
        projet: { select: { id: true, nom: true } },
        createur: { select: { id: true, prenom: true, nom: true } },
        fichiers: {
          orderBy: { version: 'desc' },
          include: {
            uploadeur: { select: { prenom: true, nom: true } },
          },
        },
        commentaires: {
          orderBy: { createdAt: 'desc' },
          include: {
            auteur: { select: { id: true, prenom: true, nom: true } },
          },
        },
      },
    })

    if (!support) {
      notFound()
    }

    // Historique des actions pour ce support
    const historique = await prisma.historiqueAction.findMany({
      where: { supportId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { prenom: true, nom: true } },
      },
    })

    const isCreateur = support.createur.id === user.id
    const latestFile = support.fichiers[0]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/projets/${support.projet.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{support.nom}</h1>
              <Badge variant="outline">{support.type}</Badge>
            </div>
            <p className="text-gray-600">
              Projet: {support.projet.nom} • Par {support.createur.prenom} {support.createur.nom}
            </p>
          </div>
          <StatutActions
            supportId={support.id}
            statut={support.statut}
            roleProjet={roleProjet}
            isCreateur={isCreateur}
          />
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Preview & Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestFile ? (
                  <div className="rounded-lg border bg-gray-50 p-8 text-center">
                    {latestFile.mimeType.startsWith('image/') ? (
                      <img
                        src={`/api/fichiers/${latestFile.id}`}
                        alt={latestFile.nomOriginal}
                        className="max-h-96 mx-auto object-contain"
                      />
                    ) : latestFile.mimeType === 'application/pdf' ? (
                      <iframe
                        src={`/api/fichiers/${latestFile.id}`}
                        className="w-full h-96"
                        title={latestFile.nomOriginal}
                      />
                    ) : (
                      <div className="py-12">
                        <FileText className="mx-auto h-16 w-16 text-gray-400" />
                        <p className="mt-4 text-gray-500">{latestFile.nomOriginal}</p>
                        <p className="text-sm text-gray-400">
                          Aperçu non disponible pour ce type de fichier
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed bg-gray-50 p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">Aucun fichier uploadé</p>
                    <p className="text-sm text-gray-400">
                      Uploadez un fichier pour voir l'aperçu
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {support.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{support.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Tabs */}
          <div className="space-y-6">
            <Tabs defaultValue="fichiers">
              <TabsList className="w-full">
                <TabsTrigger value="fichiers" className="flex-1">
                  <FileText className="mr-1 h-4 w-4" />
                  Fichiers ({support.fichiers.length})
                </TabsTrigger>
                <TabsTrigger value="commentaires" className="flex-1">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  ({support.commentaires.length})
                </TabsTrigger>
                <TabsTrigger value="historique" className="flex-1">
                  <History className="mr-1 h-4 w-4" />
                  ({historique.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fichiers" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <UploadFichier supportId={support.id} />
                  </CardHeader>
                  <CardContent>
                    <FilesList fichiers={support.fichiers} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="commentaires" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CreateCommentaire supportId={support.id} />
                  </CardHeader>
                  <CardContent>
                    <CommentairesList commentaires={support.commentaires} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historique" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {historique.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        Aucune action enregistrée
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {historique.map((action: typeof historique[number]) => (
                          <div
                            key={action.id}
                            className="flex items-start gap-3 text-sm border-l-2 border-gray-200 pl-4"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {action.user.prenom} {action.user.nom}
                              </p>
                              <p className="text-gray-600">{action.description || action.type}</p>
                              <p className="text-xs text-gray-400">
                                {formatDate(action.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
