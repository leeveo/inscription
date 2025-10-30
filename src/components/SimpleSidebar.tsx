'use client'

export default function SimpleSidebar() {
  return (
    <div className="w-64 h-full bg-indigo-800 text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Event Admin</h1>
      </div>
      
      <nav className="space-y-2">
        <a href="/admin/dashboard" className="flex items-center space-x-2 p-3 rounded-lg bg-indigo-700 hover:bg-indigo-600 transition-colors">
          <span>📊</span>
          <span>Dashboard</span>
        </a>
        
        <a href="/admin/evenements" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-indigo-700 transition-colors">
          <span>📅</span>
          <span>Événements</span>
        </a>
        
        <a href="/admin/participants" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-indigo-700 transition-colors">
          <span>👥</span>
          <span>Participants</span>
        </a>
      </nav>
    </div>
  )
}