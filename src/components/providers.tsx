'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'

export function Providers({ children }: { children: React.ReactNode }) {
  const accentColor = useSettingsStore((s) => s.accentColor)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    const hex = accentColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`)
    }
  }, [accentColor])

  return <>{children}</>
}
