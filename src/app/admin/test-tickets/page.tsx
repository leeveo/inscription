'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function TicketTestPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [participants, setParticipants] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState('')
  const [templates, setTemplates] = useState([])
  const [testResults, setTestResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les événements
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabase = supabaseBrowser()
        const { data, error } = await supabase
          .from('inscription_evenements')
          .select('id, nom, date_debut')
          .order('date_debut', { ascending: false })

        if (error) throw error
        setEvents(data || [])
      } catch (err) {
        console.error('Error loading events:', err)
        setTestResults(prev => [...prev, { type: 'error', message: `Erreur événements: ${err.message}` }])
      }
    }
    fetchEvents()
  }, [])

  // Charger les participants quand un événement est sélectionné
  useEffect(() => {
    if (!selectedEvent) return

    const fetchParticipants = async () => {
      try {
        const supabase = supabaseBrowser()
        const { data, error } = await supabase
          .from('inscription_participants')
          .select('id, prenom, nom, email')
          .eq('evenement_id', selectedEvent)
          .limit(10)

        if (error) throw error
        setParticipants(data || [])
      } catch (err) {
        console.error('Error loading participants:', err)
        setTestResults(prev => [...prev, { type: 'error', message: `Erreur participants: ${err.message}` }])
      }
    }
    fetchParticipants()
  }, [selectedEvent])

  // Charger les templates
  useEffect(() => {
    if (!selectedEvent) return

    const fetchTemplates = async () => {
      try {
        const supabase = supabaseBrowser()
        const { data, error } = await supabase
          .from('inscription_ticket_templates')
          .select('*')
          .eq('evenement_id', selectedEvent)

        if (error && error.code !== 'PGRST116') throw error
        setTemplates(data || [])
        setTestResults(prev => [...prev, { 
          type: 'info', 
          message: `Templates trouvés: ${data?.length || 0}` 
        }])
      } catch (err) {
        console.error('Error loading templates:', err)
        if (err.code === '42P01') {
          setTestResults(prev => [...prev, { 
            type: 'error', 
            message: 'Table inscription_ticket_templates n\'existe pas. Exécutez le script SQL.' 
          }])
        } else {
          setTestResults(prev => [...prev, { 
            type: 'error', 
            message: `Erreur templates: ${err.message}` 
          }])
        }
      }
    }
    fetchTemplates()
  }, [selectedEvent])

  // Test d'envoi de ticket
  const testSendTicket = async () => {
    if (!selectedParticipant || !selectedEvent) {
      setTestResults(prev => [...prev, { type: 'error', message: 'Sélectionnez un événement et un participant' }])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: selectedParticipant,
          eventId: selectedEvent
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setTestResults(prev => [...prev, { type: 'success', message: 'Ticket envoyé avec succès!' }])
      } else {
        setTestResults(prev => [...prev, { 
          type: 'error', 
          message: `Erreur envoi: ${result.message || 'Erreur inconnue'}`,
          details: result.details
        }])
      }
    } catch (err) {
      setTestResults(prev => [...prev, { type: 'error', message: `Erreur réseau: ${err.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  // Test création template par défaut
  const createDefaultTemplate = async () => {
    if (!selectedEvent) {
      setTestResults(prev => [...prev, { type: 'error', message: 'Sélectionnez un événement' }])
      return
    }

    try {
      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from('inscription_ticket_templates')
        .insert({
          evenement_id: selectedEvent,
          subject: 'Votre ticket pour {{event_name}}',
          html_content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">{{event_name}}</h1>
    <p style="margin: 10px 0; opacity: 0.9;">{{event_date}} • {{event_location}}</p>
  </div>
  
  <div style="background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #667eea; margin-top: 0;">Bonjour {{participant_firstname}} {{participant_lastname}}</h2>
    
    <p>Voici votre ticket électronique pour l'événement <strong>{{event_name}}</strong>.</p>
    
    <div style="background: #ecfdf5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #059669;">Vos sessions inscrites</h3>
      {{participant_sessions}}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      {{qr_code}}
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{ticket_url}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir mon ticket complet</a>
    </div>
  </div>
</div>
          `.trim()
        })
        .select()

      if (error) throw error

      setTestResults(prev => [...prev, { type: 'success', message: 'Template par défaut créé!' }])
      // Recharger les templates
      setTemplates(prev => [...prev, ...(data || [])])
    } catch (err) {
      setTestResults(prev => [...prev, { type: 'error', message: `Erreur création template: ${err.message}` }])
    }
  }

  const clearResults = () => setTestResults([])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test des Tickets - Débogage</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Événement
              </label>
              <select 
                value={selectedEvent} 
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner un événement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom} ({new Date(event.date_debut).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participant
              </label>
              <select 
                value={selectedParticipant} 
                onChange={(e) => setSelectedParticipant(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={!participants.length}
              >
                <option value="">Sélectionner un participant</option>
                {participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.prenom} {participant.nom} ({participant.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Templates existants: {templates.length}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={createDefaultTemplate}
              disabled={!selectedEvent}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Créer Template
            </button>
            <button
              onClick={testSendTicket}
              disabled={!selectedParticipant || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Envoi...' : 'Test Envoi'}
            </button>
          </div>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Résultats des Tests</h2>
            <button
              onClick={clearResults}
              className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
            >
              Effacer
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md text-sm ${
                  result.type === 'success' ? 'bg-green-50 text-green-800' :
                  result.type === 'error' ? 'bg-red-50 text-red-800' :
                  'bg-blue-50 text-blue-800'
                }`}
              >
                <div className="font-medium">
                  {result.type === 'success' ? '✅' : result.type === 'error' ? '❌' : 'ℹ️'} {result.message}
                </div>
                {result.details && (
                  <div className="mt-1 text-xs opacity-75">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
            {testResults.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucun test effectué. Sélectionnez un événement et testez les fonctionnalités.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Templates existants */}
      {templates.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Templates Existants</h2>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{template.subject}</h3>
                    <p className="text-sm text-gray-600">
                      Créé le {new Date(template.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <details>
                    <summary className="cursor-pointer text-sm text-blue-600">
                      Voir le contenu HTML
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-x-auto">
                      {template.html_content}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}