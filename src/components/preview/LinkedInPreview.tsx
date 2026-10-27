import { useState } from 'react'
import { 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  Globe, 
  MoreHorizontal, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2 
} from 'lucide-react'

interface Props {
  content: string
  imageUrl?: string
  isDocument?: boolean
  documentTitle?: string
  documentSlides?: string[]
  authorName?: string
  authorTitle?: string
  theme?: 'light' | 'dark'
}

export function LinkedInPreview({
  content,
  imageUrl,
  isDocument = false,
  documentTitle = 'Tasarım_ve_Mimari_Rehberi.pdf',
  documentSlides = [],
  authorName = 'PostCraft Studio',
  authorTitle = 'Sosyal Medya & İçerik Stüdyosu',
  theme = 'light',
}: Props) {
  const isDark = theme === 'dark'
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = isDocument && documentSlides.length > 0
    ? documentSlides
    : imageUrl
    ? [imageUrl]
    : []

  const totalSlides = slides.length
  const safeSlide = Math.min(currentSlide, Math.max(0, totalSlides - 1))
  const hasMultiple = totalSlides > 1

  const goPrev = () => setCurrentSlide((s) => Math.max(0, s - 1))
  const goNext = () => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))

  return (
    <div
      className={`w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-xl border text-xs transition-colors duration-200 ${
        isDark
          ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
          : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/50'
      }`}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-sm ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
            }`}
          >
            {authorName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className={`font-semibold text-sm leading-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {authorName}
            </h4>
            <p className={`text-[11px] leading-tight line-clamp-1 mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {authorTitle}
            </p>
            <div className={`flex items-center gap-1 text-[10px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <span>1 saat önce</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`p-1 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-zinc-700'}`}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Post Content */}
      <div
        className={`px-4 pb-3 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
          isDark ? 'text-zinc-200' : 'text-zinc-700'
        }`}
      >
        {content || <span className="text-zinc-400 italic">LinkedIn gönderi metniniz burada görünecek...</span>}
      </div>

      {/* Post Media: Document / PDF Viewer OR Regular Image */}
      {isDocument ? (
        <div
          className={`w-full border-y select-none ${
            isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-100'
          }`}
        >
          {/* Document Top Bar */}
          <div
            className={`flex items-center justify-between px-3.5 py-2.5 border-b text-xs ${
              isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs truncate max-w-[240px]">
                {documentTitle || 'Dokuman.pdf'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {totalSlides > 0 ? `${safeSlide + 1} / ${totalSlides}` : '0 / 0'}
              </span>
              <Maximize2 className="w-3.5 h-3.5 opacity-60" />
            </div>
          </div>

          {/* Document Slide Canvas */}
          <div className="relative w-full aspect-square max-h-[380px] flex items-center justify-center overflow-hidden bg-black/5 dark:bg-black/40">
            {slides.length > 0 ? (
              <>
                <img
                  key={safeSlide}
                  src={slides[safeSlide]}
                  alt={`Slayt ${safeSlide + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-200"
                />

                {/* Floating Nav Arrows */}
                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={safeSlide === 0}
                      className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                        safeSlide === 0 ? 'opacity-20 pointer-events-none' : 'opacity-85 hover:opacity-100'
                      } ${isDark ? 'bg-zinc-900/90 text-white border border-zinc-700' : 'bg-white/95 text-zinc-800 border border-zinc-200'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={safeSlide === totalSlides - 1}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                        safeSlide === totalSlides - 1 ? 'opacity-20 pointer-events-none' : 'opacity-85 hover:opacity-100'
                      } ${isDark ? 'bg-zinc-900/90 text-white border border-zinc-700' : 'bg-white/95 text-zinc-800 border border-zinc-200'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-zinc-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                <p className="text-xs font-medium">Doküman için slayt görselleri ekleyin</p>
                <p className="text-[10px] opacity-70 mt-1">LinkedIn çok sayfalı PDF slaytı simülasyonu</p>
              </div>
            )}
          </div>

          {/* Document Bottom Bar with Progress */}
          {slides.length > 0 && (
            <div
              className={`px-3.5 py-2 border-t flex items-center justify-between text-[11px] ${
                isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
              }`}
            >
              <span className="font-medium">
                Sayfa {safeSlide + 1} / {totalSlides}
              </span>
              {/* Mini progress bar */}
              <div className="flex-1 max-w-[140px] mx-3 h-1.5 rounded-full overflow-hidden bg-zinc-300 dark:bg-zinc-800">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((safeSlide + 1) / totalSlides) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                Kaydır →
              </span>
            </div>
          )}
        </div>
      ) : imageUrl ? (
        <div
          className={`w-full max-h-[300px] overflow-hidden border-y ${
            isDark ? 'border-zinc-800 bg-black' : 'border-zinc-100 bg-zinc-50'
          }`}
        >
          <img src={imageUrl} alt="LinkedIn media" className="w-full h-full object-cover" />
        </div>
      ) : null}

      {/* Reactions Bar */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-[11px] ${
          isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white">👍</span>
            <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[9px] text-white">❤️</span>
            <span className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-[9px] text-white">💡</span>
          </div>
          <span>128 kişi</span>
        </div>
        <span>23 yorum • 4 yeniden paylaşım</span>
      </div>

      {/* Action Buttons */}
      <div
        className={`px-2 py-1.5 grid grid-cols-4 gap-1 text-[11px] font-medium ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}
      >
        <button
          type="button"
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Beğen</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Yorum</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Repeat2 className="w-3.5 h-3.5" />
          <span>Paylaş</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-zinc-800 hover:text-zinc-200' : 'hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gönder</span>
        </button>
      </div>
    </div>
  )
}
