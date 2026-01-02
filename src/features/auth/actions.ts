'use server'

import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from './schemas'
import { hash } from 'bcryptjs'
import { slugify } from '@/lib/utils'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import type { Prisma } from '@prisma/client'

export type ActionResult = {
  success: boolean
  error?: string
}

export async function loginAction(data: LoginInput): Promise<ActionResult> {
  try {
    const validated = loginSchema.parse(data)

    await signIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Email ou mot de passe incorrect' }
    }
    return { success: false, error: 'Une erreur est survenue' }
  }
}

export async function registerAction(data: RegisterInput): Promise<ActionResult> {
  try {
    const validated = registerSchema.parse(data)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { success: false, error: 'Cet email est déjà utilisé' }
    }

    // Créer le slug pour l'entreprise
    let slug = slugify(validated.entrepriseNom)
    const existingEntreprise = await prisma.entreprise.findUnique({
      where: { slug },
    })

    if (existingEntreprise) {
      slug = `${slug}-${Date.now()}`
    }

    // Hasher le mot de passe
    const passwordHash = await hash(validated.password, 12)

    // Créer l'entreprise et l'admin dans une transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const entreprise = await tx.entreprise.create({
        data: {
          nom: validated.entrepriseNom,
          slug,
        },
      })

      const user = await tx.user.create({
        data: {
          email: validated.email,
          passwordHash,
          nom: validated.nom,
          prenom: validated.prenom,
          role: 'ADMIN',
          entrepriseId: entreprise.id,
        },
      })

      // Créer l'entrée d'audit
      await tx.historiqueAction.create({
        data: {
          type: 'CREATION',
          description: `Création de l'entreprise "${entreprise.nom}" et du compte admin`,
          entrepriseId: entreprise.id,
          userId: user.id,
        },
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur inscription:', error)
    return { success: false, error: 'Une erreur est survenue lors de l\'inscription' }
  }
}

export async function logoutAction() {
  await signOut({ redirect: false })
  redirect('/login')
}
