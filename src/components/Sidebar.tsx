'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiCalendar, 
  FiUsers, 
  FiGrid, 
  FiMusic, 
  FiHelpCircle, 
  FiRotateCcw, 
  FiFilm,
  FiMail,
  FiSettings
} from 'react-icons/fi';

const eventAdminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid className="w-5 h-5" /> },
  { href: '/admin/evenements', label: 'Événements', icon: <FiCalendar className="w-5 h-5" /> },
  { href: '/admin/participants', label: 'Participants', icon: <FiUsers className="w-5 h-5" /> },
  { href: '/admin/emails', label: 'Emails', icon: <FiMail className="w-5 h-5" /> },
  { href: '/admin/settings', label: 'Paramètres', icon: <FiSettings className="w-5 h-5" /> },
];

// Ajout d'icônes et couleurs pour chaque application externe
const externalApps = [
  {
    href: process.env.NEXT_PUBLIC_PHOTO_MOSAIQUE_URL,
    label: 'Photo mosaique',
    icon: <FiGrid className="w-5 h-5" />,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300'
  },
  {
    href: process.env.NEXT_PUBLIC_KARAOKE_URL,
    label: 'Karaoke',
    icon: <FiMusic className="w-5 h-5" />,
    color: 'bg-pink-100 text-pink-700 border-pink-300'
  },
  {
    href: process.env.NEXT_PUBLIC_QUIZZ_URL,
    label: 'Quizz',
    icon: <FiHelpCircle className="w-5 h-5" />,
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    href: process.env.NEXT_PUBLIC_ROUE_FORTUNE_URL,
    label: 'Roue de la fortune',
    icon: <FiRotateCcw className="w-5 h-5" />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  {
    href: process.env.NEXT_PUBLIC_FRESQUE_ANIMEE_URL,
    label: 'Fresque animée',
    icon: <FiFilm className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  // Fonction pour déterminer si un lien est actif
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  
  return (
    <nav className="h-full bg-white py-6 px-4 border-r border-gray-200 overflow-y-auto">
      {/* Logo ou titre */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-indigo-700">Event Admin</h1>
      </div>
      
      {/* Sous-menu Event Admin */}
      <div>
        <span className="font-bold text-gray-700 mb-3 block">Gestion des Inscriptions</span>
        <ul className="space-y-2 mb-6">
          {eventAdminLinks.map(link => (
            <li key={link.href}>
              <Link 
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.href) 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Liens vers applications externes */}
      <div className="mt-6">
        <span className="font-bold text-gray-700 mb-3 block">Applications externes</span>
        <div className="flex flex-col gap-3">
          {externalApps.map(app =>
            app.href ? (
              <a
                key={app.href}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${app.color} shadow-sm hover:scale-[1.03] transition-transform`}
                style={{ textDecoration: 'none' }}
              >
                {app.icon}
                <span className="font-medium">{app.label}</span>
              </a>
            ) : null
          )}
        </div>
      </div>
      
      {/* Documentation section */}
      <div className="mt-6 mb-4">
        <div className="rounded-lg bg-blue-100 border border-blue-200 p-4 flex flex-col items-start">
          <div className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0H3m9 0a9 9 0 100-18 9 9 0 000 18z" />
            </svg>
            Documentation
          </div>
          <div className="text-blue-700 text-xs mb-2">
            Retrouvez guides, API et FAQ pour gérer les inscriptions aux événements.
          </div>
          <a
            href="https://docs.event-admin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1 px-3 py-1 bg-blue-200 text-blue-800 rounded font-medium text-xs hover:bg-blue-300 transition"
          >
            Accéder à la documentation
          </a>
        </div>
      </div>
    </nav>
  );
}
