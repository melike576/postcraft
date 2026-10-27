import { useState } from 'react'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  content: string
  imageUrl?: string
  carouselImages?: string[]   // carousel mode
  isCarousel?: boolean
  authorName?: string
  username?: string
  theme?: 'light' | 'dark'
}

export function InstagramPreview({
  content,
  imageUrl,
  carouselImages = [],
  isCarousel = false,
  authorName = 'PostCraft Studio',
  username = 'postcraft',
  theme = 'light',
}: Props) {
  const isDark = theme === 'dark'
  const [currentSlide, setCurrentSlide] = useState(0)

  // Determine which image array to use
  const slides: string[] = isCarousel && carouselImages.length > 0
    ? carouselImages
    : imageUrl
    ? [imageUrl]
    : []

  const totalSlides = slides.length
  const hasMultiple = totalSlides > 1

  const goPrev = () => setCurrentSlide((s) => Math.max(0, s - 1))
  const goNext = () => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))

  // Reset slide when images change
  const safeSlide = Math.min(currentSlide, Math.max(0, totalSlides - 1))

  return (
    <div
      className={`w-full max-w-[390px] mx-auto rounded-3xl overflow-hidden shadow-xl border text-xs select-none transition-colors duration-200 ${
        isDark
          ? 'bg-black border-zinc-800 text-white'
          : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/50'
      }`}
    >
      {/* Top Header */}
      <div
        className={`flex items-center justify-between px-3.5 py-3 border-b ${
          isDark ? 'border-zinc-900 bg-zinc-950/70' : 'border-zinc-100 bg-zinc-50/70'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
            <div
              className={`w-full h-full rounded-full border flex items-center justify-center text-[11px] font-bold ${
                isDark ? 'bg-zinc-900 border-black text-zinc-200' : 'bg-white border-white text-zinc-800'
              }`}
            >
              {authorName.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div>
            <div
              className={`font-semibold flex items-center gap-1 leading-none ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              {username}
            </div>
            <span className={`text-[10px] leading-none ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              İstanbul, Türkiye
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Carousel slide counter badge */}
          {isCarousel && totalSlides > 1 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {safeSlide + 1}/{totalSlides}
            </span>
          )}
          <button
            type="button"
            className={`p-1 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image / Carousel Area */}
      <div
        className={`w-full aspect-square relative overflow-hidden border-y ${
          isDark ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-100 border-zinc-100'
        }`}
      >
        {slides.length > 0 ? (
          <>
            {/* Slide image */}
            <img
              key={safeSlide}
              src={slides[safeSlide]}
              alt={`Slayt ${safeSlide + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Left / Right nav arrows (only when multiple slides) */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={safeSlide === 0}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                    safeSlide === 0 ? 'opacity-30 pointer-events-none' : 'opacity-80 hover:opacity-100'
                  } ${isDark ? 'bg-zinc-900/80 text-white' : 'bg-white/90 text-zinc-800'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={safeSlide === totalSlides - 1}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                    safeSlide === totalSlides - 1 ? 'opacity-30 pointer-events-none' : 'opacity-80 hover:opacity-100'
                  } ${isDark ? 'bg-zinc-900/80 text-white' : 'bg-white/90 text-zinc-800'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`rounded-full transition-all cursor-pointer ${
                      idx === safeSlide
                        ? 'w-2 h-2 bg-white shadow-sm'
                        : 'w-1.5 h-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Carousel stack icon (top-right) */}
            {isCarousel && totalSlides > 1 && (
              <div className="absolute top-3 right-3 opacity-90">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="6" width="13" height="13" rx="2" fill="none" stroke="white" strokeWidth="2"/>
                  <rect x="7" y="2" width="13" height="13" rx="2" fill="none" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div
            className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${
              isDark
                ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-500'
                : 'bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-400'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-2 ${
                isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'
              }`}
            >
              {isCarousel ? '🎠' : '🖼️'}
            </div>
            <span className="text-[11px]">
              {isCarousel ? 'Carousel için görsel ekleyin' : "Görsel URL'si ekleyerek önizleyin"}
            </span>
          </div>
        )}
      </div>

      {/* Action Icons */}
      <div className="px-3.5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-4">
            <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer transition-colors" />
            <MessageCircle className="w-5 h-5 -rotate-90 hover:text-zinc-400 cursor-pointer" />
            <Send className="w-5 h-5 hover:text-zinc-400 cursor-pointer" />
          </div>
          <Bookmark className="w-5 h-5 hover:text-zinc-400 cursor-pointer" />
        </div>

        {/* Likes */}
        <p className={`font-semibold mb-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
          342 beğenme
        </p>

        {/* Caption */}
        <div
          className={`leading-relaxed break-words whitespace-pre-wrap ${
            isDark ? 'text-zinc-300' : 'text-zinc-800'
          }`}
        >
          <span className={`font-semibold mr-1.5 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            {username}
          </span>
          {content || <span className="text-zinc-400 italic">Metin bekleniyor...</span>}
        </div>

        {/* Comments link & date */}
        <p
          className={`text-[11px] mt-2 cursor-pointer hover:underline ${
            isDark ? 'text-zinc-500' : 'text-zinc-500'
          }`}
        >
          14 yorumun tümünü gör
        </p>
        <p
          className={`text-[10px] uppercase tracking-wider mt-1 ${
            isDark ? 'text-zinc-600' : 'text-zinc-400'
          }`}
        >
          2 SAAT ÖNCE
        </p>
      </div>
    </div>
  )
}
