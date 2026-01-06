'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, Trash2, Building2, Loader2 } from 'lucide-react'
import { uploadEntrepriseLogo, deleteEntrepriseLogo } from '../actions'

interface LogoUploadProps {
  currentLogoUrl: string | null
  entrepriseNom: string
}

export function LogoUpload({ currentLogoUrl, entrepriseNom }: LogoUploadProps) {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setLoading(true)

    const formData = new FormData()
    formData.append('logo', file)

    const result = await uploadEntrepriseLogo(formData)

    setLoading(false)

    if (result.success && result.data) {
      setPreviewUrl(result.data.logoUrl)
      toast.success('Logo mis à jour avec succès')
      router.refresh()
    } else if (!result.success) {
      setPreviewUrl(currentLogoUrl)
      toast.error(result.error)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleDelete() {
    if (!previewUrl) return

    setLoading(true)
    const result = await deleteEntrepriseLogo()
    setLoading(false)

    if (result.success) {
      setPreviewUrl(null)
      toast.success('Logo supprimé')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Logo preview */}
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          )}
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Logo ${entrepriseNom}`}
              fill
              className="object-contain p-2"
            />
          ) : (
            <Building2 className="h-10 w-10 text-gray-400" />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {previewUrl ? 'Changer le logo' : 'Ajouter un logo'}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Formats acceptés : JPG, PNG, GIF, WebP, SVG. Taille max : 2MB.
      </p>
    </div>
  )
}
