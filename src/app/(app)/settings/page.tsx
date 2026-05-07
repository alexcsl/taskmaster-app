'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { Settings, Palette, Bell, User, AlignLeft, Code2 } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

const ACCENT_PRESETS = [
  { label: 'Purple', color: '#8b5cf6' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Cyan', color: '#06b6d4' },
  { label: 'Emerald', color: '#10b981' },
  { label: 'Amber', color: '#f59e0b' },
  { label: 'Rose', color: '#f43f5e' },
  { label: 'Pink', color: '#ec4899' },
  { label: 'Orange', color: '#f97316' },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const {
    accentColor, setAccentColor,
    editorMode, setEditorMode,
    notificationEnabled, setNotificationEnabled,
  } = useSettingsStore()

  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? '')
        setUserName(user.user_metadata?.full_name ?? '')
      }
    }
    fetchUser()
  }, [])

  async function handleSaveToCloud() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('user_settings') as any).upsert({
        user_id: user.id,
        accent_color: accentColor,
        editor_mode: editorMode,
        notification_enabled: notificationEnabled,
      })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function requestNotificationPermission() {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      if (result === 'granted') setNotificationEnabled(true)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Customize your TaskMaster experience</p>
      </div>

      <div className="space-y-6">
        {/* Accent Color */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            <h2 className="font-semibold text-white">Accent Color</h2>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {ACCENT_PRESETS.map(({ label, color }) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: color,
                    outline: accentColor === color ? '2px solid white' : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
                <span className="text-xs text-slate-500">{label}</span>
              </button>
            ))}
          </div>

          {/* Custom picker */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="text-sm text-slate-400 hover:text-white transition-colors underline"
          >
            {showColorPicker ? 'Hide' : 'Custom color…'}
          </button>

          {showColorPicker && (
            <div className="mt-4 space-y-3">
              <HexColorPicker color={accentColor} onChange={setAccentColor} style={{ width: '100%' }} />
              <div className="flex items-center gap-2">
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                  placeholder="#8b5cf6"
                />
                <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: accentColor }} />
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-slate-500">Preview:</span>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ background: accentColor }}>
                Button
              </div>
              <div className="px-3 py-1.5 rounded-lg text-xs border" style={{ color: accentColor, borderColor: accentColor, background: `${accentColor}15` }}>
                Badge
              </div>
            </div>
          </div>
        </div>

        {/* Editor Mode */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlignLeft className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            <h2 className="font-semibold text-white">Default Editor</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { mode: 'block', label: 'Block Editor', desc: 'Notion-like slash commands', icon: AlignLeft },
              { mode: 'markdown', label: 'Markdown', desc: 'Plain markdown with preview', icon: Code2 },
            ] as const).map(({ mode, label, desc, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setEditorMode(mode)}
                className="flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left"
                style={editorMode === mode ? {
                  background: `rgba(var(--accent-rgb), 0.1)`,
                  borderColor: accentColor,
                } : {
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Icon className="w-4 h-4 mb-1" style={editorMode === mode ? { color: accentColor } : { color: '#64748b' }} />
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="text-xs text-slate-500">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            <h2 className="font-semibold text-white">Notifications</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Due date reminders</p>
              <p className="text-xs text-slate-500 mt-0.5">Browser notification 24h before task is due</p>
            </div>
            <Switch
              checked={notificationEnabled}
              onCheckedChange={(val) => {
                if (val) requestNotificationPermission()
                else setNotificationEnabled(false)
              }}
            />
          </div>
        </div>

        {/* Account */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            <h2 className="font-semibold text-white">Account</h2>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-slate-400 text-xs">Name</Label>
              <p className="text-white text-sm mt-0.5">{userName || '—'}</p>
            </div>
            <div>
              <Label className="text-slate-400 text-xs">Email</Label>
              <p className="text-white text-sm mt-0.5">{userEmail}</p>
            </div>

            <Separator className="bg-white/10 my-4" />

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Sign out
            </Button>
          </div>
        </div>

        {/* Save to cloud */}
        <Button
          onClick={handleSaveToCloud}
          disabled={saving}
          className="w-full text-white font-semibold"
          style={{ background: 'var(--accent-color)' }}
        >
          {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save preferences to cloud'}
        </Button>
      </div>
    </div>
  )
}
