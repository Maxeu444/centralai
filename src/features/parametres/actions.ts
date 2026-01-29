'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink, access } from 'fs/promises'
import { join } from 'path'

/**
 * Vérifie si un fichier ou dossier existe (version async)
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

// =============================================================================
// TYPES
// =============================================================================

type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string }

// =============================================================================
// UPLOAD LOGO ENTREPRISE (Admin uniquement)
// =============================================================================

export async function uploadEntrepriseLogo(formData: FormData): Promise<ActionResult<{ logoUrl: string }>> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Seul un admin peut modifier le logo
    if (session.user.role !== 'ADMIN') {
      return { success: false, error: 'Seul un administrateur peut modifier le logo' }
    }

    const file = formData.get('logo') as File | null
    if (!file) {
      return { success: false, error: 'Aucun fichier fourni' }
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF, WebP ou SVG.' }
    }

    // Validation de la taille (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: 'Le fichier est trop volumineux (max 2MB)' }
    }

    // Récupérer l'entreprise actuelle
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: session.user.entrepriseId },
      select: { id: true, logoUrl: true },
    })

    if (!entreprise) {
      return { success: false, error: 'Entreprise non trouvée' }
    }

    // Supprimer l'ancien logo s'il existe
    if (entreprise.logoUrl) {
      const oldLogoPath = join(process.cwd(), 'public', entreprise.logoUrl)
      if (await fileExists(oldLogoPath)) {
        try {
          await unlink(oldLogoPath)
        } catch {
          // Ignorer les erreurs de suppression
        }
      }
    }

    // Créer le dossier pour les logos si nécessaire (mkdir recursive crée si nécessaire)
    const logosDir = join(process.cwd(), 'public', 'logos')
    await mkdir(logosDir, { recursive: true })

    // Générer un nom de fichier unique
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${session.user.entrepriseId}-${Date.now()}.${ext}`
    const filepath = join(logosDir, filename)

    // Écrire le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // URL publique du logo
    const logoUrl = `/logos/${filename}`

    // Mettre à jour l'entreprise
    await prisma.entreprise.update({
      where: { id: session.user.entrepriseId },
      data: { logoUrl },
    })

    revalidatePath('/dashboard/parametres')
    return { success: true, data: { logoUrl } }
  } catch (error) {
    console.error('Erreur upload logo:', error)
    return { success: false, error: 'Une erreur est survenue lors de l\'upload' }
  }
}

// =============================================================================
// SUPPRIMER LOGO ENTREPRISE (Admin uniquement)
// =============================================================================

export async function deleteEntrepriseLogo(): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (session.user.role !== 'ADMIN') {
      return { success: false, error: 'Seul un administrateur peut supprimer le logo' }
    }

    const entreprise = await prisma.entreprise.findUnique({
      where: { id: session.user.entrepriseId },
      select: { id: true, logoUrl: true },
    })

    if (!entreprise) {
      return { success: false, error: 'Entreprise non trouvée' }
    }

    if (!entreprise.logoUrl) {
      return { success: false, error: 'Aucun logo à supprimer' }
    }

    // Supprimer le fichier
    const logoPath = join(process.cwd(), 'public', entreprise.logoUrl)
    if (await fileExists(logoPath)) {
      await unlink(logoPath)
    }

    // Mettre à jour l'entreprise
    await prisma.entreprise.update({
      where: { id: session.user.entrepriseId },
      data: { logoUrl: null },
    })

    revalidatePath('/dashboard/parametres')
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression logo:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

// =============================================================================
// METTRE À JOUR LES INFOS ENTREPRISE (Admin uniquement)
// =============================================================================

export async function updateEntrepriseInfo(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Non authentifié' }
    }

    if (session.user.role !== 'ADMIN') {
      return { success: false, error: 'Seul un administrateur peut modifier les informations' }
    }

    const nom = formData.get('nom') as string
    if (!nom || nom.trim().length < 2) {
      return { success: false, error: 'Le nom doit contenir au moins 2 caractères' }
    }

    await prisma.entreprise.update({
      where: { id: session.user.entrepriseId },
      data: { nom: nom.trim() },
    })

    revalidatePath('/dashboard/parametres')
    return { success: true }
  } catch (error) {
    console.error('Erreur mise à jour entreprise:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}
