import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar, Header } from '@/components/layout'
import { Toaster } from '@/components/ui/sonner'
import { PermissionProvider } from '@/components/auth'
import { getPermissionContext } from '@/lib/permission-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const entreprise = await prisma.entreprise.findUnique({
    where: { id: session.user.entrepriseId },
    select: { nom: true },
  })

  // Préparer le contexte de permissions pour le client
  const permissionContext = await getPermissionContext()

  // Ne devrait jamais arriver car on a déjà vérifié l'auth ci-dessus
  if (!permissionContext) {
    redirect('/login')
  }

  return (
    <PermissionProvider value={permissionContext}>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            user={{
              nom: session.user.nom,
              prenom: session.user.prenom,
              email: session.user.email,
              role: session.user.role,
            }}
            entrepriseNom={entreprise?.nom || 'Mon entreprise'}
          />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        <Toaster position="top-right" />
      </div>
    </PermissionProvider>
  )
}
