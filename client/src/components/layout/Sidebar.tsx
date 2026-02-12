import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  UserCheck,
  MessageSquare,
  Zap,
  BarChart3,
  Settings,
  ChevronLeft,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Students', href: '/students' },
  { icon: BookOpen, label: 'Classes', href: '/classes' },
  { icon: Calendar, label: 'Schedule', href: '/schedule' },
  { icon: DollarSign, label: 'Billing', href: '/billing' },
  { icon: UserCheck, label: 'Staff', href: '/staff' },
  { icon: MessageSquare, label: 'Messages', href: '/messages' },
  { icon: Zap, label: 'Waivers', href: '/waivers' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r border-border-DEFAULT bg-surface-card transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border-DEFAULT h-16">
        {!sidebarCollapsed && (
          <h1 className="text-lg font-bold text-brand-500">GymFlow</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-surface-page rounded-md transition-colors"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                isActive
                  ? 'bg-brand-50 text-brand-500'
                  : 'text-text-secondary hover:bg-surface-page'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
