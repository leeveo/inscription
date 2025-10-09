'use client'

import React, { useState, useEffect } from 'react'
import { useNode } from '@craftjs/core'
import { supabaseBrowser } from '@/lib/supabase/client'

// Composant JaugeSession pour afficher la progression
const JaugeSession = ({
  participantsInscrits,
  maxParticipants,
  pourcentageRemplissage,
  isComplet
}: {
  participantsInscrits: number
  maxParticipants: number | null
  pourcentageRemplissage: number
  isComplet: boolean
}) => {
  if (!maxParticipants) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>🎫</span>
        <span>{participantsInscrits} participant(s)</span>
        <span className="text-xs">• Places illimitées</span>
      </div>
    )
  }

  const getJaugeColor = () => {
    if (isComplet) return 'bg-red-500'
    if (pourcentageRemplissage >= 80) return 'bg-orange-500'
    if (pourcentageRemplissage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getJaugeTextColor = () => {
    if (isComplet) return 'text-red-600'
    if (pourcentageRemplissage >= 80) return 'text-orange-600'
    if (pourcentageRemplissage >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-2">
      {/* Barre de progression */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              {participantsInscrits} / {maxParticipants}
            </span>
            <span className={`text-xs font-medium ${getJaugeTextColor()}`}>
              {pourcentageRemplissage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getJaugeColor()}`}
              style={{ width: `${Math.min(pourcentageRemplissage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Messages d'état */}
      {isComplet && (
        <div className="flex items-center space-x-2 text-sm text-red-600 font-medium">
          <span>🚫</span>
          <span>Session complète</span>
        </div>
      )}
      {pourcentageRemplissage >= 80 && !isComplet && (
        <div className="flex items-center space-x-2 text-sm text-orange-600">
          <span>⚠️</span>
          <span>Plus que {maxParticipants - participantsInscrits} places disponibles</span>
        </div>
      )}
      {pourcentageRemplissage < 80 && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <span>✅</span>
          <span>{maxParticipants - participantsInscrits} places disponibles</span>
        </div>
      )}
    </div>
  )
}

interface Session {
  id: number
  titre: string
  description?: string
  date: string
  heure_debut: string
  heure_fin: string
  intervenant?: string
  lieu?: string
  type?: string
  max_participants?: number | null
  participants_inscrits?: number
  places_restantes?: number | null
  pourcentage_remplissage?: number
  is_complet?: boolean
  has_capacity?: boolean
}

interface Event {
  id: string
  nom: string
  description?: string
  lieu?: string
  date_debut: string
  date_fin: string
  statut: string
  type_evenement?: string
  created_at: string
}

// Interface pour la gestion responsive des largeurs
export interface ResponsiveWidth {
  mobile?: string;   // < 640px (sm breakpoint)
  tablet?: string;   // 640px - 1024px (md breakpoint) 
  desktop?: string;  // > 1024px (lg breakpoint)
}

interface DesignFormProps {
  eventId?: string
  formTemplate?: 'modern' | 'classic' | 'minimal' | 'elegant' | 'creative' | 'corporate' | 'tech'
  fontFamily?: string
  primaryColor?: string
  backgroundColor?: string
  titleColor?: string
  title?: string
  description?: string
  submitButtonText?: string
  // Champs obligatoires (toujours présents)
  showNom?: boolean
  showPrenom?: boolean
  showEmail?: boolean
  // Champs optionnels configurables
  showTelephone?: boolean
  showEntreprise?: boolean
  showProfession?: boolean
  showSiteWeb?: boolean
  showDateNaissance?: boolean
  showUrlLinkedin?: boolean
  showUrlFacebook?: boolean
  showUrlTwitter?: boolean
  showUrlInstagram?: boolean
  showMessage?: boolean
  // Options d'affichage existantes
  showSessions?: boolean
  showSocialMedia?: boolean
  // Nouveau système responsive
  responsiveWidth?: ResponsiveWidth | string; // Compatibilité avec ancien système
  horizontalAlign?: string
}

export const DesignForm = ({
  eventId = '',
  formTemplate = 'modern',
  fontFamily = 'Inter, sans-serif',
  primaryColor = '#3B82F6',
  backgroundColor = '#FFFFFF',
  titleColor = '#1F2937',
  title = "Formulaire d'inscription",
  description = "Remplissez ce formulaire pour vous inscrire à l'événement",
  submitButtonText = "S'inscrire à l'événement",
  // Champs obligatoires (par défaut activés)
  showNom = true,
  showPrenom = true,
  showEmail = true,
  // Champs optionnels (par défaut désactivés)
  showTelephone = true,
  showEntreprise = false,
  showProfession = true,
  showSiteWeb = false,
  showDateNaissance = false,
  showUrlLinkedin = false,
  showUrlFacebook = false,
  showUrlTwitter = false,
  showUrlInstagram = false,
  showMessage = true,
  // Options d'affichage existantes
  showSessions = true,
  showSocialMedia = false,
  responsiveWidth = '100%',
  horizontalAlign = 'left',
}: DesignFormProps) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // États pour la gestion du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    profession: '',
    siteWeb: '',
    dateNaissance: '',
    urlLinkedin: '',
    urlFacebook: '',
    urlTwitter: '',
    urlInstagram: '',
    message: '',
    consent: false,
    selectedSessions: [] as number[]
  })

  // Log initialisation du composant
  useEffect(() => {
    console.log('🎨 DesignForm initialisé avec les props:', {
      eventId,
      formTemplate,
      showSessions,
      showSocialMedia
    })
  }, [])

  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  // Handlers pour les changements du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSessionChange = (sessionId: number, checked: boolean) => {
    console.log(`🔄 Session ${sessionId} ${checked ? 'ajoutée' : 'retirée'} des sélections`)
    setFormData(prev => ({
      ...prev,
      selectedSessions: checked
        ? [...prev.selectedSessions, sessionId]
        : prev.selectedSessions.filter(id => id !== sessionId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🚀 Début de la soumission du DesignForm')
    console.log('📋 Données du formulaire:', formData)
    console.log('🎯 Événement ID:', eventId)

    if (!eventId) {
      console.log('❌ Aucun événement ID fourni')
      setSubmitStatus('error')
      setSubmitMessage('Configuration de l\'événement manquante')
      return
    }

    // Validation basique
    if ((showNom && !formData.nom) || (showPrenom && !formData.prenom) || (showEmail && !formData.email)) {
      console.log('❌ Champs obligatoires manquants')
      setSubmitStatus('error')
      setSubmitMessage('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Validation du téléphone (obligatoire dans la base de données)
    if (!formData.telephone) {
      console.log('❌ Le téléphone est obligatoire')
      setSubmitStatus('error')
      setSubmitMessage('Le numéro de téléphone est obligatoire')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const supabase = supabaseBrowser()
      console.log('🔌 Client Supabase initialisé')

      // Vérifier si un participant existe déjà avec cet email pour cet événement
      const { data: existingParticipant, error: participantCheckError } = await supabase
        .from('inscription_participants')
        .select('*')
        .eq('evenement_id', eventId)
        .eq('email', formData.email.trim())
        .single()

      let newParticipant

      if (participantCheckError && participantCheckError.code === 'PGRST116') {
        // Aucun participant existant, en créer un nouveau
        console.log('👤 Aucun participant existant, création d\'un nouveau participant')

        const participantData = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone.trim() || 'Non spécifié',
          profession: formData.profession || null,
          site_web: formData.siteWeb || null,
          date_naissance: formData.dateNaissance || null,
          url_linkedin: formData.urlLinkedin || null,
          url_facebook: formData.urlFacebook || null,
          url_twitter: formData.urlTwitter || null,
          url_instagram: formData.urlInstagram || null,
          evenement_id: eventId
        }

        console.log('👤 Données du participant à insérer:', participantData)

        const { data: createdParticipant, error: participantError } = await supabase
          .from('inscription_participants')
          .insert(participantData)
          .select()
          .single()

        if (participantError) {
          console.error('❌ Erreur lors de la création du participant:', participantError)
          throw participantError
        }

        newParticipant = createdParticipant
        console.log('✅ Participant créé avec succès:', newParticipant)
      } else if (existingParticipant) {
        // Un participant existe déjà, l'utiliser
        newParticipant = existingParticipant
        console.log('✅ Participant existant réutilisé:', newParticipant)

        // Mettre à jour les informations si elles sont différentes
        const participantData = {
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone.trim() || 'Non spécifié',
          profession: formData.profession || null,
          site_web: formData.siteWeb || null,
          date_naissance: formData.dateNaissance || null,
          url_linkedin: formData.urlLinkedin || null,
          url_facebook: formData.urlFacebook || null,
          url_twitter: formData.urlTwitter || null,
          url_instagram: formData.urlInstagram || null,
        }

        const { error: updateError } = await supabase
          .from('inscription_participants')
          .update(participantData)
          .eq('id', existingParticipant.id)

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du participant:', updateError)
        } else {
          console.log('✅ Participant mis à jour avec succès')
        }
      } else if (participantCheckError) {
        console.error('❌ Erreur lors de la vérification du participant:', participantCheckError)
        throw participantCheckError
      }

      // Vérifier si un token existe déjà pour ce participant et cet événement
      const { data: existingToken, error: tokenCheckError } = await supabase
        .from('inscription_participant_qr_tokens')
        .select('*')
        .eq('participant_id', newParticipant.id)
        .eq('evenement_id', eventId)
        .eq('is_active', true)
        .single()

      let token = ''

      if (tokenCheckError && tokenCheckError.code === 'PGRST116') {
        // Aucun token trouvé, en créer un nouveau
        token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        console.log('🎟️ Token QR généré:', token)

        const { error: tokenError } = await supabase
          .from('inscription_participant_qr_tokens')
          .insert({
            participant_id: newParticipant.id,
            evenement_id: eventId,
            qr_token: token,
            ticket_url: `${window.location.origin}/ticket/${newParticipant.id}`,
            is_active: true
          })

        if (tokenError) {
          console.error('❌ Erreur lors de la création du token QR:', tokenError)
          throw tokenError
        }

        console.log('✅ Token QR créé avec succès')
      } else if (existingToken) {
        // Un token existe déjà, l'utiliser
        token = existingToken.qr_token
        console.log('🎟️ Token QR existant réutilisé:', token)
      } else if (tokenCheckError) {
        console.error('❌ Erreur lors de la vérification du token:', tokenCheckError)
        throw tokenCheckError
      }

      // Inscrire aux sessions si sélectionnées
      if (formData.selectedSessions.length > 0) {
        console.log('📚 Sessions sélectionnées:', formData.selectedSessions)

        // Vérifier que les sessions sélectionnées ont encore de la place
        const sessionsToEnroll = formData.selectedSessions.filter(sessionId => {
          const session = sessions.find(s => s.id === sessionId)
          return session && !session.is_complet && session.has_capacity
        })

        if (sessionsToEnroll.length === 0) {
          console.log('⚠️ Aucune des sessions sélectionnées n\'a de place disponible')
          setSubmitStatus('error')
          setSubmitMessage('Les sessions sélectionnées sont complètes. Veuillez choisir d\'autres sessions.')
          return
        }

        if (sessionsToEnroll.length < formData.selectedSessions.length) {
          const fullSessions = formData.selectedSessions.filter(sessionId => {
            const session = sessions.find(s => s.id === sessionId)
            return session && (session.is_complet || !session.has_capacity)
          })
          console.log('⚠️ Sessions complètes ignorées:', fullSessions)
        }

        // Vérifier les inscriptions existantes pour éviter les doublons
        const { data: existingEnrollments, error: enrollmentCheckError } = await supabase
          .from('inscription_session_participants')
          .select('session_id')
          .eq('participant_id', newParticipant.id)
          .in('session_id', sessionsToEnroll)

        if (enrollmentCheckError) {
          console.error('❌ Erreur lors de la vérification des inscriptions:', enrollmentCheckError)
        }

        const existingSessionIds = existingEnrollments?.map(e => e.session_id) || []
        const newSessionIds = sessionsToEnroll.filter(sessionId => !existingSessionIds.includes(sessionId))

        if (newSessionIds.length > 0) {
          const sessionEnrollments = newSessionIds.map(sessionId => ({
            session_id: sessionId,
            participant_id: newParticipant.id
          }))

          console.log('📝 Nouvelles inscriptions aux sessions à créer:', sessionEnrollments)

          const { error: sessionError } = await supabase
            .from('inscription_session_participants')
            .insert(sessionEnrollments)

          if (sessionError) {
            console.error('❌ Erreur lors de l\'inscription aux sessions:', sessionError)
            throw sessionError
          }

          console.log('✅ Nouvelles inscriptions aux sessions créées avec succès')
        } else {
          console.log('ℹ️ Toutes les sessions disponibles sont déjà inscrites')
        }
      } else {
        console.log('ℹ️ Aucune session sélectionnée')
      }

      console.log('🎉 Soumission DesignForm terminée avec succès!')

      // Envoyer un email de confirmation si c'est un nouveau participant
      if (participantCheckError && participantCheckError.code === 'PGRST116') {
        console.log('📧 Envoi de l\'email de confirmation...')

        try {
          const emailResponse = await fetch('/api/send-inscription-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventId: eventId,
              participantData: {
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                telephone: formData.telephone,
                profession: formData.profession
              }
            })
          });

          if (emailResponse.ok) {
            console.log('✅ Email de confirmation envoyé avec succès')
            setSubmitStatus('success')
            setSubmitMessage('Inscription réussie ! Vous recevrez un email de confirmation.')
          } else {
            const emailError = await emailResponse.json();
            console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
            setSubmitStatus('success')
            setSubmitMessage('Inscription réussie ! (Un problème technique a empêché l\'envoi de l\'email de confirmation)')
          }
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
          setSubmitStatus('success')
          setSubmitMessage('Inscription réussie ! (Un problème technique a empêché l\'envoi de l\'email de confirmation)')
        }
      } else {
        setSubmitStatus('success')
        setSubmitMessage('Vos informations ont été mises à jour avec succès !')
      }

      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        entreprise: '',
        profession: '',
        siteWeb: '',
        dateNaissance: '',
        urlLinkedin: '',
        urlFacebook: '',
        urlTwitter: '',
        urlInstagram: '',
        message: '',
        consent: false,
        selectedSessions: []
      })

    } catch (error) {
      console.error('💥 Erreur lors de la soumission DesignForm:', error)
      setSubmitStatus('error')
      setSubmitMessage(`Une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Charger les sessions depuis l'API avec les stats de capacité
  useEffect(() => {
    const fetchSessions = async () => {
      if (!eventId || !showSessions) return

      setLoadingSessions(true)
      try {
        console.log(`📚 Chargement des sessions avec stats pour l'événement ${eventId}...`)
        const supabase = supabaseBrowser()

        // D'abord récupérer les sessions de base
        const { data: basicSessions, error: basicError } = await supabase
          .from('inscription_sessions')
          .select('*')
          .eq('evenement_id', eventId)
          .order('date', { ascending: true })
          .order('heure_debut', { ascending: true })

        if (basicError) {
          console.error('❌ Erreur lors de la requête des sessions:', basicError)
          throw basicError
        }

        // Calculer les statistiques de participants pour chaque session
        const sessionIds = basicSessions?.map(s => s.id) || []

        if (sessionIds.length === 0) {
          console.log('ℹ️ Aucune session trouvée pour cet événement')
          setSessions([])
          return
        }

        console.log('📊 Session IDs à analyser:', sessionIds)

        // Récupérer tous les participants aux sessions pour cet événement
        const { data: allSessionParticipants, error: participantsError } = await supabase
          .from('inscription_session_participants')
          .select('session_id, participant_id')
          .in('session_id', sessionIds)

        if (participantsError) {
          console.error('❌ Erreur lors de la récupération des participants:', participantsError)
        } else {
          console.log('📈 Participants aux sessions récupérés:', allSessionParticipants)
        }

        // Compter les participants par session côté client
        const participantCountMap = new Map()
        sessionIds.forEach(sessionId => {
          const count = allSessionParticipants?.filter(p => p.session_id === sessionId).length || 0
          participantCountMap.set(sessionId, count)
        })

        console.log('📊 Comptage participants par session:', Object.fromEntries(participantCountMap))

        // Enrichir les sessions avec les statistiques calculées
        const enrichedSessions = basicSessions?.map(session => {
          const participantsInscrits = participantCountMap.get(session.id) || 0
          const maxParticipants = session.max_participants

          // Calculs
          const placesRestantes = maxParticipants ? Math.max(0, maxParticipants - participantsInscrits) : null
          const pourcentageRemplissage = maxParticipants ? Math.round((participantsInscrits / maxParticipants) * 100) : 0
          const isComplet = maxParticipants ? participantsInscrits >= maxParticipants : false
          const hasCapacity = !isComplet

          console.log(`📊 Session ${session.id} (${session.titre}): ${participantsInscrits}/${maxParticipants || '∞'} places - ${pourcentageRemplissage}% rempli - ${isComplet ? '❌ COMPLÈTE' : '✅ DISPONIBLE'}`)

          return {
            id: session.id,
            titre: session.titre,
            description: session.description,
            date: session.date,
            heure_debut: session.heure_debut,
            heure_fin: session.heure_fin,
            intervenant: session.intervenant,
            lieu: session.lieu,
            type: session.type,
            max_participants: maxParticipants,
            participants_inscrits: participantsInscrits,
            places_restantes: placesRestantes,
            pourcentage_remplissage: pourcentageRemplissage,
            is_complet: isComplet,
            has_capacity: hasCapacity
          }
        }) || []

        console.log(`✅ ${enrichedSessions.length} sessions enrichies avec stats calculées:`, enrichedSessions)
        setSessions(enrichedSessions)
      } catch (error) {
        console.error('💥 Erreur lors du chargement des sessions:', error)
      } finally {
        setLoadingSessions(false)
      }
    }

    fetchSessions()
  }, [eventId, showSessions])

  const getTemplateStyles = () => {
    switch (formTemplate) {
      case 'modern':
        return {
          container: 'bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border border-gray-100',
          form: 'bg-white rounded-xl shadow-lg p-6',
          title: 'text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
          input: 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
          button: 'w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105'
        }
      case 'classic':
        return {
          container: 'bg-white border-2 border-gray-300 rounded-lg shadow-md p-8',
          form: 'space-y-6',
          title: 'text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2',
          input: 'w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500',
          button: 'w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors'
        }
      case 'minimal':
        return {
          container: 'bg-gray-50 rounded-lg p-6',
          form: 'space-y-4',
          title: 'text-xl font-light text-gray-900 mb-4',
          input: 'w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 rounded-none',
          button: 'w-full text-left px-0 py-2 text-blue-600 hover:text-blue-700 border-b-2 border-blue-600 hover:border-blue-700 rounded-none bg-transparent'
        }
      case 'elegant':
        return {
          container: 'bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl p-12',
          form: 'bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20',
          title: 'text-4xl font-light text-white mb-2',
          description: 'text-gray-200 mb-8',
          input: 'w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
          button: 'w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-all'
        }
      case 'creative':
        return {
          container: 'bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 rounded-3xl shadow-2xl p-10 relative overflow-hidden',
          form: 'relative bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-purple-200',
          title: 'text-4xl font-black text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent transform -rotate-2',
          input: 'w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all',
          button: 'w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 px-8 rounded-full font-bold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg'
        }
      case 'corporate':
        return {
          container: 'bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-xl p-12 border-l-8 border-blue-600',
          form: 'bg-white rounded-lg shadow-lg p-8 border border-gray-200',
          title: 'text-3xl font-bold text-gray-900 mb-2 text-left uppercase tracking-wider',
          input: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50',
          button: 'w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-md'
        }
      case 'tech':
        return {
          container: 'bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 rounded-2xl shadow-2xl p-10 border border-cyan-500 border-opacity-30',
          form: 'bg-gray-900 bg-opacity-90 backdrop-blur rounded-xl p-8 border border-cyan-500 border-opacity-50 shadow-2xl',
          title: 'text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono uppercase tracking-wider',
          input: 'w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all',
          button: 'w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold font-mono uppercase tracking-wider hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg border-2 border-cyan-400'
        }
      default:
        return {
          container: 'bg-white rounded-lg shadow-lg p-6',
          form: 'space-y-4',
          title: 'text-2xl font-bold text-gray-900',
          input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
          button: 'w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700'
        }
    }
  }

  const styles = getTemplateStyles()

  // Fonction utilitaire pour générer les classes Tailwind responsives
  const generateResponsiveWidthClasses = (responsiveWidth: ResponsiveWidth | string | undefined): string => {
    // Si c'est une string (compatibilité avec l'ancien système)
    if (typeof responsiveWidth === 'string') {
      return getWidthClass(responsiveWidth);
    }
    
    // Si c'est un objet responsive
    if (responsiveWidth && typeof responsiveWidth === 'object') {
      const classes: string[] = [];
      
      // Largeur mobile (base)
      if (responsiveWidth.mobile) {
        classes.push(getWidthClass(responsiveWidth.mobile));
      }
      
      // Largeur tablette (sm: breakpoint)
      if (responsiveWidth.tablet) {
        classes.push(`sm:${getWidthClass(responsiveWidth.tablet)}`);
      }
      
      // Largeur desktop (lg: breakpoint)  
      if (responsiveWidth.desktop) {
        classes.push(`lg:${getWidthClass(responsiveWidth.desktop)}`);
      }
      
      return classes.join(' ');
    }
    
    // Valeur par défaut
    return 'w-full';
  };

  // Fonction pour convertir les valeurs de largeur en classes Tailwind
  const getWidthClass = (width: string): string => {
    switch (width) {
      case '100%':
        return 'w-full';
      case '75%':
        return 'w-3/4';
      case '66.66%':
        return 'w-2/3';
      case '50%':
        return 'w-1/2';
      case '33.33%':
        return 'w-1/3';
      case '25%':
        return 'w-1/4';
      case 'auto':
        return 'w-auto';
      default:
        // Pour les valeurs personnalisées, on utilise w-full par défaut
        return 'w-full';
    }
  };

  const getHorizontalAlignClasses = (align: string) => {
    switch (align) {
      case 'center':
        return 'mx-auto';
      case 'right':
        return 'ml-auto mr-0';
      case 'left':
      default:
        return 'ml-0 mr-0';
    }
  };

  // Générer les classes responsives
  const widthClasses = generateResponsiveWidthClasses(responsiveWidth);
  
  // Classes responsives combinées avec la nouvelle approche
  const responsiveClasses = `${widthClasses} ${getHorizontalAlignClasses(horizontalAlign || 'left')}`;

  // Formater les sessions pour l'affichage
  const formatSessionForDisplay = (session: Session) => {
    const date = new Date(session.date)
    const formattedDate = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    return `${session.titre} - ${formattedDate} de ${session.heure_debut} à ${session.heure_fin}${session.lieu ? ` - ${session.lieu}` : ''}${session.intervenant ? ` - ${session.intervenant}` : ''}`
  }

  const renderForm = () => (
    <div className={styles.form}>
      <div className="mb-6">
        <h2
          className={`${styles.title} ${formTemplate === 'elegant' ? 'mb-2' : 'mb-4'}`}
          style={{
            fontFamily,
            color: formTemplate === 'creative' || formTemplate === 'modern' || formTemplate === 'tech' ? undefined : titleColor
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`${formTemplate === 'elegant' ? styles.description : 'text-gray-600'}`}
            style={{ fontFamily }}
          >
            {description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className={formTemplate === 'classic' ? 'space-y-6' : 'space-y-4'}>
        {/* Champs obligatoires : Nom et Prénom */}
        {(showNom || showPrenom) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showNom && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Votre nom"
                />
              </div>
            )}
            {showPrenom && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Votre prénom"
                />
              </div>
            )}
          </div>
        )}

        {/* Email (obligatoire si activé) */}
        {showEmail && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={styles.input}
              style={{ fontFamily }}
              placeholder="votre@email.com"
            />
          </div>
        )}

        {/* Champs optionnels en grille */}
        {(showTelephone || showEntreprise) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showTelephone && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            )}
            {showEntreprise && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Entreprise
                </label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleInputChange}
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Nom de votre entreprise"
                />
              </div>
            )}
          </div>
        )}

        {/* Profession et Site Web */}
        {(showProfession || showSiteWeb) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showProfession && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Votre profession"
                />
              </div>
            )}
            {showSiteWeb && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Site Web
                </label>
                <input
                  type="url"
                  name="siteWeb"
                  value={formData.siteWeb}
                  onChange={handleInputChange}
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="https://votre-site.com"
                />
              </div>
            )}
          </div>
        )}

        {/* Date de naissance */}
        {showDateNaissance && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Date de naissance
            </label>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleInputChange}
              className={styles.input}
              style={{ fontFamily }}
            />
          </div>
        )}

        {/* Sessions (si activé) */}
        {showSessions && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Sessions souhaitées
            </label>
            <div className="space-y-2">
              {loadingSessions ? (
                <div className={`text-sm ${formTemplate === 'elegant' ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontFamily }}>
                  Chargement des sessions...
                </div>
              ) : sessions.length > 0 ? (
                sessions.map((session) => {
                  const isDisabled = session.is_complet || !session.has_capacity
                  return (
                    <div key={session.id} className={`border rounded-lg p-3 space-y-2 ${
                      isDisabled ? 'border-gray-300 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
                    }`}>
                      <label className={`flex items-start ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          className="mr-2 mt-1"
                          checked={formData.selectedSessions.includes(session.id)}
                          onChange={(e) => handleSessionChange(session.id, e.target.checked)}
                          disabled={isDisabled}
                        />
                        <div className="flex-1">
                          <span className={`${formTemplate === 'elegant' ? 'text-gray-200' : ''} ${
                            isDisabled ? 'text-gray-500' : ''
                          }`} style={{ fontFamily }}>
                            {formatSessionForDisplay(session)}
                          </span>

                          {/* Jauge de remplissage */}
                          <JaugeSession
                            participantsInscrits={session.participants_inscrits || 0}
                            maxParticipants={session.max_participants}
                            pourcentageRemplissage={session.pourcentage_remplissage || 0}
                            isComplet={session.is_complet || false}
                          />
                        </div>
                      </label>

                      {/* Indicateur visuel pour les sessions complètes */}
                      {isDisabled && (
                        <div className="text-xs text-red-600 font-medium text-center bg-red-50 rounded py-1">
                          {session.is_complet ? '⛔ Session complète - Plus de places disponibles' : '❌ Session non disponible'}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : eventId ? (
                <div className={`text-sm ${formTemplate === 'elegant' ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontFamily }}>
                  Aucune session disponible pour cet événement
                </div>
              ) : (
                <div className={`text-sm ${formTemplate === 'elegant' ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontFamily }}>
                  Veuillez spécifier un ID d'événement pour afficher les sessions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Réseaux sociaux configurables */}
        {(showUrlLinkedin || showUrlFacebook || showUrlTwitter || showUrlInstagram) && (
          <div>
            <h4 className={`text-sm font-medium mb-3 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Réseaux sociaux
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showUrlLinkedin && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="urlLinkedin"
                    value={formData.urlLinkedin}
                    onChange={handleInputChange}
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://linkedin.com/in/votre-profil"
                  />
                </div>
              )}
              {showUrlFacebook && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="urlFacebook"
                    value={formData.urlFacebook}
                    onChange={handleInputChange}
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://facebook.com/votre-profil"
                  />
                </div>
              )}
              {showUrlTwitter && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    name="urlTwitter"
                    value={formData.urlTwitter}
                    onChange={handleInputChange}
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://twitter.com/votre-compte"
                  />
                </div>
              )}
              {showUrlInstagram && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="urlInstagram"
                    value={formData.urlInstagram}
                    onChange={handleInputChange}
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://instagram.com/votre-compte"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message (optionnel et configurable) */}
        {showMessage && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Message (optionnel)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              className={styles.input}
              style={{ fontFamily }}
              placeholder="Un message ou une question..."
            />
          </div>
        )}

        {/* Messages de statut */}
        {submitStatus !== 'idle' && (
          <div className={`p-4 rounded-lg ${
            submitStatus === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <p>{submitMessage}</p>
          </div>
        )}

        {/* Case à cocher */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleInputChange}
            id="consent"
            className="mr-2"
            required
          />
          <label htmlFor="consent" className={`text-sm ${
            formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-600'
          }`} style={{ fontFamily }}>
            J'accepte les conditions d'utilisation et la politique de confidentialité *
          </label>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${styles.button} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ fontFamily }}
          >
            {isSubmitting ? 'Inscription en cours...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`relative my-4 ${responsiveClasses}`}
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          🎨 Formulaire Design {selected && '• Sélectionné'}
        </div>
      )}

      <div className={styles.container}>
        {renderForm()}
      </div>
    </div>
  );
};

// Settings component
export const DesignFormSettings = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const {
    actions: { setProp },
    id,
    eventId,
    formTemplate,
    fontFamily,
    primaryColor,
    backgroundColor,
    titleColor,
    title,
    description,
    submitButtonText,
    showNom,
    showPrenom,
    showEmail,
    showTelephone,
    showEntreprise,
    showProfession,
    showSiteWeb,
    showDateNaissance,
    showUrlLinkedin,
    showUrlFacebook,
    showUrlTwitter,
    showUrlInstagram,
    showMessage,
    showSessions,
    showSocialMedia,
    responsiveWidth,
    horizontalAlign,
  } = useNode((node) => ({
    id: node.id,
    eventId: node.data.props.eventId,
    formTemplate: node.data.props.formTemplate,
    fontFamily: node.data.props.fontFamily,
    primaryColor: node.data.props.primaryColor,
    backgroundColor: node.data.props.backgroundColor,
    titleColor: node.data.props.titleColor,
    title: node.data.props.title,
    description: node.data.props.description,
    submitButtonText: node.data.props.submitButtonText,
    showNom: node.data.props.showNom,
    showPrenom: node.data.props.showPrenom,
    showEmail: node.data.props.showEmail,
    showTelephone: node.data.props.showTelephone,
    showEntreprise: node.data.props.showEntreprise,
    showProfession: node.data.props.showProfession,
    showSiteWeb: node.data.props.showSiteWeb,
    showDateNaissance: node.data.props.showDateNaissance,
    showUrlLinkedin: node.data.props.showUrlLinkedin,
    showUrlFacebook: node.data.props.showUrlFacebook,
    showUrlTwitter: node.data.props.showUrlTwitter,
    showUrlInstagram: node.data.props.showUrlInstagram,
    showMessage: node.data.props.showMessage,
    showSessions: node.data.props.showSessions,
    showSocialMedia: node.data.props.showSocialMedia,
    responsiveWidth: node.data.props.responsiveWidth,
    horizontalAlign: node.data.props.horizontalAlign,
  }));



  // Charger les événements depuis l'API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error)
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [])

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Template Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-1">🎨 Formulaire Design</p>
        <p className="text-xs text-blue-700">
          Sélectionnez parmi 7 templates différents et personnalisez tous les aspects du formulaire.
        </p>
      </div>

      {/* Event Configuration */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">📅 Configuration Événement</h4>
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">
            Sélectionner l'événement
          </label>
          {loadingEvents ? (
            <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm text-yellow-600">
              Chargement des événements...
            </div>
          ) : events.length > 0 ? (
            <select
              value={eventId || ''}
              onChange={(e) => setProp((props: DesignFormProps) => (props.eventId = e.target.value))}
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm"
            >
              <option value="">Sélectionner un événement...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.nom} - {formatDate(event.date_debut)}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm text-yellow-600">
              Aucun événement trouvé
            </div>
          )}
          <p className="text-xs text-yellow-600 mt-1">
            Sélectionnez l'événement pour charger les sessions réelles depuis la base de données.
          </p>
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Template</h4>
        <select
          value={formTemplate || 'modern'}
          onChange={(e) => setProp((props: DesignFormProps) => (props.formTemplate = e.target.value as DesignFormProps['formTemplate']))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="modern">Moderne</option>
          <option value="classic">Classique</option>
          <option value="minimal">Minimal</option>
          <option value="elegant">Élégant</option>
          <option value="creative">Créatif</option>
          <option value="corporate">Entreprise</option>
          <option value="tech">Tech</option>
        </select>
      </div>

      {/* Content */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contenu</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du formulaire
            </label>
            <input
              type="text"
              value={title || "Formulaire d'inscription"}
              onChange={(e) => setProp((props: DesignFormProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du titre
            </label>
            <input
              type="color"
              value={titleColor || '#1F2937'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.titleColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description || "Remplissez ce formulaire pour vous inscrire à l'événement"}
              onChange={(e) => setProp((props: DesignFormProps) => (props.description = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={submitButtonText || "S'inscrire à l'événement"}
              onChange={(e) => setProp((props: DesignFormProps) => (props.submitButtonText = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Style Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Style</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Police de caractères
            </label>
            <select
              value={fontFamily || 'Inter, sans-serif'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.fontFamily = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Poppins, sans-serif">Poppins</option>
              <option value="Playfair Display, serif">Playfair Display</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Lato, sans-serif">Lato</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Raleway, sans-serif">Raleway</option>
              <option value="Ubuntu, sans-serif">Ubuntu</option>
              <option value="Bebas Neue, cursive">Bebas Neue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur principale
            </label>
            <input
              type="color"
              value={primaryColor || '#3B82F6'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.primaryColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de fond
            </label>
            <input
              type="color"
              value={backgroundColor || '#FFFFFF'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.backgroundColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Width and Alignment - Version Responsive */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">📱 Largeur responsive du formulaire</h4>
        
        {/* Presets responsives */}
        <div className="space-y-3 mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2">Presets adaptatifs :</div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setProp((props: DesignFormProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '100%', 
                  desktop: '100%'
                };
              })}
              className="px-3 py-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              📱 Pleine largeur sur tous écrans
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 100% • Desktop: 100%</div>
            </button>
            
            <button
              onClick={() => setProp((props: DesignFormProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '75%',
                  desktop: '66.66%'
                };
              })}
              className="px-3 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              📱💻 Adaptatif recommandé
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 75% • Desktop: 2/3</div>
            </button>
            
            <button
              onClick={() => setProp((props: DesignFormProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '66.66%',
                  desktop: '50%'
                };
                props.horizontalAlign = 'center'; // 🎯 Ajout de l'alignement center
              })}
              className="px-3 py-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              🎯 Centré progressif
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 2/3 • Desktop: 50% (centré)</div>
            </button>
            
            <button
              onClick={() => setProp((props: DesignFormProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '50%',
                  desktop: '33.33%'
                };
              })}
              className="px-3 py-2 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
            >
              📝 Formulaire étroit
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 50% • Desktop: 1/3</div>
            </button>
          </div>
        </div>

        {/* Configuration manuelle */}
        <div className="border-t pt-3">
          <div className="text-xs font-medium text-gray-600 mb-3">Configuration manuelle :</div>
          
          <div className="space-y-3">
            {/* Mobile */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                📱 Mobile (&lt; 640px)
              </label>
              <select
                value={typeof responsiveWidth === 'object' ? responsiveWidth?.mobile || '100%' : responsiveWidth || '100%'}
                onChange={(e) => {
                  const currentWidth = typeof responsiveWidth === 'object' ? responsiveWidth : { mobile: responsiveWidth || '100%' };
                  setProp((props: DesignFormProps) => {
                    props.responsiveWidth = {
                      ...currentWidth,
                      mobile: e.target.value
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="50%">50% (moitié)</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="25%">25%</option>
                <option value="auto">Auto (contenu)</option>
              </select>
            </div>
            
            {/* Tablette */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                📟 Tablette (640px - 1024px)
              </label>
              <select
                value={typeof responsiveWidth === 'object' ? responsiveWidth?.tablet || '100%' : '100%'}
                onChange={(e) => {
                  const currentWidth = typeof responsiveWidth === 'object' ? responsiveWidth : { mobile: responsiveWidth || '100%' };
                  setProp((props: DesignFormProps) => {
                    props.responsiveWidth = {
                      mobile: currentWidth.mobile || responsiveWidth || '100%',
                      ...currentWidth,
                      tablet: e.target.value
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="50%">50% (moitié)</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="25%">25%</option>
                <option value="auto">Auto (contenu)</option>
              </select>
            </div>
            
            {/* Desktop */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                💻 Desktop (&gt; 1024px)
              </label>
              <select
                value={typeof responsiveWidth === 'object' ? responsiveWidth?.desktop || '100%' : '100%'}
                onChange={(e) => {
                  const currentWidth = typeof responsiveWidth === 'object' ? responsiveWidth : { mobile: responsiveWidth || '100%' };
                  setProp((props: DesignFormProps) => {
                    props.responsiveWidth = {
                      mobile: currentWidth.mobile || responsiveWidth || '100%',
                      tablet: currentWidth.tablet,
                      ...currentWidth,
                      desktop: e.target.value
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="50%">50% (moitié)</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="25%">25%</option>
                <option value="auto">Auto (contenu)</option>
              </select>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            💡 Les largeurs s'adaptent automatiquement selon la taille d'écran pour une expérience optimale
          </p>
        </div>

        {/* Alignement horizontal */}
        <div className="border-t pt-3 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alignement horizontal du formulaire
          </label>
          <div className="space-y-2">
            <select
              value={horizontalAlign || 'left'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.horizontalAlign = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="left">Gauche</option>
              <option value="center">Centre</option>
              <option value="right">Droite</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setProp((props: DesignFormProps) => (props.horizontalAlign = 'left'))}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  horizontalAlign === 'left'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="block">⬅️</span>
                Gauche
              </button>
              <button
                onClick={() => setProp((props: DesignFormProps) => (props.horizontalAlign = 'center'))}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  horizontalAlign === 'center'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="block">↔️</span>
                Centre
              </button>
              <button
                onClick={() => setProp((props: DesignFormProps) => (props.horizontalAlign = 'right'))}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  horizontalAlign === 'right'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="block">➡️</span>
                Droite
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Permet de centrer le formulaire entier sur la page
            </p>
          </div>
        </div>
      </div>

      {/* Champs du formulaire */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Champs du formulaire</h4>
        
        <div className="space-y-4">
          {/* Champs obligatoires */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Champs obligatoires :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showNom || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showNom = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Nom *</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPrenom || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showPrenom = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Prénom *</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showEmail || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showEmail = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email *</span>
              </label>
            </div>
          </div>

          {/* Champs optionnels */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Informations complémentaires :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showTelephone || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showTelephone = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Téléphone</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showEntreprise || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showEntreprise = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Entreprise</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showProfession || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showProfession = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Profession</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSiteWeb || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showSiteWeb = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Site Web</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDateNaissance || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showDateNaissance = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Date de naissance</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showMessage || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showMessage = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Message (commentaire)</span>
              </label>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Réseaux sociaux :</p>
            
            <div className="space-y-2 ml-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlLinkedin || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlLinkedin = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">LinkedIn</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlFacebook || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlFacebook = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Facebook</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlTwitter || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlTwitter = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Twitter/X</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlInstagram || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlInstagram = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Instagram</span>
              </label>
            </div>
          </div>

          {/* Sessions */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Fonctionnalités spéciales :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSessions || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showSessions = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sélection de sessions</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DesignForm.craft = {
  displayName: 'DesignForm',
  props: {
    eventId: '',
    formTemplate: 'modern',
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    titleColor: '#1F2937',
    title: "Formulaire d'inscription",
    description: "Remplissez ce formulaire pour vous inscrire à l'événement",
    submitButtonText: "S'inscrire à l'événement",
    // Champs obligatoires (par défaut activés)
    showNom: true,
    showPrenom: true,
    showEmail: true,
    // Champs optionnels (par défaut quelques-uns activés)
    showTelephone: true,
    showEntreprise: false,
    showProfession: true,
    showSiteWeb: false,
    showDateNaissance: false,
    showUrlLinkedin: false,
    showUrlFacebook: false,
    showUrlTwitter: false,
    showUrlInstagram: false,
    showMessage: true,
    // Options d'affichage existantes
    showSessions: true,
    showSocialMedia: false,
    responsiveWidth: {
      mobile: '100%',
      tablet: '100%',
      desktop: '100%'
    },
    horizontalAlign: 'left',
  },
  related: {
    settings: DesignFormSettings,
  },
};