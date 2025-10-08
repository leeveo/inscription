// src/app/inscription/[evenementId]/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, User, Mail, CheckCircle } from 'lucide-react'

interface Evenement {
  id: string
  nom: string
  description: string
  date_debut: string
  date_fin: string
  lieu: string
  places_disponibles: number
  prix: number
}

interface UserProfile {
  id: string
  email: string
  nom?: string
  prenom?: string
}

export default function InscriptionPage() {
  const router = useRouter()
  const { evenementId } = useParams()
  const { handleSubmit } = useForm()
  const [evenement, setEvenement] = useState<Evenement | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = supabaseBrowser()
      
      // Récupérer l'utilisateur
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          nom: authUser.user_metadata?.nom,
          prenom: authUser.user_metadata?.prenom
        })
      }

      // Récupérer l'événement
      const { data: evenementData } = await supabase
        .from('inscription_evenements')
        .select('*')
        .eq('id', evenementId)
        .single()

      if (evenementData) {
        setEvenement(evenementData as unknown as Evenement)
      }

      setLoading(false)
    }

    fetchData()
  }, [evenementId])

  const onSubmit = async () => {
    if (!user || !evenement) return
    
    setSubmitting(true)
    const supabase = supabaseBrowser()

    const { error } = await (supabase as any)
      .from('inscription_inscriptions')
      .insert({
        utilisateur_id: user.id,
        evenement_id: evenementId,
        statut: 'en_attente',
      })

    setSubmitting(false)
    if (!error) router.push(`/inscription/${evenementId}/confirmation`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!evenement || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Événement non trouvé</h2>
          <p className="text-gray-600">L'événement que vous cherchez n'existe pas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Inscription à l'événement</h1>
          <p className="text-gray-600">Confirmez votre participation en quelques clics</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Informations de l'événement */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-3 text-indigo-600" />
              Détails de l'événement
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{evenement.nom}</h3>
                <p className="text-gray-600 leading-relaxed">{evenement.description}</p>
              </div>

              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                <div>
                  <p className="font-medium">Début: {formatDate(evenement.date_debut)}</p>
                  <p className="font-medium">Fin: {formatDate(evenement.date_fin)}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-indigo-600" />
                <span className="font-medium">{evenement.lieu}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-3 text-indigo-600" />
                <span className="font-medium">{evenement.places_disponibles} places disponibles</span>
              </div>

              {evenement.prix > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-lg font-bold text-indigo-700">
                    Prix: {evenement.prix}€
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Informations utilisateur et confirmation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="mr-3 text-indigo-600" />
              Vos informations
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-3 text-indigo-600" />
                <span className="font-medium">{user.email}</span>
              </div>
              
              {(user.nom || user.prenom) && (
                <div className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-3 text-indigo-600" />
                  <span className="font-medium">
                    {user.prenom} {user.nom}
                  </span>
                </div>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Récapitulatif de votre inscription</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Événement: {evenement.nom}</li>
                <li>• Date: {new Date(evenement.date_debut).toLocaleDateString('fr-FR')}</li>
                <li>• Lieu: {evenement.lieu}</li>
                <li>• Statut: En attente de confirmation</li>
              </ul>
            </div>

            {/* Bouton d'inscription */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <button 
                type="submit" 
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
                  submitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmer mon inscription
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              En vous inscrivant, vous acceptez de recevoir des notifications concernant cet événement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
