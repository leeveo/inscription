'use client';

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define your types
type Participant = {
  id: number;
  evenement_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  checked_in: boolean;
  checked_in_at?: string;
  // Other participant properties
}

type Event = {
  id: number;
  nom: string;
  description: string;
  lieu: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
  // Other event properties
}

type CheckInClientProps = {
  eventId: string;
  participantId: string;
};

export default function CheckInClient({ eventId, participantId }: CheckInClientProps) {
  const router = useRouter()
  
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [success, setSuccess] = useState(false)
  
  useEffect(() => {
    const fetchParticipantAndEvent = async () => {
      if (!participantId || !eventId) return
      
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()
        
        // Fetch participant
        const { data: participantData, error: participantError } = await supabase
          .from('inscription_participants')
          .select('*')
          .eq('id', participantId)
          .eq('evenement_id', eventId)
          .single()
        
        if (participantError) throw participantError
        if (!participantData) throw new Error('Participant not found')
        
        setParticipant(participantData as Participant)
        
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('inscription_evenements')
          .select('*')
          .eq('id', eventId)
          .single()
        
        if (eventError) throw eventError
        if (!eventData) throw new Error('Event not found')
        
        // Add type assertion here:
        setEvent(eventData as Event)
      } catch (err: Error | unknown) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Error fetching data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchParticipantAndEvent()
  }, [participantId, eventId])
  
  const handleCheckIn = async () => {
    if (!participant || !event) return
    
    try {
      setCheckingIn(true)
      const supabase = supabaseBrowser()
      
      const { error } = await supabase
        .from('inscription_participants')
        .update({
          checked_in: true,
          check_in_time: new Date().toISOString()
        })
        .eq('id', participant.id)
      
      if (error) throw error
      
      setSuccess(true)
      // Update local state
      setParticipant(prev => prev ? {...prev, checked_in: true, check_in_time: new Date().toISOString()} : null)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/admin/evenements/${eventId}`)
      }, 2000)
      
    } catch (err: Error | unknown) {
      console.error('Error checking in:', err)
      setError(err instanceof Error ? err.message : 'Error checking in participant')
    } finally {
      setCheckingIn(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !participant || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error || 'Participant or event not found'}</p>
          <Link 
            href={`/admin/evenements/${eventId}`}
            className="inline-block mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Return to Event
          </Link>
        </div>
      </div>
    );
  }
  
  // Simple component rendering without complex JSX
  return React.createElement('div', { className: "container mx-auto px-4 py-8 max-w-md" },
    React.createElement('div', { className: "bg-white shadow-lg rounded-lg overflow-hidden" },
      // Header
      React.createElement('div', { className: "bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white" },
        React.createElement('h1', { className: "text-xl font-bold" }, "Check-In Participant"),
        event && React.createElement('p', { className: "mt-1" }, event.nom)
      ),
      
      // Content
      participant && event && React.createElement('div', { className: "p-6" },
        React.createElement('div', { className: "mb-6" },
          React.createElement('h2', { className: "text-2xl font-bold text-gray-800" },
            participant.prenom, " ", participant.nom
          ),
          React.createElement('p', { className: "text-gray-600" }, participant.email),
          React.createElement('p', { className: "text-gray-600" }, participant.telephone)
        ),
        
        participant?.checked_in && (
          React.createElement('div', { className: "bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4" },
            React.createElement('p', { className: "font-bold" }, "✓ Already Checked In"),
            React.createElement('p', null, "This participant was checked in at ", participant.checked_in_at &&
              new Date(participant.checked_in_at).toLocaleString('fr-FR'))
          )
        ) || success ? (
          React.createElement('div', { className: "bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4" },
            React.createElement('p', { className: "font-bold" }, "✓ Check-In Successful"),
            React.createElement('p', null, "Redirecting to event page...")
          )
        ) : (
          React.createElement('button',
            {
              onClick: handleCheckIn,
              disabled: checkingIn,
              className: "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            },
            checkingIn ? (
              React.createElement('span', { className: "flex items-center justify-center" },
                React.createElement('svg', {
                  className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24"
                },
                  React.createElement('circle', {
                    className: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "4"
                  }),
                  React.createElement('path', {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  })
                ),
                "Processing..."
              )
            ) : (
              "Check In Participant"
            )
          )
        ),
        
        React.createElement('div', { className: "mt-6" },
          React.createElement(Link, { 
            href: `/admin/evenements/${eventId}`,
            className: "block text-center text-blue-600 hover:text-blue-800"
          }, "Back to Event")
        )
      )
    )
  );
}