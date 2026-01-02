import { Badge } from '@/components/ui/badge'
import { formatFileSize, formatDateTime } from '@/lib/utils'
import { FileText, Image as ImageIcon, File, Download } from 'lucide-react'
import Link from 'next/link'

interface Fichier {
  id: string
  nomOriginal: string
  mimeType: string
  taille: number
  version: number
  createdAt: Date
  uploadeur: {
    prenom: string
    nom: string
  }
}

interface FilesListProps {
  fichiers: Fichier[]
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5" />
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5" />
  }
  return <File className="h-5 w-5" />
}

export function FilesList({ fichiers }: FilesListProps) {
  if (fichiers.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        Aucun fichier uploadé
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {fichiers.map((fichier, index) => (
        <div
          key={fichier.id}
          className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
        >
          <div className="rounded-lg bg-gray-100 p-2">
            {getFileIcon(fichier.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{fichier.nomOriginal}</p>
              {index === 0 && (
                <Badge variant="default" className="text-xs">
                  Dernière
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">
              v{fichier.version} • {formatFileSize(fichier.taille)} • Par{' '}
              {fichier.uploadeur.prenom} {fichier.uploadeur.nom}
            </p>
            <p className="text-xs text-gray-400">
              {formatDateTime(fichier.createdAt)}
            </p>
          </div>
          <Link href={`/api/fichiers/${fichier.id}`} target="_blank">
            <Download className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </Link>
        </div>
      ))}
    </div>
  )
}
