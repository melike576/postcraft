import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Kanban
} from 'lucide-react'
import type { BoardCard, BoardColumnId } from '../../types/board'
import type { Platform } from '../../types/post'

interface ContentBoardProps {
  cards: BoardCard[]
  onAddCard: (card: Omit<BoardCard, 'id' | 'createdAt'>) => void
  onMoveCard: (cardId: string, targetColumn: BoardColumnId) => void
  onDeleteCard: (cardId: string) => void
  onSendToEditor: (card: BoardCard) => void
  isDark: boolean
}

interface ColumnConfig {
  id: BoardColumnId
  title: string
  emoji: string
  badgeBg: string
  badgeText: string
  desc: string
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'ideas',
    title: 'Fikir Havuzu',
    emoji: '💡',
    badgeBg: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    badgeText: 'text-amber-500',
    desc: 'Akla gelen ham fikirler & ilham notları',
  },
  {
    id: 'in_progress',
    title: 'Hazırlanıyor',
    emoji: '✍️',
    badgeBg: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    badgeText: 'text-blue-500',
    desc: 'Taslağa dökülen & yazım aşamasındakiler',
  },
  {
    id: 'review',
    title: 'Onay & İnceleme',
    emoji: '⏳',
    badgeBg: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    badgeText: 'text-purple-500',
    desc: 'Görseli bekleyen / son rötuşlar',
  },
  {
    id: 'done',
    title: 'Tamamlandı',
    emoji: '✅',
    badgeBg: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    badgeText: 'text-emerald-500',
    desc: 'Paylaşılan veya arşive kalkanlar',
  },
]

const COLUMN_ORDER: BoardColumnId[] = ['ideas', 'in_progress', 'review', 'done']

export function ContentBoard({
  cards,
  onAddCard,
  onMoveCard,
  onDeleteCard,
  onSendToEditor,
  isDark,
}: ContentBoardProps) {
  // Inline card creation state
  const [activeNewCol, setActiveNewCol] = useState<BoardColumnId | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newPlatform, setNewPlatform] = useState<Platform | 'general'>('general')

  const handleOpenAdd = (colId: BoardColumnId) => {
    setActiveNewCol(colId)
    setNewTitle('')
    setNewNote('')
    setNewPlatform('general')
  }

  const handleSaveNew = (colId: BoardColumnId) => {
    if (!newTitle.trim()) return
    onAddCard({
      title: newTitle.trim(),
      note: newNote.trim(),
      columnId: colId,
      platform: newPlatform,
    })
    setActiveNewCol(null)
    setNewTitle('')
    setNewNote('')
  }

  const getPlatformLabel = (p: Platform | 'general') => {
    switch (p) {
      case 'twitter':
        return 'X (Twitter)'
      case 'linkedin':
        return 'LinkedIn'
      case 'instagram':
        return 'Instagram'
      default:
        return 'Genel'
    }
  }

  const getPlatformBadgeClass = (p: Platform | 'general') => {
    if (isDark) {
      switch (p) {
        case 'twitter':
          return 'bg-stone-800 text-stone-200 border-stone-700'
        case 'linkedin':
          return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        case 'instagram':
          return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
        default:
          return 'bg-stone-800 text-stone-400 border-stone-700'
      }
    } else {
      switch (p) {
        case 'twitter':
          return 'bg-stone-100 text-stone-700 border-stone-200'
        case 'linkedin':
          return 'bg-amber-50 text-amber-800 border-amber-200'
        case 'instagram':
          return 'bg-rose-50 text-rose-700 border-rose-200'
        default:
          return 'bg-stone-100 text-stone-600 border-stone-200'
      }
    }
  }

  const movePrev = (card: BoardCard) => {
    const idx = COLUMN_ORDER.indexOf(card.columnId)
    if (idx > 0) {
      onMoveCard(card.id, COLUMN_ORDER[idx - 1])
    }
  }

  const moveNext = (card: BoardCard) => {
    const idx = COLUMN_ORDER.indexOf(card.columnId)
    if (idx < COLUMN_ORDER.length - 1) {
      onMoveCard(card.id, COLUMN_ORDER[idx + 1])
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-x-auto min-h-screen">
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-stone-200 dark:border-stone-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                İçerik Panosu & Planlama
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Aklınıza gelen fikirleri toplayın, geliştirin ve tek tıkla gönderi editörüne aktarın.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Add to Ideas */}
        <button
          type="button"
          onClick={() => handleOpenAdd('ideas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 ${
            isDark
              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
              : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[#d97706]/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Fikir Ekle</span>
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.columnId === col.id)
          const isAdding = activeNewCol === col.id

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 flex flex-col transition-all min-h-[480px] ${
                isDark
                  ? 'bg-[#12100d]/90 border-[#221e18] shadow-black/20'
                  : 'bg-[#faf8f5] border-[#eae2d5] shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.emoji}</span>
                  <h3 className="font-bold text-sm tracking-tight">{col.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}
                  >
                    {colCards.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAdd(col.id)}
                  className={`p-1 rounded-lg border transition-all cursor-pointer ${
                    isDark
                      ? 'border-[#292218] hover:border-amber-500/50 hover:text-amber-400 text-stone-400'
                      : 'border-[#e0d6c8] hover:border-[#d97706] hover:text-[#b45309] text-stone-600'
                  }`}
                  title={`${col.title} sütununa kart ekle`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Description */}
              <p className={`text-[10px] mb-3 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                {col.desc}
              </p>

              {/* Inline Add Card Form */}
              {isAdding && (
                <div
                  className={`rounded-xl border p-3 mb-3 animate-in fade-in-50 duration-150 space-y-2.5 ${
                    isDark
                      ? 'bg-[#181510] border-amber-500/40 shadow-md'
                      : 'bg-white border-[#fde68a] shadow-xs'
                  }`}
                >
                  <input
                    type="text"
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Kart başlığı (örn: React 19 İpuçları)..."
                    className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-[#13110d] border-[#292218] text-stone-200 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                        : 'bg-[#faf8f5] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                    }`}
                  />

                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Kısa not veya anahtar kelimeler..."
                    className={`w-full text-xs px-2.5 py-1.5 rounded-lg border resize-none transition-all ${
                      isDark
                        ? 'bg-[#13110d] border-[#292218] text-stone-300 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                        : 'bg-[#faf8f5] border-[#e2d8cb] text-stone-800 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                    }`}
                  />

                  {/* Platform Choice */}
                  <div className="flex items-center gap-1">
                    {(['general', 'twitter', 'linkedin', 'instagram'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPlatform(p)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all cursor-pointer ${
                          newPlatform === p
                            ? isDark
                              ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                              : 'bg-[#d97706] text-white border-[#d97706] font-bold'
                            : isDark
                            ? 'bg-[#15120d] border-[#241f17] text-stone-400 hover:text-stone-200'
                            : 'bg-white border-[#e0d6c8] text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {getPlatformLabel(p)}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveNewCol(null)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveNew(col.id)}
                      disabled={!newTitle.trim()}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-40 ${
                        isDark
                          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                          : 'bg-[#d97706] hover:bg-[#b45309] text-white'
                      }`}
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                {colCards.length === 0 && !isAdding ? (
                  <div
                    className={`h-36 rounded-xl border border-dashed flex flex-col items-center justify-center text-center p-4 ${
                      isDark
                        ? 'border-[#241f18] text-stone-600'
                        : 'border-[#e8dfd3] text-stone-400'
                    }`}
                  >
                    <span className="text-2xl mb-1 opacity-50">{col.emoji}</span>
                    <span className="text-xs font-medium">Bu sütunda kart yok</span>
                    <button
                      type="button"
                      onClick={() => handleOpenAdd(col.id)}
                      className="text-[11px] text-amber-500 hover:underline mt-1 font-semibold cursor-pointer"
                    >
                      + İlk kartı ekle
                    </button>
                  </div>
                ) : (
                  colCards.map((card) => {
                    const colIndex = COLUMN_ORDER.indexOf(card.columnId)
                    const canMoveLeft = colIndex > 0
                    const canMoveRight = colIndex < COLUMN_ORDER.length - 1

                    return (
                      <div
                        key={card.id}
                        className={`rounded-xl border p-3.5 transition-all shadow-xs group hover:shadow-md ${
                          isDark
                            ? 'bg-[#181510] border-[#292218] hover:border-amber-500/40 text-stone-200'
                            : 'bg-white border-[#ebe4d8] hover:border-[#d97706]/40 text-stone-800'
                        }`}
                      >
                        {/* Top: Platform Badge & Date */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${getPlatformBadgeClass(
                              card.platform
                            )}`}
                          >
                            {getPlatformLabel(card.platform)}
                          </span>
                          <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                            {card.createdAt}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-xs leading-snug mb-1">
                          {card.title}
                        </h4>

                        {/* Note / Body */}
                        {card.note && (
                          <p
                            className={`text-[11px] leading-relaxed line-clamp-3 mb-3 ${
                              isDark ? 'text-stone-400' : 'text-stone-600'
                            }`}
                          >
                            {card.note}
                          </p>
                        )}

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-800/80 gap-1">
                          {/* Move Left / Right Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={!canMoveLeft}
                              onClick={() => movePrev(card)}
                              className={`p-1 rounded-md transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
                                isDark
                                  ? 'hover:bg-stone-800 text-stone-400 hover:text-white'
                                  : 'hover:bg-stone-100 text-stone-500 hover:text-stone-900'
                              }`}
                              title="Önceki sütuna taşı"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={!canMoveRight}
                              onClick={() => moveNext(card)}
                              className={`p-1 rounded-md transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
                                isDark
                                  ? 'hover:bg-stone-800 text-stone-400 hover:text-white'
                                  : 'hover:bg-stone-100 text-stone-500 hover:text-stone-900'
                              }`}
                              title="Sonraki sütuna taşı"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Right: Send to Editor & Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onSendToEditor(card)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                isDark
                                  ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/15 hover:border-amber-500'
                                  : 'border-[#fde68a] text-[#b45309] hover:bg-[#fffbeb] hover:border-[#d97706]'
                              }`}
                              title="Bu fikri gönderi editörüne aktar"
                            >
                              <Send className="w-3 h-3" />
                              <span>Editöre Aktar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteCard(card.id)}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                isDark
                                  ? 'text-stone-500 hover:text-rose-400 hover:bg-rose-950/20'
                                  : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title="Kartı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
