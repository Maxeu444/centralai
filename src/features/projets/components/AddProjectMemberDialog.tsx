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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { addProjectMember } from '@/features/projets/members-actions'

type User = {
  id: string
  nom: string
  prenom: string
  email: string
}

interface AddProjectMemberDialogProps {
  projetId: string
  availableUsers: User[]
  trigger?: React.ReactNode
}

export function AddProjectMemberDialog({ 
  projetId, 
  availableUsers, 
  trigger 
}: AddProjectMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('COLLABORATEUR')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un utilisateur')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('projetId', projetId)
    formData.append('userId', selectedUser)
    formData.append('role', selectedRole)

    const result = await addProjectMember(formData)

    setLoading(false)

    if (result.success) {
      toast.success('Membre ajouté au projet')
      setOpen(false)
      setSelectedUser('')
      setSelectedRole('COLLABORATEUR')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  if (availableUsers.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un membre
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
            Ajoutez un collaborateur de votre entreprise à ce projet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Utilisateur</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col items-start">
                      <span>{user.prenom} {user.nom}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rôle dans le projet</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
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
                      Valide les supports, gère les membres
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex flex-col items-start">
                    <span>Administrateur</span>
                    <span className="text-xs text-muted-foreground">
                      Accès complet au projet
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !selectedUser}>
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
