import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { FileText, MessageSquare, Image as ImageIcon, Film, Share2 } from 'lucide-react'

type TypeSupport = 'PRINT' | 'WEB' | 'VIDEO' | 'SOCIAL' | 'AUTRE'
type StatutSupport = 'BROUILLON' | 'EN_VALIDATION' | 'VALIDE' | 'REFUSE'

const typeIcons: Record<TypeSupport, React.ReactNode> = {
  PRINT: <FileText className="h-5 w-5" />,
  WEB: <Share2 className="h-5 w-5" />,
  VIDEO: <Film className="h-5 w-5" />,
  SOCIAL: <ImageIcon className="h-5 w-5" />,
  AUTRE: <FileText className="h-5 w-5" />,
}

interface SupportCardProps {
  support: {
    id: string
    nom: string
    description: string | null
    type: TypeSupport
    statut: StatutSupport
    createdAt: Date
    createur: {
      prenom: string
      nom: string
    }
    _count: {
      commentaires: number
      fichiers: number
    }
  }
}

export function SupportCard({ support }: SupportCardProps) {
  return (
    <Link href={`/dashboard/supports/${support.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gray-100 p-2">
                {typeIcons[support.type]}
              </div>
              <div>
                <CardTitle className="text-base">{support.nom}</CardTitle>
                <p className="text-xs text-gray-500">{support.type}</p>
              </div>
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
        </CardHeader>
        <CardContent>
          {support.description && (
            <p className="mb-2 text-sm text-gray-500 line-clamp-2">{support.description}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Par {support.createur.prenom} {support.createur.nom}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {support._count.fichiers}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {support._count.commentaires}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {formatDate(support.createdAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
