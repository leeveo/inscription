'use client'

import React, { useState } from 'react';
import { FiZap, FiArrowRight, FiCheck, FiCalendar, FiUsers, FiSettings, FiMail } from 'react-icons/fi';

export default function WizardEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWizardType, setSelectedWizardType] = useState<string | null>(null);
  
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
    couleurHeaderEmail: '#3b82f6'
  });

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
  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  
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
  const [newParticipant, setNewParticipant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    profession: '',
    commentaires: ''
  });

  // États pour la création de l'événement
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [emailsSending, setEmailsSending] = useState(false);

  // Fonction pour traiter le fichier CSV
  const handleCSVFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setModalMessage('Veuillez sélectionner un fichier CSV valide');
      setShowErrorModal(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          setModalMessage('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
          setShowErrorModal(true);
          return;
        }

        // Analyser l'en-tête pour détecter les colonnes
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        
        const importedParticipants: any[] = [];
        
        // Traiter chaque ligne de données
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
          
          if (values.length >= 3) { // Au minimum nom, prénom, email
            const participant = {
              id: Date.now() + i,
              nom: '',
              prenom: '',
              email: '',
              telephone: '',
              entreprise: '',
              profession: '',
              commentaires: 'Importé via CSV',
              statut: 'confirmé',
              date_inscription: new Date().toISOString()
            };

            // Mapper les colonnes dynamiquement
            headers.forEach((header, index) => {
              if (values[index]) {
                switch (header) {
                  case 'nom':
                  case 'lastname':
                  case 'last_name':
                    participant.nom = values[index];
                    break;
                  case 'prenom':
                  case 'prénom':
                  case 'firstname':
                  case 'first_name':
                    participant.prenom = values[index];
                    break;
                  case 'email':
                  case 'e-mail':
                    participant.email = values[index];
                    break;
                  case 'telephone':
                  case 'téléphone':
                  case 'phone':
                  case 'tel':
                    participant.telephone = values[index];
                    break;
                  case 'entreprise':
                  case 'company':
                  case 'societe':
                  case 'société':
                    participant.entreprise = values[index];
                    break;
                  case 'profession':
                  case 'job':
                  case 'poste':
                  case 'title':
                    participant.profession = values[index];
                    break;
                }
              }
            });

            // Vérifier que les champs obligatoires sont remplis
            if (participant.nom && participant.prenom && participant.email) {
              importedParticipants.push(participant);
            }
          }
        }

        if (importedParticipants.length > 0) {
          setParticipants([...participants, ...importedParticipants]);
          setShowImportModal(false);
          setImportedCount(importedParticipants.length);
          setModalMessage(`${importedParticipants.length} participant(s) importé(s) avec succès !`);
          setShowSuccessModal(true);
        } else {
          setModalMessage('Aucun participant valide trouvé dans le fichier CSV. Vérifiez le format.');
          setShowErrorModal(true);
        }

      } catch (error) {
        console.error('Erreur lors de l\'analyse du CSV:', error);
        setModalMessage('Erreur lors de la lecture du fichier CSV. Vérifiez le format.');
        setShowErrorModal(true);
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

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
        invitationEmailTemplate,
        registrationFormType,
        registrationFormFields
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
  
  const wizardTypes = [
    {
      id: 'salon-professionnel',
      title: 'Salon professionnel checkin',
      description: 'Optimisé pour les salons avec système de check-in avancé, gestion des visiteurs et badges numériques',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-slate-900 via-blue-900 to-indigo-900',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      hoverColor: 'group-hover:text-blue-600',
      tags: ['Check-in QR', 'Badges', 'Analytics'],
      tagColors: ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700']
    },
    {
      id: 'conference',
      title: 'Conférence, session et séminaire',
      description: 'Parfait pour conférences, formations, ateliers et séminaires avec gestion complète des sessions, intervenants et participants',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      hoverColor: 'group-hover:text-purple-600',
      tags: ['Sessions', 'Intervenants', 'Agenda', 'Networking'],
      tagColors: ['bg-purple-100 text-purple-700', 'bg-violet-100 text-violet-700', 'bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700']
    },
    {
      id: 'concert-payant',
      title: 'Concert payant',
      description: 'Spécialisé pour événements musicaux avec billetterie, différents tarifs et gestion des places',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200 hover:border-orange-400',
      hoverColor: 'group-hover:text-orange-600',
      tags: ['Billetterie', 'Paiements', 'Places numérotées'],
      tagColors: ['bg-orange-100 text-orange-700', 'bg-red-100 text-red-700', 'bg-pink-100 text-pink-700']
    }
  ];
  
  const steps = [
    { id: 1, title: 'Informations générales', icon: <FiSettings className="w-5 h-5" /> },
    { id: 2, title: 'Configuration', icon: <FiCalendar className="w-5 h-5" /> },
    { id: 3, title: 'Sessions', icon: <FiUsers className="w-5 h-5" /> },
    { id: 4, title: 'Invités', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { id: 5, title: 'Formulaires et emails', icon: <FiMail className="w-5 h-5" /> },
    { id: 6, title: 'Finalisation', icon: <FiCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center shadow-lg border border-blue-400/30 backdrop-blur-sm">
              <FiZap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Wizard Event
              </h1>
              <p className="text-gray-600 font-medium">
                Créez votre événement étape par étape avec notre assistant intelligent
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-lg border border-blue-400/30' 
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
                    currentStep > step.id ? 'bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Step 1: Choose Wizard Type */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Choisissez le type d'événement
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Sélectionnez le type d'événement que vous souhaitez créer. Chaque wizard est optimisé pour des fonctionnalités spécifiques.
                </p>
              </div>

              {/* Wizard Type Selection Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {wizardTypes.map((wizard) => (
                  <div 
                    key={wizard.id}
                    onClick={() => setSelectedWizardType(wizard.id)}
                    className={`group cursor-pointer bg-gradient-to-br ${wizard.bgGradient} rounded-2xl p-6 border-2 ${
                      selectedWizardType === wizard.id 
                        ? 'border-blue-600 ring-2 ring-blue-300/30 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-sm' 
                        : wizard.borderColor
                    } transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative`}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Selection Indicator */}
                      {selectedWizardType === wizard.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-full flex items-center justify-center shadow-lg">
                          <FiCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${wizard.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        {wizard.icon}
                      </div>
                      <h3 className={`text-xl font-bold text-gray-900 mb-2 transition-colors ${wizard.hoverColor}`}>
                        {wizard.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {wizard.description}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {wizard.tags.map((tag, index) => (
                          <span key={tag} className={`px-3 py-1 ${wizard.tagColors[index]} text-xs rounded-full font-medium`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>              {/* Continue Button */}
              <div className="text-center mt-8">
                {selectedWizardType ? (
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                  >
                    <span>Continuer avec {wizardTypes.find(w => w.id === selectedWizardType)?.title}</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-gray-500 font-medium">
                    Sélectionnez un type de wizard pour continuer
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Conference Details */}
          {currentStep === 2 && selectedWizardType === 'conference' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Informations de votre conférence
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Renseignez les détails essentiels de votre conférence. Ces informations pourront être modifiées plus tard.
                </p>
              </div>

              {/* Simplified Event Details Form */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Colonne de gauche - Informations principales */}
                  <div className="space-y-6">
                    {/* Nom de la conférence */}
                    <div>
                      <label htmlFor="wizard-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la conférence *
                      </label>
                      <input
                        type="text"
                        id="wizard-nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: Conférence Tech 2024"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="wizard-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description courte
                      </label>
                      <textarea
                        id="wizard-description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Décrivez brièvement votre conférence..."
                      />
                    </div>

                    {/* Type de localisation */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Format de la conférence *
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="wizard-lieu-physique"
                            name="wizard_type_localisation"
                            value="lieu"
                            checked={formData.typeLocalisation === 'lieu'}
                            onChange={(e) => setFormData({...formData, typeLocalisation: e.target.value as 'lieu'})}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <label htmlFor="wizard-lieu-physique" className="ml-3 text-sm text-gray-700">
                            🏢 En présentiel (lieu physique)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="wizard-evenement-en-ligne"
                            name="wizard_type_localisation"
                            value="en_ligne"
                            checked={formData.typeLocalisation === 'en_ligne'}
                            onChange={(e) => setFormData({...formData, typeLocalisation: e.target.value as 'en_ligne'})}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <label htmlFor="wizard-evenement-en-ligne" className="ml-3 text-sm text-gray-700">
                            💻 En ligne (webinaire, visioconférence)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="wizard-hybride"
                            name="wizard_type_localisation"
                            value="non_applicable"
                            checked={formData.typeLocalisation === 'non_applicable'}
                            onChange={(e) => setFormData({...formData, typeLocalisation: e.target.value as 'non_applicable'})}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <label htmlFor="wizard-hybride" className="ml-3 text-sm text-gray-700">
                            🌐 Hybride (présentiel + en ligne)
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Lieu (si présentiel ou hybride) */}
                    {(formData.typeLocalisation === 'lieu' || formData.typeLocalisation === 'non_applicable') && (
                      <div>
                        <label htmlFor="wizard-lieu" className="block text-sm font-medium text-gray-700 mb-2">
                          Lieu de la conférence *
                        </label>
                        <input
                          type="text"
                          id="wizard-lieu"
                          value={formData.lieu}
                          onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Ex: Palais des Congrès, Paris"
                        />
                      </div>
                    )}
                  </div>

                  {/* Colonne de droite - Dates et organisation */}
                  <div className="space-y-6">
                    {/* Date de début */}
                    <div>
                      <label htmlFor="wizard-dateDebut" className="block text-sm font-medium text-gray-700 mb-2">
                        Date et heure de début *
                      </label>
                      <input
                        type="datetime-local"
                        id="wizard-dateDebut"
                        value={formData.dateDebut}
                        onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Date de fin */}
                    <div>
                      <label htmlFor="wizard-dateFin" className="block text-sm font-medium text-gray-700 mb-2">
                        Date et heure de fin *
                      </label>
                      <input
                        type="datetime-local"
                        id="wizard-dateFin"
                        value={formData.dateFin}
                        onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Organisateur */}
                    <div>
                      <label htmlFor="wizard-organisateur" className="block text-sm font-medium text-gray-700 mb-2">
                        Organisateur *
                      </label>
                      <input
                        type="text"
                        id="wizard-organisateur"
                        value={formData.organisateur}
                        onChange={(e) => setFormData({...formData, organisateur: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nom de l'organisateur ou entreprise"
                      />
                    </div>

                    {/* Email de contact */}
                    <div>
                      <label htmlFor="wizard-emailContact" className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contact *
                      </label>
                      <input
                        type="email"
                        id="wizard-emailContact"
                        value={formData.emailContact}
                        onChange={(e) => setFormData({...formData, emailContact: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="contact@exemple.com"
                      />
                    </div>

                    {/* Places disponibles */}
                    <div>
                      <label htmlFor="wizard-places" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de places disponibles
                      </label>
                      <input
                        type="number"
                        id="wizard-places"
                        value={formData.placesDisponibles}
                        onChange={(e) => setFormData({...formData, placesDisponibles: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="100"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Configuration Section */}
                {/* Navigation buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Validation simple
                      if (formData.nom && formData.dateDebut && formData.dateFin && formData.organisateur && formData.emailContact && formData.emailSubject && formData.emailTemplate) {
                        setCurrentStep(3);
                      } else {
                        alert('Veuillez remplir tous les champs obligatoires (*), y compris la configuration email');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                  >
                    Continuer
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Sessions and Speakers */}
          {currentStep === 3 && selectedWizardType === 'conference' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sessions et Intervenants
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Configurez vos sessions et ajoutez les intervenants de votre conférence.
                </p>
              </div>

              <div className="max-w-6xl mx-auto space-y-8">
                {/* Section Intervenants */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      👥 Intervenants
                      <span className="text-sm font-normal opacity-90">({intervenants.length})</span>
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      {intervenants.map((intervenant, index) => (
                        <div key={intervenant.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Intervenant {index + 1}
                            </h4>
                            {intervenants.length > 1 && (
                              <button
                                onClick={() => {
                                  setIntervenants(intervenants.filter(i => i.id !== intervenant.id));
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Supprimer cet intervenant"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                              <input
                                type="text"
                                value={intervenant.prenom}
                                onChange={(e) => {
                                  const newIntervenants = [...intervenants];
                                  newIntervenants[index].prenom = e.target.value;
                                  setIntervenants(newIntervenants);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Jean"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                              <input
                                type="text"
                                value={intervenant.nom}
                                onChange={(e) => {
                                  const newIntervenants = [...intervenants];
                                  newIntervenants[index].nom = e.target.value;
                                  setIntervenants(newIntervenants);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Dupont"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                              <input
                                type="email"
                                value={intervenant.email}
                                onChange={(e) => {
                                  const newIntervenants = [...intervenants];
                                  newIntervenants[index].email = e.target.value;
                                  setIntervenants(newIntervenants);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="jean.dupont@email.com"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                              <input
                                type="text"
                                value={intervenant.entreprise}
                                onChange={(e) => {
                                  const newIntervenants = [...intervenants];
                                  newIntervenants[index].entreprise = e.target.value;
                                  setIntervenants(newIntervenants);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="TechCorp"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                              <input
                                type="text"
                                value={intervenant.poste}
                                onChange={(e) => {
                                  const newIntervenants = [...intervenants];
                                  newIntervenants[index].poste = e.target.value;
                                  setIntervenants(newIntervenants);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="CEO, CTO, Expert..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                              <input
                                type="tel"
                                value={intervenant.telephone}
                                onChange={(e) => {
                                  const newIntervenants = [...intervenants];
                                  newIntervenants[index].telephone = e.target.value;
                                  setIntervenants(newIntervenants);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="+33 1 23 45 67 89"
                              />
                            </div>

                            <div className="md:col-span-2 lg:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                              <textarea
                                value={intervenant.bio}
                                onChange={(e) => {
                                  const newIntervenants = [...intervenants];
                                  newIntervenants[index].bio = e.target.value;
                                  setIntervenants(newIntervenants);
                                }}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                placeholder="Présentation de l'intervenant, son expertise, ses réalisations..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setIntervenants([...intervenants, {
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
                        }]);
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter un intervenant
                    </button>
                  </div>
                </div>

                {/* Section Sessions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      📋 Sessions de conférence
                      <span className="text-sm font-normal opacity-90">({sessions.length})</span>
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      {sessions.map((session, index) => (
                        <div key={session.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Session {index + 1}
                            </h4>
                            {sessions.length > 1 && (
                              <button
                                onClick={() => {
                                  setSessions(sessions.filter(s => s.id !== session.id));
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Supprimer cette session"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la session *</label>
                              <input
                                type="text"
                                value={session.titre}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].titre = e.target.value;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Ex: L'avenir de l'intelligence artificielle"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Type de session</label>
                              <select
                                value={session.type_session}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].type_session = e.target.value as any;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="presentation">🎤 Présentation</option>
                                <option value="keynote">⭐ Keynote</option>
                                <option value="workshop">🛠️ Workshop</option>
                                <option value="table-ronde">🗣️ Table ronde</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité max</label>
                              <input
                                type="number"
                                value={session.capacite_max}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].capacite_max = e.target.value;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="100"
                                min="1"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date de la session *</label>
                              <input
                                type="date"
                                value={session.date}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].date = e.target.value;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                              <input
                                type="time"
                                value={session.heure_debut}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].heure_debut = e.target.value;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
                              <input
                                type="time"
                                value={session.heure_fin}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].heure_fin = e.target.value;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                value={session.description}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].description = e.target.value;
                                  setSessions(newSessions);
                                }}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                placeholder="Description de la session, objectifs, contenu..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de la session</label>
                              <input
                                type="text"
                                value={session.lieu_session}
                                onChange={(e) => {
                                  const newSessions = [...sessions];
                                  newSessions[index].lieu_session = e.target.value;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Salle A, Amphithéâtre..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Intervenants assignés
                              </label>
                              <select
                                multiple
                                value={session.intervenant_ids}
                                onChange={(e) => {
                                  const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
                                  const newSessions = [...sessions];
                                  newSessions[index].intervenant_ids = selectedIds;
                                  setSessions(newSessions);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                size={Math.min(4, intervenants.length)}
                              >
                                {intervenants.map((intervenant) => (
                                  <option key={intervenant.id} value={intervenant.id}>
                                    {intervenant.prenom} {intervenant.nom} {intervenant.entreprise && `(${intervenant.entreprise})`}
                                  </option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                Maintenez Ctrl/Cmd pour sélectionner plusieurs intervenants
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSessions([...sessions, {
                          id: Date.now(),
                          titre: '',
                          description: '',
                          date: '',
                          heure_debut: '',
                          heure_fin: '',
                          lieu_session: '',
                          intervenant_ids: [],
                          capacite_max: '',
                          type_session: 'presentation'
                        }]);
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter une session
                    </button>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Validation des intervenants (au moins un avec nom/prénom/email)
                      const validIntervenants = intervenants.filter(i => i.nom && i.prenom && i.email);
                      // Validation des sessions (au moins une avec titre)
                      const validSessions = sessions.filter(s => s.titre);
                      
                      if (validIntervenants.length === 0) {
                        alert('Veuillez ajouter au moins un intervenant avec nom, prénom et email');
                        return;
                      }
                      
                      if (validSessions.length === 0) {
                        alert('Veuillez ajouter au moins une session avec un titre');
                        return;
                      }
                      
                      setCurrentStep(4);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                  >
                    Continuer
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Invités */}
          {currentStep === 4 && selectedWizardType === 'conference' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Gestion des participants
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Ajoutez des participants à votre conférence manuellement ou par import CSV.
                </p>
              </div>

              <div className="max-w-6xl mx-auto space-y-6">
                {/* Actions d'ajout de participants */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        👥 Participants 
                        <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          {participants.length}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Gérez la liste des participants de votre conférence
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAddParticipantForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter un participant
                      </button>
                      
                      <button
                        onClick={() => setShowImportModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Importer CSV
                      </button>
                    </div>
                  </div>

                  {/* Formulaire d'ajout de participant */}
                  {showAddParticipantForm && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-blue-900">Nouveau participant</h4>
                        <button
                          onClick={() => {
                            setShowAddParticipantForm(false);
                            setNewParticipant({
                              nom: '', prenom: '', email: '', telephone: '', entreprise: '', profession: '', commentaires: ''
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-1">Prénom *</label>
                          <input
                            type="text"
                            value={newParticipant.prenom}
                            onChange={(e) => setNewParticipant({...newParticipant, prenom: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Jean"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-1">Nom *</label>
                          <input
                            type="text"
                            value={newParticipant.nom}
                            onChange={(e) => setNewParticipant({...newParticipant, nom: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Dupont"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-1">Email *</label>
                          <input
                            type="email"
                            value={newParticipant.email}
                            onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="jean.dupont@email.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-1">Téléphone</label>
                          <input
                            type="tel"
                            value={newParticipant.telephone}
                            onChange={(e) => setNewParticipant({...newParticipant, telephone: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+33 1 23 45 67 89"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-1">Entreprise</label>
                          <input
                            type="text"
                            value={newParticipant.entreprise}
                            onChange={(e) => setNewParticipant({...newParticipant, entreprise: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="TechCorp"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-1">Profession</label>
                          <input
                            type="text"
                            value={newParticipant.profession}
                            onChange={(e) => setNewParticipant({...newParticipant, profession: e.target.value})}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Développeur, Manager..."
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-blue-900 mb-1">Commentaires</label>
                        <textarea
                          value={newParticipant.commentaires}
                          onChange={(e) => setNewParticipant({...newParticipant, commentaires: e.target.value})}
                          rows={2}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Informations complémentaires..."
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => {
                            setShowAddParticipantForm(false);
                            setNewParticipant({
                              nom: '', prenom: '', email: '', telephone: '', entreprise: '', profession: '', commentaires: ''
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Annuler
                        </button>
                        
                        <button
                          onClick={() => {
                            if (newParticipant.nom && newParticipant.prenom && newParticipant.email) {
                              setParticipants([...participants, {
                                id: Date.now(),
                                ...newParticipant,
                                statut: 'confirmé',
                                date_inscription: new Date().toISOString()
                              }]);
                              setNewParticipant({
                                nom: '', prenom: '', email: '', telephone: '', entreprise: '', profession: '', commentaires: ''
                              });
                              setShowAddParticipantForm(false);
                            } else {
                              alert('Veuillez remplir au moins le nom, prénom et email');
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-lg hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Modal d'import CSV (simulé) */}
                  {showImportModal && (
                    <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-green-900">Import CSV</h4>
                        <button
                          onClick={() => setShowImportModal(false)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-green-900 mb-2">
                            Fichier CSV à importer
                          </label>
                          <div 
                            className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const files = e.dataTransfer.files;
                              if (files.length > 0) {
                                handleCSVFile(files[0]);
                              }
                            }}
                          >
                            <input
                              type="file"
                              accept=".csv"
                              className="hidden"
                              id="csv-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleCSVFile(file);
                                }
                              }}
                            />
                            <label htmlFor="csv-upload" className="cursor-pointer">
                              <div className="text-green-600 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <p className="text-green-900 font-medium">Cliquez pour sélectionner un fichier CSV</p>
                              <p className="text-green-700 text-sm mt-1">ou glissez-déposez le fichier ici</p>
                            </label>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-900 mb-2">Format CSV attendu :</h5>
                          <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                            nom,prenom,email,telephone,entreprise,profession<br/>
                            Dupont,Jean,jean.dupont@email.com,0123456789,TechCorp,Développeur<br/>
                            Martin,Sophie,sophie.martin@email.com,0987654321,StartupXYZ,Designer
                          </div>
                          <div className="mt-3 text-xs text-green-700">
                            <p><strong>Colonnes supportées :</strong> nom, prenom, email (obligatoire), telephone, entreprise, profession</p>
                            <p><strong>Encodage :</strong> UTF-8 recommandé pour les caractères accentués</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowImportModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Fermer
                          </button>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                          <p className="text-sm text-blue-800 font-medium mb-1">💡 Mode d'emploi</p>
                          <p className="text-xs text-blue-700">
                            L'import se fait automatiquement dès que vous sélectionnez un fichier ou le glissez-déposez dans la zone.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Liste des participants */}
                  {participants.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Liste des participants :</h4>
                      <div className="grid gap-3">
                        {participants.map((participant, index) => (
                          <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-full flex items-center justify-center text-white font-bold shadow-lg border border-blue-400/30 backdrop-blur-sm">
                                {participant.prenom?.charAt(0)}{participant.nom?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {participant.prenom} {participant.nom}
                                </div>
                                <div className="text-sm text-gray-600">
                                  📧 {participant.email}
                                  {participant.telephone && (
                                    <span className="ml-3">📞 {participant.telephone}</span>
                                  )}
                                </div>
                                {(participant.entreprise || participant.profession) && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {participant.profession && `${participant.profession}`}
                                    {participant.entreprise && participant.profession && ' • '}
                                    {participant.entreprise && `${participant.entreprise}`}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                {participant.statut}
                              </span>
                              <button
                                onClick={() => {
                                  setParticipants(participants.filter(p => p.id !== participant.id));
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors p-1"
                                title="Supprimer ce participant"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        👥
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h4>
                      <p className="text-gray-600 text-sm">
                        Commencez par ajouter des participants à votre conférence
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                  
                  <button 
                    onClick={() => setCurrentStep(5)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                  >
                    Continuer
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Formulaires et emails */}
          {currentStep === 5 && selectedWizardType === 'conference' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Formulaires et emails
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Configurez l'email d'invitation, le formulaire d'inscription et l'email de confirmation pour votre événement.
                </p>
              </div>

              <div className="max-w-7xl mx-auto">
                {/* Grid avec 3 encarts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  
                  {/* Encart 1: Email d'invitation */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Email d'invitation</h3>
                      <p className="text-sm text-gray-600">Template pour inviter vos participants</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Modèle d'email d'invitation
                        </label>
                        <div className="space-y-2">
                          {[
                            { id: 'invitation1', name: 'Invitation Moderne', color: 'from-blue-500 to-indigo-600' },
                            { id: 'invitation2', name: 'Invitation Classique', color: 'from-gray-600 to-gray-800' },
                            { id: 'invitation3', name: 'Invitation Élégante', color: 'from-purple-500 to-pink-600' }
                          ].map((template) => (
                            <label
                              key={template.id}
                              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                invitationEmailTemplate === template.id
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="invitationTemplate"
                                value={template.id}
                                checked={invitationEmailTemplate === template.id}
                                onChange={(e) => setInvitationEmailTemplate(e.target.value)}
                                className="sr-only"
                              />
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${template.color} flex items-center justify-center mr-3`}>
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{template.name}</div>
                              </div>
                              {invitationEmailTemplate === template.id && (
                                <FiCheck className="w-5 h-5 text-blue-600" />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                          <strong>Aperçu :</strong> Email envoyé pour inviter les participants à s'inscrire à votre événement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Encart 2: Formulaire d'inscription */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Formulaire d'inscription</h3>
                      <p className="text-sm text-gray-600">Champs à remplir par les participants</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Type de formulaire
                        </label>
                        <div className="space-y-2">
                          {[
                            { id: 'standard', name: 'Standard', desc: 'Nom, prénom, email' },
                            { id: 'professionnel', name: 'Professionnel', desc: 'Inclut entreprise et fonction' },
                            { id: 'complet', name: 'Complet', desc: 'Tous les champs disponibles' }
                          ].map((type) => (
                            <label
                              key={type.id}
                              className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                registrationFormType === type.id
                                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="formType"
                                value={type.id}
                                checked={registrationFormType === type.id}
                                onChange={(e) => setRegistrationFormType(e.target.value)}
                                className="sr-only"
                              />
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{type.name}</div>
                                  <div className="text-xs text-gray-600">{type.desc}</div>
                                </div>
                                {registrationFormType === type.id && (
                                  <FiCheck className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700">
                          <strong>Champs inclus :</strong> Nom*, Prénom*, Email*
                          {registrationFormType === 'professionnel' && ', Entreprise, Fonction'}
                          {registrationFormType === 'complet' && ', Téléphone, Entreprise, Profession, Commentaires'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Encart 3: Email de confirmation d'inscription */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Email de confirmation</h3>
                      <p className="text-sm text-gray-600">Confirmation envoyée après inscription</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template de confirmation *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'modern', name: 'Moderne', preview: '✨', color: 'from-purple-500 to-indigo-600' },
                            { id: 'classic', name: 'Classique', preview: '📜', color: 'from-gray-600 to-gray-800' },
                            { id: 'minimal', name: 'Minimal', preview: '▫️', color: 'from-gray-400 to-gray-600' },
                            { id: 'original', name: 'Original', preview: '📧', color: 'from-blue-500 to-blue-700' }
                          ].map((template) => (
                            <div
                              key={template.id}
                              onClick={() => setFormData({...formData, emailTemplate: template.id})}
                              className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                formData.emailTemplate === template.id
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-center">
                                <div className={`w-full h-16 rounded-lg mb-2 flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br ${template.color}`}>
                                  {template.preview}
                                </div>
                                <h4 className="font-medium text-gray-900 text-xs">
                                  {template.name}
                                </h4>
                              </div>

                              {formData.emailTemplate === template.id && (
                                <div className="absolute top-1 right-1">
                                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    <FiCheck className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="emailSubjectStep5" className="block text-sm font-medium text-gray-700 mb-2">
                          Objet de l'email *
                        </label>
                        <input
                          type="text"
                          id="emailSubjectStep5"
                          value={formData.emailSubject}
                          onChange={(e) => setFormData({...formData, emailSubject: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Confirmation - {{event_name}}"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Couleur du header
                        </label>
                        <input
                          type="color"
                          value={formData.couleurHeaderEmail || '#3b82f6'}
                          onChange={(e) => setFormData({...formData, couleurHeaderEmail: e.target.value})}
                          className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700">
                          <strong>Aperçu :</strong> Email automatique envoyé après chaque inscription réussie.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button 
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                  
                  <button 
                    onClick={() => setCurrentStep(6)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                  >
                    Continuer
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Finalisation */}
          {currentStep === 6 && selectedWizardType === 'conference' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Récapitulatif et finalisation
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Vérifiez toutes les informations de votre conférence avant de la créer.
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {/* Récapitulatif des informations */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Récapitulatif de votre conférence
                  </h3>
                  
                  <div className="space-y-8">
                    {/* Informations générales - Section étendue */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="font-bold text-purple-700 text-lg mb-4">
                        Informations générales
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Nom de l'événement :</span>
                          <div className="mt-1 text-gray-900 font-medium">{formData.nom || 'Non défini'}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Type :</span>
                          <div className="mt-1 text-gray-900 font-medium">🎤 Conférence</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Format :</span>
                          <div className="mt-1 text-gray-900 font-medium">
                            {formData.typeLocalisation === 'lieu' ? '🏢 Présentiel' : 
                             formData.typeLocalisation === 'en_ligne' ? '💻 En ligne' : 
                             '🌐 Hybride'}
                          </div>
                        </div>
                        {formData.lieu && (
                          <div>
                            <span className="font-semibold text-gray-700">Lieu :</span>
                            <div className="mt-1 text-gray-900 font-medium">{formData.lieu}</div>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-700">Organisateur :</span>
                          <div className="mt-1 text-gray-900 font-medium">{formData.organisateur || 'Non défini'}</div>
                        </div>
                        {formData.placesDisponibles && (
                          <div>
                            <span className="font-semibold text-gray-700">Capacité :</span>
                            <div className="mt-1 text-gray-900 font-medium">{formData.placesDisponibles} places</div>
                          </div>
                        )}
                        {formData.description && (
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700">Description :</span>
                            <div className="mt-1 text-gray-900">{formData.description}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Planning et contact - Section étendue */}
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                      <h4 className="font-bold text-indigo-700 text-lg mb-4">
                        Planning et contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Date de début :</span>
                          <div className="mt-1 text-gray-900 font-medium">
                            {formData.dateDebut ? new Date(formData.dateDebut).toLocaleString('fr-FR') : 'Non défini'}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Date de fin :</span>
                          <div className="mt-1 text-gray-900 font-medium">
                            {formData.dateFin ? new Date(formData.dateFin).toLocaleString('fr-FR') : 'Non défini'}
                          </div>
                        </div>
                        {formData.dateDebut && formData.dateFin && (
                          <div>
                            <span className="font-semibold text-gray-700">Durée :</span>
                            <div className="mt-1 text-gray-900 font-medium">
                              {Math.ceil((new Date(formData.dateFin).getTime() - new Date(formData.dateDebut).getTime()) / (1000 * 60 * 60 * 24))} jour(s)
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-700">Email de contact :</span>
                          <div className="mt-1 text-gray-900 font-medium">{formData.emailContact || 'Non défini'}</div>
                        </div>
                        {formData.telephoneContact && (
                          <div>
                            <span className="font-semibold text-gray-700">Téléphone :</span>
                            <div className="mt-1 text-gray-900 font-medium">{formData.telephoneContact}</div>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-700">Statut :</span>
                          <div className="mt-1">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                              📝 Brouillon
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration email */}
                    <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                      <h4 className="font-bold text-pink-700 text-lg mb-4">
                        Configuration des emails
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Template sélectionné :</span>
                          <div className="mt-1 text-gray-900 font-medium">
                            {emailTemplates.find(t => t.id === formData.emailTemplate)?.name || 'Non défini'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {emailTemplates.find(t => t.id === formData.emailTemplate)?.description}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Objet de l'email :</span>
                          <div className="mt-1 text-gray-900 bg-white p-2 rounded border italic">
                            "{formData.emailSubject}"
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Intervenants - Section étendue */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h4 className="font-bold text-green-700 text-lg mb-4 flex items-center gap-2">
                        Intervenants
                        <span className="text-sm font-normal bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          {intervenants.filter(i => i.nom && i.prenom).length}
                        </span>
                      </h4>
                      {intervenants.filter(i => i.nom && i.prenom).length > 0 ? (
                        <div className="space-y-4">
                          {intervenants.filter(i => i.nom && i.prenom).map((intervenant, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                              <div className="font-semibold text-gray-900 text-base">
                                {intervenant.prenom} {intervenant.nom}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {intervenant.email && (
                                  <div>📧 {intervenant.email}</div>
                                )}
                                {intervenant.telephone && (
                                  <div>📞 {intervenant.telephone}</div>
                                )}
                                {(intervenant.poste || intervenant.entreprise) && (
                                  <div className="mt-2 text-gray-700">
                                    {intervenant.poste && `${intervenant.poste}`}
                                    {intervenant.poste && intervenant.entreprise && ' • '}
                                    {intervenant.entreprise && `${intervenant.entreprise}`}
                                  </div>
                                )}
                                {intervenant.bio && (
                                  <div className="mt-2 text-gray-600 text-xs italic">
                                    "{intervenant.bio}"
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Aucun intervenant configuré
                        </div>
                      )}
                    </div>

                    {/* Sessions - Section étendue */}
                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                      <h4 className="font-bold text-orange-700 text-lg mb-4 flex items-center gap-2">
                        Programme des sessions
                        <span className="text-sm font-normal bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                          {sessions.filter(s => s.titre).length}
                        </span>
                      </h4>
                      {sessions.filter(s => s.titre).length > 0 ? (
                        <div className="space-y-4">
                          {sessions.filter(s => s.titre).map((session, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-base">
                                    {session.titre}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <div className="flex items-center gap-4">
                                      {session.type_session && (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                          {session.type_session === 'presentation' ? '🎤 Présentation' :
                                           session.type_session === 'keynote' ? '⭐ Keynote' :
                                           session.type_session === 'workshop' ? '🛠️ Workshop' :
                                           '🗣️ Table ronde'}
                                        </span>
                                      )}
                                      {session.date && (
                                        <span className="text-gray-700 font-medium">
                                          📅 {new Date(session.date).toLocaleDateString('fr-FR')}
                                        </span>
                                      )}
                                      {(session.heure_debut && session.heure_fin) && (
                                        <span className="text-gray-700 font-medium">
                                          ⏰ {session.heure_debut} - {session.heure_fin}
                                        </span>
                                      )}
                                      {session.lieu_session && (
                                        <span className="text-gray-700">
                                          📍 {session.lieu_session}
                                        </span>
                                      )}
                                    </div>
                                    {session.capacite_max && (
                                      <div className="mt-1 text-gray-600">
                                        👥 Capacité max : {session.capacite_max} personnes
                                      </div>
                                    )}
                                  </div>
                                  {session.description && (
                                    <div className="mt-2 text-gray-700 text-sm">
                                      {session.description}
                                    </div>
                                  )}
                                  {session.intervenant_ids && session.intervenant_ids.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs font-medium text-gray-600">Intervenants assignés :</span>
                                      <div className="text-sm text-gray-700 mt-1">
                                        {session.intervenant_ids.map(id => {
                                          const intervenant = intervenants.find(i => i.id === id);
                                          return intervenant ? `${intervenant.prenom} ${intervenant.nom}` : '';
                                        }).filter(Boolean).join(', ') || 'Aucun'}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Aucune session configurée
                        </div>
                      )}
                    </div>

                    {/* Participants */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-bold text-blue-700 text-lg mb-4 flex items-center gap-2">
                        Participants
                        <span className="text-sm font-normal bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                          {participants.length}
                        </span>
                      </h4>
                      {participants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {participants.slice(0, 4).map((participant, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-blue-200 text-sm">
                              <div className="font-semibold text-gray-900">
                                {participant.prenom} {participant.nom}
                              </div>
                              <div className="text-gray-600">
                                📧 {participant.email}
                              </div>
                              {participant.entreprise && (
                                <div className="text-gray-600">
                                  🏢 {participant.entreprise}
                                </div>
                              )}
                            </div>
                          ))}
                          {participants.length > 4 && (
                            <div className="flex items-center justify-center bg-white p-3 rounded-lg border border-blue-200 text-blue-600 font-medium">
                              +{participants.length - 4} autres participants
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Aucun participant ajouté
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions de création */}
                <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200/50 p-6 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center shadow-lg border border-blue-400/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Prêt à créer votre conférence ?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      En cliquant sur "Créer la conférence", votre événement sera créé avec tous les paramètres configurés.
                    </p>
                    
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => setCurrentStep(5)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour aux formulaires
                      </button>
                      
                      <button 
                        onClick={handleCreateEvent}
                        disabled={isCreatingEvent}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-bold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg border border-blue-400/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isCreatingEvent ? (
                          <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Création en cours...
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-5 h-5" />
                            Créer la conférence
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Steps Placeholder */}
          {(currentStep !== 1 && 
            !(currentStep === 2 && selectedWizardType === 'conference') && 
            !(currentStep === 3 && selectedWizardType === 'conference') &&
            !(currentStep === 4 && selectedWizardType === 'conference') &&
            !(currentStep === 6 && selectedWizardType === 'conference')) && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <FiZap className="w-12 h-12 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Étape {currentStep} - En développement
              </h2>
              
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Cette étape sera développée selon le type de wizard sélectionné.
              </p>
              
              <button 
                onClick={() => setCurrentStep(currentStep > 1 ? currentStep - 1 : 1)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de succès d'import */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header avec dégradé */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Import réussi !</h3>
            </div>
            
            {/* Contenu */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{importedCount}
                </div>
                <p className="text-gray-700 font-medium">
                  {modalMessage}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Participants ajoutés à votre liste
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    // Reset du wizard pour créer un nouvel événement
                    setCurrentStep(1);
                    setSelectedWizardType(null);
                    setFormData({
                      nom: '',
                      description: '',
                      dateDebut: '',
                      dateFin: '',
                      lieu: '',
                      organisateur: '',
                      emailContact: '',
                      telephoneContact: '',
                      placesDisponibles: '',
                      typeLocalisation: 'lieu',
                      emailTemplate: 'modern',
                      emailSubject: 'Confirmation de votre inscription - {{event_name}}',
                      couleurHeaderEmail: '#3b82f6'
                    });
                    setParticipants([]);
                    setIntervenants([{
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
                    }]);
                    setSessions([{
                      id: Date.now(),
                      titre: '',
                      description: '',
                      date: '',
                      heure_debut: '',
                      heure_fin: '',
                      lieu_session: '',
                      intervenant_ids: [],
                      capacite_max: '',
                      type_session: 'presentation'
                    }]);
                    setEventCreated(false);
                    setCreatedEventId(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Nouvel événement
                </button>
                <button
                  onClick={() => window.location.href = '/admin/evenements'}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                >
                  📋 Voir mes événements
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'erreur d'import */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header avec dégradé rouge */}
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-red-400/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Erreur d'import</h3>
            </div>
            
            {/* Contenu */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <p className="text-gray-700 font-medium mb-4">
                  {modalMessage}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-1">💡 Conseils :</p>
                  <ul className="text-xs text-blue-700 text-left space-y-1">
                    <li>• Vérifiez que votre fichier est bien au format .csv</li>
                    <li>• Assurez-vous d'avoir les colonnes : nom, prenom, email</li>
                    <li>• Utilisez l'encodage UTF-8 pour les accents</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour l'envoi des emails */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Événement créé avec succès !</h3>
            </div>
            
            {/* Contenu */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-800 font-medium mb-4">
                  🎉 Votre conférence "<strong>{formData.nom}</strong>" a été créée !
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    📧 Souhaitez-vous envoyer les emails d'invitation maintenant ?
                  </p>
                  <ul className="text-xs text-blue-700 text-left space-y-1">
                    <li>• <strong>{participants.length}</strong> participant(s) recevront un email d'invitation</li>
                    <li>• Template sélectionné : <strong>{invitationEmailTemplate}</strong></li>
                    <li>• Formulaire d'inscription : <strong>{registrationFormType}</strong></li>
                    <li>• Template de confirmation : <strong>{formData.emailTemplate}</strong></li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    <strong>Note :</strong> Les participants pourront s'inscrire via le formulaire configuré et recevront automatiquement l'email de confirmation.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Plus tard
                </button>
                <button
                  onClick={handleSendInvitationEmails}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg"
                >
                  📧 Envoyer les invitations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de statut envoi d'emails */}
      {emailsSending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
                <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Envoi des invitations</h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-700 font-medium mb-4">
                📧 Envoi des emails d'invitation en cours...
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  Veuillez patienter pendant l'envoi des {participants.length} email(s) d'invitation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}