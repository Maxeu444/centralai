'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Settings,
  History,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projets', href: '/dashboard/projets', icon: FolderKanban },
  { name: 'Supports', href: '/dashboard/supports', icon: FileText },
  { name: 'Équipe', href: '/dashboard/equipe', icon: Users },
  { name: 'Invitations', href: '/dashboard/invitations', icon: Mail },
  { name: 'Historique', href: '/dashboard/historique', icon: History },
  { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-gray-50">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          CentralIA
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
