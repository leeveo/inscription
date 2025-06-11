'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

type Participant = {
  id: number
  evenement_id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  site_web?: string
  checked_in: boolean
  created_at: string
  // Nouveaux champs
  profession?: string
  date_naissance?: string
  url_linkedin?: string
  url_facebook?: string
  url_twitter?: string
  url_instagram?: string
  evenement?: {
    id: number
    nom: string
    date_debut: string
  }
}

export default function ParticipantDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const participantId = params.id as string
  
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (!participantId) {
          throw new Error("ID participant manquant")
        }
        
        const supabase = supabaseBrowser()
        
        const { data, error } = await supabase
          .from('inscription_participants')
          .select(`
            *,
            evenement:evenement_id (
              id,
              nom,
              date_debut
            )
          `)
          .eq('id', participantId)
          .single()
        
        if (error) throw error
        
        setParticipant(data as Participant)
      } catch (err: any) {
        console.error('Erreur lors du chargement du participant:', err)
        setError(err.message || 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchParticipant()
  }, [participantId])

  // Format date function - avoiding hydration mismatch
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    
    // Simple consistent date format
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  // Format datetime function - avoiding hydration mismatch
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Retour
        </button>
      </div>
    )
  }
  
  if (!participant) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">Participant non trouvé</p>
        </div>
        <button
          onClick={() => router.push('/admin/participants')}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Retour à la liste
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/admin/participants"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la liste des participants
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h2 className="text-2xl font-bold text-white">
            {participant.prenom} {participant.nom}
          </h2>
          <p className="text-blue-100 mt-2">
            Détails du participant
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations personnelles
              </h3>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Nom complet</p>
                <p className="mt-1">{participant.prenom} {participant.nom}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{participant.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="mt-1">{participant.telephone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Profession</p>
                <p className="mt-1">{participant.profession || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Date de naissance</p>
                <p className="mt-1">{formatDate(participant.date_naissance)}</p>
              </div>
            </div>
            
            {/* Liens et réseaux sociaux */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Site web et réseaux sociaux
              </h3>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Site web</p>
                {participant.site_web ? (
                  <a 
                    href={participant.site_web} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-1 text-blue-600 hover:text-blue-800 block"
                  >
                    {participant.site_web}
                  </a>
                ) : (
                  <p className="mt-1">-</p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                {participant.url_linkedin ? (
                  <a 
                    href={participant.url_linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-1 text-blue-600 hover:text-blue-800 block"
                  >
                    {participant.url_linkedin}
                  </a>
                ) : (
                  <p className="mt-1">-</p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Facebook</p>
                {participant.url_facebook ? (
                  <a 
                    href={participant.url_facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-1 text-blue-600 hover:text-blue-800 block"
                  >
                    {participant.url_facebook}
                  </a>
                ) : (
                  <p className="mt-1">-</p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Twitter/X</p>
                {participant.url_twitter ? (
                  <a 
                    href={participant.url_twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-1 text-blue-600 hover:text-blue-800 block"
                  >
                    {participant.url_twitter}
                  </a>
                ) : (
                  <p className="mt-1">-</p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Instagram</p>
                {participant.url_instagram ? (
                  <a 
                    href={participant.url_instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-1 text-blue-600 hover:text-blue-800 block"
                  >
                    {participant.url_instagram}
                  </a>
                ) : (
                  <p className="mt-1">-</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Informations événement */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
              Informations d'inscription
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Événement</p>
                {participant.evenement ? (
                  <Link 
                    href={`/admin/evenements/${participant.evenement.id}`}
                    className="mt-1 text-blue-600 hover:text-blue-800 block"
                  >
                    {participant.evenement.nom}
                  </Link>
                ) : (
                  <p className="mt-1">-</p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Date d'inscription</p>
                <p className="mt-1">{formatDateTime(participant.created_at)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Statut Check-in</p>
                {participant.checked_in ? (
                  <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Enregistré
                  </span>
                ) : (
                  <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Non enregistré
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
            <Link 
              href={`/ticket/${participant.id}`}
              target="_blank"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Voir le billet
            </Link>
            
            <Link 
              href={`/admin/evenements/${participant.evenement_id}?editParticipant=${participant.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
