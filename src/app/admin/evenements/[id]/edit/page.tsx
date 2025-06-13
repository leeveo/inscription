'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ParticipantForm from '@/components/ParticipantForm'
import ImportParticipantsModal from '@/components/ImportParticipantsModal'
import EmailForm from '@/components/EmailForm'
import SessionAgenda from '@/components/SessionAgenda';
import SessionForm from '@/components/SessionForm';

// Simple toast notification system
const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 
      'bg-red-100 border border-red-200 text-red-800'
    }`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        )}
        <p>{message}</p>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Fix the schema to ensure type_evenement is required (not optional)
const schema = z.object({
  nom: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
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
  // Make type_evenement required with no optional() modifier
  type_evenement: z.enum(["conférence", "atelier", "autre", "webinar"]),
  statut: z.enum(['brouillon', 'publié', 'archivé']),
})

type FormData = z.infer<typeof schema>

export default function EditEventPage() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Extract ID directly from the URL path
  const pathSegments = pathname.split('/')
  const eventId = pathSegments[pathSegments.length - 2] // Get the ID from the path
  
  console.log("Path:", pathname)
  console.log("ID from path:", eventId)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  
  // Modal states
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [participantSearch, setParticipantSearch] = useState('')
  const [emailTarget, setEmailTarget] = useState<{ id: string, email: string, name: string } | null>(null)
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [participantPage, setParticipantPage] = useState(1)
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  // Add the missing state variable for editing participants
  const [participantToEdit, setParticipantToEdit] = useState<any>(null)
  
  // Add these new state variables for session management
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'sessions'>('details');
  
  // Add toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      type_participation: 'présentiel',
      type_evenement: 'conférence',
      statut: 'brouillon'
    }
  })

  // Watch values for conditional rendering
  const typeParticipation = watch('type_participation')

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        console.error("Missing event ID")
        setFormError("ID d'événement manquant")
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setFormError(null)
        console.log("Fetching event data for ID:", eventId)
        
        const supabase = supabaseBrowser()
        
        const { data, error } = await supabase
          .from('inscription_evenements')
          .select('*')
          .eq('id', eventId)
          .single()
        
        if (error) {
          console.error("Error fetching event data:", error)
          throw error
        }
        
        if (!data) {
          throw new Error("Événement non trouvé")
        }
        
        console.log("Event data loaded:", data)
        
        // Format dates for form inputs
        const formattedData = {
          ...data,
          date_debut: new Date(data.date_debut as string).toISOString().slice(0, 16),
          date_fin: new Date(data.date_fin as string).toISOString().slice(0, 16),
          // Ensure capacity is properly formatted and never NaN
          capacite: data.capacite !== null && data.capacite !== undefined ? String(data.capacite) : ''
        }
        
        reset(formattedData)
      } catch (err: Error | unknown) {
        console.error("Erreur lors du chargement de l'événement:", err)
        setFormError(`Erreur: ${err instanceof Error ? err.message : 'Une erreur inconnue est survenue'}`)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvent()
  }, [eventId, reset])

  // Enhanced fetch participants with pagination
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) return
      
      try {
        setIsLoadingParticipants(true)
        const supabase = supabaseBrowser()
        
        // Get total count first
        const { count, error: countError } = await supabase
          .from('inscription_participants')
          .select('*', { count: 'exact', head: true })
          .eq('evenement_id', eventId)
        
        if (countError) throw countError
        setTotalParticipants(count || 0)
        
        // Then get paginated participants
        let query = supabase
          .from('inscription_participants')
          .select('*')
          .eq('evenement_id', eventId)
          
        // Apply search if provided
        if (participantSearch) {
          query = query.or(`nom.ilike.%${participantSearch}%,prenom.ilike.%${participantSearch}%,email.ilike.%${participantSearch}%`)
        }
        
        // Apply pagination
        const from = (participantPage - 1) * 10
        const to = from + 10 - 1
        
        const { data, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to)
        
        if (error) throw error
        
        setParticipants(data || [])
      } catch (err) {
        console.error('Error fetching participants:', err)
      } finally {
        setIsLoadingParticipants(false)
      }
    }
    
    fetchParticipants()
  }, [eventId, participantPage, participantSearch])

  const onSubmit = async (data: FormData) => {
    if (!eventId) {
      setFormError("ID d&apos;événement invalide")
      return
    }
    
    try {
      setIsSubmitting(true)
      setFormError(null)
      const supabase = supabaseBrowser()

      const { error } = await supabase
        .from('inscription_evenements')
        .update({
          ...data,
          date_debut: new Date(data.date_debut),
          date_fin: new Date(data.date_fin),
        })
        .eq('id', eventId)

      if (error) {
        console.error("Erreur lors de la mise à jour de l'événement:", error)
        setFormError(`Erreur lors de la mise à jour: ${error.message}`)
      } else {
        // Show success toast and stay on the page
        setToast({
          message: "Événement mis à jour avec succès!",
          type: "success"
        });
      }
    } catch (error: Error | unknown) {
      console.error("Erreur:", error)
      setFormError("Une erreur inattendue s&apos;est produite.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle new participant added
  const handleParticipantAdded = (participant: any) => {
    setParticipants([participant, ...participants])
    setIsParticipantModalOpen(false)
  }
  
  // Handle import completion
  const handleImportComplete = (importedCount: number) => {
    // Refresh participant list after import
    if (importedCount > 0) {
      const fetchParticipants = async () => {
        if (!eventId) return
        
        try {
          const supabase = supabaseBrowser()
          
          const { data, error } = await supabase
            .from('inscription_participants')
            .select('*')
            .eq('evenement_id', eventId)
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          setParticipants(data || [])
        } catch (err) {
          console.error('Error fetching participants:', err)
        }
      }
      
      fetchParticipants()
    }
    
    // Close the modal after a short delay
    setTimeout(() => {
      setIsImportModalOpen(false)
    }, 2000)
  }

  // Handle checkbox selection for all participants
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedParticipants([])
    } else {
      setSelectedParticipants(participants.map(p => p.id))
    }
    setIsAllSelected(!isAllSelected)
  }
  
  // Handle individual participant selection
  const handleSelectParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(pId => pId !== id))
      setIsAllSelected(false)
    } else {
      setSelectedParticipants([...selectedParticipants, id])
      if (selectedParticipants.length + 1 === participants.length) {
        setIsAllSelected(true)
      }
    }
  }
  
  // Handle email to selected participants
  const handleEmailSelected = () => {
    if (selectedParticipants.length === 0) return
    setEmailTarget(null) // No specific target, email to many
    setIsEmailModalOpen(true)
  }
  
  // Handle email to single participant
  const handleEmailSingle = (participant: any) => {
    setEmailTarget({
      id: participant.id,
      email: participant.email,
      name: `${participant.prenom} ${participant.nom}`
    })
    setIsEmailModalOpen(true)
  }
  
  // Handle email send completion
  const handleEmailSent = () => {
    // Reset selection after sending email
    setSelectedParticipants([])
    setIsAllSelected(false)
    setIsEmailModalOpen(false)
    setEmailTarget(null)
  }
  
  // Calculate pagination details
  const totalPages = Math.ceil(totalParticipants / 10)

  // Handle session actions
  const handleAddSession = () => {
    setSessionToEdit(null);
    setIsSessionModalOpen(true);
  };
  
  const handleEditSession = (session: any) => {
    setSessionToEdit(session);
    setIsSessionModalOpen(true);
  };
  
  const handleSessionSaved = (session: any) => {
    // Refresh session list or update state as needed
    setIsSessionModalOpen(false);
    setSessionToEdit(null);
    // You might want to add a toast notification here
  };
  
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Show toast if needed */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {formError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{formError}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <Link 
            href={`/admin/evenements/${eventId}`}
            className="text-blue-100 hover:text-white mb-4 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux détails
          </Link>
          <h2 className="text-2xl font-bold text-white">Modifier l&apos;événement</h2>
          <p className="text-blue-100 mt-2">Mettez à jour les informations de l&apos;événement</p>
        </div>
        
        {/* Add navigation tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Détails de l&apos;événement
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participants'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Participants
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sessions & Planning
            </button>
          </nav>
        </div>
        
        {/* Event details form (show only if active tab is 'details') */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-5">
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
                    Description *
                  </label>
                  <textarea 
                    id="description"
                    {...register('description')} 
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    placeholder="Décrivez votre événement en détail..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type_evenement" className="block text-sm font-medium text-gray-700 mb-1">
                      Type d&apos;événement
                    </label>
                    <select
                      id="type_evenement"
                      {...register('type_evenement')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="conférence">Conférence</option>
                      <option value="atelier">Atelier</option>
                      <option value="webinar">Webinar</option>
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
                onClick={() => router.push(`/admin/evenements/${eventId}`)}
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
                    Mise à jour en cours...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </button>
            </div>
          </form>
        )}
        
        {/* Participants management (show only if active tab is 'participants') */}
        {activeTab === 'participants' && (
          <div className="bg-blue-50 p-6">
            {/* Enhanced participant management section */}
            <div className="bg-blue-50 p-6 border-t border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-blue-800">Gestion des participants</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsParticipantModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter
                  </button>
                  
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Importer
                  </button>
                  
                  <button
                    onClick={handleEmailSelected}
                    disabled={selectedParticipants.length === 0}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Envoyer un email {selectedParticipants.length > 0 && `(${selectedParticipants.length})`}
                  </button>
                </div>
              </div>
              
              <div className="border border-blue-200 rounded bg-white p-3">
                {isLoadingParticipants ? (
                  <div className="flex justify-center items-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm2-5.291A7.962 7.962 0 0114 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun participant</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {participantSearch ? 'Aucun résultat pour cette recherche' : 'Commencez par ajouter des participants à cet événement'}
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setIsParticipantModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajouter un participant
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-3 text-left">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  checked={isAllSelected}
                                  onChange={handleSelectAll}
                                />
                              </div>
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Participant
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Téléphone
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {participants.map(participant => (
                            <tr key={participant.id} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    checked={selectedParticipants.includes(participant.id)}
                                    onChange={() => handleSelectParticipant(participant.id)}
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {participant.prenom} {participant.nom}
                                    </div>
                                    {participant.profession && (
                                      <div className="text-xs text-gray-500">{participant.profession}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{participant.email}</div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{participant.telephone || "—"}</div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(participant.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handleEmailSingle(participant)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Envoyer un email"
                                  >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Open participant form with this participant for editing
                                      setParticipantToEdit(participant);
                                      setIsParticipantModalOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Modifier"
                                  >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <Link
                                    href={`/ticket/${participant.id}`}
                                    target="_blank"
                                    className="text-green-600 hover:text-green-900"
                                    title="Voir le billet"
                                  >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-700">
                          Affichage de <span className="font-medium">{(participantPage - 1) * 10 + 1}</span> à{' '}
                          <span className="font-medium">
                            {Math.min(participantPage * 10, totalParticipants)}
                          </span>{' '}
                          sur <span className="font-medium">{totalParticipants}</span> participants
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setParticipantPage(prev => Math.max(prev - 1, 1))}
                            disabled={participantPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Précédent</span>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => setParticipantPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={participantPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Suivant</span>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Sessions management (show only if active tab is 'sessions') */}
        {activeTab === 'sessions' && (
          <div className="bg-indigo-50 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sessions et Planning</h2>
              <p className="text-gray-600 text-sm">
                Créez et gérez les sessions de votre événement auxquelles les participants pourront s&apos;inscrire.
              </p>
            </div>
            
            <SessionAgenda 
              eventId={eventId} 
              onAddSession={handleAddSession}
              onEditSession={handleEditSession}
            />
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Statistiques des sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border border-indigo-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 mr-4">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-800">Total Sessions</p>
                      <p className="text-2xl font-bold text-indigo-900" id="total-sessions">0</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4 border border-green-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 mr-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Inscriptions Totales</p>
                      <p className="text-2xl font-bold text-green-900" id="total-registrations">0</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4 border border-blue-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Taux de Participation</p>
                      <p className="text-2xl font-bold text-blue-900" id="participation-rate">0%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions les plus populaires</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscriptions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap" colSpan={4}>
                        <div className="text-center text-gray-500 py-2">
                          Aucune donnée disponible
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Modals for participant, import, email, and session forms */}
        <div>
          {/* Session modal */}
          {isSessionModalOpen && (
            <Modal
              isOpen={isSessionModalOpen}
              onClose={() => {
                setIsSessionModalOpen(false);
                setSessionToEdit(null);
              }}
              title={sessionToEdit ? "Modifier la session" : "Ajouter une session"}
              size="lg"
            >
              <SessionForm
                eventId={eventId}
                session={sessionToEdit}
                onSessionSaved={handleSessionSaved}
                onCancel={() => {
                  setIsSessionModalOpen(false);
                  setSessionToEdit(null);
                }}
              />
            </Modal>
          )}

          {/* Participant form modal */}
          {isParticipantModalOpen && (
            <Modal
              isOpen={isParticipantModalOpen}
              onClose={() => {
                setIsParticipantModalOpen(false);
                setParticipantToEdit(null);
              }}
              title={participantToEdit ? "Modifier le participant" : "Ajouter un participant"}
              size="md"
            >
              <ParticipantForm
                eventId={eventId}
                participant={participantToEdit}
                onParticipantAdded={handleParticipantAdded}
                onCancel={() => {
                  setIsParticipantModalOpen(false);
                  setParticipantToEdit(null);
                }}
              />
            </Modal>
          )}

          {/* Import participants modal */}
          {isImportModalOpen && (
            <Modal
              isOpen={isImportModalOpen}
              onClose={() => setIsImportModalOpen(false)}
              title="Importer des participants"
              size="lg"
            >
              <ImportParticipantsModal
                eventId={eventId}
                onClose={() => setIsImportModalOpen(false)}
                onImportComplete={handleImportComplete}
              />
            </Modal>
          )}

          {/* Email modal */}
          {isEmailModalOpen && (
            <Modal
              isOpen={isEmailModalOpen}
              onClose={() => setIsEmailModalOpen(false)}
              title={emailTarget ? `Envoyer un email à ${emailTarget.name}` : `Envoyer un email aux participants (${selectedParticipants.length})`}
              size="lg"
            >
              <EmailForm
                eventId={eventId}
                recipientIds={emailTarget ? [emailTarget.id] : selectedParticipants}
                singleRecipient={emailTarget ? emailTarget.email : null}
                onSent={handleEmailSent}
                onCancel={() => setIsEmailModalOpen(false)}
              />
            </Modal>
          )}
        </div>
      </div>
    </div>
  )
}
