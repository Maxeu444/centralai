'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Check, X, MessageSquareText, User } from 'lucide-react'
import { moderateSuggestion } from '../actions'

interface Suggestion {
  id: string
  champCible: string
  contenuSuggere: string
  commentaire: string | null
  statut: string
  createdAt: Date
  auteur: {
    prenom: string
    nom: string
  }
  moderateur?: {
    prenom: string
    nom: string
  } | null
}

interface SuggestionsListProps {
  suggestions: Suggestion[]
  canModerate: boolean
}

const CHAMP_LABELS: Record<string, string> = {
  contenu: 'Texte principal',
  descriptionPost: 'Description du post',
  texteStory: 'Texte Story',
}

const STATUT_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'secondary' },
  ACCEPTEE: { label: 'Acceptée', variant: 'default' },
  REFUSEE: { label: 'Refusée', variant: 'destructive' },
}

export function SuggestionsList({ suggestions, canModerate }: SuggestionsListProps) {
  const [isPending, startTransition] = useTransition()

  const handleModerate = (suggestionId: string, action: 'ACCEPTER' | 'REFUSER') => {
    startTransition(async () => {
      const result = await moderateSuggestion({ suggestionId, action })
      if (result.success) {
        toast.success(action === 'ACCEPTER' ? 'Suggestion acceptée' : 'Suggestion refusée')
      } else {
        toast.error(result.error || 'Erreur')
      }
    })
  }

  const pendingSuggestions = suggestions.filter((s) => s.statut === 'EN_ATTENTE')
  const processedSuggestions = suggestions.filter((s) => s.statut !== 'EN_ATTENTE')

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquareText className="h-5 w-5" />
            Suggestions de modification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">
            Aucune suggestion de modification
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquareText className="h-5 w-5" />
          Suggestions de modification
          {pendingSuggestions.length > 0 && (
            <Badge variant="secondary">{pendingSuggestions.length} en attente</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggestions en attente */}
        {pendingSuggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">En attente de validation</h4>
            {pendingSuggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                canModerate={canModerate}
                isPending={isPending}
                onModerate={handleModerate}
              />
            ))}
          </div>
        )}

        {/* Suggestions traitées */}
        {processedSuggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Historique</h4>
            {processedSuggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                canModerate={false}
                isPending={false}
                onModerate={() => {}}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SuggestionItemProps {
  suggestion: Suggestion
  canModerate: boolean
  isPending: boolean
  onModerate: (suggestionId: string, action: 'ACCEPTER' | 'REFUSER') => void
}

function SuggestionItem({ suggestion, canModerate, isPending, onModerate }: SuggestionItemProps) {
  const badgeInfo = STATUT_BADGES[suggestion.statut] || STATUT_BADGES.EN_ATTENTE

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{CHAMP_LABELS[suggestion.champCible] || suggestion.champCible}</Badge>
          <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
        </div>
        <span className="text-xs text-gray-500">{formatDate(suggestion.createdAt)}</span>
      </div>

      <div className="text-sm">
        <p className="font-medium text-gray-900 mb-1">Contenu proposé :</p>
        <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2">
          {suggestion.contenuSuggere}
        </p>
      </div>

      {suggestion.commentaire && (
        <div className="text-sm">
          <p className="font-medium text-gray-900 mb-1">Commentaire :</p>
          <p className="text-gray-600 italic">{suggestion.commentaire}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <User className="h-3 w-3" />
          <span>
            {suggestion.auteur.prenom} {suggestion.auteur.nom}
          </span>
          {suggestion.moderateur && (
            <span className="text-gray-400">
              • Modéré par {suggestion.moderateur.prenom} {suggestion.moderateur.nom}
            </span>
          )}
        </div>

        {canModerate && suggestion.statut === 'EN_ATTENTE' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onModerate(suggestion.id, 'REFUSER')}
              disabled={isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Refuser
            </Button>
            <Button
              size="sm"
              onClick={() => onModerate(suggestion.id, 'ACCEPTER')}
              disabled={isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Accepter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
