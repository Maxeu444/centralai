'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MoreHorizontal, RefreshCw, XCircle, Copy } from 'lucide-react'
import { cancelInvitation, resendInvitation } from '@/features/equipe/actions'

interface InvitationActionsProps {
  invitationId: string
}

export function InvitationActions({ invitationId }: InvitationActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    const formData = new FormData()
    formData.append('invitationId', invitationId)

    const result = await cancelInvitation(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Invitation annulée')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleResend() {
    setLoading(true)
    const formData = new FormData()
    formData.append('invitationId', invitationId)

    const result = await resendInvitation(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Nouvelle invitation envoyée')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function handleCopyLink() {
    // En production, cela serait le vrai lien d'invitation
    const inviteLink = `${window.location.origin}/register?invitation=${invitationId}`
    navigator.clipboard.writeText(inviteLink)
    toast.success('Lien copié dans le presse-papier')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copier le lien
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleResend}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Renvoyer l&apos;invitation
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={handleCancel}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Annuler l&apos;invitation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
