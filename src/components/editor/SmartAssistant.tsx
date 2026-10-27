import { useState, useMemo } from 'react'
import { Sparkles, X, ChevronRight, Hash, MessageSquareQuote, SlidersHorizontal, Check, Lightbulb } from 'lucide-react'
import type { Platform } from '../../types/post'

interface SmartAssistantProps {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
  platform: Platform
  content: string
  onApplyContent: (newContent: string) => void
  onPrependHook: (hook: string) => void
  onAppendText: (text: string) => void
}

interface AnalysisResult {
  topicKey: 'design' | 'dev' | 'career' | 'productivity' | 'general'
  topicBadge: string
  topicLabel: string
  hooks: string[]
  hashtags: string[]
  callToActions: string[]
  tones: {
    professional: string
    punchy: string
    story: string
  }
}

function analyzeContent(rawText: string): AnalysisResult {
  const text = rawText.toLowerCase()

  // Keyword banks
  const devKeywords = [
    'kod', 'yazılım', 'yazilim', 'react', 'typescript', 'javascript', 'frontend', 'backend',
    'css', 'html', 'api', 'bug', 'refactor', 'tailwind', 'nextjs', 'git', 'fonksiyon',
    'bileşen', 'component', 'developer', 'yazılımcı', 'yazilimci', 'framework'
  ]

  const designKeywords = [
    'tasarım', 'tasarim', 'ui', 'ux', 'arayüz', 'arayuz', 'figma', 'renk', 'kontrast',
    'buton', 'tipografi', 'font', 'kullanıcı', 'kullanici', 'deneyim', 'estetik', 'mockup',
    'görsel', 'gorsel', 'layout', 'padding', 'margin'
  ]

  const careerKeywords = [
    'staj', 'stajyer', 'kariyer', 'iş', 'is', 'mülakat', 'mulakat', 'cv', 'ofis',
    'şirket', 'sirket', 'ekip', 'mentor', 'terfi', 'maaş', 'maas', 'tecrübe', 'tecrube',
    'öğrendim', 'ogrendim', 'ders', 'üniversite', 'mezun'
  ]

  const productivityKeywords = [
    'odak', 'zaman', 'üretkenlik', 'uretkenlik', 'disiplin', 'alışkanlık', 'aliskanlik',
    'hedef', 'motivasyon', 'günlük', 'gunluk', 'plan', 'rutin', 'çalışma', 'calisma', 'pomodoro'
  ]

  let devScore = 0
  let designScore = 0
  let careerScore = 0
  let productivityScore = 0

  devKeywords.forEach((w) => { if (text.includes(w)) devScore += 1 })
  designKeywords.forEach((w) => { if (text.includes(w)) designScore += 1 })
  careerKeywords.forEach((w) => { if (text.includes(w)) careerScore += 1 })
  productivityKeywords.forEach((w) => { if (text.includes(w)) productivityScore += 1 })

  const maxScore = Math.max(devScore, designScore, careerScore, productivityScore)
  const trimmed = rawText.trim()

  // 1. DESIGN & UI/UX
  if (maxScore > 0 && maxScore === designScore) {
    return {
      topicKey: 'design',
      topicBadge: '🎨 Tasarım & UI/UX',
      topicLabel: 'Arayüz, görsel hiyerarşi ve kullanıcı deneyimi',
      hooks: [
        'Birçok tasarımcının arayüzlerde yaptığı en kritik hata:',
        'Kullanıcı deneyimi (UX) hakkında bunu kimse açıkça söylemiyor ama:',
        'İyi bir UI tasarımı ile vasat bir tasarım arasındaki o tek fark:',
        'Kullanıcıların yüzde 90\'ının ilk tıkladığı anda hissettiği o detay:',
        'Tasarımda renk ve kontrast dengesi kurarken öğrendiğim kural:',
      ],
      hashtags: ['#UIDesign', '#UXDesign', '#ArayüzTasarımı', '#ProductDesign', '#Figma', '#WebDesign', '#UX'],
      callToActions: [
        'Sizce kullanıcı arayüzlerinde en sık yapılan hata nedir?',
        'Kullanıcı deneyimini güçlendirmek için sizin ilk kuralınız ne?',
        'Tasarım sürecinizde siz hangi yaklaşımı benimsiyorsunuz?',
      ],
      tones: {
        professional: `Kullanıcı deneyimi ve modern arayüz prensiplerini incelediğimizde:\n\n${trimmed}\n\nSizce dijital ürünlerde kullanıcı sadakatini en çok hangi tasarım kararları belirler? Fikirlerinizi duymaktan memnuniyet duyarım.`,
        punchy: `Tasarımda altın kural:\n\n⚡ ${trimmed}\n\nBasit tut, kullanıcıyı yorma. 🎨`,
        story: `Bir arayüzü tasarlarken aldığım en çarpıcı kullanıcı geri bildirimi:\n\n${trimmed}\n\nDetaylar ürünü vezir de eder, rezil de. Ne düşünüyorsunuz?`,
      },
    }
  }

  // 2. SOFTWARE & WEB DEV
  if (maxScore > 0 && maxScore === devScore) {
    return {
      topicKey: 'dev',
      topicBadge: '💻 Yazılım & Web Geliştirme',
      topicLabel: 'Frontend mimarisi, kod kalitesi ve geliştirici araçları',
      hooks: [
        'Junior ve mid yazılımcıların kod yazarken yaptığı en yaygın hata:',
        'Clean Code ve mimari hakkında kimse söylemiyor ama gerçek şu:',
        'Bu yapıyı kurduktan sonra projede bug çıkma oranı yarıya indi:',
        'React ve frontend dünyasında son 1 yılda çıkardığım en büyük ders:',
        'Kod yazarken şu detayı atlamak sonradan saatlerce debug yaptırır:',
      ],
      hashtags: ['#WebDev', '#Frontend', '#ReactJS', '#TypeScript', '#CleanCode', '#SoftwareEngineering', '#Coding'],
      callToActions: [
        'Sizin bu konuda favori yaklaşımınız veya kütüphaneniz nedir?',
        'Ekibinizde benzer bir standart veya mimari uyguluyor musunuz?',
        'Sizce bu sorunu çözmenin en zarif yolu ne?',
      ],
      tones: {
        professional: `Yazılım mimarisi ve kod sürdürülebilirliği perspektifinden baktığımızda:\n\n${trimmed}\n\nEkibinizde benzer bir yaklaşım izliyor musunuz? Deneyimlerinizi paylaşmanızdan memnuniyet duyarım.`,
        punchy: `Yazılımda net kural:\n\n⚡ ${trimmed}\n\nTemiz kod yaz, gelecekteki seni koru. 💻`,
        story: `Kodu canlıya almadan önceki son review'da fark ettiğim o kritik nokta:\n\n${trimmed}\n\nSiz olsaydınız bu senaryoda nasıl bir refactor yapardınız?`,
      },
    }
  }

  // 3. CAREER & INTERNSHIP
  if (maxScore > 0 && maxScore === careerScore) {
    return {
      topicKey: 'career',
      topicBadge: '🚀 Kariyer & Profesyonel Gelişim',
      topicLabel: 'Staj deneyimi, iş hayatı ve sektör dinamikleri',
      hooks: [
        'Staj ve kariyerimin başında bu tavsiyeyi alsaydım 2 yılımı kurtarırdım:',
        'İş hayatında teknik bilgiden bile daha kritik olan o tek beceri:',
        'Sektörde ilk adımı atarken herkesin yaptığı en büyük yanlış algı:',
        'Kariyer yolculuğumda son dönemde çıkardığım en dürüst ders:',
        'Mülakatlarda ve ekip içi iletişimde fark yaratan o ince detay:',
      ],
      hashtags: ['#Kariyer', '#İşHayatı', '#Stajyer', '#ProfesyonelGelişim', '#YazılımMülakatı', '#Mentorluk', '#Networking'],
      callToActions: [
        'Kariyerinizin başında aldığınız en değerli tavsiye neydi?',
        'Siz benzer bir durumda kalsaydınız nasıl bir yol izlerdiniz?',
        'Bu görüşü kendi çalışma ortamınızda nasıl deneyimlediniz?',
      ],
      tones: {
        professional: `Profesyonel iş hayatı ve kariyer dinamikleri üzerine kişisel bir değerlendirme:\n\n${trimmed}\n\nBenzer süreçlerden geçen sektör profesyonellerinin görüşlerini ve katkılarını duymaktan onur duyarım.`,
        punchy: `Kariyerde en net gerçek:\n\n⚡ ${trimmed}\n\nSürekli öğren, uygula, fark yarat. 🚀`,
        story: `Kariyerimin dönüm noktalarından birinde fark ettiğim o gerçek:\n\n${trimmed}\n\nSiz geriye dönseydiniz kendinize bu konuda ne söylerdiniz?`,
      },
    }
  }

  // 4. PRODUCTIVITY & FOCUS
  if (maxScore > 0 && maxScore === productivityScore) {
    return {
      topicKey: 'productivity',
      topicBadge: '⚡ Üretkenlik & Odak',
      topicLabel: 'Zaman yönetimi, derin çalışma ve alışkanlıklar',
      hooks: [
        'Günde 2 saat tasarruf etmemi sağlayan o basit kural:',
        'Üretkenlik ve motivasyon hakkında söylenen en büyük yanılgı:',
        'Odaklanma sorunu yaşayan herkesin denemesi gereken o yöntem:',
        'Disiplin ve alışkanlık inşası konusunda aldığım en sert ders:',
      ],
      hashtags: ['#Üretkenlik', '#ZamanYönetimi', '#Odaklanma', '#KişiselGelişim', '#Disiplin', '#DeepWork'],
      callToActions: [
        'Sizin gün içinde en çok uyguladığınız odaklanma tekniği nedir?',
        'Bu yöntemi denediniz mi, verim alabildiniz mi?',
        'Kendi çalışma rutininizde buna katılıyor musunuz?',
      ],
      tones: {
        professional: `Verimlilik ve süreç optimizasyonu açısından değerlendirdiğimizde:\n\n${trimmed}\n\nKendi çalışma akışınızda en yüksek verimi hangi alışkanlıklarla elde ediyorsunuz?`,
        punchy: `Daha az efor, daha çok sonuç:\n\n⚡ ${trimmed}\n\nOdaklan ve bitir. ⏱️`,
        story: `Tükenmişlik hissinden çıkıp üretkenliği yeniden yakaladığım o an:\n\n${trimmed}\n\nSizin kurtarıcı odak rutininiz nedir?`,
      },
    }
  }

  // 5. GENERAL FALLBACK (Analyzed words from text)
  return {
    topicKey: 'general',
    topicBadge: '💡 Genel İçerik & Fikir Paylaşımı',
    topicLabel: 'Yazdığınız metin analiz edilerek uyarlanmış öneriler',
    hooks: [
      'Bunu kimse açıkça söylemiyor ama gerçek şu:',
      'Son zamanlarda bu konuda edindiğim en çarpıcı gözlem:',
      'Birçok kişinin gözden kaçırdığı o kritik detay:',
      'Bu konuya sıfırdan başlasaydım tam olarak şunu yapardım:',
      'Biraz tartışmalı bir fikir ama bence doğrusu:',
    ],
    hashtags: ['#Gelişim', '#Fikirler', '#Paylaşım', '#Deneyim', '#Öğrenme', '#Vizyon'],
    callToActions: [
      'Siz bu konuda ne düşünüyorsunuz?',
      'Sizin bu konudaki favori bakış açınız nedir?',
      'Katılıyor musunuz, yoksa farklı bir görüşte misiniz?',
    ],
    tones: {
      professional: `Bu konudaki düşünce ve analizlerimi sizlerle paylaşmak istiyorum:\n\n${trimmed}\n\nSizlerin bu konudaki perspektifini duymaktan memnuniyet duyarım.`,
      punchy: `Özetle:\n\n⚡ ${trimmed}\n\nKaydet ve paylaş. 📌`,
      story: `Geçtiğimiz günlerde aklıma takılan ve üzerine düşündüğüm o konu:\n\n${trimmed}\n\nSiz bu durumu nasıl yorumluyorsunuz?`,
    },
  }
}

export function SmartAssistant({
  isOpen,
  onClose,
  isDark,
  content,
  onApplyContent,
  onPrependHook,
  onAppendText,
}: SmartAssistantProps) {
  const [activeTab, setActiveTab] = useState<'hooks' | 'tones' | 'cta'>('hooks')
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  // Real-time Context Analysis
  const analysis = useMemo(() => analyzeContent(content), [content])
  const hasEnoughText = content.trim().length >= 15

  if (!isOpen) return null

  const handleHookClick = (hook: string, idx: number) => {
    onPrependHook(hook)
    setCopiedIndex(`hook-${idx}`)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const handleApplyTone = (toneType: 'professional' | 'punchy' | 'story') => {
    const transformed = analysis.tones[toneType]
    if (!transformed) return

    onApplyContent(transformed)
    setCopiedIndex(`tone-${toneType}`)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const handleAppendHashtag = (tag: string) => {
    onAppendText(` ${tag}`)
    setCopiedIndex(`tag-${tag}`)
    setTimeout(() => setCopiedIndex(null), 1000)
  }

  const handleAppendCTA = (cta: string) => {
    onAppendText(`\n\n${cta}`)
    setCopiedIndex(`cta-${cta}`)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-md animate-in fade-in-50 duration-200 ${
        isDark
          ? 'bg-[#14110d] border-amber-500/30 shadow-black/40'
          : 'bg-[#fffdfa] border-[#fde68a] shadow-[#d97706]/10'
      }`}
    >
      {/* Header with Live Analysis Badge */}
      <div className="flex items-start sm:items-center justify-between pb-3.5 border-b border-amber-500/20 mb-3.5 gap-3">
        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight text-amber-500">
                Akıllı İçerik Analizi
              </h4>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-100 border-[#fde68a] text-[#92400e]'
              }`}>
                {analysis.topicBadge}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 truncate">
              {analysis.topicLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
            isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`}
          title="Asistanı Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Helper notice if text is very short */}
      {!hasEnoughText && (
        <div className={`p-2.5 rounded-xl border mb-3 flex items-center gap-2 text-xs ${
          isDark ? 'bg-amber-500/5 border-amber-500/20 text-amber-300/80' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Metninize birkaç cümle ekledikçe asistan konunuzu analiz edip daha spesifik kancalar ve etiketler sunacaktır.
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 mb-3.5 p-1 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <button
          type="button"
          onClick={() => setActiveTab('hooks')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'hooks'
              ? isDark
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-[#d97706] text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>Konuya Özel Kancalar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tones')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'tones'
              ? isDark
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-[#d97706] text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Akıllı Tonlama</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cta')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'cta'
              ? isDark
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-[#d97706] text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Konuya Uygun Etiketler</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'hooks' && (
        <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
          <p className="text-[10px] text-stone-400 font-medium mb-1">
            "{analysis.topicBadge}" konusu için üretilen kancalardan birini metnin başına ekleyin:
          </p>
          {analysis.hooks.map((hook, idx) => {
            const isApplied = copiedIndex === `hook-${idx}`
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleHookClick(hook, idx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isApplied
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : isDark
                    ? 'bg-[#181510] border-[#292218] text-stone-300 hover:border-amber-500/50 hover:text-amber-300'
                    : 'bg-white border-[#ece3d5] text-stone-700 hover:border-[#d97706] hover:text-[#b45309]'
                }`}
              >
                <span className="truncate">{hook}</span>
                {isApplied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {activeTab === 'tones' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleApplyTone('professional')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              copiedIndex === 'tone-professional'
                ? 'bg-emerald-500/20 border-emerald-500'
                : isDark
                ? 'bg-[#181510] border-[#292218] hover:border-amber-500/50'
                : 'bg-white border-[#ece3d5] hover:border-[#d97706]'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-amber-500 block mb-1">
                💼 Profesyonel (LinkedIn)
              </span>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                {analysis.topicBadge} alanında vizyoner ve saygın sektör tonu.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-[#b45309] dark:text-amber-400 mt-2 block">
              {copiedIndex === 'tone-professional' ? '✓ Metne Dönüştürüldü' : 'Metne Dönüştür →'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyTone('punchy')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              copiedIndex === 'tone-punchy'
                ? 'bg-emerald-500/20 border-emerald-500'
                : isDark
                ? 'bg-[#181510] border-[#292218] hover:border-amber-500/50'
                : 'bg-white border-[#ece3d5] hover:border-[#d97706]'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-amber-500 block mb-1">
                ⚡ Kısa & Çarpıcı (X)
              </span>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                Gereksiz kelimeleri eleyen, net ve vurucu özet.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-[#b45309] dark:text-amber-400 mt-2 block">
              {copiedIndex === 'tone-punchy' ? '✓ Metne Dönüştürüldü' : 'Metne Dönüştür →'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyTone('story')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              copiedIndex === 'tone-story'
                ? 'bg-emerald-500/20 border-emerald-500'
                : isDark
                ? 'bg-[#181510] border-[#292218] hover:border-amber-500/50'
                : 'bg-white border-[#ece3d5] hover:border-[#d97706]'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-amber-500 block mb-1">
                🔥 Merak Uyandırıcı
              </span>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                Okuyucuyu içine çeken ve etkileşimi artıran kurgu.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-[#b45309] dark:text-amber-400 mt-2 block">
              {copiedIndex === 'tone-story' ? '✓ Metne Dönüştürüldü' : 'Metne Dönüştür →'}
            </span>
          </button>
        </div>
      )}

      {activeTab === 'cta' && (
        <div className="space-y-3">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1.5">
              "{analysis.topicBadge}" İçin Eşleşen Popüler Etiketler:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analysis.hashtags.map((tag, idx) => {
                const isAdded = copiedIndex === `tag-${tag}`
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendHashtag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : isDark
                        ? 'bg-[#181510] border-[#292218] text-stone-300 hover:border-amber-500 hover:text-amber-300'
                        : 'bg-white border-[#e8ded2] text-stone-700 hover:border-[#d97706] hover:text-[#b45309]'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1.5">
              Bu Konuya Uygun Kapanış Soruları:
            </span>
            <div className="space-y-1 max-h-[90px] overflow-y-auto pr-1">
              {analysis.callToActions.map((cta, idx) => {
                const isAdded = copiedIndex === `cta-${cta}`
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendCTA(cta)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : isDark
                        ? 'bg-[#181510] border-[#292218] text-stone-300 hover:border-amber-500 hover:text-amber-300'
                        : 'bg-white border-[#e8ded2] text-stone-700 hover:border-[#d97706] hover:text-[#b45309]'
                    }`}
                  >
                    <span className="truncate">{cta}</span>
                    <span className="text-[10px] text-amber-500 font-semibold shrink-0">
                      {isAdded ? '✓ Eklendi' : '+ Ekle'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
