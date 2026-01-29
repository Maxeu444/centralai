'use client'

import { useState } from 'react'
import { ContenuEditor, CreateSuggestionDialog } from '@/features/supports'

interface SupportContenu {
  contenu: string | null
  descriptionPost: string | null
  texteStory: string | null
}

interface SupportContenuClientProps {
  supportId: string
  type: string
  initialContenu: SupportContenu
  canEditDirectly: boolean
}

export function SupportContenuClient({
  supportId,
  type,
  initialContenu,
  canEditDirectly,
}: SupportContenuClientProps) {
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false)

  return (
    <>
      <ContenuEditor
        supportId={supportId}
        type={type}
        initialContenu={initialContenu}
        canEditDirectly={canEditDirectly}
        onSuggest={() => setShowSuggestionDialog(true)}
      />

      <CreateSuggestionDialog
        supportId={supportId}
        typeSupport={type}
        open={showSuggestionDialog}
        onOpenChange={setShowSuggestionDialog}
      />
    </>
  )
}
