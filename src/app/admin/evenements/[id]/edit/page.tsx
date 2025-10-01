'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EmailTemplateEditor from '@/components/EmailTemplateEditor';
import SessionAgenda from '@/components/SessionAgenda';
import SessionForm from '@/components/SessionForm';
import Modal from '@/components/Modal';
import QrCodeCard from '@/components/qr/QrCodeCard';
import LandingPageTemplateSelector, { LandingPageConfig } from '@/components/LandingPageTemplateSelector';
import ParticipantUrlGenerator from '@/components/ParticipantUrlGenerator';
import LandingPageAnalytics from '@/components/LandingPageAnalytics';
import ParticipantDetailsModal from '@/components/ParticipantDetailsModal';
import EventDescriptionEditor from '@/components/EventDescriptionEditor';
import ImageUpload from '@/components/ImageUpload';
import ParticipantEmailManager from '@/components/ParticipantEmailManager';
import ImportParticipantsModal from '@/components/ImportParticipantsModal';
import EmailTemplatePreview from '@/components/EmailTemplatePreview';
import TicketTemplateModal from '@/components/TicketTemplateModal';
import TicketTemplateViewer from '@/components/TicketTemplateViewer';
import FullAgendaModal from '@/components/FullAgendaModal';
import DetailedStatsModal from '@/components/DetailedStatsModal';
import LandingLinkForm from '@/components/LandingLinkForm';
import { exportParticipantsToCSV, exportSelectedParticipantsToCSV } from '@/utils/csvExport';
import { useSessionsStats } from '@/hooks/useSessionsStats';

// Type pour les événements
type Evenement = {
  id: string
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  created_at: string
  prix?: number
  places_disponibles?: number
  organisateur?: string
  email_contact?: string
  telephone_contact?: string
  logo_url?: string
  statut?: string
  type_evenement?: string
  code_acces?: string
}

type Participant = {
  id: string
  evenement_id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  profession?: string
  created_at: string
  checked_in?: boolean
  checked_in_at?: string
  token_landing_page?: string | null
}

type Session = {
  id: string
  evenement_id: string
  titre: string
  description: string
  date: string
  heure_debut: string
  heure_fin: string
  participant_count: number
  participants: any[]
  is_registered?: boolean
  type: string
  intervenant?: string
  lieu?: string
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'email' | 'participants' | 'sessions' | 'checkin' | 'landing-page' | 'participant-urls'>('details');
  const [showEmailTemplateEditor, setShowEmailTemplateEditor] = useState(false);
  const [showParticipantEmailManager, setShowParticipantEmailManager] = useState(false);
  const [showTicketTemplateModal, setShowTicketTemplateModal] = useState(false);
  const [showFullAgendaModal, setShowFullAgendaModal] = useState(false);
  const [showDetailedStatsModal, setShowDetailedStatsModal] = useState(false);
  const [showLandingLinkForm, setShowLandingLinkForm] = useState(false);
  const [landingLinkTarget, setLandingLinkTarget] = useState<{ id: string; email: string; name: string } | null>(null);
  
  // Hook pour récupérer les statistiques des sessions - seulement quand l'onglet sessions est actif
  const { data: sessionsStatsData, isLoading: isLoadingStats, error: statsError, refetch: refetchStats } = useSessionsStats(activeTab === 'sessions' ? eventId : '');
  
  // Form fields
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [lieu, setLieu] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [prix, setPrix] = useState<number | ''>('');
  const [placesDisponibles, setPlacesDisponibles] = useState<number | ''>('');
  const [organisateur, setOrganisateur] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [telephoneContact, setTelephoneContact] = useState('');
  const [typeEvenement, setTypeEvenement] = useState('');
  const [statut, setStatut] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [codeAcces, setCodeAcces] = useState('');

  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showImportParticipantsModal, setShowImportParticipantsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<{ id: string; email: string; name: string } | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');
  
  // Add participant form state
  const [newParticipant, setNewParticipant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: ''
  });

  // Sessions state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);

  // Check-in state
  const [checkedInParticipants, setCheckedInParticipants] = useState<Participant[]>([]);
  const [isLoadingCheckedIn, setIsLoadingCheckedIn] = useState(false);
  const [checkinSearchTerm, setCheckinSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Add QR code modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedParticipantForQr, setSelectedParticipantForQr] = useState<Participant | null>(null);

  // Add participant details modal state
  const [showParticipantDetailsModal, setShowParticipantDetailsModal] = useState(false);
  const [selectedParticipantForDetails, setSelectedParticipantForDetails] = useState<Participant | null>(null);

  // Landing page state
  const [landingPageConfig, setLandingPageConfig] = useState<LandingPageConfig | null>(null);
  const [isLoadingLandingPage, setIsLoadingLandingPage] = useState(false);
  const [landingPageError, setLandingPageError] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();
        
        const { data, error } = await supabase
          .from('inscription_evenements')
          .select('*, code_acces')
          .eq('id', eventId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          const event = data as Evenement;
          setNom(event.nom || '');
          setDescription(event.description || '');
          setLieu(event.lieu || '');
          setDateDebut(event.date_debut ? new Date(event.date_debut).toISOString().slice(0, 16) : '');
          setDateFin(event.date_fin ? new Date(event.date_fin).toISOString().slice(0, 16) : '');
          setPrix(event.prix || '');
          setPlacesDisponibles(event.places_disponibles || '');
          setOrganisateur(event.organisateur || '');
          setEmailContact(event.email_contact || '');
          setTelephoneContact(event.telephone_contact || '');
          setTypeEvenement(event.type_evenement || '');
          setStatut(event.statut || '');
          setLogoUrl(event.logo_url || ''); // Load existing logo
          setCodeAcces(event.code_acces || ''); // Load existing access code
        }

        // Load landing page configuration
        try {
          const response = await fetch(`/api/landing-page-config?eventId=${eventId}`);
          if (response.ok) {
            const { config } = await response.json();
            if (config) {
              setLandingPageConfig({
                templateId: config.template_id,
                customization: config.customization
              });
            }
          }
        } catch (err) {
          console.error('Error loading landing page config:', err);
        }
      } catch (err: Error | unknown) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'événement');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);

  // Fetch participants
  const fetchParticipants = async () => {
    if (!eventId) return;
    
    try {
      setIsLoadingParticipants(true);
      const supabase = supabaseBrowser();
      
      let query = supabase
        .from('inscription_participants')
        .select('*, token_landing_page')
        .eq('evenement_id', eventId);
      
      if (participantSearch) {
        query = query.or(`nom.ilike.%${participantSearch}%,prenom.ilike.%${participantSearch}%,email.ilike.%${participantSearch}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setParticipants(data as Participant[] || []);
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Fetch checked-in participants
  const fetchCheckedInParticipants = async () => {
    if (!eventId) return;
    
    try {
      setIsLoadingCheckedIn(true);
      const supabase = supabaseBrowser();
      
      // First, try to get all participants for this event
      let query = supabase
        .from('inscription_participants')
        .select('*')
        .eq('evenement_id', eventId);
      
      if (checkinSearchTerm) {
        query = query.or(`nom.ilike.%${checkinSearchTerm}%,prenom.ilike.%${checkinSearchTerm}%,email.ilike.%${checkinSearchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error details:', error);
        // If there's an error, just set empty array instead of throwing
        setCheckedInParticipants([]);
        return;
      }
      
      // Check if we have data and if checked_in column exists
      if (data && data.length > 0) {
        // Check if the first participant has checked_in property
        const hasCheckedInColumn = data[0] && 'checked_in' in data[0];
        
        if (hasCheckedInColumn) {
          // Filter only checked-in participants
          const checkedInData = data.filter(p => p.checked_in === true) || [];
          setCheckedInParticipants(checkedInData as Participant[] || []);
        } else {
          // If checked_in column doesn't exist, show empty array
          console.warn('checked_in column does not exist in the participants table');
          setCheckedInParticipants([]);
        }
      } else {
        setCheckedInParticipants([]);
      }
      
    } catch (err: Error | unknown) {
      console.error('Error fetching checked-in participants:', err);
      // Don't show error to user for this non-critical feature
      setCheckedInParticipants([]);
    } finally {
      setIsLoadingCheckedIn(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'participants' || activeTab === 'participant-urls') {
      fetchParticipants();
    } else if (activeTab === 'checkin') {
      fetchCheckedInParticipants();
      
      if (autoRefresh) {
        const interval = setInterval(fetchCheckedInParticipants, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
      }
    }
    // Les statistiques de sessions sont gérées automatiquement par le hook useSessionsStats
    // Pas besoin de les rafraîchir manuellement ici
  }, [eventId, activeTab, participantSearch, checkinSearchTerm, autoRefresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Afficher les valeurs avant sauvegarde
    console.log('=== DEBUG SAVE EVENT ===');
    console.log('logoUrl state:', logoUrl);
    console.log('logoUrl || null:', logoUrl || null);
    
    try {
      setIsSaving(true);
      const supabase = supabaseBrowser();
      
      const updateData = {
        nom,
        description,
        lieu,
        date_debut: dateDebut,
        date_fin: dateFin,
        prix: prix === '' ? null : prix,
        places_disponibles: placesDisponibles === '' ? null : placesDisponibles,
        organisateur,
        email_contact: emailContact,
        telephone_contact: telephoneContact,
        type_evenement: typeEvenement,
        statut,
        logo_url: logoUrl || null,
        code_acces: codeAcces || null
      };
      
      console.log('Update data being sent:', updateData);
      
      const { error } = await supabase
        .from('inscription_evenements')
        .update(updateData)
        .eq('id', eventId);
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Event updated successfully');
      router.push(`/admin/evenements/${eventId}`);
    } catch (err: Error | unknown) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour générer un nouveau code d'accès
  const generateNewAccessCode = async () => {
    try {
      const supabase = supabaseBrowser();
      
      // Générer un code aléatoire de 4 chiffres
      const newCode = Math.floor(Math.random() * 9000 + 1000).toString();
      
      // Vérifier que le code n'existe pas déjà
      const { data: existingEvent } = await supabase
        .from('inscription_evenements')
        .select('id')
        .eq('code_acces', newCode)
        .single();

      if (existingEvent) {
        // Si le code existe, réessayer
        return generateNewAccessCode();
      }

      setCodeAcces(newCode);
      alert(`Nouveau code généré: ${newCode}`);
    } catch (error) {
      console.error('Erreur lors de la génération du code:', error);
      alert('Erreur lors de la génération du code');
    }
  };

  // Copier le code d'accès dans le presse-papiers
  const copyAccessCode = () => {
    if (codeAcces) {
      navigator.clipboard.writeText(codeAcces).then(() => {
        alert('Code d\'accès copié dans le presse-papiers !');
      }).catch((err) => {
        console.error('Erreur lors de la copie:', err);
        alert('Erreur lors de la copie');
      });
    }
  };

  // Add participant
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supabase = supabaseBrowser();
      
      const { error } = await supabase
        .from('inscription_participants')
        .insert({
          evenement_id: eventId,
          ...newParticipant
        });
      
      if (error) throw error;
      
      // Reset form
      setNewParticipant({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        profession: ''
      });
      
      setShowAddParticipantModal(false);
      fetchParticipants();
    } catch (err) {
      console.error('Error adding participant:', err);
    }
  };

  // Select/deselect participants
  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map(p => p.id));
    }
  };

  // Email functions
  const handleEmailSelected = () => {
    if (selectedParticipants.length > 0) {
      setEmailTarget(null);
      setShowEmailModal(true);
    }
  };

  const handleEmailSingle = (participant: Participant) => {
    setEmailTarget({
      id: participant.id,
      email: participant.email,
      name: `${participant.prenom} ${participant.nom}`
    });
    setShowEmailModal(true);
  };

  // Landing link functions
  const handleSendLandingLinkSingle = (participant: Participant) => {
    setLandingLinkTarget({
      id: participant.id,
      email: participant.email,
      name: `${participant.prenom} ${participant.nom}`
    });
    setShowLandingLinkForm(true);
  };

  const handleSendLandingLinksSelected = () => {
    if (selectedParticipants.length > 0) {
      setLandingLinkTarget(null);
      setShowLandingLinkForm(true);
    }
  };

  // Session functions
  const handleAddSession = () => {
    setSessionToEdit(null);
    setIsSessionModalOpen(true);
  };

  const handleEditSession = (session: Session) => {
    setSessionToEdit(session);
    setIsSessionModalOpen(true);
  };

  const handleSessionSaved = (session: Session) => {
    setIsSessionModalOpen(false);
    setSessionToEdit(null);
    // Rafraîchir les statistiques après sauvegarde d'une session
    refetchStats();
    // The SessionAgenda component will automatically refresh
  };

  // Function to show QR code for a participant
  const handleShowQrCode = (participant: Participant) => {
    setSelectedParticipantForQr(participant);
    setShowQrModal(true);
  };

  // Function to show participant details modal
  const handleShowParticipantDetails = (participant: Participant) => {
    setSelectedParticipantForDetails(participant);
    setShowParticipantDetailsModal(true);
  };

  // Function to export all participants to CSV
  const handleExportAllParticipants = () => {
    if (participants.length === 0) {
      alert('Aucun participant à exporter');
      return;
    }
    const filename = `participants_${nom.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    exportParticipantsToCSV(participants, filename);
  };

  // Function to export selected participants to CSV
  const handleExportSelectedParticipants = () => {
    if (selectedParticipants.length === 0) {
      alert('Aucun participant sélectionné');
      return;
    }
    const filename = `participants_selectionnes_${nom.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    exportSelectedParticipantsToCSV(participants, selectedParticipants, filename);
  };

  // Function to export checked-in participants to CSV
  const handleExportCheckedInParticipants = () => {
    if (checkedInParticipants.length === 0) {
      alert('Aucun participant enregistré à exporter');
      return;
    }
    const filename = `participants_enregistres_${nom.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    exportParticipantsToCSV(checkedInParticipants, filename);
  };

  // Landing page functions
  const handleLandingPageConfigUpdate = async (config: LandingPageConfig) => {
    try {
      setLandingPageError(null);
      
      // Save configuration to your API or Supabase
      const response = await fetch('/api/landing-page-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          config
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      setLandingPageConfig(config);
    } catch (err: any) {
      console.error('Error updating landing page config:', err);
      setLandingPageError(err.message);
    }
  };

  const handlePreviewLandingPage = (templateId: string, config: LandingPageConfig) => {
    // Open preview in new tab with production URL
    const publicBaseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || 'https://waivent.app';

    // Encoder les données de personnalisation pour les passer dans l'URL
    const customizationParams = encodeURIComponent(JSON.stringify(config.customization));
    const previewUrl = `${publicBaseUrl}/landing/${eventId}?preview=true&template=${templateId}&colors=${customizationParams}`;

    window.open(previewUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !nom) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Erreur!</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/evenements"
          className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* En-tête */}
      <div className="mb-8">
        <Link
          href={`/admin/evenements/${eventId}`}
          className="group inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-all duration-300"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Retour aux détails de l&apos;événement</span>
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Modifier l&apos;événement</h1>
        <p className="text-lg text-gray-600">
          Gérez tous les aspects de votre événement depuis cette interface
        </p>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="mb-8">
        <div className="bg-white p-2 rounded-2xl shadow-lg border-2 border-gray-200">
          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`group relative px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'details'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Détails</span>
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`group relative px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'participants'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Participants</span>
              {participants.length > 0 && (
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'participants' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  {participants.length}
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('checkin')}
              className={`group relative px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'checkin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Check-in</span>
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`group relative px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'sessions'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Sessions</span>
            </button>

            <button
              onClick={() => setActiveTab('landing-page')}
              className={`group relative px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'landing-page'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Landing Page</span>
            </button>

            <button
              onClick={() => setActiveTab('participant-urls')}
              className={`group relative px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'participant-urls'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>URLs</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`group relative px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'email'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'details' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom de l'événement */}
              <div className="md:col-span-2">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l&apos;événement *
                </label>
                <input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description * (HTML)
                </label>
                <EventDescriptionEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Décrivez votre événement en détail avec du texte formaté..."
                />
              </div>

              {/* Logo de l'événement */}
              <div className="md:col-span-2">
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

              {/* Lieu */}
              <div>
                <label htmlFor="lieu" className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu *
                </label>
                <input
                  type="text"
                  id="lieu"
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type d'événement */}
              <div>
                <label htmlFor="typeEvenement" className="block text-sm font-medium text-gray-700 mb-1">
                  Type d&apos;événement
                </label>
                <input
                  type="text"
                  id="typeEvenement"
                  value={typeEvenement}
                  onChange={(e) => setTypeEvenement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date de début */}
              <div>
                <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
                  Date et heure de début *
                </label>
                <input
                  type="datetime-local"
                  id="dateDebut"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date de fin */}
              <div>
                <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
                  Date et heure de fin *
                </label>
                <input
                  type="datetime-local"
                  id="dateFin"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Prix */}
              <div>
                <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (€)
                </label>
                <input
                  type="number"
                  id="prix"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value ? parseFloat(e.target.value) : '')}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Places disponibles */}
              <div>
                <label htmlFor="placesDisponibles" className="block text-sm font-medium text-gray-700 mb-1">
                  Places disponibles
                </label>
                <input
                  type="number"
                  id="placesDisponibles"
                  value={placesDisponibles}
                  onChange={(e) => setPlacesDisponibles(e.target.value ? parseInt(e.target.value) : '')}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Organisateur */}
              <div>
                <label htmlFor="organisateur" className="block text-sm font-medium text-gray-700 mb-1">
                  Organisateur
                </label>
                <input
                  type="text"
                  id="organisateur"
                  value={organisateur}
                  onChange={(e) => setOrganisateur(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email de contact */}
              <div>
                <label htmlFor="emailContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contact
                </label>
                <input
                  type="email"
                  id="emailContact"
                  value={emailContact}
                  onChange={(e) => setEmailContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Téléphone de contact */}
              <div>
                <label htmlFor="telephoneContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  id="telephoneContact"
                  value={telephoneContact}
                  onChange={(e) => setTelephoneContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Statut */}
              <div>
                <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="statut"
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="actif">Actif</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="annule">Annulé</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>

              {/* Code d'accès pour QR Scanner */}
              <div className="md:col-span-2">
                <label htmlFor="codeAcces" className="block text-sm font-medium text-gray-700 mb-1">
                  Code d&apos;accès QR Scanner (4 chiffres)
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="codeAcces"
                    value={codeAcces}
                    onChange={(e) => setCodeAcces(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="0000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={generateNewAccessCode}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    title="Générer un nouveau code"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Générer
                  </button>
                  {codeAcces && (
                    <button
                      type="button"
                      onClick={copyAccessCode}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium"
                      title="Copier le code"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copier
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>
                    💡 <strong>Ce code est requis pour accéder au QR Scanner mobile.</strong>
                  </p>
                  <p>
                    🔗 Les hôtesses pourront utiliser ce code sur: 
                    <Link 
                      href="/qr-scanner-new" 
                      target="_blank" 
                      className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                    >
                      /qr-scanner-new
                    </Link>
                  </p>
                  {codeAcces && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-medium">
                        ✅ Code actuel: <span className="text-2xl font-bold tracking-widest">{codeAcces}</span>
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        Partagez ce code avec les hôtesses pour leur permettre d&apos;accéder au système de check-in mobile.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-6">
              <Link
                href={`/admin/evenements/${eventId}`}
                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                )}
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Template Viewer */}
            <div className="mb-8">
              <TicketTemplateViewer
                eventId={eventId}
                onEdit={() => setShowTicketTemplateModal(true)}
              />
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Gestion des participants
                </h2>
                <p className="text-gray-600 font-medium">
                  Gérez les participants de cet événement
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportAllParticipants}
                  className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exporter CSV
                </button>

                <button
                  onClick={() => setShowAddParticipantModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter participant
                </button>

                <button
                  onClick={() => setShowImportParticipantsModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Importer CSV
                </button>

                <button
                  onClick={() => setShowParticipantEmailManager(true)}
                  disabled={participants.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Envoyer emails
                </button>

                <button
                  onClick={handleEmailSelected}
                  disabled={selectedParticipants.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email général
                  {selectedParticipants.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      {selectedParticipants.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Modern Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un participant par nom, email, téléphone..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 
                           rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                           focus:border-transparent focus:shadow-xl transition-all duration-300
                           text-gray-700 placeholder-gray-400 font-medium"
                />
                {participantSearch && (
                  <button
                    onClick={() => setParticipantSearch('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Participants List */}
            {isLoadingParticipants ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun participant</h3>
                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des participants à cet événement</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedParticipants.length === participants.length && participants.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut Check-in
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date inscription
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedParticipants.includes(participant.id)}
                            onChange={() => handleSelectParticipant(participant.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {participant.prenom} {participant.nom}
                            </div>
                            {participant.profession && (
                              <div className="text-sm text-gray-500">{participant.profession}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.telephone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {participant.checked_in ? (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                                <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-400"></div>
                                Enregistré
                              </span>
                              {participant.checked_in_at && (
                                <div className="ml-2 text-xs text-gray-500">
                                  {new Date(participant.checked_in_at).toLocaleString('fr-FR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">
                              <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-400"></div>
                              Non enregistré
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(participant.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleShowParticipantDetails(participant)}
                              className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                              title="Voir sessions et détails"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEmailSingle(participant)}
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                              title="Envoyer un email général"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/send-ticket-email', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      participantId: participant.id,
                                      eventId: eventId
                                    })
                                  })
                                  
                                  const result = await response.json()
                                  
                                  if (result.success) {
                                    alert('Ticket envoyé avec succès !')
                                  } else {
                                    alert(`Erreur lors de l'envoi: ${result.message}`)
                                  }
                                } catch (error) {
                                  alert('Erreur lors de l\'envoi du ticket')
                                  console.error('Error sending ticket:', error)
                                }
                              }}
                              className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                              title="Envoyer le ticket par email"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleShowQrCode(participant)}
                              className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                              title="Voir le QR code"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </button>
                            <Link
                              href={`/ticket/${participant.id}`}
                              target="_blank"
                              className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200"
                              title="Voir le billet"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            )}
          </div>
        </div>
      )}

      {/* Check-in Tab */}
      {activeTab === 'checkin' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Check-in en temps réel
                </h2>
                <p className="text-gray-600 font-medium">
                  Suivez les participants qui se sont enregistrés
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Modern Export Check-in Button */}
                <button
                  onClick={handleExportCheckedInParticipants}
                  disabled={checkedInParticipants.length === 0}
                  className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 
                           text-white font-medium rounded-xl shadow-lg hover:shadow-xl
                           transform hover:scale-105 transition-all duration-300 
                           border border-white/20 backdrop-blur-sm
                           flex items-center space-x-2 min-w-[180px]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="Exporter les participants enregistrés"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Exporter CSV</span>
                  {checkedInParticipants.length > 0 && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">{checkedInParticipants.length}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </button>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Actualisation auto</span>
                </label>
                <button
                  onClick={fetchCheckedInParticipants}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualiser
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher un participant enregistré..."
                value={checkinSearchTerm}
                onChange={(e) => setCheckinSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Enregistrés</p>
                    <p className="text-xl font-bold text-green-900">{checkedInParticipants.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total inscrits</p>
                    <p className="text-xl font-bold text-blue-900">{participants.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-full mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Taux présence</p>
                    <p className="text-xl font-bold text-purple-900">
                      {participants.length > 0 ? Math.round((checkedInParticipants.length / participants.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checked-in participants list */}
            {isLoadingCheckedIn ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : checkedInParticipants.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun participant enregistré</h3>
                <p className="mt-1 text-sm text-gray-500">Les participants qui se présentent apparaîtront ici en temps réel</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heure d&apos;arrivée
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checkedInParticipants.map((participant) => (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {participant.prenom} {participant.nom}
                              </div>
                              {participant.profession && (
                                <div className="text-sm text-gray-500">{participant.profession}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.telephone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.checked_in_at 
                            ? new Date(participant.checked_in_at).toLocaleString('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })
                            : 'Heure non disponible'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={`/ticket/${participant.id}`}
                              target="_blank"
                              className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200"
                              title="Voir le billet"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleEmailSingle(participant)}
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                              title="Envoyer un email"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-8">
          {/* Header Section with Modern Design */}
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Sessions et Planning
                  </h2>
                  <p className="text-gray-600 font-medium text-lg max-w-2xl">
                    Créez et gérez les sessions de votre événement auxquelles les participants pourront s'inscrire.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAddSession}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer session
                  </button>

                  <button
                    onClick={() => setShowFullAgendaModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0l-2 9a3 3 0 003 3h4a3 3 0 003-3l-2-9M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7" />
                    </svg>
                    Voir agenda complet
                  </button>

                  <button
                    onClick={refetchStats}
                    disabled={isLoadingStats}
                    className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className={`w-5 h-5 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isLoadingStats ? 'Chargement...' : 'Actualiser stats'}
                  </button>

                  <button
                    onClick={() => setShowDetailedStatsModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors duration-200 text-sm font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Voir détails
                  </button>
                </div>
              </div>
              
              {/* Session Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0l-2 9a3 3 0 003 3h4a3 3 0 003-3l-2-9M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      {isLoadingStats ? (
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">
                          {sessionsStatsData?.totalSessions || 0}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Participants inscrits</p>
                      {isLoadingStats ? (
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">
                          {sessionsStatsData?.totalParticipantsInscriptions || 0}
                        </p>
                      )}
                      {statsError && (
                        <p className="text-xs text-red-500 mt-1">Erreur de chargement</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taux de remplissage</p>
                      {isLoadingStats ? (
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold text-gray-900">
                            {sessionsStatsData?.fillRate || 0}%
                          </p>
                          {sessionsStatsData && sessionsStatsData.totalCapacity === 0 && (
                            <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-full">
                              Capacité illimitée
                            </span>
                          )}
                        </div>
                      )}
                      {sessionsStatsData && sessionsStatsData.totalCapacity > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {sessionsStatsData.totalParticipantsInscriptions} / {sessionsStatsData.totalCapacity} places
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modern SessionAgenda Component */}
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-lg">
                <SessionAgenda 
                  eventId={eventId} 
                  onAddSession={handleAddSession}
                  onEditSession={handleEditSession}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Landing Page Tab */}
      {activeTab === 'landing-page' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            {landingPageError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>{landingPageError}</p>
              </div>
            )}
            
            <LandingPageTemplateSelector
              eventId={eventId}
              currentConfig={landingPageConfig}
              onConfigUpdate={handleLandingPageConfigUpdate}
              onPreview={handlePreviewLandingPage}
            />
          </div>
        </div>
      )}

      {/* Participant URLs Tab */}
      {activeTab === 'participant-urls' && (
        <div className="space-y-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">URLs Personnalisées des Participants</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Générez des liens personnalisés pour chaque participant et suivez les performances
                </p>
              </div>
              
              <ParticipantUrlGenerator 
                eventId={eventId}
                participants={participants}
                onTokenGenerated={(participantId, token, url) => {
                  // Mettre à jour la liste des participants avec le nouveau token
                  setParticipants(prev => prev.map(p => 
                    p.id === participantId 
                      ? { ...p, token_landing_page: token }
                      : p
                  ));
                }}
              />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <LandingPageAnalytics eventId={eventId} />
            </div>
          </div>
        </div>
      )}

      {/* Modèle d'email Tab */}
      {activeTab === 'email' && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Modèle d&apos;email</h2>
              <p className="text-sm text-gray-600 mt-1">
                Personnalisez le modèle d&apos;email qui sera envoyé aux participants
              </p>
            </div>
            
            <EmailTemplatePreview 
              eventId={eventId}
              eventName={nom}
              onEditTemplate={() => setShowEmailTemplateEditor(true)}
            />
          </div>
        </div>
      )}

      {/* Modal EmailTemplateEditor */}
      {showEmailTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <EmailTemplateEditor
            eventId={eventId}
            onClose={() => setShowEmailTemplateEditor(false)}
          />
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddParticipantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un participant</h3>
              <form onSubmit={handleAddParticipant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={newParticipant.prenom}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, prenom: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={newParticipant.nom}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, nom: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={newParticipant.telephone}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, telephone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={newParticipant.profession}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, profession: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddParticipantModal(false)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {emailTarget ? `Envoyer un email à ${emailTarget.name}` : `Envoyer un email à ${selectedParticipants.length} participant(s)`}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sujet de l'email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre message..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement email sending
                      setShowEmailModal(false);
                      setSelectedParticipants([]);
                      setEmailTarget(null);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
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

      {/* Participant Details Modal */}
      <ParticipantDetailsModal
        participant={selectedParticipantForDetails}
        isOpen={showParticipantDetailsModal}
        onClose={() => {
          setShowParticipantDetailsModal(false);
          setSelectedParticipantForDetails(null);
        }}
      />

      {/* QR Code Modal */}
      {showQrModal && selectedParticipantForQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  QR Code de {selectedParticipantForQr.prenom} {selectedParticipantForQr.nom}
                </h3>
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    setSelectedParticipantForQr(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <QrCodeCard value={`${window.location.origin}/admin/check-in/${eventId}/${selectedParticipantForQr.id}`} />
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Email:</strong> {selectedParticipantForQr.email}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Téléphone:</strong> {selectedParticipantForQr.telephone}
                  </p>
                  {selectedParticipantForQr.profession && (
                    <p className="text-sm text-gray-600">
                      <strong>Profession:</strong> {selectedParticipantForQr.profession}
                    </p>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Scannez ce QR code pour enregistrer le participant
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    setSelectedParticipantForQr(null);
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Télécharger ou imprimer le QR code
                    window.print();
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ParticipantEmailManager */}
      {showParticipantEmailManager && (
        <ParticipantEmailManager
          eventId={eventId}
          participants={participants}
          event={{
            id: eventId,
            nom,
            date_debut: dateDebut,
            lieu,
            description
          }}
          onClose={() => setShowParticipantEmailManager(false)}
        />
      )}

      {/* Modal TicketTemplateManager */}
      <TicketTemplateModal
        eventId={eventId}
        isOpen={showTicketTemplateModal}
        onClose={() => setShowTicketTemplateModal(false)}
      />

      {/* Modal ImportParticipants */}
      <ImportParticipantsModal
        isOpen={showImportParticipantsModal}
        onClose={() => setShowImportParticipantsModal(false)}
        eventId={eventId}
        onSuccess={() => {
          // Refresh participants list
          fetchParticipants();
          setShowImportParticipantsModal(false);
        }}
      />

      {/* Modal Agenda Complet */}
      <FullAgendaModal
        eventId={eventId}
        isOpen={showFullAgendaModal}
        onClose={() => setShowFullAgendaModal(false)}
      />

      {/* Modal Statistiques Détaillées */}
      <DetailedStatsModal
        eventId={eventId}
        isOpen={showDetailedStatsModal}
        onClose={() => setShowDetailedStatsModal(false)}
      />

      {/* Modal Landing Link Form */}
      {showLandingLinkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <LandingLinkForm
                eventId={eventId}
                recipientIds={landingLinkTarget ? [landingLinkTarget.id] : selectedParticipants}
                singleRecipient={landingLinkTarget}
                onSent={() => {
                  setShowLandingLinkForm(false);
                  setSelectedParticipants([]);
                  setLandingLinkTarget(null);
                }}
                onCancel={() => {
                  setShowLandingLinkForm(false);
                  setLandingLinkTarget(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
        