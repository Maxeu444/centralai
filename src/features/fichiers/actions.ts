'use server'

import { prisma } from '@/lib/prisma'
import { canAccessSupport } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import type { Prisma } from '@prisma/client'

export type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = (Number(process.env.MAX_FILE_SIZE_MB) || 100) * 1024 * 1024 // 100MB par défaut pour vidéos

const ALLOWED_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Vidéos
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
]

export async function uploadFichier(
  supportId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, support } = await canAccessSupport(supportId)

    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'Aucun fichier fourni' }
    }

    // Vérifications
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Type de fichier non autorisé' }
    }

    // Créer le dossier si nécessaire (mkdir recursive crée seulement si besoin)
    const uploadPath = join(UPLOAD_DIR, user.entrepriseId, supportId)
    await mkdir(uploadPath, { recursive: true })

    // Générer un nom unique
    const extension = file.name.split('.').pop() || ''
    const timestamp = Date.now()
    const nomStocke = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
    const filePath = join(uploadPath, nomStocke)

    // Écrire le fichier
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Déterminer la version
    const lastFichier = await prisma.fichier.findFirst({
      where: { supportId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })
    const version = (lastFichier?.version || 0) + 1

    // Enregistrer en base
    const fichier = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newFichier = await tx.fichier.create({
        data: {
          nomOriginal: file.name,
          nomStocke,
          mimeType: file.type,
          taille: file.size,
          version,
          cheminStockage: filePath,
          supportId,
          uploadeurId: user.id,
        },
      })

      await tx.historiqueAction.create({
        data: {
          type: 'UPLOAD_VERSION',
          description: `Upload de la version ${version}: ${file.name}`,
          entrepriseId: user.entrepriseId,
          userId: user.id,
          supportId,
          projetId: support.projetId,
          fichierId: newFichier.id,
        },
      })

      return newFichier
    })

    revalidatePath(`/dashboard/supports/${supportId}`)
    return { success: true, data: { id: fichier.id } }
  } catch (error) {
    console.error('Erreur upload fichier:', error)
    return { success: false, error: 'Erreur lors de l\'upload' }
  }
}

export async function deleteFichier(fichierId: string): Promise<ActionResult> {
  try {
    const fichier = await prisma.fichier.findUnique({
      where: { id: fichierId },
      select: { supportId: true, cheminStockage: true },
    })

    if (!fichier) {
      return { success: false, error: 'Fichier non trouvé' }
    }

    const { roleProjet } = await canAccessSupport(fichier.supportId)

    if (roleProjet === 'COLLABORATEUR') {
      return { success: false, error: 'Permission refusée' }
    }

    // Supprimer de la base (on garde le fichier physique pour l'instant - soft delete possible)
    await prisma.fichier.delete({
      where: { id: fichierId },
    })

    revalidatePath(`/dashboard/supports/${fichier.supportId}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression fichier:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
