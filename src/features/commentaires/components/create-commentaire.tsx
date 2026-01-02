'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createCommentaire } from '../actions'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

interface CreateCommentaireProps {
  supportId: string
  parentId?: string
}

export function CreateCommentaire({ supportId, parentId }: CreateCommentaireProps) {
  const [contenu, setContenu] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contenu.trim()) return

    setIsLoading(true)
    try {
      const result = await createCommentaire({
        contenu: contenu.trim(),
        supportId,
        parentId,
      })
      if (result.success) {
        setContenu('')
        toast.success('Commentaire ajouté')
      } else {
        toast.error(result.error || 'Erreur')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        placeholder="Ajouter un commentaire... (utilisez @nom pour mentionner)"
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isLoading || !contenu.trim()}>
          <Send className="mr-1 h-4 w-4" />
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </Button>
      </div>
    </form>
  )
}
