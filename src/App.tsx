import { useState, useEffect, useRef } from 'react'
import { 
  PenSquare, 
  FileText, 
  Calendar as CalendarIcon, 
  Image as ImageIcon, 
  Clock, 
  Send, 
  Check, 
  Eye, 
  Trash2, 
  Sun, 
  Moon,
  Sparkle,
  Plus,
  Upload,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Kanban,
  LogOut,
  LogIn
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { InstagramIcon, LinkedinIcon, TwitterIcon } from './components/icons'
import { InstagramPreview } from './components/preview/InstagramPreview'
import { LinkedInPreview } from './components/preview/LinkedInPreview'
import { TwitterPreview, splitIntoTweets } from './components/preview/TwitterPreview'
import { DraftsList } from './components/drafts/DraftsList'
import { CalendarView } from './components/calendar/CalendarView'
import { ScheduleModal } from './components/calendar/ScheduleModal'
import { SmartAssistant } from './components/editor/SmartAssistant'
import { ContentScore } from './components/editor/ContentScore'
import { ContentBoard } from './components/board/ContentBoard'
import { AuthModal } from './components/auth/AuthModal'
import type { Platform, Post } from './types/post'
import type { BoardCard, BoardColumnId } from './types/board'
import type { User } from './types/auth'

const SAMPLE_IMAGES = [
  { label: 'Tasarım / UI', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Yazılım / Çalışma Alanı', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80' },
]

const INITIAL_DRAFTS: Post[] = [
  {
    id: 'draft-1',
    content: 'Bugün staj deneyimimden çıkardığım en büyük ders: Bir butonun hover durumundaki okunurluğu bile kullanıcının uygulamanıza olan güvenini doğrudan etkiler. UX detaylarda gizlidir. ✨',
    imageUrl: SAMPLE_IMAGES[0].url,
    platform: 'linkedin',
    status: 'draft',
    createdAt: '17 Eki 2026',
  },
  {
    id: 'draft-2',
    content: 'Yeni bir React projesine başlarken önce mimariyi mi kurarsınız yoksa doğrudan kodlamaya mı başlarsınız? Benim tercihim her zaman tip güvenliği (TypeScript) ile başlamak. 🚀',
    imageUrl: '',
    platform: 'twitter',
    status: 'draft',
    createdAt: '16 Eki 2026',
  },
  {
    id: 'post-sched-1',
    content: 'Tailwind CSS v4 ile modern Amber Studio temamız yayında! Fırınlanmış kehribar tonları ve koyu mod desteği ile içerik üreticileri için tasarlandı. 🍯⚡',
    imageUrl: SAMPLE_IMAGES[1].url,
    platform: 'twitter',
    status: 'scheduled',
    createdAt: '18 Eki 2026',
    scheduledAt: '2026-10-19T14:30',
  },
  {
    id: 'post-sched-2',
    content: 'Frontend mimarisinde bileşen izolasyonu ve temiz kod prensipleri: Neden her butonun kendi sorumluluğu olmalı? Detaylı teknik incelemem yayında! 💻📈',
    imageUrl: SAMPLE_IMAGES[0].url,
    platform: 'linkedin',
    status: 'scheduled',
    createdAt: '18 Eki 2026',
    scheduledAt: '2026-10-21T10:00',
  },
  {
    id: 'post-sched-3',
    content: 'Haftalık tasarım ilhamı: Minimalist arayüzler ve sıcak tonlar. Gözü yormayan çalışma alanları üretkenliği nasıl artırır? 🎨🌿',
    imageUrl: SAMPLE_IMAGES[0].url,
    platform: 'instagram',
    status: 'scheduled',
    createdAt: '18 Eki 2026',
    scheduledAt: '2026-10-24T18:00',
  },
]

const INITIAL_BOARD_CARDS: BoardCard[] = [
  {
    id: 'card-1',
    title: 'React 19 Server Actions vs React Query',
    note: 'Server Actions ne zaman yeterli, ne zaman React Query veya SWR kullanmak gerekir? Karşılaştırmalı teknik rehber.',
    columnId: 'ideas',
    platform: 'linkedin',
    createdAt: '22 Eki',
  },
  {
    id: 'card-2',
    title: 'CSS Grid ile 5 Dakikada Responsive Galeri',
    note: 'repeat(auto-fit, minmax(250px, 1fr)) püf noktası. Kısa ve vurucu kod örneği.',
    columnId: 'ideas',
    platform: 'twitter',
    createdAt: '21 Eki',
  },
  {
    id: 'card-3',
    title: 'Junior Yazılımcıların Yaptığı 3 Büyük CV Hatası',
    note: '1. Çok fazla alakasız teknoloji listelemek 2. Proje linklerinin kırık olması 3. Etkiyi sayılarla anlatamamak.',
    columnId: 'in_progress',
    platform: 'linkedin',
    createdAt: '20 Eki',
  },
  {
    id: 'card-4',
    title: 'Amber Studio Tasarım Sistemi Yayında!',
    note: 'Fırınlanmış kehribar tonları, koyu mod desteği ve gerçekçi sosyal medya önizlemeleri.',
    columnId: 'done',
    platform: 'general',
    createdAt: '18 Eki',
  },
]

const DEFAULT_USER: User = {
  id: 'user-default',
  name: 'PostCraft Studio',
  handle: 'postcraft',
  title: 'İçerik Üreticisi & Tasarımcı',
  email: 'demo@postcraft.studio',
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [activeTab, setActiveTab] = useState<'editor' | 'drafts' | 'calendar' | 'board'>('editor')

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('postcraft_active_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_USER
      }
    }
    return DEFAULT_USER
  })
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Save active user in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('postcraft_active_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('postcraft_active_user')
    }
  }, [currentUser])
  
  // Editor States
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const [platform, setPlatform] = useState<Platform>('twitter')
  const [content, setContent] = useState(
    'Sıcak, enerjik ve kusursuz bir kontrast... Fırınlanmış kehribar ve altın tonlarıyla PostCraft stüdyosu artık hem gözü dinlendiriyor hem de ilham veriyor. 🍯'
  )
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0].url)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')

  // User-uploaded image state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // PNG Export State & Ref
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'exported'>('idle')
  const previewRef = useRef<HTMLDivElement>(null)

  // Smart Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  // Twitter Thread Mode State
  const [isThreadMode, setIsThreadMode] = useState(false)

  // Instagram Carousel State
  const [isCarouselMode, setIsCarouselMode] = useState(false)
  const [carouselImages, setCarouselImages] = useState<string[]>([])
  const carouselFileInputRef = useRef<HTMLInputElement>(null)

  // LinkedIn Document Mode State
  const [isLinkedInDocMode, setIsLinkedInDocMode] = useState(false)
  const [linkedInDocTitle, setLinkedInDocTitle] = useState('Frontend_Mimari_Rehberi.pdf')
  const [linkedInDocSlides, setLinkedInDocSlides] = useState<string[]>([])
  const linkedInFileInputRef = useRef<HTMLInputElement>(null)

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [targetScheduleDate, setTargetScheduleDate] = useState<string | undefined>(undefined)

  // Real Posts State (with LocalStorage persistence)
  const [drafts, setDrafts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('postcraft_drafts')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure sample scheduled items are present if none exist
        const hasScheduled = parsed.some((p: Post) => p.status === 'scheduled')
        if (!hasScheduled) {
          const scheduledSamples = INITIAL_DRAFTS.filter(p => p.status === 'scheduled')
          return [...parsed, ...scheduledSamples]
        }
        return parsed
      } catch {
        return INITIAL_DRAFTS
      }
    }
    return INITIAL_DRAFTS
  })

  // Synchronize drafts with LocalStorage whenever drafts change
  useEffect(() => {
    localStorage.setItem('postcraft_drafts', JSON.stringify(drafts))
  }, [drafts])

  // Board Cards State (with LocalStorage persistence)
  const [boardCards, setBoardCards] = useState<BoardCard[]>(() => {
    const saved = localStorage.getItem('postcraft_board_cards')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return INITIAL_BOARD_CARDS
      }
    }
    return INITIAL_BOARD_CARDS
  })

  useEffect(() => {
    localStorage.setItem('postcraft_board_cards', JSON.stringify(boardCards))
  }, [boardCards])

  const isDark = theme === 'dark'

  // Platform char limits
  const charLimits: Record<Platform, number> = {
    twitter: isThreadMode ? 2500 : 280,
    instagram: 2200,
    linkedin: 3000,
  }

  const currentLimit = charLimits[platform]
  const isLimitReached = content.length >= currentLimit
  const threadTweets = splitIntoTweets(content)
  const threadCount = threadTweets.length

  // Save or Update Draft (Status: 'draft')
  const handleSaveDraft = () => {
    if (!content.trim()) return

    const now = new Date()
    const formattedDate = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'short' })} ${now.getFullYear()}`

    if (editingDraftId) {
      // Update existing draft
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === editingDraftId
            ? { ...d, content, imageUrl, platform, updatedAt: formattedDate }
            : d
        )
      )
    } else {
      // Create new draft
      const newDraft: Post = {
        id: `draft-${Date.now()}`,
        content,
        imageUrl,
        platform,
        status: 'draft',
        createdAt: formattedDate,
      }
      setDrafts((prev) => [newDraft, ...prev])
      setEditingDraftId(newDraft.id)
    }

    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  // Confirm Scheduling (Status: 'scheduled')
  const handleConfirmSchedule = (scheduledAt: string, targetPlatform: Platform) => {
    if (!content.trim()) return

    const now = new Date()
    const formattedDate = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'short' })} ${now.getFullYear()}`

    // Synchronize editor platform with chosen platform
    setPlatform(targetPlatform)

    if (editingDraftId) {
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === editingDraftId
            ? { 
                ...d, 
                content, 
                imageUrl, 
                platform: targetPlatform, 
                status: 'scheduled', 
                scheduledAt, 
                updatedAt: formattedDate 
              }
            : d
        )
      )
    } else {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        content,
        imageUrl,
        platform: targetPlatform,
        status: 'scheduled',
        createdAt: formattedDate,
        scheduledAt,
      }
      setDrafts((prev) => [newPost, ...prev])
      setEditingDraftId(newPost.id)
    }

    setSaveStatus('saved')
    setTimeout(() => {
      setSaveStatus('idle')
      setActiveTab('calendar') // Direct to calendar view to see the scheduled post
    }, 600)
  }

  // Load draft into editor
  const handleEditDraft = (draft: Post) => {
    setEditingDraftId(draft.id)
    setContent(draft.content)
    setImageUrl(draft.imageUrl || '')
    setPlatform(draft.platform)
    setActiveTab('editor')
  }

  // Delete draft / post
  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    if (editingDraftId === id) {
      setEditingDraftId(null)
    }
  }

  // Update a post from CalendarView
  const handleUpdatePost = (updatedPost: Post) => {
    setDrafts((prev) => prev.map((p) => p.id === updatedPost.id ? updatedPost : p))
  }

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setUploadedImageUrl(result)
        setImageUrl(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveActiveImage = () => {
    setUploadedImageUrl(null)
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Export Mockup as PNG
  const handleExportPng = async () => {
    if (!previewRef.current) return
    setExportStatus('exporting')
    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95,
      })
      const link = document.createElement('a')
      link.download = `postcraft-${platform}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      setExportStatus('exported')
      setTimeout(() => setExportStatus('idle'), 2000)
    } catch (err) {
      console.error('Export failed:', err)
      setExportStatus('idle')
    }
  }

  // Smart Assistant Handlers
  const handlePrependHook = (hook: string) => {
    setContent((prev) => {
      const trimmed = prev.trim()
      const newText = trimmed ? `${hook}\n\n${trimmed}` : hook
      return newText.slice(0, currentLimit)
    })
  }

  const handleAppendText = (text: string) => {
    setContent((prev) => {
      const newText = `${prev}${text}`
      return newText.slice(0, currentLimit)
    })
  }

  const handleApplyAssistantContent = (newText: string) => {
    setContent(newText.slice(0, currentLimit))
  }

  // Instagram Carousel Handlers
  const handleCarouselAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const remaining = 10 - carouselImages.length
    const toProcess = files.slice(0, remaining)
    toProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        if (result) {
          setCarouselImages((prev) => [...prev, result].slice(0, 10))
        }
      }
      reader.readAsDataURL(file)
    })
    // Reset input so same file can be re-added if needed
    if (carouselFileInputRef.current) carouselFileInputRef.current.value = ''
  }

  const handleCarouselRemove = (idx: number) => {
    setCarouselImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleCarouselMoveLeft = (idx: number) => {
    if (idx === 0) return
    setCarouselImages((prev) => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const handleCarouselMoveRight = (idx: number) => {
    setCarouselImages((prev) => {
      if (idx === prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  // LinkedIn Document Handlers
  const handleLinkedInAddSlides = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const remaining = 10 - linkedInDocSlides.length
    const toProcess = files.slice(0, remaining)
    toProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        if (result) {
          setLinkedInDocSlides((prev) => [...prev, result].slice(0, 10))
        }
      }
      reader.readAsDataURL(file)
    })
    if (linkedInFileInputRef.current) linkedInFileInputRef.current.value = ''
  }

  const handleLinkedInRemoveSlide = (idx: number) => {
    setLinkedInDocSlides((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleLinkedInMoveLeft = (idx: number) => {
    if (idx === 0) return
    setLinkedInDocSlides((prev) => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const handleLinkedInMoveRight = (idx: number) => {
    setLinkedInDocSlides((prev) => {
      if (idx === prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  // Board Handlers
  const handleAddBoardCard = (card: Omit<BoardCard, 'id' | 'createdAt'>) => {
    const now = new Date()
    const formattedDate = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'short' })}`
    const newCard: BoardCard = {
      ...card,
      id: `card-${Date.now()}`,
      createdAt: formattedDate,
    }
    setBoardCards((prev) => [newCard, ...prev])
  }

  const handleMoveBoardCard = (cardId: string, targetColumn: BoardColumnId) => {
    setBoardCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, columnId: targetColumn } : c))
    )
  }

  const handleDeleteBoardCard = (cardId: string) => {
    setBoardCards((prev) => prev.filter((c) => c.id !== cardId))
  }

  const handleSendBoardCardToEditor = (card: BoardCard) => {
    setEditingDraftId(null)
    const combined = card.note ? `${card.title}\n\n${card.note}` : card.title
    setContent(combined)
    if (card.platform !== 'general') {
      setPlatform(card.platform)
    }
    setActiveTab('editor')
  }

  // Start fresh new post
  const handleNewPost = () => {
    setEditingDraftId(null)
    setContent('')
    setImageUrl('')
    setActiveTab('editor')
  }

  // Create new post for a specific date from calendar
  const handleCreateNewForDate = (dateStr?: string) => {
    setEditingDraftId(null)
    setContent('')
    setImageUrl('')
    if (dateStr) {
      setTargetScheduleDate(dateStr)
    } else {
      setTargetScheduleDate(undefined)
    }
    setActiveTab('editor')
    setIsScheduleModalOpen(true)
  }

  const scheduledCount = drafts.filter((p) => p.status === 'scheduled').length

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row antialiased transition-colors duration-300 ${
        isDark ? 'bg-[#0b0a08] text-amber-50/90' : 'bg-[#faf8f5] text-stone-900'
      }`}
    >
      {/* 1. Left Minimalist Sidebar */}
      <aside
        className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-5 flex flex-col justify-between shrink-0 transition-colors duration-300 ${
          isDark
            ? 'bg-[#12100d]/95 border-[#211e18]'
            : 'bg-white border-[#ebe5dc] shadow-xs'
        }`}
      >
        <div className="space-y-7">
          {/* Logo / Brand with Warm Amber Accent */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm tracking-wider shadow-sm transition-all ${
                  isDark
                    ? 'bg-amber-500 text-stone-950 shadow-amber-500/20'
                    : 'bg-[#d97706] text-white shadow-[#d97706]/25'
                }`}
              >
                PC
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight block leading-tight">
                  PostCraft
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    isDark ? 'text-amber-400' : 'text-[#b45309]'
                  }`}
                >
                  Amber Studio
                </span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'border-[#2e281d] bg-[#1a1712] text-amber-300 hover:bg-[#241f17]'
                  : 'border-[#fef3c7] bg-[#fffbeb] text-[#b45309] hover:bg-[#fde68a]'
              }`}
              title={isDark ? 'Açık Temaya Geç' : 'Karanlık Temaya Geç'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'editor'
                  ? isDark
                    ? 'bg-[#221c10] text-amber-300 font-semibold border border-[#3d3119]'
                    : 'bg-[#fffbeb] text-[#b45309] font-semibold border border-[#fde68a]'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-[#161410]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#f5efe6]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PenSquare className="w-4 h-4" />
                <span>{editingDraftId ? 'Taslak Düzenleniyor' : 'Yeni Gönderi'}</span>
              </div>
              {editingDraftId && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('drafts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'drafts'
                  ? isDark
                    ? 'bg-[#221c10] text-amber-300 font-semibold border border-[#3d3119]'
                    : 'bg-[#fffbeb] text-[#b45309] font-semibold border border-[#fde68a]'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-[#161410]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#f5efe6]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Taslaklar</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                  isDark
                    ? 'bg-[#2c2212] text-amber-300'
                    : 'bg-[#fef3c7] text-[#b45309]'
                }`}
              >
                {drafts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'calendar'
                  ? isDark
                    ? 'bg-[#221c10] text-amber-300 font-semibold border border-[#3d3119]'
                    : 'bg-[#fffbeb] text-[#b45309] font-semibold border border-[#fde68a]'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-[#161410]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#f5efe6]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4" />
                <span>Takvim & Zamanlama</span>
              </div>
              {scheduledCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                    isDark
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-amber-100 text-[#b45309] border border-[#fde68a]'
                  }`}
                >
                  {scheduledCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'board'
                  ? isDark
                    ? 'bg-[#221c10] text-amber-300 font-semibold border border-[#3d3119]'
                    : 'bg-[#fffbeb] text-[#b45309] font-semibold border border-[#fde68a]'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-[#161410]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#f5efe6]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Kanban className="w-4 h-4" />
                <span>İçerik Panosu</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                  isDark
                    ? 'bg-[#2c2212] text-amber-300'
                    : 'bg-[#fef3c7] text-[#b45309]'
                }`}
              >
                {boardCards.length}
              </span>
            </button>
          </nav>
        </div>

        {/* User Account with Amber Accent */}
        <div
          className={`pt-4 border-t flex items-center justify-between px-1 ${
            isDark ? 'border-[#211e18]' : 'border-[#eee8df]'
          }`}
        >
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer hover:opacity-85 transition-opacity"
                title="Hesap Değiştir / Bilgileri Görüntüle"
              >
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isDark
                      ? 'bg-[#1e1911] border-[#382d17] text-amber-300'
                      : 'bg-[#fef3c7] border-[#fde68a] text-[#b45309]'
                  }`}
                >
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-tight truncate">
                    {currentUser.name}
                  </p>
                  <p
                    className={`text-[10px] font-mono mt-0.5 truncate ${
                      isDark ? 'text-amber-400/80' : 'text-[#b45309]'
                    }`}
                  >
                    @{currentUser.handle}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCurrentUser(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isDark
                    ? 'text-stone-500 hover:text-rose-400 hover:bg-stone-800'
                    : 'text-stone-400 hover:text-rose-600 hover:bg-stone-100'
                }`}
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309] hover:bg-[#fef3c7]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Giriş Yap / Kayıt Ol</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main View Area: Either Editor, Drafts List, Calendar, or Board */}
      {activeTab === 'board' ? (
        <ContentBoard
          cards={boardCards}
          onAddCard={handleAddBoardCard}
          onMoveCard={handleMoveBoardCard}
          onDeleteCard={handleDeleteBoardCard}
          onSendToEditor={handleSendBoardCardToEditor}
          isDark={isDark}
        />
      ) : activeTab === 'calendar' ? (
        <CalendarView
          posts={drafts}
          onSelectPostForEdit={handleEditDraft}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeleteDraft}
          onCreateNewForDate={handleCreateNewForDate}
          isDark={isDark}
        />
      ) : activeTab === 'drafts' ? (
        <DraftsList
          drafts={drafts}
          onEdit={handleEditDraft}
          onDelete={handleDeleteDraft}
          onNewPost={handleNewPost}
          theme={theme}
        />
      ) : (
        <>
          {/* 2. Middle Column: Composer / Editor */}
          <section
            className={`flex-1 flex flex-col border-b md:border-b-0 md:border-r transition-colors duration-300 ${
              isDark ? 'bg-[#0e0d0a] border-[#211e18]' : 'bg-white border-[#ebe5dc]'
            }`}
          >
            {/* Editor Header: Platform Tabs */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-[#211e18]' : 'border-[#ebe5dc]'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                  isDark ? 'bg-[#161410] border-[#262118]' : 'bg-[#f7f3ec] border-[#e8dfd3]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPlatform('twitter')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    platform === 'twitter'
                      ? isDark
                        ? 'bg-[#241d11] text-amber-300 font-semibold shadow-sm border border-[#423418]'
                        : 'bg-white text-[#b45309] font-semibold shadow-xs border border-[#fde68a]'
                      : isDark
                      ? 'text-stone-400 hover:text-stone-200'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('linkedin')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    platform === 'linkedin'
                      ? isDark
                        ? 'bg-[#241d11] text-amber-300 font-semibold shadow-sm border border-[#423418]'
                        : 'bg-white text-[#b45309] font-semibold shadow-xs border border-[#fde68a]'
                      : isDark
                      ? 'text-stone-400 hover:text-stone-200'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('instagram')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    platform === 'instagram'
                      ? isDark
                        ? 'bg-[#241d11] text-amber-300 font-semibold shadow-sm border border-[#423418]'
                        : 'bg-white text-[#b45309] font-semibold shadow-xs border border-[#fde68a]'
                      : isDark
                      ? 'text-stone-400 hover:text-stone-200'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </button>
              </div>

              {/* Action Buttons: New Post & Clear */}
              <div className="flex items-center gap-2">
                {editingDraftId && (
                  <button
                    type="button"
                    onClick={handleNewPost}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isDark
                        ? 'border-[#2e281d] text-amber-300 hover:bg-[#1f1b14]'
                        : 'border-[#ded4c5] text-[#b45309] hover:bg-[#f6efe4]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Gönderi</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setContent('')}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark
                      ? 'text-stone-500 hover:text-rose-400 hover:bg-[#201a14]'
                      : 'text-stone-400 hover:text-rose-600 hover:bg-[#fae8e8]'
                  }`}
                  title="Metni Temizle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col space-y-6">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    {editingDraftId ? 'Taslağı Güncelliyorsun' : 'İçerik Metni'}
                  </label>
                  
                  <div className="flex items-center gap-2">
                    {/* Twitter Thread Toggle Button */}
                    {platform === 'twitter' && (
                      <button
                        type="button"
                        onClick={() => setIsThreadMode((prev) => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                          isThreadMode
                            ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-amber-500/20'
                            : isDark
                            ? 'bg-[#18140f] border-[#292218] text-stone-300 hover:border-amber-500/40 hover:text-amber-300'
                            : 'bg-white border-[#e5ded3] text-stone-700 hover:border-[#d97706] hover:text-[#b45309]'
                        }`}
                        title="Twitter zincir modu (uzun metinleri otomatik tweetlere böler)"
                      >
                        <span>🧵</span>
                        <span>{isThreadMode ? 'Zincir Aktif' : 'Zincir Modu'}</span>
                      </button>
                    )}

                    {/* Instagram Carousel Toggle Button */}
                    {platform === 'instagram' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCarouselMode((prev) => !prev)
                          if (isCarouselMode) setCarouselImages([])
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                          isCarouselMode
                            ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-amber-500/20'
                            : isDark
                            ? 'bg-[#18140f] border-[#292218] text-stone-300 hover:border-amber-500/40 hover:text-amber-300'
                            : 'bg-white border-[#e5ded3] text-stone-700 hover:border-[#d97706] hover:text-[#b45309]'
                        }`}
                        title="Birden fazla görsel ile carousel post oluştur"
                      >
                        <span>🎠</span>
                        <span>{isCarouselMode ? 'Carousel Aktif' : 'Carousel Modu'}</span>
                      </button>
                    )}

                    {/* LinkedIn Document Toggle Button */}
                    {platform === 'linkedin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsLinkedInDocMode((prev) => !prev)
                          if (isLinkedInDocMode) setLinkedInDocSlides([])
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                          isLinkedInDocMode
                            ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-amber-500/20'
                            : isDark
                            ? 'bg-[#18140f] border-[#292218] text-stone-300 hover:border-amber-500/40 hover:text-amber-300'
                            : 'bg-white border-[#e5ded3] text-stone-700 hover:border-[#d97706] hover:text-[#b45309]'
                        }`}
                        title="Çok sayfalı PDF doküman / slayt gönderisi oluştur"
                      >
                        <span>📄</span>
                        <span>{isLinkedInDocMode ? 'Doküman Aktif' : 'Doküman Modu'}</span>
                      </button>
                    )}

                    {/* Akıllı Asistan Aç/Kapa Butonu */}
                    <button
                      type="button"
                      onClick={() => setIsAssistantOpen((prev) => !prev)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                        isAssistantOpen
                          ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-amber-500/20'
                          : isDark
                          ? 'bg-[#18140f] border-amber-500/30 text-amber-400 hover:border-amber-500 hover:bg-amber-500/10'
                          : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309] hover:bg-[#fef3c7] hover:border-[#fbbf24]'
                      }`}
                    >
                      <Sparkle className="w-3.5 h-3.5" />
                      <span>{isAssistantOpen ? 'Asistanı Kapat' : 'Akıllı Asistan'}</span>
                    </button>
                  </div>
                </div>

                {/* Smart Assistant Panel */}
                {isAssistantOpen && (
                  <div className="mb-3.5">
                    <SmartAssistant
                      isOpen={isAssistantOpen}
                      onClose={() => setIsAssistantOpen(false)}
                      isDark={isDark}
                      platform={platform}
                      content={content}
                      onApplyContent={handleApplyAssistantContent}
                      onPrependHook={handlePrependHook}
                      onAppendText={handleAppendText}
                    />
                  </div>
                )}

                <textarea
                  value={content}
                  maxLength={currentLimit}
                  onChange={(e) => setContent(e.target.value.slice(0, currentLimit))}
                  placeholder="Yeni gönderini buraya yaz..."
                  className={`w-full flex-1 min-h-[220px] rounded-2xl p-4 text-sm transition-all resize-none leading-relaxed border ${
                    isLimitReached
                      ? isDark
                        ? 'bg-[#13110d]/90 border-amber-500 text-stone-100 ring-2 ring-amber-500/40 focus:outline-hidden'
                        : 'bg-[#fffdfa] border-[#d97706] text-stone-900 ring-2 ring-[#d97706]/30 focus:outline-hidden'
                      : isDark
                      ? 'bg-[#13110d]/80 border-[#211e18] text-stone-100 placeholder-stone-600 focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500'
                      : 'bg-[#fdfbf7] border-[#e8dfd3] text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706]'
                  }`}
                />

                {/* Character Limit Indicator */}
                <div className="flex items-center justify-between mt-2 px-1">
                  <div>
                    {platform === 'twitter' && isThreadMode && (
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>🧵 {threadCount} Tweet Zinciri Olarak Bölündü</span>
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-xs font-mono transition-all ${
                      isLimitReached
                        ? isDark
                          ? 'text-amber-400 font-bold'
                          : 'text-[#b45309] font-bold'
                        : isDark
                        ? 'text-stone-400'
                        : 'text-stone-500'
                    }`}
                  >
                    {content.length} / {currentLimit}
                  </span>
                </div>
              </div>

              {/* Content Quality Score */}
              <ContentScore content={content} platform={platform} isDark={isDark} />

              {/* Image Selection Area */}
              {platform === 'instagram' && isCarouselMode ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎠</span>
                      Carousel Slaytları ({carouselImages.length}/10)
                    </label>
                    {carouselImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCarouselImages([])}
                        className={`text-[11px] font-medium transition-colors cursor-pointer ${
                          isDark ? 'text-stone-400 hover:text-rose-400' : 'text-stone-500 hover:text-rose-600'
                        }`}
                      >
                        Tümünü Temizle
                      </button>
                    )}
                  </div>

                  {/* Multi-file input */}
                  <input
                    type="file"
                    ref={carouselFileInputRef}
                    onChange={handleCarouselAddImages}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  {/* Carousel Thumbnails Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {carouselImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border aspect-square flex flex-col justify-between p-1.5 transition-all ${
                          isDark ? 'border-[#2d261b] bg-[#16130e]' : 'border-[#e8dfd3] bg-[#fcfaf7]'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Slayt ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Top index badge & remove button */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCarouselRemove(idx)}
                            className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                            title="Slaytı Kaldır"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom reorder arrows */}
                        <div className="relative z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleCarouselMoveLeft(idx)}
                            className="w-5 h-5 rounded-md bg-black/70 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-black"
                            title="Sola Kaydır"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === carouselImages.length - 1}
                            onClick={() => handleCarouselMoveRight(idx)}
                            className="w-5 h-5 rounded-md bg-black/70 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-black"
                            title="Sağa Kaydır"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Image Card (if < 10) */}
                    {carouselImages.length < 10 && (
                      <button
                        type="button"
                        onClick={() => carouselFileInputRef.current?.click()}
                        className={`rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 aspect-square transition-all cursor-pointer ${
                          isDark
                            ? 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400'
                            : 'border-[#fde68a] hover:border-[#d97706] bg-[#fffbeb] hover:bg-[#fef3c7] text-[#b45309]'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] font-semibold">+ Görsel Ekle</span>
                        <span className="text-[9px] opacity-70">Çoklu seçilebilir</span>
                      </button>
                    )}
                  </div>

                  {/* Quick sample add buttons for convenience */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`text-[11px] font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Örnek görselleri ekle:
                    </span>
                    {SAMPLE_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={carouselImages.length >= 10}
                        onClick={() => {
                          if (carouselImages.length < 10) {
                            setCarouselImages((prev) => [...prev, img.url].slice(0, 10))
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#15130f] border-[#242018] text-stone-300 hover:border-amber-500/50 hover:text-amber-300'
                            : 'bg-white border-[#e5ded3] text-stone-600 hover:border-[#d97706] hover:text-[#b45309]'
                        }`}
                      >
                        + {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : platform === 'linkedin' && isLinkedInDocMode ? (
                <div className="space-y-3">
                  {/* Header & Title Input */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📄</span>
                      LinkedIn Doküman / PDF Slaytları ({linkedInDocSlides.length}/10)
                    </label>
                    {linkedInDocSlides.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setLinkedInDocSlides([])}
                        className={`text-[11px] font-medium transition-colors cursor-pointer ${
                          isDark ? 'text-stone-400 hover:text-rose-400' : 'text-stone-500 hover:text-rose-600'
                        }`}
                      >
                        Tümünü Temizle
                      </button>
                    )}
                  </div>

                  {/* Document Name Field */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Dosya Adı:
                    </span>
                    <input
                      type="text"
                      value={linkedInDocTitle}
                      onChange={(e) => setLinkedInDocTitle(e.target.value)}
                      placeholder="Ornek_Dokuman.pdf"
                      className={`flex-1 px-3 py-1.5 text-xs rounded-xl border font-mono transition-all ${
                        isDark
                          ? 'bg-[#15120d] border-[#292218] text-amber-300 focus:border-amber-500 focus:outline-hidden'
                          : 'bg-white border-[#e5ded3] text-[#b45309] focus:border-[#d97706] focus:outline-hidden'
                      }`}
                    />
                  </div>

                  {/* Multi-file input */}
                  <input
                    type="file"
                    ref={linkedInFileInputRef}
                    onChange={handleLinkedInAddSlides}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  {/* Slides Thumbnails Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {linkedInDocSlides.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border aspect-square flex flex-col justify-between p-1.5 transition-all ${
                          isDark ? 'border-[#2d261b] bg-[#16130e]' : 'border-[#e8dfd3] bg-[#fcfaf7]'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Slayt ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Top index badge & remove button */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            Sayfa {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleLinkedInRemoveSlide(idx)}
                            className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                            title="Slaytı Kaldır"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom reorder arrows */}
                        <div className="relative z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleLinkedInMoveLeft(idx)}
                            className="w-5 h-5 rounded-md bg-black/70 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-black"
                            title="Sola Kaydır"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === linkedInDocSlides.length - 1}
                            onClick={() => handleLinkedInMoveRight(idx)}
                            className="w-5 h-5 rounded-md bg-black/70 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-black"
                            title="Sağa Kaydır"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Slide Card (if < 10) */}
                    {linkedInDocSlides.length < 10 && (
                      <button
                        type="button"
                        onClick={() => linkedInFileInputRef.current?.click()}
                        className={`rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 aspect-square transition-all cursor-pointer ${
                          isDark
                            ? 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400'
                            : 'border-[#fde68a] hover:border-[#d97706] bg-[#fffbeb] hover:bg-[#fef3c7] text-[#b45309]'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] font-semibold">+ Slayt Ekle</span>
                        <span className="text-[9px] opacity-70">Çoklu seçilebilir</span>
                      </button>
                    )}
                  </div>

                  {/* Quick sample add buttons for convenience */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`text-[11px] font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Örnek slaytları ekle:
                    </span>
                    {SAMPLE_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={linkedInDocSlides.length >= 10}
                        onClick={() => {
                          if (linkedInDocSlides.length < 10) {
                            setLinkedInDocSlides((prev) => [...prev, img.url].slice(0, 10))
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                          isDark
                            ? 'bg-[#15130f] border-[#242018] text-stone-300 hover:border-amber-500/50 hover:text-amber-300'
                            : 'bg-white border-[#e5ded3] text-stone-600 hover:border-[#d97706] hover:text-[#b45309]'
                        }`}
                      >
                        + {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#b45309]" />
                    Görsel Seçimi & Yükleme
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {SAMPLE_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(img.url)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          imageUrl === img.url
                            ? isDark
                              ? 'bg-amber-500 text-stone-950 border-amber-500 font-semibold shadow-xs'
                              : 'bg-[#d97706] text-white border-[#d97706] font-semibold shadow-sm'
                            : isDark
                            ? 'bg-[#15130f] border-[#242018] text-stone-300 hover:border-[#383124]'
                            : 'bg-white border-[#e5ded3] text-stone-600 hover:text-stone-900 hover:border-[#cbbfad]'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Görsel Yükle Butonu (Adı ASLA değişmez) */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        uploadedImageUrl && imageUrl === uploadedImageUrl
                          ? isDark
                            ? 'bg-amber-500 text-stone-950 border-amber-500 font-semibold shadow-xs'
                            : 'bg-[#d97706] text-white border-[#d97706] font-semibold shadow-sm'
                          : isDark
                          ? 'border-amber-500/40 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500'
                          : 'border-[#d97706]/40 text-[#b45309] bg-[#fffbeb] hover:bg-[#fef3c7] hover:border-[#d97706]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Görsel Yükle</span>
                    </button>

                    {/* Görsel Varsa "Görsel Yükle"nin Hemen Yanında Beliren Çöp Kutusu */}
                    {imageUrl !== '' && (
                      <button
                        type="button"
                        onClick={handleRemoveActiveImage}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                          isDark
                            ? 'border-[#2e241b] text-stone-400 hover:text-rose-400 hover:border-rose-900/40 hover:bg-rose-950/20'
                            : 'border-[#e8ded2] text-stone-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                        }`}
                        title="Görseli Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Editor Bottom Actions */}
            <div
              className={`p-4 px-6 sm:px-8 border-t flex items-center justify-between ${
                isDark ? 'border-[#211e18] bg-[#0e0d0a]/90' : 'border-[#ebe5dc] bg-[#faf6f0]'
              }`}
            >
              <button
                type="button"
                onClick={handleSaveDraft}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isDark
                    ? 'border-[#2e281d] text-stone-300 hover:bg-[#1f1b14] hover:text-white'
                    : 'border-[#ded4c5] text-stone-700 bg-white hover:bg-[#f6efe4] shadow-xs'
                }`}
              >
                {saveStatus === 'saved' ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-stone-400" />
                )}
                <span>
                  {saveStatus === 'saved'
                    ? editingDraftId
                      ? 'Taslak Güncellendi!'
                      : 'Yeni Taslak Eklendi!'
                    : editingDraftId
                    ? 'Değişiklikleri Kaydet'
                    : 'Taslak Olarak Sakla'}
                </span>
              </button>

              {/* Primary Action Button: Opens Schedule Modal */}
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 ${
                  isDark
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                    : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[#d97706]/25'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Planla / Zamanla</span>
              </button>
            </div>
          </section>

          {/* 3. Right Column: Authentic Social Preview */}
          <section
            className={`w-full md:w-[500px] lg:w-[540px] p-6 sm:p-8 flex flex-col justify-start shrink-0 overflow-y-auto transition-colors duration-300 ${
              isDark ? 'bg-[#080705]' : 'bg-[#f3ede4]'
            }`}
          >
            <div
              className={`flex items-center justify-between mb-6 pb-3 border-b ${
                isDark ? 'border-[#211e18]' : 'border-[#e4dcce]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                <Eye className="w-4 h-4 text-[#b45309]" />
                <span>Canlı Önizleme Mockup'ı</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-xl border font-medium capitalize ${
                    isDark
                      ? 'bg-[#16130d] border-[#362b16] text-amber-300'
                      : 'bg-white border-[#fde68a] text-[#b45309] shadow-xs'
                  }`}
                >
                  {platform} Modu
                </span>

                {/* PNG İndir Butonu */}
                <button
                  type="button"
                  onClick={handleExportPng}
                  disabled={exportStatus === 'exporting'}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                    exportStatus === 'exported'
                      ? 'bg-emerald-500 text-stone-950 border-emerald-500'
                      : isDark
                      ? 'bg-[#1e1911] border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-stone-950'
                      : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309] hover:bg-[#fef3c7]'
                  }`}
                  title="Önizlemeyi PNG görseli olarak indir"
                >
                  {exportStatus === 'exporting' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Hazırlanıyor...</span>
                    </>
                  ) : exportStatus === 'exported' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>İndirildi!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG İndir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mockup Rendering */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div ref={previewRef} className="w-full flex justify-center p-2 rounded-2xl">
                {platform === 'instagram' && (
                  <InstagramPreview
                    content={content}
                    imageUrl={imageUrl}
                    carouselImages={carouselImages}
                    isCarousel={isCarouselMode}
                    authorName={currentUser?.name || 'PostCraft Studio'}
                    username={currentUser?.handle || 'postcraft'}
                    theme={theme}
                  />
                )}

                {platform === 'linkedin' && (
                  <LinkedInPreview
                    content={content}
                    imageUrl={imageUrl}
                    isDocument={isLinkedInDocMode}
                    documentTitle={linkedInDocTitle}
                    documentSlides={linkedInDocSlides}
                    authorName={currentUser?.name || 'PostCraft Studio'}
                    authorTitle={currentUser?.title || 'İçerik Üreticisi & Tasarımcı'}
                    theme={theme}
                  />
                )}

                {platform === 'twitter' && (
                  <TwitterPreview
                    content={content}
                    imageUrl={imageUrl}
                    theme={theme}
                    isThread={isThreadMode}
                    authorName={currentUser?.name || 'PostCraft Studio'}
                    username={currentUser?.handle || 'postcraft'}
                  />
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[11px] text-stone-400">
                Önizleme, seçilen platformun güncel tasarım standartlarına göre modellenmiştir.
              </p>
            </div>
          </section>
        </>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirmSchedule={handleConfirmSchedule}
        platform={platform}
        initialDate={targetScheduleDate}
        isDark={isDark}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
        isDark={isDark}
      />
    </div>
  )
}
