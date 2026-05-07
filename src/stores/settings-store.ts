'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  accentColor: string
  sidebarCollapsed: boolean
  editorMode: 'block' | 'markdown'
  notificationEnabled: boolean
  setAccentColor: (color: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setEditorMode: (mode: 'block' | 'markdown') => void
  setNotificationEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      accentColor: '#8b5cf6',
      sidebarCollapsed: false,
      editorMode: 'block',
      notificationEnabled: true,
      setAccentColor: (color) => {
        set({ accentColor: color })
        document.documentElement.style.setProperty('--accent-color', color)
        const hex = color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`)
      },
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setEditorMode: (mode) => set({ editorMode: mode }),
      setNotificationEnabled: (enabled) => set({ notificationEnabled: enabled }),
    }),
    { name: 'taskmaster-settings' }
  )
)
