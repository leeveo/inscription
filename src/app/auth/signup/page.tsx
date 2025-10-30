'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WaiEventLogoLarge } from '@/components/WaiEventLogo'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = supabaseBrowser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      }

    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Background Web 3.0 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>

      {/* Particules animées */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-cyan-300/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-400/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.7s'}}></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      {/* Content Container - 2 colonnes */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row">
        {/* LEFT COLUMN - Description */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 xl:p-20">
          <div className="max-w-xl space-y-8">
            {/* Logo et titre */}
            <WaiEventLogoLarge />

            {/* Description */}
            <div className="space-y-6">
              <p className="text-xl text-blue-100/90 leading-relaxed">
                Rejoignez des centaines d&apos;organisateurs qui font confiance à WaiEvent pour gérer leurs événements.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Démarrage rapide</h3>
                    <p className="text-sm text-blue-200/70">Créez votre premier événement en moins de 5 minutes</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Sécurité garantie</h3>
                    <p className="text-sm text-blue-200/70">Vos données sont protégées et sécurisées</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Support 24/7</h3>
                    <p className="text-sm text-blue-200/70">Notre équipe est là pour vous aider</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-white">Jean Dupont</div>
                  <div className="text-sm text-blue-200/70">Organisateur d&apos;événements</div>
                </div>
              </div>
              <p className="text-sm text-blue-100/80 italic">
                &quot;WaiEvent a révolutionné la façon dont je gère mes événements. Interface intuitive et fonctionnalités puissantes !&quot;
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Signup Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 flex justify-center">
              <WaiEventLogoLarge />
            </div>

            {/* Form Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>

              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Créer un compte</h2>
                  <p className="text-blue-200/70">Commencez à gérer vos événements dès aujourd&apos;hui</p>
                </div>

                {success && (
                  <div className="mb-6 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-400/30 p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-400/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-green-100 font-medium">Compte créé avec succès ! Redirection...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-400/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-red-100">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-blue-100 mb-2">Nom complet</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="relative w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">Adresse email</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="relative w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                        placeholder="vous@exemple.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">Mot de passe</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="relative w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                        placeholder="Minimum 6 caractères"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-2">Confirmer le mot de passe</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="relative w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                        placeholder="Confirmer votre mot de passe"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || success}
                    className="relative w-full group/btn overflow-hidden mt-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-xl opacity-100 group-hover/btn:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-xl opacity-0 group-hover/btn:opacity-100 blur transition-opacity"></div>
                    <div className="relative px-6 py-3.5 flex items-center justify-center">
                      {loading ? (
                        <span className="flex items-center text-white font-semibold">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Création en cours...
                        </span>
                      ) : (
                        <span className="text-white font-semibold">Créer mon compte</span>
                      )}
                    </div>
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-blue-200/70">Vous avez déjà un compte ?</span>
                  </div>
                </div>

                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-blue-100 hover:bg-white/10 hover:border-white/20 transition-all font-medium"
                >
                  Se connecter
                </Link>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="inline-flex items-center text-sm text-blue-200/70 hover:text-blue-100 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}