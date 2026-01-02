import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Types pour les rôles (définis localement pour éviter les problèmes d'import Prisma)
export type Role = 'ADMIN' | 'MANAGER' | 'COLLABORATEUR'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    nom: string
    prenom: string
    role: Role
    entrepriseId: string
  }

  interface Session {
    user: {
      id: string
      email: string
      nom: string
      prenom: string
      role: Role
      entrepriseId: string
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
          include: { entreprise: true },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(password, user.passwordHash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role as Role,
          entrepriseId: user.entrepriseId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email as string
        token.nom = user.nom
        token.prenom = user.prenom
        token.role = user.role
        token.entrepriseId = user.entrepriseId
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        nom: token.nom as string,
        prenom: token.prenom as string,
        role: token.role as Role,
        entrepriseId: token.entrepriseId as string,
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
})
