import { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Calendar as CalendarIcon, 
  ListFilter, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  ExternalLink
} from 'lucide-react'
import { TwitterIcon, LinkedinIcon, InstagramIcon } from '../icons'
import { CustomDateTimePicker } from './CustomDateTimePicker'
import type { Post, Platform } from '../../types/post'

interface CalendarViewProps {
  posts: Post[]
  onSelectPostForEdit: (post: Post) => void
  onUpdatePost: (post: Post) => void
  onDeletePost: (id: string) => void
  onCreateNewForDate: (dateStr?: string) => void
  isDark: boolean
}

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const DAY_NAMES_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function CalendarView({
  posts,
  onSelectPostForEdit,
  onUpdatePost,
  onDeletePost,
  onCreateNewForDate,
  isDark
}: CalendarViewProps) {
  // Calendar navigation state (defaults to current date or October 2026)
  const [currentDate, setCurrentDate] = useState(() => {
    // Current date is Oct 2026 in our sandbox
    return new Date(2026, 9, 18) // Month 9 is October (0-indexed)
  })

  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all')
  const [viewMode, setViewMode] = useState<'month' | 'timeline'>('month')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState<string>('')
  const [reschedulePlatform, setReschedulePlatform] = useState<Platform>('twitter')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 18))
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (post.status !== 'scheduled' && post.status !== 'published') return false
    if (platformFilter !== 'all' && post.platform !== platformFilter) return false
    return true
  })

  // Group scheduled posts by YYYY-MM-DD
  const postsByDate = filteredPosts.reduce<Record<string, Post[]>>((acc, post) => {
    if (!post.scheduledAt) return acc
    const dateKey = post.scheduledAt.split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(post)
    return acc
  }, {})

  // Compute calendar days for current month
  // Monday is index 0 in Turkey
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1
  if (startingDayOfWeek === -1) startingDayOfWeek = 6 // Sunday becomes 6

  const daysInCurrentMonth = lastDayOfMonth.getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Build grid days
  interface DayCell {
    dayNum: number
    monthOffset: number // -1 for prev month, 0 for current, 1 for next
    fullDateStr: string // YYYY-MM-DD
    isToday: boolean
  }

  const days: DayCell[] = []

  // Prev month padding
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i
    const prevDate = new Date(year, month - 1, dayNum)
    const y = prevDate.getFullYear()
    const m = String(prevDate.getMonth() + 1).padStart(2, '0')
    const d = String(dayNum).padStart(2, '0')
    days.push({
      dayNum,
      monthOffset: -1,
      fullDateStr: `${y}-${m}-${d}`,
      isToday: false
    })
  }

  // Current month days
  const todayStr = '2026-10-18'
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const mStr = String(month + 1).padStart(2, '0')
    const dStr = String(d).padStart(2, '0')
    const fullDateStr = `${year}-${mStr}-${dStr}`
    days.push({
      dayNum: d,
      monthOffset: 0,
      fullDateStr,
      isToday: fullDateStr === todayStr
    })
  }

  // Next month padding to reach full rows (multiples of 7)
  const remainingCells = 7 - (days.length % 7)
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextDate = new Date(year, month + 1, d)
      const y = nextDate.getFullYear()
      const m = String(nextDate.getMonth() + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      days.push({
        dayNum: d,
        monthOffset: 1,
        fullDateStr: `${y}-${m}-${dStr}`,
        isToday: false
      })
    }
  }

  // Stats
  const totalScheduled = posts.filter(p => p.status === 'scheduled').length
  const totalPublished = posts.filter(p => p.status === 'published').length

  const openPostModal = (post: Post) => {
    setSelectedPost(post)
    setRescheduleDate(post.scheduledAt || '')
    setReschedulePlatform(post.platform)
  }

  const handleSaveReschedule = () => {
    if (!selectedPost) return
    const updated = {
      ...selectedPost,
      platform: reschedulePlatform,
      scheduledAt: rescheduleDate,
      updatedAt: new Date().toLocaleDateString('tr-TR')
    }
    onUpdatePost(updated)
    setSelectedPost(updated)
  }

  const handleToggleStatus = () => {
    if (!selectedPost) return
    const newStatus = selectedPost.status === 'published' ? 'scheduled' : 'published'
    const updated = {
      ...selectedPost,
      status: newStatus as Post['status'],
      updatedAt: new Date().toLocaleDateString('tr-TR')
    }
    onUpdatePost(updated)
    setSelectedPost(updated)
  }

  const handleUnscheduleToDraft = () => {
    if (!selectedPost) return
    const updated = {
      ...selectedPost,
      status: 'draft' as const,
      scheduledAt: undefined,
      updatedAt: new Date().toLocaleDateString('tr-TR')
    }
    onUpdatePost(updated)
    setSelectedPost(null)
  }

  const getPlatformIcon = (platform: Platform, className = "w-3.5 h-3.5") => {
    switch (platform) {
      case 'twitter': return <TwitterIcon className={className} />
      case 'linkedin': return <LinkedinIcon className={className} />
      case 'instagram': return <InstagramIcon className={className} />
    }
  }

  const getPlatformBadgeColor = (_platform: Platform) => {
    return isDark 
      ? 'bg-[#1e1911] border-[#382d17] text-amber-300 shadow-xs' 
      : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309] shadow-xs'
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header / Bar */}
      <div 
        className={`px-6 py-5 border-b flex flex-wrap items-center justify-between gap-4 transition-colors shrink-0 ${
          isDark ? 'border-[#211e18] bg-[#0c0a08]' : 'border-[#ebe5dc] bg-[#faf7f2]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-amber-500 border ${
                isDark ? 'bg-[#18140f] border-[#2e261a]' : 'bg-[#fffbeb] border-[#fde68a]'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">İçerik Takvimi</h1>
              <p className="text-xs text-stone-500">Planlanan ve yayınlanan tüm gönderilerin zaman çizelgesi</p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <span 
              className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                isDark ? 'bg-[#1a1711] border-[#312a1c] text-amber-300' : 'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{totalScheduled} Planlandı</span>
            </span>
            <span 
              className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                isDark ? 'bg-[#131b14] border-[#1d3521] text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{totalPublished} Yayınlandı</span>
            </span>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div 
            className={`flex items-center p-1 rounded-xl border text-xs font-medium ${
              isDark ? 'bg-[#14120e] border-[#262118]' : 'bg-[#f0ebe1] border-[#e2dacb]'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'month'
                  ? isDark
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                    : 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Aylık Görünüm
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'timeline'
                  ? isDark
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                    : 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Zaman Çizelgesi
            </button>
          </div>

          {/* New Scheduled Post Button */}
          <button
            type="button"
            onClick={() => onCreateNewForDate()}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[#d97706]/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Gönderi Planla</span>
          </button>
        </div>
      </div>

      {/* Filter and Date Navigation Controls */}
      <div 
        className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
          isDark ? 'border-[#1b1813] bg-[#0f0d0a]' : 'border-[#f0eae0] bg-[#fbf9f5]'
        }`}
      >
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark ? 'border-[#262118] hover:bg-[#1a1711] text-stone-300' : 'border-[#e4dcce] hover:bg-white text-stone-700'
              }`}
              title="Önceki Ay"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark ? 'border-[#262118] hover:bg-[#1a1711] text-stone-300' : 'border-[#e4dcce] hover:bg-white text-stone-700'
              }`}
              title="Sonraki Ay"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="font-bold text-sm tracking-tight px-1">
            {MONTH_NAMES_TR[month]} {year}
          </span>

          <button
            type="button"
            onClick={handleToday}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              isDark 
                ? 'border-[#2a241a] text-amber-400 hover:bg-[#1a1711]' 
                : 'border-[#dfd6c7] text-[#b45309] hover:bg-white'
            }`}
          >
            Bugün
          </button>
        </div>

        {/* Platform Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-stone-400 text-[11px] mr-1 hidden sm:inline flex items-center gap-1">
            <ListFilter className="w-3 h-3" /> Filtrele:
          </span>
          <button
            type="button"
            onClick={() => setPlatformFilter('all')}
            className={`px-2.5 py-1 rounded-lg border transition-colors font-medium ${
              platformFilter === 'all'
                ? isDark
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-amber-100 border-[#fde68a] text-[#b45309]'
                : isDark
                ? 'border-[#241f18] text-stone-400 hover:text-stone-200'
                : 'border-[#e8dfd2] text-stone-600 hover:text-stone-900'
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('twitter')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              platformFilter === 'twitter'
                ? isDark
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold ring-1 ring-amber-500/30'
                  : 'bg-amber-100 border-[#fde68a] text-[#b45309] font-semibold ring-1 ring-[#d97706]/30'
                : isDark
                ? 'border-[#241f18] text-stone-400 hover:text-amber-400 hover:border-[#3d3322]'
                : 'border-[#e8dfd2] text-stone-600 hover:text-[#b45309] hover:border-[#cbbfad]'
            }`}
          >
            <TwitterIcon className="w-3 h-3" />
            <span>X</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('linkedin')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              platformFilter === 'linkedin'
                ? isDark
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold ring-1 ring-amber-500/30'
                  : 'bg-amber-100 border-[#fde68a] text-[#b45309] font-semibold ring-1 ring-[#d97706]/30'
                : isDark
                ? 'border-[#241f18] text-stone-400 hover:text-amber-400 hover:border-[#3d3322]'
                : 'border-[#e8dfd2] text-stone-600 hover:text-[#b45309] hover:border-[#cbbfad]'
            }`}
          >
            <LinkedinIcon className="w-3 h-3" />
            <span>LinkedIn</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('instagram')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              platformFilter === 'instagram'
                ? isDark
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold ring-1 ring-amber-500/30'
                  : 'bg-amber-100 border-[#fde68a] text-[#b45309] font-semibold ring-1 ring-[#d97706]/30'
                : isDark
                ? 'border-[#241f18] text-stone-400 hover:text-amber-400 hover:border-[#3d3322]'
                : 'border-[#e8dfd2] text-stone-600 hover:text-[#b45309] hover:border-[#cbbfad]'
            }`}
          >
            <InstagramIcon className="w-3 h-3" />
            <span>Instagram</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {viewMode === 'month' ? (
          /* MONTH GRID VIEW */
          <div 
            className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
              isDark ? 'border-[#211e18] bg-[#0e0d0a]' : 'border-[#ebe5dc] bg-white'
            }`}
          >
            {/* Days of week header */}
            <div 
              className={`grid grid-cols-7 border-b text-[11px] font-bold uppercase tracking-wider text-center py-2.5 ${
                isDark ? 'border-[#211e18] bg-[#14120e] text-stone-400' : 'border-[#ebe5dc] bg-[#fdfbf7] text-stone-500'
              }`}
            >
              {DAY_NAMES_TR.map((dayName, idx) => (
                <div key={idx} className={idx >= 5 ? 'text-amber-600/80 dark:text-amber-400/80' : ''}>
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-200 dark:divide-[#211e18]">
              {days.map((cell, idx) => {
                const dayPosts = postsByDate[cell.fullDateStr] || []
                const isDifferentMonth = cell.monthOffset !== 0

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] sm:min-h-[130px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors group relative ${
                      isDifferentMonth
                        ? isDark ? 'bg-[#090806]/60 opacity-40' : 'bg-[#faf7f2]/50 opacity-40'
                        : isDark ? 'hover:bg-[#15120e]/60' : 'hover:bg-[#fcfaf6]'
                    }`}
                  >
                    {/* Day Number and Quick Add Button */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`inline-flex items-center justify-center text-xs font-semibold rounded-lg w-6 h-6 ${
                          cell.isToday
                            ? isDark
                              ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                              : 'bg-[#d97706] text-white font-bold shadow-xs'
                            : isDark
                            ? 'text-stone-300'
                            : 'text-stone-700'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Hover '+' button to schedule for this specific date */}
                      <button
                        type="button"
                        onClick={() => onCreateNewForDate(`${cell.fullDateStr}T10:00`)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded-md text-[10px] transition-all ${
                          isDark 
                            ? 'hover:bg-[#251f15] text-amber-400' 
                            : 'hover:bg-[#f3ece0] text-[#b45309]'
                        }`}
                        title={`${cell.dayNum} ${MONTH_NAMES_TR[month]} için yeni gönderi planla`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scheduled Posts in this cell */}
                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[85px] no-scrollbar">
                      {dayPosts.map((post) => {
                        const timeStr = post.scheduledAt 
                          ? post.scheduledAt.split('T')[1] || '' 
                          : ''

                        return (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => openPostModal(post)}
                            className={`w-full text-left p-1.5 rounded-lg border text-[11px] leading-tight transition-all hover:scale-[1.02] shadow-2xs ${getPlatformBadgeColor(
                              post.platform
                            )}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="flex items-center gap-1 font-semibold truncate">
                                {getPlatformIcon(post.platform, "w-3 h-3")}
                                {timeStr && <span className="font-mono text-[10px]">{timeStr}</span>}
                              </span>
                              {post.status === 'published' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Yayınlandı" />
                              )}
                            </div>
                            <p className="line-clamp-1 opacity-90 text-[10px]">
                              {post.content}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* TIMELINE / LIST VIEW */
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredPosts.length === 0 ? (
              <div 
                className={`text-center py-16 rounded-2xl border ${
                  isDark ? 'border-[#211e18] bg-[#0e0d0a]' : 'border-[#ebe5dc] bg-white'
                }`}
              >
                <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-stone-400 opacity-60" />
                <h3 className="text-sm font-semibold mb-1">Planlanmış Gönderi Yok</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                  Seçilen platform filtresine uygun planlanmış bir gönderi bulunmuyor. Yeni bir gönderi planlayarak başlayabilirsin.
                </p>
                <button
                  type="button"
                  onClick={() => onCreateNewForDate()}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isDark ? 'bg-amber-500 text-stone-950' : 'bg-[#d97706] text-white'
                  }`}
                >
                  Şimdi Gönderi Planla
                </button>
              </div>
            ) : (
              /* Sort chronologically */
              filteredPosts
                .slice()
                .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''))
                .map((post) => {
                  const dateObj = post.scheduledAt ? new Date(post.scheduledAt) : null
                  const dateDisplay = dateObj 
                    ? `${dateObj.getDate()} ${MONTH_NAMES_TR[dateObj.getMonth()]} ${dateObj.getFullYear()}, ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
                    : 'Tarih Belirtilmemiş'

                  return (
                    <div
                      key={post.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all hover:border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isDark ? 'border-[#211e18] bg-[#0e0d0a]' : 'border-[#e7dfd5] bg-white shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Platform Icon badge */}
                        <div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getPlatformBadgeColor(
                            post.platform
                          )}`}
                        >
                          {getPlatformIcon(post.platform, "w-5 h-5")}
                        </div>

                        {/* Content & Schedule info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span 
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                                post.status === 'published'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : isDark
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                  : 'bg-[#fffbeb] border-[#fbbf24] text-[#92400e]'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {dateDisplay}
                            </span>
                            <span 
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                                post.status === 'published' 
                                  ? 'bg-emerald-500 text-stone-950 border-emerald-500' 
                                  : isDark 
                                  ? 'bg-[#221c11] text-amber-300 border-[#3d3119]' 
                                  : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                              }`}
                            >
                              {post.status === 'published' ? 'Yayınlandı' : 'Planlandı'}
                            </span>
                          </div>

                          <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium ${
                            isDark ? 'text-stone-300' : 'text-stone-900'
                          }`}>
                            {post.content}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => openPostModal(post)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                            isDark ? 'border-[#2e261a] hover:bg-[#1a1610] text-stone-300' : 'border-[#dfd4c3] hover:bg-[#f6efe4] text-stone-700'
                          }`}
                        >
                          Detaylar
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectPostForEdit(post)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isDark ? 'border-[#2e261a] text-amber-400 hover:bg-[#1a1610]' : 'border-[#dfd4c3] text-[#b45309] hover:bg-[#f6efe4]'
                          }`}
                          title="Editörde Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePost(post.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isDark ? 'border-[#2e261a] text-stone-500 hover:text-rose-400 hover:bg-[#1c1214]' : 'border-[#dfd4c3] text-stone-400 hover:text-rose-600 hover:bg-[#fae8e8]'
                          }`}
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        )}
      </div>

      {/* QUICK POST DETAIL & RESCHEDULE MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all max-h-[90vh] overflow-y-auto ${
              isDark ? 'border-[#2e261a] bg-[#120f0c] text-stone-100' : 'border-[#e4dcce] bg-white text-stone-900'
            }`}
          >
            {/* Modal Header */}
            <div 
              className={`p-4 px-6 border-b flex items-center justify-between ${
                isDark ? 'border-[#211e18] bg-[#18140f]' : 'border-[#efe7dc] bg-[#faf6f0]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg border ${getPlatformBadgeColor(reschedulePlatform)}`}>
                  {getPlatformIcon(reschedulePlatform, "w-4 h-4")}
                </span>
                <div>
                  <h3 className="text-sm font-bold capitalize">
                    {reschedulePlatform === 'twitter' ? 'X (Twitter)' : reschedulePlatform} Gönderi Detayı
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Oluşturulma: {selectedPost.createdAt}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Content Preview */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                  Gönderi Metni
                </label>
                <div 
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto ${
                    isDark ? 'bg-[#090806] border-[#221e17] text-stone-200' : 'bg-[#faf8f4] border-[#ebe3d7] text-stone-800'
                  }`}
                >
                  {selectedPost.content}
                </div>
              </div>

              {/* Image thumbnail if any */}
              {selectedPost.imageUrl && (
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Ekli Görsel
                  </label>
                  <img 
                    src={selectedPost.imageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-xl border border-stone-200 dark:border-[#221e17]"
                  />
                </div>
              )}

              {/* Target Platform Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Hedef Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['twitter', 'linkedin', 'instagram'] as Platform[]).map((plt) => {
                    const isSelected = reschedulePlatform === plt
                    return (
                      <button
                        key={plt}
                        type="button"
                        onClick={() => setReschedulePlatform(plt)}
                        className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold ring-1 ring-amber-500/40'
                              : 'bg-amber-100 border-[#fde68a] text-[#b45309] font-semibold ring-1 ring-[#d97706]/40'
                            : isDark
                            ? 'border-[#241f18] text-stone-400 hover:text-stone-200'
                            : 'border-[#e8dfd2] text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {getPlatformIcon(plt, 'w-3.5 h-3.5')}
                        <span className="capitalize">{plt === 'twitter' ? 'X' : plt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sleek Custom Amber Date & Time Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Planlanan Tarih ve Saat
                </label>
                <CustomDateTimePicker
                  value={rescheduleDate}
                  onChange={setRescheduleDate}
                  isDark={isDark}
                />
              </div>

              {/* Status Toggle & Conversion */}
              <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    selectedPost.status === 'published'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : isDark
                      ? 'border-[#2e261a] text-stone-300 hover:bg-[#1a1610]'
                      : 'border-[#dfd4c3] text-stone-700 hover:bg-[#f6efe4]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {selectedPost.status === 'published' ? 'Yayınlandı (Geri Al)' : 'Yayınlandı Olarak İşaretle'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleUnscheduleToDraft}
                  className={`text-xs underline-offset-4 hover:underline transition-colors ${
                    isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Planlamayı İptal Et (Taslağa Dönüştür)
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div 
              className={`p-4 px-6 border-t flex items-center justify-between ${
                isDark ? 'border-[#211e18] bg-[#18140f]' : 'border-[#efe7dc] bg-[#faf6f0]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onDeletePost(selectedPost.id)
                  setSelectedPost(null)
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark ? 'border-[#2e261a] text-stone-500 hover:text-rose-400 hover:bg-[#1f1315]' : 'border-[#dfd4c3] text-stone-400 hover:text-rose-600 hover:bg-[#fae8e8]'
                }`}
                title="Gönderiyi Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPostForEdit(selectedPost)
                    setSelectedPost(null)
                  }}
                  className={`px-4 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isDark ? 'border-[#2e261a] text-stone-300 hover:bg-[#1a1610]' : 'border-[#ded4c5] text-stone-700 hover:bg-[#f6efe4]'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Editörde Aç</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveReschedule()
                    setSelectedPost(null)
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                    isDark ? 'bg-amber-500 hover:bg-amber-400 text-stone-950' : 'bg-[#d97706] hover:bg-[#b45309] text-white'
                  }`}
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
