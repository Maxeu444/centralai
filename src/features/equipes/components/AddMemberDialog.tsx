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
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Search, UserPlus, Users } from 'lucide-react'
import { addEquipeMember } from '../actions'

interface AddMemberDialogProps {
  equipeId: string
  equipeName: string
  availableUsers: {
    id: string
    prenom: string
    nom: string
    email: string
  }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({
  equipeId,
  equipeName,
  availableUsers,
  open,
  onOpenChange,
}: AddMemberDialogProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filteredUsers = availableUsers.filter((user) => {
    const fullName = `${user.prenom} ${user.nom}`.toLowerCase()
    const searchLower = search.toLowerCase()
    return (
      fullName.includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

  async function handleAddMember(userId: string) {
    setLoading(userId)

    const formData = new FormData()
    formData.set('equipeId', equipeId)
    formData.set('userId', userId)

    const result = await addEquipeMember(formData)

    setLoading(null)

    if (result.success) {
      toast.success('Membre ajouté à l\'équipe')
      router.refresh()
      // Keep dialog open so user can add more members
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Ajouter un membre
          </DialogTitle>
          <DialogDescription>
            Ajoutez un membre à l&apos;équipe &quot;{equipeName}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {availableUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Tous les membres de l&apos;entreprise sont déjà dans cette équipe.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Aucun résultat pour &quot;{search}&quot;</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const initials = `${user.prenom[0] || ''}${user.nom[0] || ''}`.toUpperCase()
                  const isLoading = loading === user.id

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.prenom} {user.nom}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddMember(user.id)}
                        disabled={isLoading || loading !== null}
                      >
                        {isLoading ? 'Ajout...' : 'Ajouter'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
