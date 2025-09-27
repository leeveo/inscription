import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const timeRange = searchParams.get('timeRange') || '30d'

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Calculer la date de début selon la période
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Requête pour les métriques principales
    const { data: totalVisitsData } = await supabaseAdmin
      .from('landing_page_visits')
      .select('id, participant_id, converted')
      .eq('event_id', eventId)
      .gte('visited_at', startDate.toISOString())

    const totalVisits = totalVisitsData?.length || 0
    const uniqueVisitors = new Set(totalVisitsData?.map(v => v.participant_id)).size
    const conversions = totalVisitsData?.filter(v => v.converted).length || 0
    const conversionRate = totalVisits > 0 ? (conversions / uniqueVisitors) * 100 : 0

    // Requête pour les visites par date
    const { data: visitsByDateData } = await supabaseAdmin
      .from('landing_page_visits')
      .select('visited_at, converted')
      .eq('event_id', eventId)
      .gte('visited_at', startDate.toISOString())
      .order('visited_at', { ascending: true })

    // Grouper par date
    const visitsByDate: Record<string, { visits: number; conversions: number }> = {}
    
    // Initialiser toutes les dates de la période avec 0
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      visitsByDate[dateKey] = { visits: 0, conversions: 0 }
    }

    // Remplir avec les vraies données
    visitsByDateData?.forEach(visit => {
      const dateKey = visit.visited_at.split('T')[0]
      if (visitsByDate[dateKey]) {
        visitsByDate[dateKey].visits++
        if (visit.converted) {
          visitsByDate[dateKey].conversions++
        }
      }
    })

    const visitsByDateArray = Object.entries(visitsByDate)
      .map(([date, data]) => ({
        date,
        visits: data.visits,
        conversions: data.conversions
      }))
      .slice(-parseInt(timeRange)) // Limiter aux X derniers jours

    // Requête pour les top participants
    const { data: topParticipantsData } = await supabaseAdmin
      .from('landing_page_visits')
      .select(`
        participant_id,
        converted,
        visited_at,
        inscription_participants:participant_id (
          nom,
          prenom,
          email
        )
      `)
      .eq('event_id', eventId)
      .gte('visited_at', startDate.toISOString())

    // Grouper par participant
    const participantStats: Record<string, {
      participant: any;
      visits: number;
      converted: boolean;
      lastVisit: string;
    }> = {}

    topParticipantsData?.forEach(visit => {
      const participantId = visit.participant_id
      if (!participantStats[participantId]) {
        participantStats[participantId] = {
          participant: visit.inscription_participants,
          visits: 0,
          converted: false,
          lastVisit: visit.visited_at
        }
      }
      participantStats[participantId].visits++
      if (visit.converted) {
        participantStats[participantId].converted = true
      }
      if (visit.visited_at > participantStats[participantId].lastVisit) {
        participantStats[participantId].lastVisit = visit.visited_at
      }
    })

    const topParticipants = Object.values(participantStats)
      .map(stat => ({
        participant_name: `${stat.participant.prenom} ${stat.participant.nom}`,
        participant_email: stat.participant.email,
        visits: stat.visits,
        converted: stat.converted,
        last_visit: stat.lastVisit
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10) // Top 10

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      conversions,
      conversionRate,
      visitsByDate: visitsByDateArray,
      topParticipants
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}