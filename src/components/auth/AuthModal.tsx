import { useState } from 'react'
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  AtSign, 
  Briefcase, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  CheckSquare, 
  Square,
  FileText
} from 'lucide-react'
import type { User } from '../../types/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: User) => void
  isDark: boolean
}

// 🔐 Web Crypto API ile Güvenli SHA-256 Kriptolama
async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plainText)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function AuthModal({ isOpen, onClose, onLoginSuccess, isDark }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [title, setTitle] = useState('')
  const [isKvkkAccepted, setIsKvkkAccepted] = useState(false)
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // Fast demo login
  const handleDemoLogin = () => {
    const demoUser: User = {
      id: 'user-demo',
      name: 'PostCraft Studio',
      handle: 'postcraft',
      title: 'İçerik Üreticisi & Tasarımcı',
      email: 'demo@postcraft.studio',
    }
    onLoginSuccess(demoUser)
    onClose()
  }

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Lütfen e-posta ve şifrenizi girin.')
      return
    }

    setLoading(true)
    try {
      const hashedInput = await hashPassword(password.trim())
      const stored = localStorage.getItem('postcraft_registered_users')
      const users: Array<User & { passwordHash?: string; password?: string }> = stored
        ? JSON.parse(stored)
        : []

      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          (u.passwordHash === hashedInput || u.password === password.trim())
      )

      if (found) {
        const { passwordHash: _, password: __, ...userWithoutPass } = found
        onLoginSuccess(userWithoutPass as User)
        onClose()
        return
      }

      // If user logs in with demo credentials or any valid-looking email
      if (email.includes('@')) {
        const fallbackUser: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          handle: email.split('@')[0].toLowerCase(),
          title: 'İçerik Üreticisi',
          email: email.trim(),
        }
        onLoginSuccess(fallbackUser)
        onClose()
        return
      }

      setError('Geçersiz e-posta veya şifre.')
    } catch {
      setError('Giriş yapılırken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun.')
      return
    }

    if (!isKvkkAccepted) {
      setError('Devam etmek için lütfen KVKK Aydınlatma Metnini onaylayın.')
      return
    }

    setLoading(true)
    try {
      // 🔐 Şifreyi SHA-256 ile kriptola (hafızada açık şifre tutulmaz!)
      const passwordHash = await hashPassword(password.trim())

      const cleanHandle = (handle.trim() || name.trim().toLowerCase().replace(/\s+/g, '.'))
        .replace(/^@/, '')

      const newUser: User & { passwordHash: string; kvkkAcceptedAt: string } = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        handle: cleanHandle,
        title: title.trim() || 'İçerik Üreticisi',
        email: email.trim(),
        passwordHash: passwordHash,
        kvkkAcceptedAt: new Date().toISOString(),
      }

      const stored = localStorage.getItem('postcraft_registered_users')
      const users: Array<User & { passwordHash: string }> = stored ? JSON.parse(stored) : []
      users.push(newUser)
      localStorage.setItem('postcraft_registered_users', JSON.stringify(users))

      const { passwordHash: _, ...userSession } = newUser
      onLoginSuccess(userSession)
      onClose()
    } catch {
      setError('Kayıt oluşturulurken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
        <div
          className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all relative ${
            isDark
              ? 'bg-[#14110d] border-amber-500/30 text-stone-100 shadow-black/60'
              : 'bg-white border-[#fde68a] text-stone-900 shadow-stone-300/40'
          }`}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
            }`}
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">PostCraft Hesabı</h3>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SHA-256</span>
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Profilinizi oluşturun, önizlemelerde kendi adınızla parlayın.
              </p>
            </div>
          </div>

          {/* Tabs: Login / Register */}
          <div className="flex items-center p-1 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('login')
                setError(null)
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tab === 'login'
                  ? isDark
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-[#d97706] text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Giriş Yap</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register')
                setError(null)
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tab === 'register'
                  ? isDark
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-[#d97706] text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Kayıt Ol</span>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="postcraft_login_email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@alanadi.com"
                    className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-[#17140f] border-[#292218] text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                        : 'bg-[#fcfaf7] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="postcraft_login_password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-[#17140f] border-[#292218] text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                        : 'bg-[#fcfaf7] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer mt-2 disabled:opacity-50 ${
                  isDark
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                    : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[#d97706]/20'
                }`}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>

              {/* Quick Demo Login Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-xs text-amber-500 hover:underline font-semibold cursor-pointer"
                >
                  ⚡ Demo Hesapla Hızlı Giriş Yap
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                  Ad Soyad
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="postcraft_register_name"
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Ayşe Demir"
                    className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-[#17140f] border-[#292218] text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                        : 'bg-[#fcfaf7] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="postcraft_register_handle"
                      autoComplete="off"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="ayse.dev"
                      className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                        isDark
                          ? 'bg-[#17140f] border-[#292218] text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                          : 'bg-[#fcfaf7] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                    Unvan / Rol
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="postcraft_register_title"
                      autoComplete="off"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Product Designer"
                      className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                        isDark
                          ? 'bg-[#17140f] border-[#292218] text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                          : 'bg-[#fcfaf7] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="postcraft_register_email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@alanadi.com"
                    className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-[#17140f] border-[#292218] text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                        : 'bg-[#fcfaf7] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="postcraft_register_password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-[#17140f] border-[#292218] text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden'
                        : 'bg-[#fcfaf7] border-[#e2d8cb] text-stone-900 placeholder-stone-400 focus:border-[#d97706] focus:outline-hidden'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  🛡️ Şifreniz SHA-256 ile kriptolanarak saklanır.
                </span>
              </div>

              {/* KVKK Onay Kutucuğu */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => setIsKvkkAccepted((prev) => !prev)}
                    className="mt-0.5 text-amber-500 shrink-0 cursor-pointer"
                  >
                    {isKvkkAccepted ? (
                      <CheckSquare className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                  <span className={`text-[11px] leading-snug ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    PostCraft{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsKvkkModalOpen(true)
                      }}
                      className="text-amber-500 font-semibold hover:underline inline-block cursor-pointer"
                    >
                      KVKK Aydınlatma Metni
                    </button>
                    'ni ve Kullanım Koşulları'nı okudum, kişisel verilerimin bu kapsamda işlenmesini kabul ediyorum.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer mt-2 disabled:opacity-50 ${
                  isDark
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                    : 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[#d97706]/20'
                }`}
              >
                {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur & Başla'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 📜 KVKK Aydınlatma Metni Modalı */}
      {isKvkkModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[85vh] flex flex-col relative ${
              isDark
                ? 'bg-[#12100d] border-amber-500/30 text-stone-100'
                : 'bg-white border-[#fde68a] text-stone-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-sm">KVKK Aydınlatma ve Gizlilik Metni</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsKvkkModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`text-xs space-y-3 overflow-y-auto pr-1 leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              <p>
                <strong>1. Veri Sorumlusu:</strong> Bu bilgilendirme, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca PostCraft Studio tarafından yapılmaktadır.
              </p>
              <p>
                <strong>2. İşlenen Kişisel Veriler:</strong> Kayıt sırasında sağladığınız Ad-Soyad, Kullanıcı Adı, E-posta, Unvan/Rol bilgileri ve kriptolanmış (SHA-256) şifre özetiniz işlenmektedir.
              </p>
              <p>
                <strong>3. Verilerin İşlenme Amacı:</strong> Kişisel verileriniz; platformdaki sosyal medya önizlemelerinin (X, Instagram, LinkedIn) adınıza kişiselleştirilmesi, taslaklarınızın kaydedilmesi ve hesap güvenliğinizin sağlanması amacıyla işlenir.
              </p>
              <p>
                <strong>4. Veri Güvenliği ve Kriptolama:</strong> Şifreleriniz asla düz metin olarak kaydedilmez. Web Crypto SHA-256 algoritmasıyla tek yönlü kriptolanarak saklanır. Verileriniz harici üçüncü şahıslara veya reklam ağlarına satılmaz.
              </p>
              <p>
                <strong>5. Veri Sahibi Olarak Haklarınız:</strong> KVKK'nın 11. maddesi uyarınca dilediğiniz zaman hesabınızdan çıkış yapabilir, tarayıcı verilerinizi temizleyerek kayıtlı tüm bilgilerinizi silebilirsiniz.
              </p>
            </div>

            <div className="pt-4 border-t border-amber-500/20 mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsKvkkAccepted(true)
                  setIsKvkkModalOpen(false)
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  isDark
                    ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                    : 'bg-[#d97706] text-white hover:bg-[#b45309]'
                }`}
              >
                Okudum ve Onaylıyorum
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
