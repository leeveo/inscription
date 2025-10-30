'use client'

import { LandingPageConfig } from '@/types'
import LandingRegistrationForm from '@/components/LandingRegistrationForm'

interface Event {
  id: string
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  prix?: number
  places_disponibles?: number
  organisateur?: string
  email_contact?: string
  telephone_contact?: string
  image_url?: string
  statut?: string
  type_evenement?: string
}

interface LandingTemplateProps {
  event: Event
  config: LandingPageConfig
  onRegistrationSuccess: () => void
  registrationSuccess: boolean
  isPreview?: boolean
  participantData?: any
  token?: string | null
}

export default function TechStartupTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const primaryColor = config?.customization?.primaryColor || '#00D9FF'
  const secondaryColor = config?.customization?.secondaryColor || '#7B61FF'
  const accentColor = config?.customization?.accentColor || '#FF3E9D'
  const backgroundColor = config?.customization?.backgroundColor || '#0A0B1E'

  return (
    <>
      <style jsx>{`
        .tech-grid {
          background-image:
            linear-gradient(${primaryColor}15 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor}15 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }

        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }

        .glow-box {
          box-shadow:
            0 0 20px ${primaryColor}40,
            0 0 40px ${primaryColor}20,
            inset 0 0 20px ${primaryColor}10;
        }

        .neon-border {
          border: 2px solid ${primaryColor};
          box-shadow:
            0 0 10px ${primaryColor}80,
            inset 0 0 10px ${primaryColor}40;
        }

        .gradient-tech {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor});
        }

        .floating-code {
          animation: float-code 6s ease-in-out infinite;
        }

        @keyframes float-code {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(10px); }
          75% { transform: translateY(15px) translateX(-10px); }
        }

        .typing-animation {
          overflow: hidden;
          border-right: 2px solid ${primaryColor};
          white-space: nowrap;
          animation: typing 3.5s steps(40) 1s forwards, blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        @keyframes blink-caret {
          50% { border-color: transparent; }
        }

        .scan-line {
          position: absolute;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, transparent, ${primaryColor}, transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      <div style={{ backgroundColor }} className="min-h-screen relative overflow-hidden">
        {/* Animated grid background */}
        <div className="fixed inset-0 tech-grid opacity-40"></div>

        {/* Floating code snippets */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="floating-code absolute top-20 left-10 text-xs font-mono opacity-30" style={{ color: primaryColor }}>
            {'<Event />'}
          </div>
          <div className="floating-code absolute top-40 right-20 text-xs font-mono opacity-30" style={{ color: secondaryColor }}>
            {'const register = () => {}'}
          </div>
          <div className="floating-code absolute bottom-32 left-1/4 text-xs font-mono opacity-30" style={{ color: accentColor }}>
            {'// Join us'}
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Content */}
              <div>
                <div className="mb-6">
                  <span
                    className="px-4 py-2 text-xs font-mono font-bold rounded-full border"
                    style={{
                      color: primaryColor,
                      borderColor: primaryColor,
                      backgroundColor: `${primaryColor}20`
                    }}
                  >
                    {'</'} EVENT 2024 {' />'}
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                  <span className="gradient-tech bg-clip-text text-transparent">
                    {config?.customization?.heroTitle || event.nom}
                  </span>
                </h1>

                <div className="scan-line"></div>

                <div
                  className="text-xl text-gray-300 mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
                />

                {/* Tech stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="neon-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold gradient-tech bg-clip-text text-transparent">100+</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Innovators</div>
                  </div>
                  <div className="neon-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold gradient-tech bg-clip-text text-transparent">24h</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Duration</div>
                  </div>
                  <div className="neon-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold gradient-tech bg-clip-text text-transparent">∞</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Ideas</div>
                  </div>
                </div>

                {/* Event details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg gradient-tech flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-mono">DATE</div>
                      <div className="text-white font-semibold">{new Date(event.date_debut).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg gradient-tech flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-mono">LOCATION</div>
                      <div className="text-white font-semibold">{event.lieu}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form */}
              <div>
                <div className="glow-box bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 gradient-tech rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {'<Register />'}
                    </h3>
                    <p className="text-gray-400 font-mono text-sm">
                      // Initialize your journey
                    </p>
                  </div>

                  <LandingRegistrationForm
                    eventId={event.id}
                    onSuccess={onRegistrationSuccess}
                    participantData={participantData}
                    token={token}
                  />
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 font-mono">
                    Powered by cutting-edge event technology
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold gradient-tech bg-clip-text text-transparent mb-4">
                What to expect()
              </h2>
              <div className="w-24 h-1 gradient-tech mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="neon-border rounded-xl p-6 bg-gray-900/30 backdrop-blur-sm hover:scale-105 transition-transform">
                <div className="w-12 h-12 gradient-tech rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Innovation</h3>
                <p className="text-gray-400 text-sm">Discover breakthrough technologies and methodologies</p>
              </div>

              <div className="neon-border rounded-xl p-6 bg-gray-900/30 backdrop-blur-sm hover:scale-105 transition-transform">
                <div className="w-12 h-12 gradient-tech rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Networking</h3>
                <p className="text-gray-400 text-sm">Connect with industry leaders and innovators</p>
              </div>

              <div className="neon-border rounded-xl p-6 bg-gray-900/30 backdrop-blur-sm hover:scale-105 transition-transform">
                <div className="w-12 h-12 gradient-tech rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Inspiration</h3>
                <p className="text-gray-400 text-sm">Get inspired by groundbreaking ideas and projects</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-8 px-4 border-t" style={{ borderColor: `${primaryColor}20` }}>
          <div className="container mx-auto text-center">
            <p className="text-gray-500 text-sm font-mono">
              © {new Date().getFullYear()} // Built with passion and code
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
