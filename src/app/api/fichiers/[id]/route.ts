import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const fichier = await prisma.fichier.findUnique({
      where: { id },
      include: {
        support: {
          select: { entrepriseId: true },
        },
      },
    })

    if (!fichier) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Vérification tenant
    if (fichier.support.entrepriseId !== session.user.entrepriseId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Lire le fichier
    if (!existsSync(fichier.cheminStockage)) {
      return NextResponse.json({ error: 'Fichier introuvable sur le disque' }, { status: 404 })
    }

    const buffer = await readFile(fichier.cheminStockage)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fichier.mimeType,
        'Content-Disposition': `inline; filename="${fichier.nomOriginal}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Erreur lecture fichier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
