'use client'

import 'react-big-calendar/lib/css/react-big-calendar.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
