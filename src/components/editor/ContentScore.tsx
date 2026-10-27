import { useMemo } from 'react'
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { Platform } from '../../types/post'

interface ContentScoreProps {
  content: string
  platform: Platform
  isDark: boolean
}

interface ScoreCriterion {
  id: string
  label: string
  emoji: string
  score: number   // 0 or 20
  tip: string
  passed: boolean
}

interface ScoreResult {
  total: number
  label: string
  labelEmoji: string
  criteria: ScoreCriterion[]
}

const PLATFORM_OPTIMAL: Record<Platform, { min: number; max: number }> = {
  twitter: { min: 70, max: 240 },
  instagram: { min: 150, max: 800 },
  linkedin: { min: 400, max: 1800 },
}

const PLATFORM_NAME: Record<Platform, string> = {
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
}

function computeScore(content: string, platform: Platform): ScoreResult {
  const text = content.trim()
  const len = text.length
  const { min, max } = PLATFORM_OPTIMAL[platform]

  // ── 1. Length ─────────────────────────────────────────────────────────────
  const lengthOk = len >= min && len <= max
  const lengthCriterion: ScoreCriterion = {
    id: 'length',
    label: 'Optimum Uzunluk',
    emoji: '📏',
    score: lengthOk ? 20 : 0,
    passed: lengthOk,
    tip: lengthOk
      ? `${PLATFORM_NAME[platform]} için ideal uzunluk aralığındasınız.`
      : len < min
      ? `${PLATFORM_NAME[platform]} için en az ${min} karakter önerilir. (Şimdi: ${len})`
      : `${PLATFORM_NAME[platform]} için ${max} karakterin altında kalmaya çalışın. (Şimdi: ${len})`,
  }

  // ── 2. Opening Hook ───────────────────────────────────────────────────────
  const firstLine = text.split('\n')[0] ?? ''
  const hookSignals = [
    '?', '!', ':', '…', '...',
    'neden', 'nasıl', 'nerede', 'ne zaman', 'kim', 'hangi',
    'şaşırtıcı', 'inanılmaz', 'kritik', 'gerçek', 'sır', 'gizli', 'önemli',
    'dikkat', 'uyarı', 'ipucu', 'öğrendim', 'fark ettim', 'keşfettim',
    'bilen', 'bilmek', 'söylemediler',
  ]
  const hookPassed =
    firstLine.length > 0 &&
    (firstLine.endsWith('?') ||
      firstLine.endsWith('!') ||
      firstLine.endsWith(':') ||
      hookSignals.some((s) => firstLine.toLowerCase().includes(s)))

  const hookCriterion: ScoreCriterion = {
    id: 'hook',
    label: 'Güçlü Giriş Kancası',
    emoji: '🎣',
    score: hookPassed ? 20 : 0,
    passed: hookPassed,
    tip: hookPassed
      ? 'İlk satırınız okuyucunun dikkatini çekiyor!'
      : 'İlk satırı soru, ":" veya çarpıcı bir ifadeyle başlatın.',
  }

  // ── 3. Call-to-Action ─────────────────────────────────────────────────────
  const ctaSignals = [
    '?',
    'ne düşünüyorsunuz',
    'ne düşünüyorsun',
    'katılıyor musunuz',
    'katılıyor musun',
    'yorumlarınızı',
    'yorum yazın',
    'paylaşın',
    'siz ne',
    'siz nasıl',
    'sizce',
    'oy verin',
    'takip edin',
    'beğenin',
  ]
  const ctaPassed = ctaSignals.some((s) => text.toLowerCase().includes(s))
  const ctaCriterion: ScoreCriterion = {
    id: 'cta',
    label: 'Etkileşim Daveti (CTA)',
    emoji: '💬',
    score: ctaPassed ? 20 : 0,
    passed: ctaPassed,
    tip: ctaPassed
      ? 'Okuyucuyu etkileşime davet ediyorsunuz.'
      : 'Sonuna "Siz ne düşünüyorsunuz?" veya bir soru ekleyin.',
  }

  // ── 4. Hashtags ───────────────────────────────────────────────────────────
  const hashtags = text.match(/#[\w\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]+/g) ?? []
  const hashCount = hashtags.length

  let hashPassed = false
  let hashTip = ''

  if (platform === 'twitter') {
    hashPassed = hashCount >= 1 && hashCount <= 3
    hashTip = hashPassed
      ? 'Etiket sayısı X için ideal (1-3).'
      : hashCount === 0
      ? '1-3 adet # etiketi ekleyin.'
      : `${hashCount} etiket fazla; X için 1-3 önerilir.`
  } else if (platform === 'instagram') {
    hashPassed = hashCount >= 5 && hashCount <= 20
    hashTip = hashPassed
      ? 'Etiket sayısı Instagram için ideal (5-20).'
      : hashCount === 0
      ? '5-20 adet # etiketi ekleyin.'
      : hashCount < 5
      ? `En az 5 etiket önerilir. (Şimdi: ${hashCount})`
      : `${hashCount} etiket fazla; Instagram için 5-20 önerilir.`
  } else {
    hashPassed = hashCount >= 1 && hashCount <= 5
    hashTip = hashPassed
      ? 'Etiket sayısı LinkedIn için ideal (1-5).'
      : hashCount === 0
      ? '1-5 adet # etiketi ekleyin.'
      : `${hashCount} etiket fazla; LinkedIn için 1-5 önerilir.`
  }

  const hashCriterion: ScoreCriterion = {
    id: 'hashtag',
    label: 'Etiket Kullanımı',
    emoji: '#️⃣',
    score: hashPassed ? 20 : 0,
    passed: hashPassed,
    tip: hashTip,
  }

  // ── 5. Readability (short paragraphs) ─────────────────────────────────────
  const paragraphs = text.split(/\n\n+/)
  const avgParaLen =
    paragraphs.length > 0
      ? paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length
      : len
  const readOk = avgParaLen <= 300
  const readCriterion: ScoreCriterion = {
    id: 'readability',
    label: 'Paragraf Okunabilirliği',
    emoji: '📖',
    score: readOk ? 20 : 0,
    passed: readOk,
    tip: readOk
      ? 'Kısa paragraflar kullanıyorsunuz, harika!'
      : 'Uzun bloğu 2-3 cümlelik kısa paragraflara bölün.',
  }

  const criteria = [
    lengthCriterion,
    hookCriterion,
    ctaCriterion,
    hashCriterion,
    readCriterion,
  ]
  const total = criteria.reduce((s, c) => s + c.score, 0)

  let label = 'Zayıf'
  let labelEmoji = '🔴'
  if (total >= 80) { label = 'Harika!'; labelEmoji = '🔥' }
  else if (total >= 60) { label = 'İyi'; labelEmoji = '✅' }
  else if (total >= 40) { label = 'Orta'; labelEmoji = '🟡' }

  return { total, label, labelEmoji, criteria }
}

// ── Circular gauge ─────────────────────────────────────────────────────────
function CircleGauge({ score, isDark }: { score: number; isDark: boolean }) {
  const R = 34
  const CIRCUMFERENCE = 2 * Math.PI * R
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE

  const color =
    score >= 80
      ? '#22c55e'
      : score >= 60
      ? '#d97706'
      : score >= 40
      ? '#f59e0b'
      : '#ef4444'

  return (
    <svg width={88} height={88} viewBox="0 0 88 88" className="shrink-0">
      {/* Track */}
      <circle
        cx={44}
        cy={44}
        r={R}
        fill="none"
        stroke={isDark ? '#1e1a13' : '#f5efe6'}
        strokeWidth={8}
      />
      {/* Progress */}
      <circle
        cx={44}
        cy={44}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1), stroke 0.3s' }}
      />
      {/* Score text */}
      <text
        x={44}
        y={44}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight="bold"
        fill={color}
      >
        {score}
      </text>
    </svg>
  )
}

export function ContentScore({ content, platform, isDark }: ContentScoreProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const result = useMemo(
    () => computeScore(content, platform),
    [content, platform],
  )

  const hasContent = content.trim().length >= 10

  return (
    <div
      className={`rounded-2xl border transition-all shadow-sm ${
        isDark
          ? 'bg-[#13110d] border-[#252018]'
          : 'bg-[#fffdfa] border-[#f0e8db]'
      }`}
    >
      {/* Header row – always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BarChart3
            className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-[#d97706]'}`}
          />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-amber-400' : 'text-[#b45309]'
            }`}
          >
            Etkileşim Skoru
          </span>
          {hasContent && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                result.total >= 80
                  ? isDark
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : result.total >= 60
                  ? isDark
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-amber-50 border-amber-300 text-amber-700'
                  : result.total >= 40
                  ? isDark
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-yellow-50 border-yellow-300 text-yellow-700'
                  : isDark
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-rose-50 border-rose-300 text-rose-700'
              }`}
            >
              {result.labelEmoji} {result.label}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        )}
      </button>

      {/* Expandable body */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {!hasContent ? (
            <p
              className={`text-xs text-center py-3 ${
                isDark ? 'text-stone-500' : 'text-stone-400'
              }`}
            >
              İçerik yazmaya başlayınca skor canlı olarak güncellenir ✍️
            </p>
          ) : (
            <div className="flex items-center gap-5">
              {/* Gauge */}
              <CircleGauge score={result.total} isDark={isDark} />

              {/* Criteria list */}
              <ul className="flex-1 space-y-1.5">
                {result.criteria.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    <span className="text-base leading-none mt-0.5 shrink-0">
                      {c.passed ? '✅' : '🔴'}
                    </span>
                    <div>
                      <span
                        className={`text-[11px] font-semibold ${
                          isDark ? 'text-stone-300' : 'text-stone-700'
                        }`}
                      >
                        {c.emoji} {c.label}
                      </span>
                      <p
                        className={`text-[10px] leading-snug ${
                          isDark ? 'text-stone-500' : 'text-stone-400'
                        }`}
                      >
                        {c.tip}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
