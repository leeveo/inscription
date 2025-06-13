'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabaseBrowser } from '@/lib/supabase/client'

// Schema validation
const participantSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  telephone: z.string().min(6, 'Numéro de téléphone invalide'),
  site_web: z.string().url('URL invalide').optional().or(z.literal('')),
  // Nouveaux champs
  profession: z.string().min(2, 'La profession doit contenir au moins 2 caractères').optional().or(z.literal('')),
  date_naissance: z.string().optional().or(z.literal('')),
  url_linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  url_facebook: z.string().url('URL Facebook invalide').optional().or(z.literal('')),
  url_twitter: z.string().url('URL Twitter/X invalide').optional().or(z.literal('')),
  url_instagram: z.string().url('URL Instagram invalide').optional().or(z.literal('')),
})

type ParticipantFormData = z.infer<typeof participantSchema>

type Participant = ParticipantFormData & {
  id: string
  evenement_id: string
  created_at: string
}

interface ParticipantFormProps {
  eventId: string | null // Changé de number à string
  participant?: Participant | null
  onParticipantAdded: (participant: Participant) => void
  onCancel: () => void
}

// Remove unused variables
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function ParticipantForm({ 
  eventId, 
  participant, 
  onParticipantAdded,
  onCancel 
}: ParticipantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: participant ? {
      nom: participant.nom,
      prenom: participant.prenom,
      email: participant.email,
      telephone: participant.telephone,
      site_web: participant.site_web || '',
      // Nouveaux champs
      profession: participant.profession || '',
      date_naissance: participant.date_naissance || '',
      url_linkedin: participant.url_linkedin || '',
      url_facebook: participant.url_facebook || '',
      url_twitter: participant.url_twitter || '',
      url_instagram: participant.url_instagram || '',
    } : undefined
  })

  const onSubmit = async (data: ParticipantFormData) => {
    try {
      if (!eventId) {
        throw new Error("Invalid event ID")
      }
      
      setIsSubmitting(true)
      setError(null)
      const supabase = supabaseBrowser()
      
      // Remove empty strings for optional fields
      const formattedData = {
        ...data,
        site_web: data.site_web || null,
        profession: data.profession || null,
        date_naissance: data.date_naissance || null,
        url_linkedin: data.url_linkedin || null,
        url_facebook: data.url_facebook || null,
        url_twitter: data.url_twitter || null,
        url_instagram: data.url_instagram || null,
        evenement_id: eventId
      }
      
      if (participant) {
        // Update existing participant
        const { data: updatedParticipant, error: updateError } = await supabase
          .from('inscription_participants')
          .update(formattedData)
          .eq('id', participant.id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        onParticipantAdded(updatedParticipant as Participant)
      } else {
        // Create new participant
        const { data: newParticipant, error: insertError } = await supabase
          .from('inscription_participants')
          .insert(formattedData)
          .select()
          .single()
        
        if (insertError) throw insertError
        
        onParticipantAdded(newParticipant as Participant)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Error submitting participant form:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Remove the title since it's now handled by the Modal component */}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              id="nom"
              type="text"
              {...register('nom')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dupont"
            />
            {errors.nom && (
              <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              id="prenom"
              type="text"
              {...register('prenom')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jean"
            />
            {errors.prenom && (
              <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="jean.dupont@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            id="telephone"
            type="tel"
            {...register('telephone')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+33 6 12 34 56 78"
          />
          {errors.telephone && (
            <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
          )}
        </div>
        
        {/* Nouveau champ : Profession */}
        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
            Profession (optionnel)
          </label>
          <input
            id="profession"
            type="text"
            {...register('profession')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingénieur, Médecin, Étudiant..."
          />
          {errors.profession && (
            <p className="mt-1 text-sm text-red-600">{errors.profession.message}</p>
          )}
        </div>
        
        {/* Nouveau champ : Date de naissance */}
        <div>
          <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700 mb-1">
            Date de naissance (optionnel)
          </label>
          <input
            id="date_naissance"
            type="date"
            {...register('date_naissance')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            // Si la date est au format ISO, extraire seulement la partie date (YYYY-MM-DD)
            value={watch('date_naissance')?.split('T')[0] || ''}
          />
          {errors.date_naissance && (
            <p className="mt-1 text-sm text-red-600">{errors.date_naissance.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="site_web" className="block text-sm font-medium text-gray-700 mb-1">
            Site Web (optionnel)
          </label>
          <input
            id="site_web"
            type="url"
            {...register('site_web')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://www.example.com"
          />
          {errors.site_web && (
            <p className="mt-1 text-sm text-red-600">{errors.site_web.message}</p>
          )}
        </div>
        
        {/* Nouveaux champs réseaux sociaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="url_linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn (optionnel)
            </label>
            <input
              id="url_linkedin"
              type="url"
              {...register('url_linkedin')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.linkedin.com/in/username"
            />
            {errors.url_linkedin && (
              <p className="mt-1 text-sm text-red-600">{errors.url_linkedin.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="url_facebook" className="block text-sm font-medium text-gray-700 mb-1">
              Facebook (optionnel)
            </label>
            <input
              id="url_facebook"
              type="url"
              {...register('url_facebook')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.facebook.com/username"
            />
            {errors.url_facebook && (
              <p className="mt-1 text-sm text-red-600">{errors.url_facebook.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="url_twitter" className="block text-sm font-medium text-gray-700 mb-1">
              Twitter/X (optionnel)
            </label>
            <input
              id="url_twitter"
              type="url"
              {...register('url_twitter')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://twitter.com/username"
            />
            {errors.url_twitter && (
              <p className="mt-1 text-sm text-red-600">{errors.url_twitter.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="url_instagram" className="block text-sm font-medium text-gray-700 mb-1">
              Instagram (optionnel)
            </label>
            <input
              id="url_instagram"
              type="url"
              {...register('url_instagram')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.instagram.com/username"
            />
            {errors.url_instagram && (
              <p className="mt-1 text-sm text-red-600">{errors.url_instagram.message}</p>
            )}
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
              participant ? 'Mettre à jour' : 'Ajouter'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
