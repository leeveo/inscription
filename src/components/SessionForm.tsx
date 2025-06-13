'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabaseBrowser } from '@/lib/supabase/client'

// Schema validation
const sessionSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  date: z.string().min(1, 'La date est requise'),
  heure_debut: z.string().min(1, 'L\'heure de début est requise'),
  heure_fin: z.string().min(1, 'L\'heure de fin est requise'),
  intervenant: z.string().optional(),
  lieu: z.string().optional(),
  type: z.string().min(1, 'Le type de session est requis'),
})

type SessionFormData = z.infer<typeof sessionSchema>

type Session = SessionFormData & {
  id: string
  evenement_id: string
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
      lieu: session.lieu || '',
      type: session.type || '',
    } : {
      // Default values for new sessions
      type: 'conférence', // Set default type
      date: new Date().toISOString().split('T')[0], // Today's date
    }
  })

  // Watch the form values for debugging
  const formValues = watch();
  console.log("Current form values:", formValues);

  const onSubmit = async (data: SessionFormData) => {
    try {
      if (!eventId) {
        throw new Error("ID d'événement invalide")
      }
      
      setIsSubmitting(true)
      setError(null)
      const supabase = supabaseBrowser()
      
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
        lieu: data.lieu || '',
        type: data.type,
      };
      
      if (session) {
        // Update existing session
        console.log("Updating session with ID:", session.id);
        
        const { data: updatedSession, error: updateError } = await supabase
          .from('inscription_sessions')
          .update(formattedData)
          .eq('id', session.id)
          .select()
          .single()
        
        if (updateError) {
          console.error("Error updating session:", updateError);
          throw updateError;
        }
        
        console.log("Session updated successfully:", updatedSession);
        onSessionSaved(updatedSession as Session)
      } else {
        // Create new session
        console.log("Creating new session for event:", eventId);
        
        const { data: newSession, error: insertError } = await supabase
          .from('inscription_sessions')
          .insert({
            ...formattedData,
            evenement_id: eventId
          })
          .select()
          .single()
        
        if (insertError) {
          console.error("Error creating session:", insertError);
          throw insertError;
        }
        
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
            <label htmlFor="intervenant" className="block text-sm font-medium text-gray-700 mb-1">
              Intervenant
            </label>
            <input
              id="intervenant"
              type="text"
              {...register('intervenant')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom de l'intervenant"
            />
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
