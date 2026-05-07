'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSettingsStore } from '@/stores/settings-store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { NoteTree } from './note-tree'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, setSidebarCollapsed } = useSettingsStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isNotesOpen = pathname.startsWith('/notes')

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <div className={cn(
      'flex flex-col h-full transition-all duration-300 ease-in-out glass-sidebar',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(var(--accent-rgb), 0.25)' }}>
              <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            </div>
            <span className="font-semibold text-white text-sm">TaskMaster</span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/notes'
              ? pathname.startsWith('/notes')
              : pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                      active
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    style={active ? {
                      background: `rgba(var(--accent-rgb), 0.15)`,
                      color: 'var(--accent-color)',
                    } : {}}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px]" />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{label}</span>
                    )}
                    {active && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--accent-color)' }} />
                    )}
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="bg-slate-800 text-white border-white/10">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </TooltipProvider>

        {/* Note page tree (only when expanded and on notes) */}
        {!sidebarCollapsed && isNotesOpen && (
          <div className="mt-2 pt-2 border-t border-white/5">
            <NoteTree />
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/5">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors',
                  sidebarCollapsed && 'justify-center px-2'
                )}
              >
                <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Sign out</span>}
              </button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-white/10">
                Sign out
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        'lg:hidden fixed left-0 top-0 h-full z-50 transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-full w-64">
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
