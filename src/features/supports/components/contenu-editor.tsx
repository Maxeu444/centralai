'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Edit, Save, X, Type, MessageSquareText, Instagram } from 'lucide-react'
import { updateSupportContenu } from '../actions'

interface SupportContenu {
  contenu: string | null
  descriptionPost: string | null
  texteStory: string | null
}

interface ContenuEditorProps {
  supportId: string
  type: string
  initialContenu: SupportContenu
  canEditDirectly: boolean
  onSuggest?: () => void
}

export function ContenuEditor({
  supportId,
  type,
  initialContenu,
  canEditDirectly,
  onSuggest,
}: ContenuEditorProps) {
  const { contenu, descriptionPost, texteStory } = initialContenu
  
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    contenu: contenu || '',
    descriptionPost: descriptionPost || '',
    texteStory: texteStory || '',
  })

  const isReseauxSociaux = type === 'SOCIAL'

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSupportContenu(supportId, {
        contenu: formData.contenu || null,
        descriptionPost: isReseauxSociaux ? (formData.descriptionPost || null) : null,
        texteStory: isReseauxSociaux ? (formData.texteStory || null) : null,
      })

      if (result.success) {
        toast.success('Contenu mis à jour')
        setIsEditing(false)
      } else {
        toast.error(result.error || 'Erreur')
      }
    })
  }

  const handleCancel = () => {
    setFormData({
      contenu: contenu || '',
      descriptionPost: descriptionPost || '',
      texteStory: texteStory || '',
    })
    setIsEditing(false)
  }

  const hasContent = contenu || (isReseauxSociaux && (descriptionPost || texteStory))

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="h-5 w-5" />
            Contenu textuel
            {isReseauxSociaux && (
              <Badge variant="secondary" className="ml-2">
                <Instagram className="h-3 w-3 mr-1" />
                Réseaux sociaux
              </Badge>
            )}
          </CardTitle>
          {canEditDirectly ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onSuggest}>
              <MessageSquareText className="h-4 w-4 mr-1" />
              Suggérer
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasContent ? (
            <p className="text-gray-500 italic text-center py-4">
              Aucun contenu textuel défini
            </p>
          ) : (
            <>
              {contenu && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Texte principal</Label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{contenu}</p>
                </div>
              )}
              
              {isReseauxSociaux && descriptionPost && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Instagram className="h-3 w-3" />
                    Description du post
                  </Label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{descriptionPost}</p>
                </div>
              )}
              
              {isReseauxSociaux && texteStory && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Texte Story</Label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{texteStory}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Type className="h-5 w-5" />
          Modifier le contenu
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
          >
            <Save className="h-4 w-4 mr-1" />
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contenu">Texte principal</Label>
          <Textarea
            id="contenu"
            placeholder="Contenu textuel du support..."
            value={formData.contenu}
            onChange={(e) => setFormData((prev) => ({ ...prev, contenu: e.target.value }))}
            rows={4}
          />
        </div>

        {isReseauxSociaux && (
          <>
            <div className="space-y-2">
              <Label htmlFor="descriptionPost" className="flex items-center gap-1">
                <Instagram className="h-3 w-3" />
                Description du post
              </Label>
              <Textarea
                id="descriptionPost"
                placeholder="Caption pour le post (Instagram, LinkedIn, etc.)..."
                value={formData.descriptionPost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, descriptionPost: e.target.value }))
                }
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Le texte qui accompagnera l&apos;image ou la vidéo sur les réseaux sociaux
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="texteStory">Texte Story</Label>
              <Textarea
                id="texteStory"
                placeholder="Texte à afficher dans la story..."
                value={formData.texteStory}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, texteStory: e.target.value }))
                }
                rows={2}
              />
              <p className="text-xs text-gray-500">
                Texte court pour les stories Instagram/Facebook
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
