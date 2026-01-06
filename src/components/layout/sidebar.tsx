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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions, Can, ManagerOrAbove, AdminOnly } from '@/components/auth'
import type { Permission } from '@/lib/rbac'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  permission?: Permission
  adminOnly?: boolean
  managerOrAbove?: boolean
}

const navigation: NavItem[] = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projets', href: '/dashboard/projets', icon: FolderKanban },
  { name: 'Supports', href: '/dashboard/supports', icon: FileText },
  { name: 'Équipe', href: '/dashboard/equipe', icon: Users, managerOrAbove: true },
  { name: 'Invitations', href: '/dashboard/invitations', icon: Mail, adminOnly: true },
  { name: 'Historique', href: '/dashboard/historique', icon: History, managerOrAbove: true },
  { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings, adminOnly: true },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
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
}

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
          
          // Rendu conditionnel selon les permissions
          if (item.adminOnly) {
            return (
              <AdminOnly key={item.name}>
                <NavLink item={item} isActive={isActive} />
              </AdminOnly>
            )
          }
          
          if (item.managerOrAbove) {
            return (
              <ManagerOrAbove key={item.name}>
                <NavLink item={item} isActive={isActive} />
              </ManagerOrAbove>
            )
          }
          
          if (item.permission) {
            return (
              <Can key={item.name} permission={item.permission}>
                <NavLink item={item} isActive={isActive} />
              </Can>
            )
          }
          
          // Pas de restriction - afficher pour tous
          return <NavLink key={item.name} item={item} isActive={isActive} />
        })}
      </nav>

      {/* Role indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && <RoleIndicator />}
    </aside>
  )
}

function RoleIndicator() {
  const { role } = usePermissions()
  
  const roleColors = {
    ADMIN: 'bg-red-100 text-red-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    COLLABORATEUR: 'bg-green-100 text-green-700',
  }
  
  return (
    <div className="border-t px-3 py-3">
      <div className={cn(
        'rounded-md px-3 py-1.5 text-xs font-medium text-center',
        roleColors[role] || 'bg-gray-100 text-gray-700'
      )}>
        Rôle: {role}
      </div>
    </div>
  )
}
