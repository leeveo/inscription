'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Test Tailwind</h1>
        <p className="text-gray-600 mb-4">
          Si vous voyez cette page avec des styles (fond bleu, carte blanche avec ombres), 
          alors Tailwind CSS fonctionne correctement.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Bouton de Test
        </button>
      </div>
    </div>
  )
}