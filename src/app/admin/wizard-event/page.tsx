'use client'

import React, { useState } from 'react';
import { FiZap, FiCheck, FiCalendar, FiUsers, FiSettings, FiMail, FiTag } from 'react-icons/fi';
import WizardSelection from './components/WizardSelection';
import StepGeneralInfo from './components/StepGeneralInfo';
import StepSessions from './components/StepSessions';
import StepParticipants from './components/StepParticipants';
import StepExposants from './components/StepExposants';
import StepForms from './components/StepForms';
import StepFinalization from './components/StepFinalization';
import StepTicketing from './components/StepTicketing';

export default function WizardEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWizardType, setSelectedWizardType] = useState<string | null>(null);
  const [wizardStarted, setWizardStarted] = useState(false);
  
  // Form data for conference wizard
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    organisateur: '',
    emailContact: '',
    telephoneContact: '',
    placesDisponibles: '',
    typeLocalisation: 'lieu' as 'lieu' | 'en_ligne' | 'non_applicable',
    emailTemplate: 'modern',
    emailSubject: 'Confirmation de votre inscription - {{event_name}}',
    couleurHeaderEmail: '#3b82f6',
    secteurActivite: '', // Pour Salon
    ouverturePortes: '' // Pour Concert
  });

  // Ticket Types for Concert
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);

  // Exposants for Salon
  const [exposants, setExposants] = useState<any[]>([]);

  // Intervenants et Sessions data
  const [intervenants, setIntervenants] = useState([
    {
      id: Date.now(),
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      entreprise: '',
      poste: '',
      bio: '',
      photo_url: '',
      linkedin: '',
      twitter: ''
    }
  ]);

  const [sessions, setSessions] = useState([
    {
      id: Date.now(),
      titre: '',
      description: '',
      date: '',
      heure_debut: '',
      heure_fin: '',
      lieu_session: '',
      intervenant_ids: [],
      capacite_max: '',
      type_session: 'presentation' as 'presentation' | 'workshop' | 'table-ronde' | 'keynote'
    }
  ]);

  // Participants data
  const [participants, setParticipants] = useState<any[]>([]);
  
  // États pour les configurations email et formulaire
  const [invitationEmailTemplate, setInvitationEmailTemplate] = useState('template1');
  const [registrationFormType, setRegistrationFormType] = useState('standard');
  const [registrationFormFields, setRegistrationFormFields] = useState({
    nom: true,
    prenom: true,
    email: true,
    telephone: false,
    entreprise: false,
    profession: false,
    commentaires: false
  });

  // États pour la création de l'événement
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [emailsSending, setEmailsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Email templates for wizard
  const emailTemplates = [
    {
      id: 'modern-gradient',
      name: 'Modern Gradient',
      description: 'Design moderne avec dégradé coloré',
      category: 'modern',
      subject: '🎟️ Votre ticket pour {{event_name}} - {{participant_firstname}}'
    },
    {
      id: 'business-professional',
      name: 'Business Professional',
      description: 'Style corporate élégant et professionnel',
      category: 'business',
      subject: 'Votre badge professionnel - {{event_name}}'
    },
    {
      id: 'conference-badge',
      name: 'Conference Badge',
      description: 'Badge spécialement conçu pour les conférences',
      category: 'business',
      subject: '📋 Votre badge de conférence - {{event_name}}'
    },
    {
      id: 'creative-colorful',
      name: 'Creative Colorful',
      description: 'Template coloré et créatif pour événements dynamiques',
      category: 'creative',
      subject: '🎨 Bienvenue à {{event_name}} - {{participant_firstname}}'
    },
    {
      id: 'minimal-clean',
      name: 'Minimal Clean',
      description: 'Design épuré et minimaliste',
      category: 'minimal',
      subject: 'Confirmation d\'inscription - {{event_name}}'
    }
  ];

  // Définition dynamique des étapes selon le type de wizard
  const getSteps = () => {
    const commonSteps = [
      { id: 1, title: 'Informations générales', icon: <FiSettings className="w-5 h-5" /> }
    ];

    if (selectedWizardType === 'concert-payant') {
      return [
        ...commonSteps,
        { id: 2, title: 'Billetterie', icon: <FiTag className="w-5 h-5" /> },
        { id: 3, title: 'Spectateurs', icon: <FiUsers className="w-5 h-5" /> },
        { id: 4, title: 'Finalisation', icon: <FiCheck className="w-5 h-5" /> }
      ];
    } else if (selectedWizardType === 'salon-professionnel') {
      return [
        ...commonSteps,
        { id: 2, title: 'Programme', icon: <FiCalendar className="w-5 h-5" /> }, // Sessions renamed
        { id: 3, title: 'Visiteurs & Exposants', icon: <FiUsers className="w-5 h-5" /> },
        { id: 4, title: 'Finalisation', icon: <FiCheck className="w-5 h-5" /> }
      ];
    } else {
      // Default Conference
      return [
        ...commonSteps,
        { id: 2, title: 'Sessions', icon: <FiUsers className="w-5 h-5" /> },
        { id: 3, title: 'Invités', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { id: 4, title: 'Finalisation', icon: <FiCheck className="w-5 h-5" /> }
      ];
    }
  };

  const getTheme = () => {
    switch (selectedWizardType) {
      case 'concert-payant':
        return {
          gradient: 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-600',
          textGradient: 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600',
          border: 'border-orange-400/30',
          button: 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700',
          stepActive: 'bg-gradient-to-br from-orange-500 to-red-600'
        };
      case 'salon-professionnel':
        return {
          gradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600',
          textGradient: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600',
          border: 'border-blue-400/30',
          button: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700',
          stepActive: 'bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600'
        };
      default:
        return {
          gradient: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600',
          textGradient: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',
          border: 'border-violet-400/30',
          button: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700',
          stepActive: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600'
        };
    }
  };

  const steps = getSteps();
  const theme = getTheme();

  // Fonction pour créer l'événement
  const handleCreateEvent = async () => {
    setIsCreatingEvent(true);
    
    try {
      // Validation côté client
      if (!formData.nom || !formData.dateDebut) {
        throw new Error(`Données manquantes: nom="${formData.nom}", dateDebut="${formData.dateDebut}"`);
      }

      console.log('📝 FormData avant envoi:', formData);

      const eventData = {
        ...formData,
        intervenants: intervenants.filter(i => i.nom && i.prenom),
        sessions: sessions.filter(s => s.titre),
        participants,
        exposants: selectedWizardType === 'salon-professionnel' ? exposants : [],
        ticketTypes: selectedWizardType === 'concert-payant' ? ticketTypes : [],
        invitationEmailTemplate,
        registrationFormType,
        registrationFormFields,
        wizardType: selectedWizardType
      };

      console.log('📤 EventData envoyé:', eventData);

      // Appel API pour créer l'événement
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de la création de l\'événement');
      }
      
      setCreatedEventId(result.event.id);
      setEventCreated(true);
      setIsCreatingEvent(false);
      
      // Afficher la modal de confirmation pour l'envoi d'emails
      setShowConfirmationModal(true);

    } catch (error) {
      setIsCreatingEvent(false);
      setModalMessage(`Erreur lors de la création de l'événement : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setShowErrorModal(true);
      console.error('Erreur création événement:', error);
    }
  };

  // Fonction pour envoyer les emails d'invitation
  const handleSendInvitationEmails = async () => {
    setEmailsSending(true);
    setShowConfirmationModal(false);
    
    try {
      if (!createdEventId) {
        throw new Error('ID de l\'événement manquant');
      }

      console.log('📧 === DÉBUT ENVOI EMAILS CLIENT ===');
      console.log('🆔 Event ID:', createdEventId);
      console.log('👥 Participants:', participants);
      console.log('🎨 Template:', invitationEmailTemplate);
      console.log('📝 Form Type:', registrationFormType);

      const emailPayload = {
        eventId: createdEventId,
        participants: participants.map(p => ({
          email: p.email,
          nom: p.nom,
          prenom: p.prenom,
          telephone: p.telephone,
          profession: p.profession
        })),
        invitationTemplate: invitationEmailTemplate,
        registrationFormType: registrationFormType
      };

      console.log('📤 Payload envoyé:', emailPayload);

      // Appel API pour envoyer les emails d'invitation
      const response = await fetch('/api/send-invitation-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      console.log('📡 Réponse API:', response.status, response.statusText);

      const result = await response.json();
      console.log('📊 Résultat API:', result);

      if (!response.ok || !result.success) {
        console.error('❌ Erreur API envoi emails:', result);
        throw new Error(result.error || 'Erreur lors de l\'envoi des emails');
      }
      
      console.log('✅ Emails envoyés avec succès:', result.results);
      
      setEmailsSending(false);
      setModalMessage(
        `🎉 Événement créé avec succès !\n\n` +
        `📧 ${result.results.sent} email(s) d'invitation envoyé(s) avec succès\n` +
        `${result.results.errors > 0 ? `⚠️ ${result.results.errors} email(s) en erreur\n` : ''}` +
        `📋 Formulaire d'inscription configuré (${registrationFormType})\n` +
        `✅ Template de confirmation sélectionné\n\n` +
        `Les participants peuvent maintenant s'inscrire via le lien reçu par email.\n\n` +
        `Vous pouvez consulter votre événement dans la gestion des événements.`
      );
      setShowSuccessModal(true);

    } catch (error) {
      console.error('❌ Exception envoi emails:', error);
      setEmailsSending(false);
      setModalMessage(`Erreur lors de l'envoi des emails : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setShowErrorModal(true);
    }
  };

  const handleWizardSelect = (wizardId: string) => {
    setSelectedWizardType(wizardId);
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setWizardStarted(false);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl ${theme.gradient} flex items-center justify-center shadow-lg ${theme.border} backdrop-blur-sm`}>
              <FiZap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme.textGradient} bg-clip-text text-transparent`}>
                Wizard Event
              </h1>
              <p className="text-gray-600 font-medium">
                Créez votre événement étape par étape avec notre assistant intelligent
              </p>
            </div>
          </div>
          
          {/* Progress Steps - Only show if wizard is selected */}
          {wizardStarted && (
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    {/* Step Circle */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                      currentStep >= step.id 
                        ? `${theme.stepActive} text-white shadow-lg ${theme.border}` 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > step.id ? (
                        <FiCheck className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    
                    {/* Step Title */}
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-semibold ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        Étape {step.id}
                      </p>
                      <p className={`text-xs mt-1 ${
                        currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-1 mx-4 mt-[-20px] transition-all duration-300 ${
                      currentStep > step.id ? theme.textGradient : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {!wizardStarted ? (
            <WizardSelection 
              selectedWizardType={selectedWizardType}
              onSelect={handleWizardSelect}
              onContinue={() => setWizardStarted(true)}
            />
          ) : (
            <>
              {currentStep === 1 && (
                <StepGeneralInfo 
                  formData={formData} 
                  setFormData={setFormData} 
                  onNext={handleNext} 
                  onBack={handleBack}
                  wizardType={selectedWizardType || ''}
                />
              )}
              
              {/* Step 2 Logic */}
              {currentStep === 2 && selectedWizardType === 'concert-payant' && (
                <StepTicketing 
                  ticketTypes={ticketTypes}
                  setTicketTypes={setTicketTypes}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 2 && selectedWizardType !== 'concert-payant' && (
                <StepSessions 
                  sessions={sessions} 
                  intervenants={intervenants} 
                  setSessions={setSessions} 
                  setIntervenants={setIntervenants}
                  onNext={handleNext} 
                  onBack={handleBack}
                  wizardType={selectedWizardType || ''}
                />
              )}
              
              {/* Step 3 Logic */}
              {currentStep === 3 && (
                selectedWizardType === 'salon-professionnel' ? (
                  <StepExposants
                    exposants={exposants}
                    setExposants={setExposants}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                ) : (
                  <StepParticipants 
                    participants={participants} 
                    setParticipants={setParticipants} 
                    onNext={handleNext} 
                    onBack={handleBack}
                    wizardType={selectedWizardType || ''}
                  />
                )
              )}

              {/* Step 4 Logic - Finalization */}
              {currentStep === 4 && (
                <StepFinalization 
                  formData={formData}
                  intervenants={intervenants}
                  sessions={sessions}
                  participants={participants}
                  ticketTypes={ticketTypes}
                  wizardType={selectedWizardType || ''}
                  invitationEmailTemplate={invitationEmailTemplate}
                  registrationFormType={registrationFormType}
                  emailTemplates={emailTemplates}
                  handleCreateEvent={handleCreateEvent}
                  isCreatingEvent={isCreatingEvent}
                  onBack={handleBack}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmation d'envoi d'emails */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className={`${theme.gradient} p-6 text-center`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm ${theme.border}`}>
                <FiMail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Envoyer les invitations ?</h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                L'événement a été créé avec succès. Voulez-vous envoyer les emails d'invitation aux {participants.length} participants maintenant ?
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSendInvitationEmails}
                  disabled={emailsSending}
                  className={`w-full px-6 py-3 ${theme.button} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2`}
                >
                  {emailsSending ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FiMail className="w-5 h-5" />
                      Oui, envoyer les invitations
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setModalMessage('Événement créé avec succès ! Vous pourrez envoyer les invitations plus tard depuis le tableau de bord.');
                    setShowSuccessModal(true);
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Non, plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-green-400/30">
                <FiCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Succès !</h3>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6 whitespace-pre-line text-gray-700">
                {modalMessage}
              </div>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Redirection ou reset
                  window.location.href = '/admin/evenements'; // Redirection vers la liste des événements
                }}
                className={`w-full px-6 py-3 ${theme.button} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg`}
              >
                Aller au tableau de bord
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'erreur */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-red-400/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Erreur</h3>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6 text-gray-700">
                {modalMessage}
              </div>
              
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
