import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, formatDateTime } from '@/lib/utils'

interface Commentaire {
  id: string
  contenu: string
  createdAt: Date
  auteur: {
    id: string
    prenom: string
    nom: string
  }
}

interface CommentairesListProps {
  commentaires: Commentaire[]
}

export function CommentairesList({ commentaires }: CommentairesListProps) {
  if (commentaires.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        Aucun commentaire pour le moment
      </p>
    )
  }

  // Highlighter les mentions @nom
  function highlightMentions(text: string): React.ReactNode {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-blue-600 font-medium">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="space-y-4">
      {commentaires.map((commentaire) => (
        <div key={commentaire.id} className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {getInitials(commentaire.auteur.prenom, commentaire.auteur.nom)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {commentaire.auteur.prenom} {commentaire.auteur.nom}
              </span>
              <span className="text-xs text-gray-400">
                {formatDateTime(commentaire.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
              {highlightMentions(commentaire.contenu)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
