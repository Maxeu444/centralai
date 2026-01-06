'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { inviteUser } from '@/features/equipe/actions'

type Projet = {
  id: string
  nom: string
}

type Equipe = {
  id: string
  nom: string
  couleur: string
}

interface InviteUserDialogProps {
  projets?: Projet[]
  equipes?: Equipe[]
  trigger?: React.ReactNode
}

export function InviteUserDialog({ projets = [], equipes = [], trigger }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await inviteUser(formData)

    setLoading(false)

    if (result.success) {
      toast.success('Membre ajouté avec succès. Un email a été envoyé pour définir son mot de passe.')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un membre
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Ajouter un membre
          </DialogTitle>
          <DialogDescription>
            Créez un compte pour le nouveau membre. Il recevra un email pour définir son mot de passe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                name="prenom"
                type="text"
                placeholder="Jean"
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                name="nom"
                type="text"
                placeholder="Dupont"
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="collaborateur@exemple.com"
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select name="role" defaultValue="COLLABORATEUR">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COLLABORATEUR">
                  <div className="flex flex-col items-start">
                    <span>Collaborateur</span>
                    <span className="text-xs text-muted-foreground">
                      Crée des supports, demande des validations
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="MANAGER">
                  <div className="flex flex-col items-start">
                    <span>Manager</span>
                    <span className="text-xs text-muted-foreground">
                      Gère les projets et valide les supports
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex flex-col items-start">
                    <span>Administrateur</span>
                    <span className="text-xs text-muted-foreground">
                      Accès complet, gère l&apos;équipe
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {equipes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="equipeId">Équipe (optionnel)</Label>
              <Select name="equipeId" defaultValue="__none__">
                <SelectTrigger>
                  <SelectValue placeholder="Aucune équipe spécifique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune équipe spécifique</SelectItem>
                  {equipes.map((equipe) => (
                    <SelectItem key={equipe.id} value={equipe.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: equipe.couleur }}
                        />
                        {equipe.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                L&apos;utilisateur sera automatiquement ajouté à cette équipe
              </p>
            </div>
          )}

          {projets.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="projetId">Projet (optionnel)</Label>
              <Select name="projetId" defaultValue="__none__">
                <SelectTrigger>
                  <SelectValue placeholder="Aucun projet spécifique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucun projet spécifique</SelectItem>
                  {projets.map((projet) => (
                    <SelectItem key={projet.id} value={projet.id}>
                      {projet.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                L&apos;utilisateur sera automatiquement ajouté à ce projet
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le compte'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
