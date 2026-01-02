import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Users, FileText } from 'lucide-react'

interface ProjetCardProps {
  projet: {
    id: string
    nom: string
    description: string | null
    slug: string
    createdAt: Date
    _count: {
      membres: number
      supports: number
    }
  }
}

export function ProjetCard({ projet }: ProjetCardProps) {
  return (
    <Link href={`/dashboard/projets/${projet.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{projet.nom}</CardTitle>
          </div>
          {projet.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{projet.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{projet._count.membres} membres</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{projet._count.supports} supports</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Créé le {formatDate(projet.createdAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
