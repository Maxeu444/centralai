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
import { MoreHorizontal, Shield, Trash2, AlertTriangle } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/features/equipe/actions'

type Role = 'ADMIN' | 'MANAGER' | 'COLLABORATEUR'

interface UserActionsProps {
  user: {
    id: string
    nom: string
    prenom: string
    role: Role
  }
  currentUserId: string
  canManage: boolean
}

export function UserActions({ user, currentUserId, canManage }: UserActionsProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(user.role)
  const router = useRouter()

  const isCurrentUser = user.id === currentUserId
  const isAdmin = user.role === 'ADMIN'

  if (!canManage || isCurrentUser) {
    return null
  }

  async function handleRoleChange() {
    if (selectedRole === user.role) {
      setRoleDialogOpen(false)
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('userId', user.id)
    formData.append('role', selectedRole)

    const result = await updateUserRole(formData)
    setLoading(false)

    if (result.success) {
      toast.success(`Rôle de ${user.prenom} mis à jour`)
      setRoleDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    setLoading(true)
    const formData = new FormData()
    formData.append('userId', user.id)

    const result = await deleteUser(formData)
    setLoading(false)

    if (result.success) {
      toast.success(`${user.prenom} ${user.nom} a été supprimé`)
      setDeleteDialogOpen(false)
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
          {!isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog modifier rôle */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifier le rôle de {user.prenom} {user.nom}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{user.prenom} {user.nom}</p>
                <p className="text-sm text-muted-foreground">
                  Rôle actuel: <Badge variant="outline">{user.role}</Badge>
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

      {/* Dialog suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{user.prenom} {user.nom}</strong> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <p className="font-medium mb-1">Cette action supprimera :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Le compte utilisateur</li>
                <li>Ses appartenances aux projets</li>
                <li>Ses commentaires seront conservés (auteur anonymisé)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
