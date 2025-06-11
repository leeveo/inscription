'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navItems = [
  { label: 'Accueil', href: '/' },
  { label: 'Événements', href: '/evenements' },
  { label: 'Dashboard Admin', href: '/admin/evenements' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
      <span className="font-bold text-lg">🎟️ Event Admin</span>
      <div className="flex space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'text-sm px-3 py-2 rounded-md',
              pathname === item.href ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
