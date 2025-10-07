'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabaseBrowser } from '@/lib/supabase/client'
import type { Intervenant } from './IntervenantsManager'
import Image from 'next/image'

// Schema validation
const sessionSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  date: z.string().min(1, 'La date est requise'),
  heure_debut: z.string().min(1, 'L\'heure de début est requise'),
  heure_fin: z.string().min(1, 'L\'heure de fin est requise'),
  intervenant: z.string().optional(),
  intervenant_id: z.string().optional(),
  programme: z.string().optional(),
  lieu: z.string().optional(),
  type: z.string().min(1, 'Le type de session est requis'),
  max_participants: z.string().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

type Session = {
  id: string
  evenement_id: string
  titre: string
  description?: string
  date: string
  heure_debut: string
  heure_fin: string
  intervenant?: string
  intervenant_id?: number | null
  programme?: string
  lieu?: string
  type: string
  max_participants?: number | null
  created_at?: string
}

interface SessionFormProps {
  eventId: string
  session?: Session | null
  onSessionSaved: (session: Session) => void
  onCancel: () => void
}

export default function SessionForm({ eventId, session, onSessionSaved, onCancel }: SessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intervenants, setIntervenants] = useState<Intervenant[]>([])
  const [selectedIntervenant, setSelectedIntervenant] = useState<Intervenant | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session ? {
      titre: session.titre || '',
      description: session.description || '',
      date: session.date || '',
      heure_debut: session.heure_debut || '',
      heure_fin: session.heure_fin || '',
      intervenant: session.intervenant || '',
      intervenant_id: session.intervenant_id?.toString() || '',
      programme: session.programme || '',
      lieu: session.lieu || '',
      type: session.type || '',
      max_participants: session.max_participants?.toString() || '',
    } : {
      // Default values for new sessions
      type: 'conférence', // Set default type
      date: new Date().toISOString().split('T')[0], // Today's date
      max_participants: '',
      intervenant_id: '',
      programme: '',
    }
  })

  // Fetch intervenants for this event
  useEffect(() => {
    const fetchIntervenants = async () => {
      try {
        const supabase = supabaseBrowser()
        const { data, error } = await supabase
          .from('inscription_intervenants')
          .select('*')
          .eq('evenement_id', eventId)
          .order('ordre', { ascending: true })

        if (error) throw error
        setIntervenants(data || [])

        // If editing session with intervenant_id, set selected intervenant
        if (session?.intervenant_id && data) {
          const intervenant = data.find(i => i.id === session.intervenant_id)
          if (intervenant) setSelectedIntervenant(intervenant)
        }
      } catch (error) {
        console.error('Error fetching intervenants:', error)
      }
    }

    fetchIntervenants()
  }, [eventId, session])

  // Watch the form values for debugging
  const formValues = watch();
  console.log("Current form values:", formValues);

  // Watch intervenant_id changes to update selected intervenant
  const intervenantId = watch('intervenant_id')
  useEffect(() => {
    if (intervenantId && intervenantId !== '') {
      const intervenant = intervenants.find(i => i.id?.toString() === intervenantId)
      setSelectedIntervenant(intervenant || null)
    } else {
      setSelectedIntervenant(null)
    }
  }, [intervenantId, intervenants])

  const onSubmit = async (data: SessionFormData) => {
    try {
      if (!eventId) {
        throw new Error("ID d'événement invalide")
      }
      
      setIsSubmitting(true)
      setError(null)
      
      // Log the data we're about to send
      console.log("Sending session data:", data);
      
      // Ensure all fields are included, even if they're empty strings
      const formattedData = {
        titre: data.titre,
        description: data.description || '',
        date: data.date,
        heure_debut: data.heure_debut,
        heure_fin: data.heure_fin,
        intervenant: data.intervenant || '',
        intervenant_id: data.intervenant_id && data.intervenant_id.trim() !== '' ? parseInt(data.intervenant_id, 10) : null,
        programme: data.programme || '',
        lieu: data.lieu || '',
        type: data.type,
        max_participants: data.max_participants && data.max_participants.trim() !== '' ? parseInt(data.max_participants, 10) : null,
      };
      
      if (session) {
        // Update existing session via API
        console.log("Updating session with ID:", session.id);
        
        const response = await fetch('/api/sessions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session.id,
            ...formattedData
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la mise à jour');
        }
        
        const { session: updatedSession } = await response.json();
        console.log("Session updated successfully:", updatedSession);
        onSessionSaved(updatedSession as Session)
      } else {
        // Create new session via API
        console.log("Creating new session for event:", eventId);
        
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId,
            ...formattedData
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la création');
        }
        
        const { session: newSession } = await response.json();
        console.log("Session created successfully:", newSession);
        onSessionSaved(newSession as Session)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'enregistrement';
      console.error('Error submitting session form:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="titre"
            type="text"
            {...register('titre')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Titre de la session"
          />
          {errors.titre && (
            <p className="mt-1 text-sm text-red-600">{errors.titre.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Description détaillée de la session"
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type de session <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            {...register('type')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Sélectionnez un type</option>
            <option value="conférence">Conférence</option>
            <option value="atelier">Atelier</option>
            <option value="pause">Pause</option>
            <option value="networking">Networking</option>
            <option value="autre">Autre</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre maximum de participants
          </label>
          <input
            id="max_participants"
            type="number"
            min="1"
            {...register('max_participants')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Laissez vide pour illimité"
          />
          <p className="mt-1 text-sm text-gray-500">
            Laissez ce champ vide si vous ne souhaitez pas limiter le nombre de participants
          </p>
          {errors.max_participants && (
            <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            {...register('date')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="heure_debut" className="block text-sm font-medium text-gray-700 mb-1">
              Heure de début <span className="text-red-500">*</span>
            </label>
            <input
              id="heure_debut"
              type="time"
              {...register('heure_debut')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.heure_debut && (
              <p className="mt-1 text-sm text-red-600">{errors.heure_debut.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="heure_fin" className="block text-sm font-medium text-gray-700 mb-1">
              Heure de fin <span className="text-red-500">*</span>
            </label>
            <input
              id="heure_fin"
              type="time"
              {...register('heure_fin')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.heure_fin && (
              <p className="mt-1 text-sm text-red-600">{errors.heure_fin.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="intervenant_id" className="block text-sm font-medium text-gray-700 mb-1">
              Intervenant
            </label>
            <select
              id="intervenant_id"
              {...register('intervenant_id')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un intervenant</option>
              {intervenants.map((intervenant) => (
                <option key={intervenant.id} value={intervenant.id}>
                  {intervenant.prenom} {intervenant.nom}
                  {intervenant.titre && ` - ${intervenant.titre}`}
                </option>
              ))}
            </select>
            {intervenants.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Aucun intervenant disponible. Ajoutez d'abord des intervenants dans l'onglet Intervenants.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lieu" className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <input
              id="lieu"
              type="text"
              {...register('lieu')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Salle A, Auditorium, etc."
            />
          </div>
        </div>

        {/* Fiche intervenant sélectionné */}
        {selectedIntervenant && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Intervenant sélectionné</h4>
            <div className="flex items-start space-x-4">
              {selectedIntervenant.photo_url ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedIntervenant.photo_url}
                    alt={`${selectedIntervenant.prenom} ${selectedIntervenant.nom}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900">
                  {selectedIntervenant.prenom} {selectedIntervenant.nom}
                </h5>
                {selectedIntervenant.titre && (
                  <p className="text-sm text-gray-700 mt-1">{selectedIntervenant.titre}</p>
                )}
                {selectedIntervenant.entreprise && (
                  <p className="text-sm text-gray-600">{selectedIntervenant.entreprise}</p>
                )}
                {selectedIntervenant.biographie && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{selectedIntervenant.biographie}</p>
                )}
                <div className="flex items-center space-x-3 mt-2">
                  {selectedIntervenant.email && (
                    <a href={`mailto:${selectedIntervenant.email}`} className="text-xs text-blue-600 hover:text-blue-700">
                      {selectedIntervenant.email}
                    </a>
                  )}
                  {selectedIntervenant.telephone && (
                    <span className="text-xs text-gray-600">{selectedIntervenant.telephone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="programme" className="block text-sm font-medium text-gray-700 mb-1">
            Programme de la session
          </label>
          <textarea
            id="programme"
            {...register('programme')}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Détails du programme, points clés, déroulement de la session..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Décrivez le programme détaillé de cette session (agenda, points abordés, activités...)
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              session ? 'Mettre à jour' : 'Ajouter'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
