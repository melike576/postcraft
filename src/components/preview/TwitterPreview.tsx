import { MessageCircle, Repeat2, Heart, Bookmark, Share, BadgeCheck, MoreHorizontal } from 'lucide-react'

interface Props {
  content: string
  imageUrl?: string
  authorName?: string
  username?: string
  theme?: 'light' | 'dark'
  isThread?: boolean
}

export function splitIntoTweets(text: string, maxLen = 250): string[] {
  const trimmed = text.trim()
  if (!trimmed) return ['']
  if (trimmed.length <= 280) return [trimmed]

  // Split by paragraphs first
  const paragraphs = trimmed.split(/\n\s*\n/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const para of paragraphs) {
    const candidate = currentChunk ? `${currentChunk}\n\n${para}` : para
    if (candidate.length <= maxLen) {
      currentChunk = candidate
    } else {
      if (currentChunk) {
        chunks.push(currentChunk)
        currentChunk = ''
      }

      if (para.length <= maxLen) {
        currentChunk = para
      } else {
        // Split by sentences or words
        const sentences = para.split(/(?<=[.?!])\s+/)
        for (const sentence of sentences) {
          const sentCandidate = currentChunk ? `${currentChunk} ${sentence}` : sentence
          if (sentCandidate.length <= maxLen) {
            currentChunk = sentCandidate
          } else {
            if (currentChunk) chunks.push(currentChunk)
            // If single sentence is still too long, split by words
            if (sentence.length <= maxLen) {
              currentChunk = sentence
            } else {
              const words = sentence.split(' ')
              for (const word of words) {
                const wordCandidate = currentChunk ? `${currentChunk} ${word}` : word
                if (wordCandidate.length <= maxLen) {
                  currentChunk = wordCandidate
                } else {
                  if (currentChunk) chunks.push(currentChunk)
                  currentChunk = word
                }
              }
            }
          }
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  const total = chunks.length
  if (total <= 1) return chunks

  return chunks.map((chunk, index) => `${chunk} (${index + 1}/${total})`)
}

export function TwitterPreview({
  content,
  imageUrl,
  authorName = 'PostCraft Studio',
  username = 'postcraft',
  theme = 'light',
  isThread = false,
}: Props) {
  const isDark = theme === 'dark'
  const tweets = isThread ? splitIntoTweets(content) : [content]

  return (
    <div className="w-full max-w-[460px] mx-auto flex flex-col gap-0 select-none">
      {tweets.map((tweetText, idx) => {
        const isFirst = idx === 0
        const isLast = idx === tweets.length - 1
        const hasNext = idx < tweets.length - 1

        return (
          <div
            key={idx}
            className={`w-full p-4 border text-xs transition-colors duration-200 relative ${
              isDark
                ? 'bg-black border-zinc-800 text-zinc-100'
                : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/50'
            } ${isFirst && isLast ? 'rounded-2xl shadow-xl' : ''} ${
              isFirst && !isLast ? 'rounded-t-2xl border-b-0' : ''
            } ${!isFirst && !isLast ? 'border-b-0 border-t-0' : ''} ${
              !isFirst && isLast ? 'rounded-b-2xl border-t-0 shadow-xl' : ''
            }`}
          >
            {/* Thread Connector Line running from this tweet's avatar to the next */}
            {hasNext && (
              <div
                className={`absolute left-[35px] top-[54px] bottom-0 w-0.5 ${
                  isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                }`}
              />
            )}

            {/* Tweet Header */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  {authorName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-bold text-sm hover:underline cursor-pointer ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    {authorName}
                  </span>
                  <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                  <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>@{username}</span>
                  <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>·</span>
                  <span className={`text-xs hover:underline cursor-pointer ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {idx === 0 ? '18d' : `${Math.max(1, 18 - idx * 2)}d`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={`p-1 ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Tweet Body */}
            <div
              className={`mt-2.5 pl-12 text-sm leading-normal whitespace-pre-wrap break-words ${
                isDark ? 'text-zinc-200' : 'text-zinc-800'
              }`}
            >
              {tweetText || <span className="text-zinc-400 italic">Tweet metniniz burada görünecek...</span>}
            </div>

            {/* Media if present (attached to first tweet in thread) */}
            {isFirst && imageUrl && (
              <div
                className={`mt-3 ml-12 rounded-2xl overflow-hidden border max-h-[240px] ${
                  isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <img src={imageUrl} alt="Tweet media" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Tweet Interaction Metrics */}
            <div
              className={`mt-3 ml-12 pt-2.5 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-zinc-900 text-zinc-500' : 'border-zinc-100 text-zinc-500'
              }`}
            >
              <div className="flex items-center gap-1.5 hover:text-sky-500 cursor-pointer transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{Math.max(2, 18 - idx * 4)}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer transition-colors">
                <Repeat2 className="w-3.5 h-3.5" />
                <span>{Math.max(1, 9 - idx * 2)}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer transition-colors">
                <Heart className="w-3.5 h-3.5" />
                <span>{Math.max(12, 84 - idx * 18)}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-sky-500 cursor-pointer transition-colors">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{Math.max(1, 12 - idx * 3)}</span>
              </div>
              <div className="flex items-center hover:text-sky-500 cursor-pointer transition-colors">
                <Share className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
