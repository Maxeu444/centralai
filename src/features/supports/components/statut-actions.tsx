'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { changeStatut } from '../actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Check, X, Send } from 'lucide-react'

type StatutSupport = 'BROUILLON' | 'EN_VALIDATION' | 'VALIDE' | 'REFUSE'
type Role = 'ADMIN' | 'MANAGER' | 'COLLABORATEUR'

interface StatutActionsProps {
  supportId: string
  statut: StatutSupport
  roleProjet: Role
  isCreateur: boolean
}

export function StatutActions({ supportId, statut, roleProjet, isCreateur }: StatutActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const canValidate = roleProjet === 'ADMIN' || roleProjet === 'MANAGER'
  const canRequestValidation = isCreateur || canValidate

  async function handleAction(action: 'DEMANDER_VALIDATION' | 'VALIDER' | 'REFUSER') {
    setIsLoading(true)
    try {
      const result = await changeStatut(supportId, { action })
      if (result.success) {
        const messages = {
          DEMANDER_VALIDATION: 'Demande de validation envoyée',
          VALIDER: 'Support validé',
          REFUSER: 'Support refusé',
        }
        toast.success(messages[action])
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
    <div className="flex items-center gap-2">
      <Badge
        variant={
          statut === 'VALIDE'
            ? 'default'
            : statut === 'EN_VALIDATION'
              ? 'secondary'
              : statut === 'REFUSE'
                ? 'destructive'
                : 'outline'
        }
      >
        {statut.replace('_', ' ')}
      </Badge>

      {(statut === 'BROUILLON' || statut === 'REFUSE') && canRequestValidation && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('DEMANDER_VALIDATION')}
          disabled={isLoading}
        >
          <Send className="mr-1 h-4 w-4" />
          Demander validation
        </Button>
      )}

      {statut === 'EN_VALIDATION' && canValidate && (
        <>
          <Button
            size="sm"
            variant="default"
            onClick={() => handleAction('VALIDER')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-1 h-4 w-4" />
            Valider
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction('REFUSER')}
            disabled={isLoading}
          >
            <X className="mr-1 h-4 w-4" />
            Refuser
          </Button>
        </>
      )}
    </div>
  )
}
