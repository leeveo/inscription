export default function WaiEventLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className="relative inline-flex items-center justify-center group">
      {/* Multi-layer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-cyan-400 to-fuchsia-500 rounded-2xl blur-2xl opacity-70 transition-all duration-500 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-300 to-violet-400 rounded-2xl blur-xl opacity-50 transition-all duration-500"></div>

      {/* Logo container with glassmorphism */}
      <div className={`relative ${className} rounded-2xl bg-gradient-to-br from-white/10 via-cyan-500/20 to-violet-500/20 backdrop-blur-sm p-3 border border-white/20 shadow-2xl shadow-cyan-500/30 transform scale-110 transition-all duration-300`}>
        {/* Geometric modern logo */}
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Abstract wave/event symbol */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
            </linearGradient>
          </defs>

          {/* Main W shape with modern geometric design */}
          <path d="M15 25 Q20 60 30 75 Q35 65 40 40 Q45 55 50 65 Q55 55 60 40 Q65 65 70 75 Q80 60 85 25 L75 25 Q72 45 65 60 Q60 48 55 35 L50 50 L45 35 Q40 48 35 60 Q28 45 25 25 Z"
                fill="url(#logoGradient)"
                className="drop-shadow-2xl"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.95"/>

          {/* Accent circles - modern touch */}
          <circle cx="30" cy="20" r="3" fill="#06b6d4" className="animate-pulse" style={{animationDelay: '0s'}}/>
          <circle cx="50" cy="15" r="4" fill="#8b5cf6" className="animate-pulse" style={{animationDelay: '0.3s'}}/>
          <circle cx="70" cy="20" r="3" fill="#ec4899" className="animate-pulse" style={{animationDelay: '0.6s'}}/>

          {/* Bottom accent line */}
          <path d="M25 85 Q50 88 75 85" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </div>
    </div>
  )
}

export function WaiEventLogoLarge() {
  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Large logo with enhanced effects */}
      <div className="relative group">
        {/* Multiple glow layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-cyan-400 to-fuchsia-500 rounded-3xl blur-3xl opacity-50 group-hover:opacity-80 transition-all duration-700 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-300 to-violet-400 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-700"></div>
        <div className="absolute -inset-2 bg-gradient-to-br from-fuchsia-400 to-cyan-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700"></div>

        {/* Logo container */}
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-white/10 via-cyan-500/20 to-violet-500/20 backdrop-blur-sm p-6 border border-white/30 shadow-2xl shadow-cyan-500/40 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="logoGradientLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Main W shape with modern geometric design */}
            <path d="M15 25 Q20 60 30 75 Q35 65 40 40 Q45 55 50 65 Q55 55 60 40 Q65 65 70 75 Q80 60 85 25 L75 25 Q72 45 65 60 Q60 48 55 35 L50 50 L45 35 Q40 48 35 60 Q28 45 25 25 Z"
                  fill="url(#logoGradientLarge)"
                  className="drop-shadow-2xl"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.95"
                  filter="url(#glow)"/>

            {/* Accent circles with staggered animation */}
            <circle cx="30" cy="20" r="3.5" fill="#06b6d4" className="animate-pulse" style={{animationDelay: '0s', animationDuration: '2s'}}/>
            <circle cx="50" cy="15" r="5" fill="#8b5cf6" className="animate-pulse" style={{animationDelay: '0.4s', animationDuration: '2s'}}/>
            <circle cx="70" cy="20" r="3.5" fill="#ec4899" className="animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2s'}}/>

            {/* Bottom accent line */}
            <path d="M25 85 Q50 90 75 85" stroke="url(#logoGradientLarge)" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
          </svg>
        </div>
      </div>

      {/* Brand name with modern styling */}
      <div className="text-center space-y-3">
        <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent tracking-tight drop-shadow-2xl">
          WaiEvent
        </h1>
        <div className="flex items-center justify-center space-x-3">
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-cyan-400 to-violet-400 rounded-full"></div>
          <p className="text-sm text-cyan-100/90 font-semibold tracking-[0.3em] uppercase">Admin Platform</p>
          <div className="h-0.5 w-12 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-transparent rounded-full"></div>
        </div>
        {/* Subtitle dot accents */}
        <div className="flex items-center justify-center space-x-2 pt-1">
          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
          <div className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" style={{animationDelay: '0.3s'}}></div>
          <div className="w-1 h-1 rounded-full bg-fuchsia-400 animate-pulse" style={{animationDelay: '0.6s'}}></div>
        </div>
      </div>
    </div>
  )
}