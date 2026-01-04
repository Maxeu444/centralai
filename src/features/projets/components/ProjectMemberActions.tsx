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
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { MoreHorizontal, Shield, UserMinus, AlertTriangle } from 'lucide-react'
import { updateProjectMemberRole, removeProjectMember } from '@/features/projets/members-actions'

type Role = 'ADMIN' | 'MANAGER' | 'COLLABORATEUR'

interface ProjectMemberActionsProps {
  projetId: string
  member: {
    userId: string
    nom: string
    prenom: string
    role: Role
  }
  currentUserId: string
  canManage: boolean
}

export function ProjectMemberActions({ 
  projetId,
  member, 
  currentUserId, 
  canManage 
}: ProjectMemberActionsProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(member.role)
  const router = useRouter()

  const isCurrentUser = member.userId === currentUserId

  if (!canManage || isCurrentUser) {
    return null
  }

  async function handleRoleChange() {
    if (selectedRole === member.role) {
      setRoleDialogOpen(false)
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('projetId', projetId)
    formData.append('userId', member.userId)
    formData.append('role', selectedRole)

    const result = await updateProjectMemberRole(formData)
    setLoading(false)

    if (result.success) {
      toast.success(`Rôle de ${member.prenom} mis à jour`)
      setRoleDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleRemove() {
    setLoading(true)
    const formData = new FormData()
    formData.append('projetId', projetId)
    formData.append('userId', member.userId)

    const result = await removeProjectMember(formData)
    setLoading(false)

    if (result.success) {
      toast.success(`${member.prenom} a été retiré du projet`)
      setRemoveDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Modifier le rôle
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setRemoveDialogOpen(true)}
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Retirer du projet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog modifier rôle */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle dans le projet</DialogTitle>
            <DialogDescription>
              Modifier le rôle de {member.prenom} {member.nom} pour ce projet
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{member.prenom} {member.nom}</p>
                <p className="text-sm text-muted-foreground">
                  Rôle actuel: <Badge variant="outline">{member.role}</Badge>
                </p>
              </div>
            </div>

            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
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
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleRoleChange} disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog retirer */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Retirer du projet
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer <strong>{member.prenom} {member.nom}</strong> de ce projet ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              L&apos;utilisateur n&apos;aura plus accès aux supports de ce projet.
              Il pourra être réajouté ultérieurement.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={loading}>
              {loading ? 'Retrait...' : 'Retirer du projet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
