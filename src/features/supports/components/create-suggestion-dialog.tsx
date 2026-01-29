'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSuggestion } from '../actions'

interface CreateSuggestionDialogProps {
  supportId: string
  typeSupport: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CHAMP_OPTIONS = [
  { value: 'contenu', label: 'Texte principal' },
  { value: 'descriptionPost', label: 'Description du post' },
  { value: 'texteStory', label: 'Texte Story' },
]

export function CreateSuggestionDialog({
  supportId,
  typeSupport,
  open,
  onOpenChange,
}: CreateSuggestionDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [champCible, setChampCible] = useState<string>('contenu')
  const [contenuSuggere, setContenuSuggere] = useState('')
  const [commentaire, setCommentaire] = useState('')

  const isReseauxSociaux = typeSupport === 'SOCIAL'

  // Filtrer les options selon le type de support
  const filteredOptions = isReseauxSociaux
    ? CHAMP_OPTIONS
    : CHAMP_OPTIONS.filter((opt) => opt.value === 'contenu')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!contenuSuggere.trim()) {
      toast.error('Veuillez entrer le contenu suggéré')
      return
    }

    startTransition(async () => {
      const result = await createSuggestion({
        supportId,
        champCible: champCible as 'contenu' | 'descriptionPost' | 'texteStory',
        contenuSuggere: contenuSuggere.trim(),
        commentaire: commentaire.trim() || undefined,
      })

      if (result.success) {
        toast.success('Suggestion envoyée')
        onOpenChange(false)
        setChampCible('contenu')
        setContenuSuggere('')
        setCommentaire('')
      } else {
        toast.error(result.error || 'Erreur')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Suggérer une modification</DialogTitle>
          <DialogDescription>
            Proposez une modification de texte. Elle sera soumise à validation avant d&apos;être
            appliquée.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="champ">Champ à modifier</Label>
            <Select value={champCible} onValueChange={setChampCible}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un champ" />
              </SelectTrigger>
              <SelectContent>
                {filteredOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenuSuggere">Nouveau contenu suggéré</Label>
            <Textarea
              id="contenuSuggere"
              placeholder="Entrez le texte que vous proposez..."
              value={contenuSuggere}
              onChange={(e) => setContenuSuggere(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
            <Textarea
              id="commentaire"
              placeholder="Expliquez votre suggestion..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Envoi...' : 'Envoyer la suggestion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
