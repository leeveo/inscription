'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useState } from 'react'
import EventDescriptionEditor from '@/components/EventDescriptionEditor'
import ImageUpload from '@/components/ImageUpload'

// Update the schema to handle capacite properly and remove description validation (handled separately)
const schema = z.object({
  nom: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  lieu: z.string().min(3, "Le lieu doit contenir au moins 3 caractères"),
  date_debut: z.string().refine(val => !!val, "La date de début est requise"),
  date_fin: z.string().refine(val => !!val, "La date de fin est requise"),
  // New fields
  nom_client: z.string().optional(),
  adresse_client: z.string().optional(),
  adresse_evenement: z.string().optional(),
  type_participation: z.enum(['présentiel', 'virtuel', 'hybride']),
  notes: z.string().optional(),
  capacite: z.string().optional(),
  // Make type_evenement required (not optional)
  type_evenement: z.enum(['concert', 'salon_professionnel', 'atelier', 'conference', 'webinar', 'cours_en_ligne', 'festival', 'tourisme', 'spectacle', 'match', 'pratique_sportive', 'adhesion', 'don', 'autre']).default('conference'),
  statut: z.enum(['brouillon', 'publié', 'archivé']),
  // Note: description and logo_url are handled separately in state
})

type FormData = z.infer<typeof schema>

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type_participation: 'présentiel',
      type_evenement: 'conference',
      statut: 'brouillon'
    }
  })

  // Watch values for conditional rendering
  const typeParticipation = watch('type_participation')

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setIsSubmitting(true)
      setFormError(null)

      // Validate description manually since it's not in the form
      if (!description || description.trim().length < 10) {
        setFormError("La description doit contenir au moins 10 caractères")
        setIsSubmitting(false)
        return
      }

      const supabase = supabaseBrowser()

      // Ensure capacity is properly handled
      const formattedData = {
        ...data,
        description: description, // Use HTML description from state
        logo_url: logoUrl || null, // Use logo URL from state
        date_debut: new Date(data.date_debut),
        date_fin: new Date(data.date_fin),
        // If capacite is empty string, set to null to avoid NaN
        capacite: data.capacite === '' ? null : data.capacite
      }

      const { error } = await (supabase as any)
        .from('inscription_evenements')
        .insert(formattedData)

      if (error) {
        console.error("Erreur lors de la création de l'événement:", error)
        setFormError(`Erreur lors de la création: ${error.message}`)
      } else {
        router.push('/admin/evenements')
      }
    } catch (error) {
      console.error("Erreur:", error)
      setFormError("Une erreur inattendue s'est produite.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {formError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{formError}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h2 className="text-2xl font-bold text-white">Créer un nouvel événement</h2>
          <p className="text-blue-100 mt-2">Remplissez le formulaire ci-dessous pour créer un événement</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="border-b border-gray-200 pb-5">
            <div>
              {/* Commentaire sur la section */}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l&apos;événement *
                </label>
                <input 
                  id="nom"
                  {...register('nom')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="Ex: Conférence annuelle 2025"
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description * (HTML)
                </label>
                <EventDescriptionEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Décrivez votre événement en détail avec du texte formaté..."
                />
                {!description && (
                  <p className="mt-1 text-sm text-red-600">La description est requise</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo de l&apos;événement
                </label>
                <ImageUpload
                  currentImageUrl={logoUrl || ''}
                  onImageUploaded={setLogoUrl}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Téléchargez un logo qui apparaîtra sur les pages d&apos;inscription et templates (max 1MB)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type_evenement" className="block text-sm font-medium text-gray-700 mb-1">
                    Type d&apos;événement *
                  </label>
                  <select
                    id="type_evenement"
                    {...register('type_evenement')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Sélectionner un type d&apos;événement</option>
                    <option value="concert">Concert</option>
                    <option value="salon_professionnel">Salon professionnel</option>
                    <option value="atelier">Atelier</option>
                    <option value="conference">Conférence</option>
                    <option value="webinar">Événement en ligne (webinar)</option>
                    <option value="cours_en_ligne">Cours en ligne</option>
                    <option value="festival">Festival</option>
                    <option value="tourisme">Tourisme et parc de loisirs</option>
                    <option value="spectacle">Spectacle</option>
                    <option value="match">Match</option>
                    <option value="pratique_sportive">Pratique sportive</option>
                    <option value="adhesion">Adhésion</option>
                    <option value="don">Don</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="capacite" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité
                  </label>
                  <input 
                    id="capacite"
                    type="number"
                    {...register('capacite')} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    placeholder="Nombre maximum de participants"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="statut"
                  {...register('statut')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="publié">Publié</option>
                  <option value="archivé">Archivé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Information Section */}
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations client</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="nom_client" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client
                </label>
                <input 
                  id="nom_client"
                  {...register('nom_client')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="Ex: Entreprise ABC"
                />
              </div>
              
              <div>
                <label htmlFor="adresse_client" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse du client
                </label>
                <textarea 
                  id="adresse_client"
                  {...register('adresse_client')} 
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="Adresse complète du client"
                />
              </div>
            </div>
          </div>

          {/* Event Location and Time Section */}
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lieu et temps</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="type_participation" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de participation
                </label>
                <select
                  id="type_participation"
                  {...register('type_participation')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="présentiel">Présentiel</option>
                  <option value="virtuel">Virtuel</option>
                  <option value="hybride">Hybride</option>
                </select>
              </div>

              <div>
                <label htmlFor="lieu" className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu *
                </label>
                <input 
                  id="lieu"
                  {...register('lieu')} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="Ex: Centre de conférences"
                />
                {errors.lieu && (
                  <p className="mt-1 text-sm text-red-600">{errors.lieu.message}</p>
                )}
              </div>
              
              {(typeParticipation === 'présentiel' || typeParticipation === 'hybride') && (
                <div>
                  <label htmlFor="adresse_evenement" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse détaillée de l&apos;événement
                  </label>
                  <textarea 
                    id="adresse_evenement"
                    {...register('adresse_evenement')} 
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    placeholder="Adresse complète du lieu de l'événement"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure de début *
                  </label>
                  <input 
                    id="date_debut"
                    type="datetime-local" 
                    {...register('date_debut')} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  />
                  {errors.date_debut && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_debut.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure de fin *
                  </label>
                  <input 
                    id="date_fin"
                    type="datetime-local" 
                    {...register('date_fin')} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  />
                  {errors.date_fin && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_fin.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes additionnelles</h3>
            <div>
              <textarea 
                id="notes"
                {...register('notes')} 
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="Notes internes concernant cet événement..."
              />
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => router.push('/admin/evenements')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                "Créer l'événement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}