import { useState } from 'react'
import { 
  FileText, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Plus, 
  Search,
  Calendar
} from 'lucide-react'
import { InstagramIcon, LinkedinIcon, TwitterIcon } from '../icons'
import type { Post, Platform } from '../../types/post'

interface Props {
  drafts: Post[]
  onEdit: (post: Post) => void
  onDelete: (id: string) => void
  onNewPost: () => void
  theme: 'light' | 'dark'
}

export function DraftsList({ drafts, onEdit, onDelete, onNewPost, theme }: Props) {
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const isDark = theme === 'dark'

  const filteredDrafts = drafts.filter((d) => {
    const matchesPlatform = filterPlatform === 'all' || d.platform === filterPlatform
    const matchesSearch = d.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesPlatform && matchesSearch
  })

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'twitter':
        return <TwitterIcon className="w-3.5 h-3.5" />
      case 'linkedin':
        return <LinkedinIcon className="w-3.5 h-3.5" />
      case 'instagram':
        return <InstagramIcon className="w-3.5 h-3.5" />
    }
  }

  const getPlatformName = (platform: Platform) => {
    switch (platform) {
      case 'twitter':
        return 'X (Twitter)'
      case 'linkedin':
        return 'LinkedIn'
      case 'instagram':
        return 'Instagram'
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Kayıtlı Taslaklar</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Tarayıcında saklanan ve üzerinde çalışmaya devam edebileceğin {drafts.length} taslak var.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewPost}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 ${
            isDark
              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
              : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[#d97706]/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Gönderi Yaz</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Taslaklarda ara..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border transition-all ${
              isDark
                ? 'bg-[#15130f] border-[#262118] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500'
                : 'bg-white border-[#e5ded3] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d97706]'
            }`}
          />
        </div>

        {/* Platform Filter Buttons */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto ${
            isDark ? 'bg-[#15130f] border-[#262118]' : 'bg-[#f7f3ec] border-[#e8dfd3]'
          }`}
        >
          {(['all', 'twitter', 'linkedin', 'instagram'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPlatform(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                filterPlatform === p
                  ? isDark
                    ? 'bg-[#241d11] text-amber-300 font-semibold shadow-xs border border-[#423418]'
                    : 'bg-white text-[#b45309] font-semibold shadow-xs border border-[#fde68a]'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {p === 'all' ? 'Hepsi' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Drafts Grid / List */}
      {filteredDrafts.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed ${
            isDark ? 'border-[#242018] bg-[#100e0b]/50' : 'border-[#e0d6c8] bg-[#faf6f0]/50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
              isDark ? 'bg-[#1c1813] text-stone-500' : 'bg-[#eee6dc] text-stone-500'
            }`}
          >
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-sm">Hiç taslak bulunamadı</h3>
          <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4">
            {searchQuery
              ? 'Arama kriterlerinize uygun taslak bulunamadı.'
              : 'Henüz kaydedilmiş bir taslağınız yok. Yeni bir gönderi yazıp "Taslak Olarak Sakla" butonuna basabilirsiniz.'}
          </p>
          <button
            type="button"
            onClick={onNewPost}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${
              isDark
                ? 'bg-[#221c10] text-amber-300 border border-[#3d3119] hover:bg-[#2c2212]'
                : 'bg-white text-[#b45309] border border-[#fde68a] hover:bg-[#fffbeb]'
            }`}
          >
            Yeni Gönderi Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrafts.map((draft) => (
            <div
              key={draft.id}
              className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                isDark
                  ? 'bg-[#12100d] border-[#211e18] hover:border-[#383124]'
                  : 'bg-white border-[#ebe5dc] hover:border-[#d9cdbf]'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                        isDark
                          ? 'bg-[#1a1610] border-[#302615] text-amber-300'
                          : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
                      }`}
                    >
                      {getPlatformIcon(draft.platform)}
                      <span>{getPlatformName(draft.platform)}</span>
                    </span>
                    {draft.status === 'scheduled' && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400">
                        {draft.scheduledAt ? draft.scheduledAt.replace('T', ' ') : 'Planlandı'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{draft.createdAt}</span>
                  </div>
                </div>

                {/* Content snippet */}
                <p className="text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 text-inherit">
                  {draft.content}
                </p>

                {/* Thumbnail if any */}
                {draft.imageUrl && (
                  <div className="w-full h-28 rounded-xl overflow-hidden mb-4 border border-inherit">
                    <img
                      src={draft.imageUrl}
                      alt="Taslak görseli"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div
                className={`pt-3 border-t flex items-center justify-between ${
                  isDark ? 'border-[#1e1b15]' : 'border-[#f2ebe0]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(draft)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isDark
                        ? 'bg-[#221c10] text-amber-300 hover:bg-[#2c2212]'
                        : 'bg-[#fffbeb] text-[#b45309] hover:bg-[#fef3c7]'
                    }`}
                    title="Bu taslağı editörde düzenle"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Düzenle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(draft.id, draft.content)}
                    className={`p-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200 transition-colors ${
                      isDark ? 'hover:bg-[#1a1712]' : 'hover:bg-[#f6efe4]'
                    }`}
                    title="Metni kopyala"
                  >
                    {copiedId === draft.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(draft.id)}
                  className={`p-1.5 rounded-lg text-xs text-stone-400 hover:text-rose-500 transition-colors ${
                    isDark ? 'hover:bg-[#201515]' : 'hover:bg-[#fae8e8]'
                  }`}
                  title="Taslağı sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
