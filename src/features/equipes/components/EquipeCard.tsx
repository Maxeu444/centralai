'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { MoreVertical, Pencil, Trash2, UserPlus, Users } from 'lucide-react'
import { deleteEquipe } from '../actions'
import { EditEquipeDialog } from './EditEquipeDialog'
import { AddMemberDialog } from './AddMemberDialog'

interface EquipeMember {
  id: string
  user: {
    id: string
    prenom: string
    nom: string
    email: string
  }
}

interface EquipeCardProps {
  equipe: {
    id: string
    nom: string
    description: string | null
    couleur: string
    membres: EquipeMember[]
  }
  availableUsers: {
    id: string
    prenom: string
    nom: string
    email: string
  }[]
  canEdit: boolean
  canDelete: boolean
}

export function EquipeCard({ equipe, availableUsers, canEdit, canDelete }: EquipeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const memberIds = equipe.membres.map(m => m.user.id)
  const usersNotInTeam = availableUsers.filter(u => !memberIds.includes(u.id))

  async function handleDelete() {
    setDeleting(true)
    const formData = new FormData()
    formData.set('equipeId', equipe.id)
    
    const result = await deleteEquipe(formData)
    
    setDeleting(false)
    setShowDeleteDialog(false)

    if (result.success) {
      toast.success('Équipe supprimée')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <Card className="relative overflow-hidden">
        {/* Color bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: equipe.couleur }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: equipe.couleur }}
              >
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{equipe.nom}</CardTitle>
                <CardDescription>
                  {equipe.membres.length} membre{equipe.membres.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>

            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <>
                      <DropdownMenuItem onClick={() => setShowAddMemberDialog(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Ajouter un membre
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                    </>
                  )}
                  {canEdit && canDelete && <DropdownMenuSeparator />}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {equipe.description && (
            <p className="text-sm text-muted-foreground mb-4">{equipe.description}</p>
          )}

          {equipe.membres.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Membres</p>
              <div className="flex flex-wrap gap-2">
                {equipe.membres.slice(0, 5).map((membre) => (
                  <MemberBadge
                    key={membre.id}
                    membre={membre}
                    equipeId={equipe.id}
                    canEdit={canEdit}
                  />
                ))}
                {equipe.membres.length > 5 && (
                  <div className="flex h-8 items-center rounded-full bg-muted px-3 text-sm text-muted-foreground">
                    +{equipe.membres.length - 5} autres
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Aucun membre dans cette équipe
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;équipe</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l&apos;équipe &quot;{equipe.nom}&quot; ?
              Cette action est irréversible. Les membres ne seront pas supprimés de
              l&apos;entreprise.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <EditEquipeDialog
        equipe={equipe}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Add member dialog */}
      <AddMemberDialog
        equipeId={equipe.id}
        equipeName={equipe.nom}
        availableUsers={usersNotInTeam}
        open={showAddMemberDialog}
        onOpenChange={setShowAddMemberDialog}
      />
    </>
  )
}

interface MemberBadgeProps {
  membre: EquipeMember
  equipeId: string
  canEdit: boolean
}

import { removeEquipeMember } from '../actions'
import { X } from 'lucide-react'

function MemberBadge({ membre, equipeId, canEdit }: MemberBadgeProps) {
  const [removing, setRemoving] = useState(false)
  const router = useRouter()

  const initials = `${membre.user.prenom[0] || ''}${membre.user.nom[0] || ''}`.toUpperCase()

  async function handleRemove() {
    setRemoving(true)
    const formData = new FormData()
    formData.set('equipeId', equipeId)
    formData.set('userId', membre.user.id)
    
    const result = await removeEquipeMember(formData)
    
    setRemoving(false)

    if (result.success) {
      toast.success(`${membre.user.prenom} a été retiré de l'équipe`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="group flex items-center gap-1 rounded-full bg-muted pr-1 pl-1">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm px-1">
        {membre.user.prenom} {membre.user.nom}
      </span>
      {canEdit && (
        <button
          onClick={handleRemove}
          disabled={removing}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-red-600"
          title="Retirer de l'équipe"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
