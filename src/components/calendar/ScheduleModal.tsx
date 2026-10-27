import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, X, Check, Sparkles, Share2 } from 'lucide-react'
import { TwitterIcon, LinkedinIcon, InstagramIcon } from '../icons'
import { CustomDateTimePicker } from './CustomDateTimePicker'
import type { Platform } from '../../types/post'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmSchedule: (scheduledAt: string, platform: Platform) => void
  platform: Platform
  initialDate?: string
  isDark: boolean
}

interface PlatformOption {
  id: Platform
  name: string
  subname: string
  charLimit: number
  icon: (className?: string) => React.ReactNode
  activeColorLight: string
  activeColorDark: string
}

export function ScheduleModal({
  isOpen,
  onClose,
  onConfirmSchedule,
  platform,
  initialDate,
  isDark,
}: ScheduleModalProps) {
  // Target Platform State (allows choosing directly inside this modal)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(platform)

  // Default to tomorrow 10:00 AM if not set
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    if (initialDate) return initialDate
    const tomorrow = new Date(2026, 9, 19, 10, 0)
    const y = tomorrow.getFullYear()
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const d = String(tomorrow.getDate()).padStart(2, '0')
    const hh = String(tomorrow.getHours()).padStart(2, '0')
    const mm = String(tomorrow.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${hh}:${mm}`
  })

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedPlatform(platform)
      if (initialDate) {
        setSelectedDateTime(initialDate)
      }
    }
  }, [isOpen, platform, initialDate])

  if (!isOpen) return null

  // Fast smart presets
  const presets = [
    { label: 'Bugün 18:00', value: '2026-10-18T18:00' },
    { label: 'Yarın 10:00', value: '2026-10-19T10:00' },
    { label: 'Yarın 15:30', value: '2026-10-19T15:30' },
    { label: 'Çarşamba 11:00', value: '2026-10-21T11:00' },
    { label: 'Cuma 14:00', value: '2026-10-23T14:00' },
    { label: 'Gelecek Pzt 09:30', value: '2026-10-26T09:30' },
  ]

  const platformOptions: PlatformOption[] = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      subname: 'Kısa & Öz',
      charLimit: 280,
      icon: (cls) => <TwitterIcon className={cls} />,
      activeColorLight: 'bg-amber-50/90 border-[#d97706] text-[#92400e] shadow-sm ring-1 ring-[#d97706]',
      activeColorDark: 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      subname: 'Profesyonel',
      charLimit: 3000,
      icon: (cls) => <LinkedinIcon className={cls} />,
      activeColorLight: 'bg-amber-50/90 border-[#d97706] text-[#92400e] shadow-sm ring-1 ring-[#d97706]',
      activeColorDark: 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      subname: 'Görsel & Hikaye',
      charLimit: 2200,
      icon: (cls) => <InstagramIcon className={cls} />,
      activeColorLight: 'bg-amber-50/90 border-[#d97706] text-[#92400e] shadow-sm ring-1 ring-[#d97706]',
      activeColorDark: 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500',
    },
  ]

  const handleConfirm = () => {
    if (!selectedDateTime) return
    onConfirmSchedule(selectedDateTime, selectedPlatform)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'border-[#2e261a] bg-[#120f0c] text-stone-100' : 'border-[#e4dcce] bg-white text-stone-900'
        }`}
      >
        {/* Header */}
        <div 
          className={`p-4 px-6 border-b flex items-center justify-between ${
            isDark ? 'border-[#211e18] bg-[#18140f]' : 'border-[#efe7dc] bg-[#faf6f0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-100 border-[#fde68a] text-[#b45309]'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Gönderiyi Planla</h3>
              <p className="text-[11px] text-stone-500">
                Hedef platformu ve paylaşım zamanını belirle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* 1. Interactive Platform Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                Hedef Platformu Seç
              </label>
              <span className="text-[10px] text-stone-400">Tek tıkla değiştirilebilir</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {platformOptions.map((opt) => {
                const isSelected = selectedPlatform === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPlatform(opt.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all relative group cursor-pointer ${
                      isSelected
                        ? isDark
                          ? opt.activeColorDark
                          : opt.activeColorLight
                        : isDark
                        ? 'border-[#241f18] bg-[#0c0a08] text-stone-400 hover:border-[#3d3322] hover:text-stone-200'
                        : 'border-[#e8dfd2] bg-[#fdfbf7] text-stone-600 hover:border-[#cbbfad] hover:text-stone-900'
                    }`}
                  >
                    {/* Active check pill */}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    <div className="p-1 rounded-lg">
                      {opt.icon("w-5 h-5")}
                    </div>
                    <span className="text-xs font-semibold leading-none">{opt.name}</span>
                    <span className="text-[10px] opacity-70 font-mono">
                      {opt.charLimit} krk
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Quick Smart Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Önerilen Zaman Dilimleri
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset, idx) => {
                const isSelected = selectedDateTime === preset.value
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDateTime(preset.value)}
                    className={`px-2.5 py-2 rounded-xl border text-[11px] font-medium text-center transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold ring-1 ring-amber-500/40'
                          : 'bg-amber-100 border-[#fde68a] text-[#b45309] font-semibold ring-1 ring-[#d97706]/40'
                        : isDark
                        ? 'border-[#241f18] text-stone-400 hover:bg-[#1a1611]'
                        : 'border-[#e8dfd2] text-stone-600 hover:bg-[#f8f3ec]'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Sleek Custom Amber Date & Time Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
              Tarih ve Saat Seçimi
            </label>
            <CustomDateTimePicker
              value={selectedDateTime}
              onChange={setSelectedDateTime}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Footer */}
        <div 
          className={`p-4 px-6 border-t flex items-center justify-between ${
            isDark ? 'border-[#211e18] bg-[#18140f]' : 'border-[#efe7dc] bg-[#faf6f0]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[#d97706]/20'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Planla ve Takvime Ekle</span>
          </button>
        </div>
      </div>
    </div>
  )
}
