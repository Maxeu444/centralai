'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { uploadFichier } from '../actions'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'

interface UploadFichierProps {
  supportId: string
}

export function UploadFichier({ supportId }: UploadFichierProps) {
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadFichier(supportId, formData)
      if (result.success) {
        toast.success('Fichier uploadé avec succès')
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.docx,.xlsx,.pptx"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          asChild
        >
          <span className="cursor-pointer">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Upload...' : 'Nouvelle version'}
          </span>
        </Button>
      </label>
    </div>
  )
}
