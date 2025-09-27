'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabaseBrowser } from '@/lib/supabase/client'

// Types pour les sessions
type Session = {
  id: string
  titre: string
  description?: string
  date: string
  heure_debut: string
  heure_fin: string
  intervenant?: string
  lieu?: string
  type: string
  participant_count: number
  max_participants?: number | null
}

// Schema validation
const registrationSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  telephone: z.string().min(6, 'Numéro de téléphone invalide'),
  profession: z.string().optional(),
  date_naissance: z.string().optional(),
  url_linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  url_facebook: z.string().url('URL Facebook invalide').optional().or(z.literal('')),
  url_twitter: z.string().url('URL Twitter/X invalide').optional().or(z.literal('')),
  url_instagram: z.string().url('URL Instagram invalide').optional().or(z.literal('')),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface LandingRegistrationFormProps {
  eventId: string
  onSuccess?: () => void
  customButtonStyle?: React.CSSProperties
  customAccentColor?: string
  participantData?: any
  token?: string
}

export default function LandingRegistrationForm({ 
  eventId, 
  onSuccess, 
  customButtonStyle,
  customAccentColor,
  participantData,
  token
}: LandingRegistrationFormProps) {
  // Debug: afficher les props reçues
  console.log('=== LandingRegistrationForm Props ===')
  console.log('participantData:', participantData)
  console.log('token:', token)
  console.log('eventId:', eventId)
  console.log('participantData exists:', !!participantData)
  console.log('=== Fin Props ===')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [groupedSessions, setGroupedSessions] = useState<Record<string, Session[]>>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {}
  })

  // Effet pour pré-remplir le formulaire avec les données du participant
  useEffect(() => {
    console.log('=== useEffect - Mise à jour des valeurs du formulaire ===')
    console.log('participantData dans useEffect:', participantData)
    
    if (participantData) {
      console.log('Pré-remplissage du formulaire avec:', {
        nom: participantData.nom,
        prenom: participantData.prenom,
        email: participantData.email,
        telephone: participantData.telephone,
        profession: participantData.profession,
      })
      
      // Mettre à jour chaque champ individuellement
      setValue('nom', participantData.nom || '')
      setValue('prenom', participantData.prenom || '')
      setValue('email', participantData.email || '')
      setValue('telephone', participantData.telephone || '')
      setValue('profession', participantData.profession || '')
      setValue('date_naissance', participantData.date_naissance || '')
      setValue('url_linkedin', participantData.url_linkedin || '')
      setValue('url_facebook', participantData.url_facebook || '')
      setValue('url_twitter', participantData.url_twitter || '')
      setValue('url_instagram', participantData.url_instagram || '')
    }
    console.log('=== Fin useEffect ===')
  }, [participantData, setValue])

  // Charger les sessions disponibles
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const supabase = supabaseBrowser()
        
        const { data, error } = await supabase
          .from('inscription_sessions')
          .select('*')
          .eq('evenement_id', eventId)
          .order('date')
          .order('heure_debut')

        if (error) {
          console.error('Error fetching sessions:', error)
          return
        }

        // Récupérer les sessions avec le nombre de participants inscrits
        const sessionsWithCounts = await Promise.all(
          (data || []).map(async (session) => {
            const { count, error: countError } = await supabase
              .from('inscription_session_participants')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id)

            if (countError) {
              console.error('Error counting participants for session:', session.id, countError)
            }

            return {
              id: String(session.id),
              titre: String(session.titre),
              description: session.description ? String(session.description) : undefined,
              date: String(session.date),
              heure_debut: String(session.heure_debut),
              heure_fin: String(session.heure_fin),
              intervenant: session.intervenant ? String(session.intervenant) : undefined,
              lieu: session.lieu ? String(session.lieu) : undefined,
              type: String(session.type),
              participant_count: Number(count || 0),
              max_participants: session.max_participants ? Number(session.max_participants) : null
            }
          })
        )

        setSessions(sessionsWithCounts)

        // Grouper les sessions par date
        const grouped = sessionsWithCounts.reduce((acc: Record<string, Session[]>, session) => {
          const date = new Date(session.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          if (!acc[date]) {
            acc[date] = []
          }
          acc[date].push(session)
          return acc
        }, {})

        setGroupedSessions(grouped)
      } catch (err) {
        console.error('Error loading sessions:', err)
      } finally {
        setLoadingSessions(false)
      }
    }

    fetchSessions()
  }, [eventId])

  // Fonction pour rafraîchir les compteurs de sessions
  const refreshSessionCounts = async () => {
    try {
      const supabase = supabaseBrowser()
      
      const { data, error } = await supabase
        .from('inscription_sessions')
        .select('*')
        .eq('evenement_id', eventId)
        .order('date')
        .order('heure_debut')

      if (error) {
        console.error('Error fetching sessions:', error)
        return
      }

      // Récupérer les sessions avec le nombre de participants inscrits
      const sessionsWithCounts = await Promise.all(
        (data || []).map(async (session) => {
          const { count, error: countError } = await supabase
            .from('inscription_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)

          if (countError) {
            console.error('Error counting participants for session:', session.id, countError)
          }

          return {
            id: String(session.id),
            titre: String(session.titre),
            description: session.description ? String(session.description) : undefined,
            date: String(session.date),
            heure_debut: String(session.heure_debut),
            heure_fin: String(session.heure_fin),
            intervenant: session.intervenant ? String(session.intervenant) : undefined,
            lieu: session.lieu ? String(session.lieu) : undefined,
            type: String(session.type),
            participant_count: Number(count || 0),
            max_participants: session.max_participants ? Number(session.max_participants) : null
          }
        })
      )

      setSessions(sessionsWithCounts)
      console.log('✅ Compteurs de sessions mis à jour')
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des sessions:', error)
    }
  }

  // Fonction pour gérer la sélection des sessions
  const handleSessionToggle = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    
    // Empêcher la sélection si la session est pleine
    if (session && isSessionFull(session) && !selectedSessions.includes(sessionId)) {
      return
    }
    
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    )
  }

  // Fonction pour formater l'heure
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    return `${hours}h${minutes !== '00' ? minutes : ''}`
  }

  // Fonction pour déterminer la couleur du type de session
  const getSessionTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conférence': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'atelier': return 'bg-green-100 border-green-300 text-green-800'
      case 'pause': return 'bg-gray-100 border-gray-300 text-gray-800'
      case 'networking': return 'bg-purple-100 border-purple-300 text-purple-800'
      default: return 'bg-indigo-100 border-indigo-300 text-indigo-800'
    }
  }

  // Fonction pour vérifier si une session est complète
  const isSessionFull = (session: Session) => {
    return session.max_participants !== null && session.participant_count >= session.max_participants
  }

  // Fonction pour obtenir le pourcentage de remplissage
  const getCapacityPercentage = (session: Session) => {
    if (!session.max_participants) return 0
    return Math.min((session.participant_count / session.max_participants) * 100, 100)
  }

  // Fonction pour obtenir la couleur de la jauge selon le taux de remplissage
  const getCapacityBarColor = (session: Session) => {
    if (!session.max_participants) return 'bg-gray-300'
    const percentage = getCapacityPercentage(session)
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Si c'est un participant existant, utiliser son email
      const finalData = participantData ? {
        ...data,
        email: participantData.email
      } : data
      
      console.log('Données du formulaire:', finalData)
      
      const supabase = supabaseBrowser()
      
      // Si c'est un participant existant avec token
      if (participantData && token) {
        console.log('Mise à jour des données du participant existant:', participantData.id, finalData)
        
        // Mettre à jour les données du participant
        const { data: updatedParticipant, error: updateError } = await supabase
          .from('inscription_participants')
          .update({
            nom: finalData.nom,
            prenom: finalData.prenom,
            email: finalData.email,
            telephone: finalData.telephone,
            profession: finalData.profession
          })
          .eq('id', participantData.id)
          .select()
          .single()

        if (updateError) {
          console.error('Erreur lors de la mise à jour du participant:', updateError)
          throw new Error('Erreur lors de la mise à jour de vos informations')
        }

        console.log('Participant mis à jour avec succès:', updatedParticipant)

        // Marquer la conversion du token
        try {
          const response = await fetch('/api/participant-tokens', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              token, 
              participantId: participantData.id 
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Erreur API token:', errorText)
            throw new Error('Erreur lors de la confirmation du token')
          }

          const result = await response.json()
          console.log('Token confirmé:', result)
        } catch (tokenError) {
          console.error('Erreur lors de la confirmation du token:', tokenError)
          // Ne pas bloquer si le token ne peut pas être confirmé
        }

        // Inscrire aux sessions sélectionnées via API route
        if (selectedSessions.length > 0) {
          console.log(`🔄 Inscription à ${selectedSessions.length} session(s) pour participant ${participantData.id}`)
          
          // Utiliser l'API route pour contourner RLS
          let successfulInscriptions = 0
          let alreadyRegistered = 0
          
          for (const sessionId of selectedSessions) {
            try {
              const response = await fetch('/api/sessions/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  sessionId, 
                  participantId: participantData.id 
                }),
              })

              if (!response.ok) {
                const errorData = await response.json()
                console.error(`Erreur inscription session ${sessionId}:`, errorData)
                
                // Gérer spécifiquement les erreurs de session pleine
                if (response.status === 409 && errorData.error === 'Session pleine') {
                  const sessionTitle = sessions.find(s => s.id === sessionId)?.titre || `Session ${sessionId}`
                  throw new Error(`❌ ${sessionTitle} est complète (${errorData.capacity?.current}/${errorData.capacity?.max} participants)`)
                }
                
                throw new Error(`Erreur lors de l'inscription à la session ${sessionId}`)
              }

              const result = await response.json()
              
              // Distinguer les nouvelles inscriptions des doublons
              if (result.message.includes('already registered')) {
                console.log(`ℹ️ Session ${sessionId} - Participant déjà inscrit`)
                alreadyRegistered++
              } else {
                console.log(`✅ Session ${sessionId} - Nouvelle inscription:`, result)
                successfulInscriptions++
              }
            } catch (sessionError) {
              console.error(`Erreur session ${sessionId}:`, sessionError)
              throw new Error(`Erreur lors de l'inscription aux sessions`)
            }
          }
          
          // Message de résultat détaillé
          if (successfulInscriptions > 0 && alreadyRegistered > 0) {
            console.log(`✅ ${successfulInscriptions} nouvelle(s) inscription(s), ${alreadyRegistered} déjà inscrit(es)`)
          } else if (successfulInscriptions > 0) {
            console.log(`✅ ${successfulInscriptions} inscription(s) réussie(s)`)
          } else if (alreadyRegistered > 0) {
            console.log(`ℹ️ Toutes les sessions étaient déjà sélectionnées (${alreadyRegistered})`)
          }
          
          // Rafraîchir les compteurs de participants après inscription
          await refreshSessionCounts()
        }

        setIsSubmitted(true)
      } else {
        // Nouvelle inscription
        const { data: newParticipant, error: insertError } = await supabase
          .from('inscription_participants')
          .insert({
            ...finalData,
            evenement_id: eventId,
          })
          .select()
          .single()
        
        if (insertError) {
          throw insertError
        }
        
        // Inscrire aux sessions sélectionnées via API route
        if (selectedSessions.length > 0 && newParticipant) {
          console.log(`🔄 Inscription à ${selectedSessions.length} session(s) pour nouveau participant ${newParticipant.id}`)
          
          // Utiliser l'API route pour contourner RLS
          let newInscriptions = 0
          
          for (const sessionId of selectedSessions) {
            try {
              const response = await fetch('/api/sessions/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  sessionId, 
                  participantId: newParticipant.id 
                }),
              })

              if (!response.ok) {
                const errorData = await response.json()
                console.error(`Erreur inscription session ${sessionId}:`, errorData)
                
                // Gérer spécifiquement les erreurs de session pleine
                if (response.status === 409 && errorData.error === 'Session pleine') {
                  const sessionTitle = sessions.find(s => s.id === sessionId)?.titre || `Session ${sessionId}`
                  throw new Error(`❌ ${sessionTitle} est complète (${errorData.capacity?.current}/${errorData.capacity?.max} participants)`)
                }
                
                throw new Error(`Erreur lors de l'inscription à la session ${sessionId}`)
              }

              const result = await response.json()
              console.log(`✅ Session ${sessionId} inscrite pour nouveau participant:`, result)
              newInscriptions++
            } catch (sessionError) {
              console.error(`Erreur session ${sessionId}:`, sessionError)
              throw new Error(`Erreur lors de l'inscription aux sessions`)
            }
          }
          
          console.log(`✅ ${newInscriptions} nouvelle(s) inscription(s) réussie(s)`)
          
          // Rafraîchir les compteurs de participants après inscription
          await refreshSessionCounts()
        }
        
        console.log('Participant added successfully:', newParticipant)
        reset()
        setIsSubmitted(true)
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      // Debug complet de l'erreur
      console.error('=== ERREUR DÉTAILLÉE ===')
      console.error('Type de err:', typeof err)
      console.error('err brut:', err)
      console.error('err.toString():', String(err))
      console.error('JSON.stringify(err):', JSON.stringify(err, Object.getOwnPropertyNames(err)))
      console.error('err.message:', err?.message)
      console.error('err.stack:', err?.stack)
      console.error('err.code:', err?.code)
      console.error('err.details:', err?.details)
      console.error('Contexte:', {
        participantData,
        token,
        eventId,
        hasParticipantData: !!participantData,
        hasToken: !!token
      })
      console.error('=== FIN ERREUR ===')
      
      // Créer un message d'erreur plus descriptif
      let errorMessage = 'Une erreur est survenue lors de l\'inscription'
      
      if (err && typeof err === 'object') {
        if (err.message) {
          errorMessage = err.message
        } else if (err.code) {
          errorMessage = `Erreur base de données: ${err.code}`
        } else if (err.error) {
          errorMessage = err.error
        } else {
          errorMessage = `Erreur inconnue: ${JSON.stringify(err)}`
        }
      } else if (typeof err === 'string' && err.length > 0) {
        errorMessage = err
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
  
  const focusStyle = customAccentColor ? {
    focusRingColor: customAccentColor
  } : {}

  // Popup de confirmation (remplace la page de confirmation)
  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* Icône de succès animée */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-700">
              <svg className="w-10 h-10 text-green-600 animate-in zoom-in duration-1000 delay-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Confettis animés */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-700"></div>
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-red-400 rounded-full animate-bounce delay-500"></div>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-bounce delay-800"></div>
            </div>
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">
          {participantData ? '🎉 Participation confirmée !' : '✅ Inscription réussie !'}
        </h3>

        {/* Message principal */}
        <p className="text-gray-600 text-center mb-4">
          {participantData 
            ? 'Votre participation à cet événement a été confirmée avec succès.'
            : 'Votre inscription a été enregistrée avec succès.'
          }
        </p>

        {/* Sessions sélectionnées */}
        {selectedSessions.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Sessions sélectionnées ({selectedSessions.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedSessions.map(sessionId => {
                const session = sessions.find(s => s.id === sessionId)
                if (!session) return null
                return (
                  <div key={sessionId} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{session.titre}</div>
                      <div className="text-xs text-gray-500">
                        📅 {new Date(session.date).toLocaleDateString('fr-FR')} • 
                        ⏰ {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
                        {session.lieu && ` • 📍 ${session.lieu}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 text-center">
            📧 Vous recevrez prochainement un email de confirmation avec tous les détails.
          </p>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={() => {
            setIsSubmitted(false)
            if (onSuccess) onSuccess()
          }}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Parfait ! 👍
        </button>
      </div>
    </div>
  )

  // Si soumis avec succès, afficher le popup de confirmation
  if (isSubmitted) {
    return <ConfirmationModal />
  }

  return (
    <div>
      {participantData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-800">
              <strong>👋 Bonjour {participantData.prenom} {participantData.nom} !</strong><br/>
              Vos informations ont été pré-remplies. Cliquez sur "Confirmer" pour valider votre participation.
            </p>
          </div>
        </div>
      )}

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="prenom"
            {...register('prenom')}
            className={inputClasses}
          />
          {errors.prenom && (
            <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nom"
            {...register('nom')}
            className={inputClasses}
          />
          {errors.nom && (
            <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          {participantData ? (
            // Afficher l'email comme texte pour les participants existants
            <div className="mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="text-sm font-medium text-blue-900">{participantData.email}</span>
              </div>
              <p className="mt-1 text-xs text-blue-700">
                Cette adresse email est associée à votre invitation.
              </p>
            </div>
          ) : (
            // Input normal pour les nouveaux participants
            <>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={inputClasses}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </>
          )}
        </div>

        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="telephone"
            {...register('telephone')}
            className={inputClasses}
          />
          {errors.telephone && (
            <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
          )}
        </div>
      </div>

      {/* Informations optionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
            Profession
          </label>
          <input
            type="text"
            id="profession"
            {...register('profession')}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700">
            Date de naissance
          </label>
          <input
            type="date"
            id="date_naissance"
            {...register('date_naissance')}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Sélection des sessions */}
      {sessions.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sessions disponibles
            {selectedSessions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({selectedSessions.length} sélectionnée{selectedSessions.length > 1 ? 's' : ''})
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez les sessions auxquelles vous souhaitez participer :
          </p>

          {loadingSessions ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : Object.keys(groupedSessions).length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2">Aucune session disponible pour cet événement</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800">{date}</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {dateSessions
                      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
                      .map((session) => (
                        <div key={session.id} className="relative">
                          <label className={`flex items-start p-3 rounded-lg transition-colors ${isSessionFull(session) ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}>
                            <input
                              type="checkbox"
                              checked={selectedSessions.includes(session.id)}
                              onChange={() => handleSessionToggle(session.id)}
                              disabled={isSessionFull(session)}
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <h5 className="text-md font-medium text-gray-900">{session.titre}</h5>
                                    {isSessionFull(session) && (
                                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Complet
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
                                    {session.lieu && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {session.lieu}
                                      </>
                                    )}
                                  </div>
                                  {session.intervenant && (
                                    <div className="mt-1 text-sm text-gray-600 flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {session.intervenant}
                                    </div>
                                  )}
                                  {session.description && (
                                    <p className="mt-2 text-sm text-gray-500">{session.description}</p>
                                  )}
                                  
                                  {/* Jauge de capacité */}
                                  {session.max_participants && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded-md">
                                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>Participants:</span>
                                        <span>{session.participant_count} / {session.max_participants}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all duration-300 ${getCapacityBarColor(session)}`}
                                          style={{ width: `${getCapacityPercentage(session)}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {session.max_participants - session.participant_count > 0 
                                          ? `${session.max_participants - session.participant_count} place${session.max_participants - session.participant_count !== 1 ? 's' : ''} restante${session.max_participants - session.participant_count !== 1 ? 's' : ''}`
                                          : 'Session complète'
                                        }
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                                    {session.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Réseaux sociaux */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Réseaux sociaux (optionnel)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="url_linkedin" className="block text-sm font-medium text-gray-700">
              LinkedIn
            </label>
            <input
              type="url"
              id="url_linkedin"
              {...register('url_linkedin')}
              className={inputClasses}
              placeholder="https://linkedin.com/in/votre-profil"
            />
            {errors.url_linkedin && (
              <p className="mt-1 text-sm text-red-600">{errors.url_linkedin.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="url_facebook" className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <input
              type="url"
              id="url_facebook"
              {...register('url_facebook')}
              className={inputClasses}
              placeholder="https://facebook.com/votre-profil"
            />
            {errors.url_facebook && (
              <p className="mt-1 text-sm text-red-600">{errors.url_facebook.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="url_twitter" className="block text-sm font-medium text-gray-700">
              Twitter/X
            </label>
            <input
              type="url"
              id="url_twitter"
              {...register('url_twitter')}
              className={inputClasses}
              placeholder="https://x.com/votre-profil"
            />
            {errors.url_twitter && (
              <p className="mt-1 text-sm text-red-600">{errors.url_twitter.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="url_instagram" className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="url"
              id="url_instagram"
              {...register('url_instagram')}
              className={inputClasses}
              placeholder="https://instagram.com/votre-profil"
            />
            {errors.url_instagram && (
              <p className="mt-1 text-sm text-red-600">{errors.url_instagram.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de soumission */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          style={customButtonStyle || { backgroundColor: '#3B82F6' }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {participantData ? 'Confirmation...' : 'Inscription en cours...'}
            </div>
          ) : (
            participantData ? "Confirmer ma participation" : "Confirmer l'inscription"
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        En vous inscrivant, vous acceptez de recevoir des informations concernant cet événement.
      </p>
    </form>
    </div>
  )
}