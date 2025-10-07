'use client'

import { useEffect, useState } from 'react'

interface AuthLoaderProps {
  message?: string
}

export default function AuthLoader({ message = 'Connexion en cours...' }: AuthLoaderProps) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-cyan-300/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Loader content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-24 h-24 rounded-full border-4 border-blue-500/20"></div>

          {/* Spinning ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-cyan-400 border-r-blue-500 animate-spin"></div>

          {/* Inner glow */}
          <div className="absolute inset-2 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm animate-pulse"></div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-ping"></div>
            <div className="absolute w-3 h-3 rounded-full bg-cyan-300"></div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-white">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>
          <p className="text-sm text-blue-200/70">Veuillez patienter</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-[shimmer_1.5s_ease-in-out_infinite]"
               style={{
                 width: '100%',
                 animation: 'shimmer 1.5s ease-in-out infinite'
               }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
