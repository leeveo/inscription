'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiCalendar,
  FiUsers,
  FiGrid,
  FiCamera,
  FiLogOut,
  FiLayout
} from 'react-icons/fi';
import WaiEventLogo from '@/components/WaiEventLogo';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const eventAdminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid className="w-5 h-5" /> },
  { href: '/admin/evenements', label: 'Événements', icon: <FiCalendar className="w-5 h-5" /> },
  { href: '/admin/participants', label: 'Participants', icon: <FiUsers className="w-5 h-5" /> },
  { href: '/admin/pages-builder', label: 'Page Builder', icon: <FiLayout className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ne pas afficher la sidebar sur les pages builder (avec UUID)
  const isBuilderEditorPage = /^\/admin\/builder\/[a-f0-9-]{36}/i.test(pathname || '');

  if (isBuilderEditorPage) {
    return null;
  }

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fonction pour déterminer si un lien est actif
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  
  return (
    <nav className="h-full relative overflow-hidden py-6 px-4 overflow-y-auto">
      {/* Background avec dégradé Web 3.0 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      
      {/* Effet de particules/mesh moderne */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-6 w-24 h-24 bg-cyan-300/15 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-8 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"></div>
      </div>
      
      {/* Contenu avec z-index élevé */}
      <div className="relative z-10">
        {/* Logo ou titre */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <WaiEventLogo className="w-12 h-12" />
            </div>
            <div className="ml-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Waivent.app
              </h1>
              <p className="text-xs text-blue-200/80">Gestion d'événements</p>
            </div>
          </div>
        </div>
        
        {/* Sous-menu Event Admin */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
            <span className="font-semibold text-white/90 text-sm uppercase tracking-wider">Inscriptions</span>
          </div>
          <ul className="space-y-2">
            {eventAdminLinks.map(link => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive(link.href) 
                      ? 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white border border-blue-400/30 shadow-lg backdrop-blur-sm' 
                      : 'text-blue-100/80 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm hover:border-white/20 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive(link.href) 
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-600 shadow-md' 
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    {React.cloneElement(link.icon, { 
                      className: `w-4 h-4 ${isActive(link.href) ? 'text-white' : 'text-blue-200 group-hover:text-white'}` 
                    })}
                  </div>
                  <span className="font-medium">{link.label}</span>
                  {isActive(link.href) && (
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full ml-auto animate-pulse"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Scanner QR */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full"></div>
            <span className="font-semibold text-white/90 text-sm uppercase tracking-wider">Scanner QR</span>
          </div>
          <div className="relative group">
            <button
              onClick={() => window.open('/qr-scanner-new', '_blank')}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl 
                       bg-gradient-to-r from-cyan-500/20 to-blue-500/20 
                       hover:from-cyan-400/30 hover:to-blue-400/30
                       border border-cyan-400/30 hover:border-cyan-300/50
                       text-white backdrop-blur-sm
                       transition-all duration-300 transform hover:scale-[1.02]
                       shadow-lg hover:shadow-xl"
              title="Ouvrir le scanner QR Code"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md">
                <FiCamera className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold block">Scanner QR Code</span>
               
              </div>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            </button>
          </div>
        </div>
        
        {/* Documentation section */}
        <div className="mt-auto space-y-4">
          <div className="relative group">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20
                          border border-indigo-400/30 backdrop-blur-sm p-4
                          hover:border-indigo-300/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0H3m9 0a9 9 0 100-18 9 9 0 000 18z" />
                  </svg>
                </div>
                <span className="font-semibold text-white">Documentation</span>
              </div>
            
              <Link
                href="/admin/documentation"
                className="inline-flex items-center gap-2 px-3 py-2
                         bg-gradient-to-r from-indigo-500 to-purple-600
                         hover:from-indigo-400 hover:to-purple-500
                         text-white text-xs font-medium rounded-lg
                         transition-all duration-300 transform hover:scale-105
                         shadow-md hover:shadow-lg"
              >
                <span>Accéder</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* User info and logout */}
          {user && (
            <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-blue-900/50
                          border border-blue-400/30 backdrop-blur-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user.user_metadata?.full_name || 'Admin'}
                  </p>
                  <p className="text-blue-200/80 text-xs truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                         bg-gradient-to-r from-red-500/20 to-pink-500/20
                         hover:from-red-500/30 hover:to-pink-500/30
                         border border-red-400/30 hover:border-red-300/50
                         text-white text-sm font-medium rounded-lg
                         transition-all duration-300 transform hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-md hover:shadow-lg"
              >
                <FiLogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
