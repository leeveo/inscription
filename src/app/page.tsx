// src/app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto mt-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Plateforme Événementielle</h1>
      <p className="mb-6 text-gray-600">Bienvenue sur votre app de gestion d’événements</p>
      <div className="flex justify-center gap-4">
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-md">Se connecter</Link>
        <Link href="/evenements" className="px-6 py-2 bg-gray-200 rounded-md">Voir les événements</Link>
      </div>
    </main>
  )
}
