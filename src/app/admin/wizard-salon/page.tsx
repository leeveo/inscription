'use client'

import React, { useState } from 'react';
import { FiZap, FiArrowRight, FiCheck, FiCalendar, FiUsers, FiSettings, FiMail, FiMapPin, FiClock, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function WizardSalonPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWizardType, setSelectedWizardType] = useState<string | null>('salon-professionnel');

  // Form data pour le wizard Salon professionnel (étendu avec tous les champs)
  const [formData, setFormData] = useState({
    // Champs principaux (table inscription_evenements)
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    organisateur: '',
    emailContact: '',
    telephoneContact: '',
    placesDisponibles: '',

    // Nouveaux champs pour étape 1
    typeEvenement: 'salon',
    statut: 'brouillon', // This is correct - database accepts this value
    codeAcces: '',
    evenementPayant: false,
    prix: 0,
    logoUrl: '',

    // Configuration (table inscription_evenements)
    typeLocalisation: 'lieu' as 'lieu' | 'en_ligne' | 'non_applicable',
    emailTemplate: 'professional',
    emailSubject: 'Confirmation d\'inscription au Salon - {{event_name}}',
    couleurHeaderEmail: '#3b82f6'
  });

  // Données pour ÉTAPE 2: EXPOSANTS (table salon_exposants)
  const [exposants, setExposants] = useState([
    {
      id: Date.now(),
      nomContact: '',
      prenomContact: '',
      emailContact: '',
      telephoneContact: '',
      entrepriseExposante: '',
      posteContact: '',
      secteurActivite: '',
      numeroStand: '',
      descriptionEntreprise: '',
      linkedin: ''
    }
  ]);

  // Données pour ÉTAPE 3: INTERVENANTS (table salon_intervenants)
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
      type_session: 'conference' as 'conference' | 'workshop' | 'table-ronde' | 'presentation' | 'atelier'
    }
  ]);

  // Visiteurs/Participants
  const [participants, setParticipants] = useState<any[]>([]);
  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  // États pour les configurations salon (étape 4)
  const [salonConfig, setSalonConfig] = useState({
    checkinType: 'qrcode' as 'qrcode' | 'badge' | 'manuel',
    badgeTemplate: 'professional',
    invitationEmailTemplate: 'template_salon',
    emailSubject: 'Confirmation d\'inscription au Salon - {{event_name}}',
    couleurHeaderEmail: '#3b82f6'
  });
  const [newParticipant, setNewParticipant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    profession: '',
    objectifVisite: '',
    participantType: 'visiteur' as 'visiteur' | 'exposant_staff'
  });

  // États pour la création de l'événement
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [emailsSending, setEmailsSending] = useState(false);

  // Fonction pour traiter le fichier CSV (version améliorée comme dans wizard-event)
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
              objectifVisite: '',
              participantType: 'visiteur' as 'visiteur' | 'exposant_staff',
              statutInscription: 'confirmé',
              dateInscription: new Date().toISOString()
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
                  case 'objectif':
                  case 'objectif_visite':
                  case 'visite':
                    participant.objectifVisite = values[index];
                    break;
                  case 'type':
                  case 'participant_type':
                  case 'type_participant':
                    participant.participantType = values[index] as 'visiteur' | 'exposant_staff';
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
        setModalMessage('Erreur lors de la lecture du fichier CSV');
        setShowErrorModal(true);
      }
    };
    reader.readAsText(file);
  };

  // Types de wizard disponibles (même design que wizard-event)
  const wizardTypes = [
    {
      id: 'salon-professionnel',
      title: 'Salon professionnel checkin',
      description: 'Optimisé pour les salons avec système de check-in avancé, gestion des exposants et visiteurs',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-slate-900 via-blue-900 to-indigo-900',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      hoverColor: 'group-hover:text-blue-600',
      tags: ['Check-in QR', 'Exposants', 'Badges', 'Analytics'],
      tagColors: ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-cyan-100 text-cyan-700']
    }
  ];

  // Étapes du wizard (adaptées pour salon - 6 étapes)
  const steps = [
    { id: 1, title: 'Informations générales', icon: <FiSettings className="w-5 h-5" /> },
    { id: 2, title: 'Exposants', icon: <FiUsers className="w-5 h-5" /> },
    { id: 3, title: 'Présentations', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
    { id: 4, title: 'Check-in', icon: <FiCheckCircle className="w-5 h-5" /> },
    { id: 5, title: 'Participants', icon: <FiUsers className="w-5 h-5" /> },
    { id: 6, title: 'Finalisation', icon: <FiCheck className="w-5 h-5" /> },
  ];

  // Mise à jour du formulaire
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ========== FONCTIONS POUR EXPOSANTS (ÉTAPE 2) ==========
  const addExposant = () => {
    setExposants(prev => [...prev, {
      id: Date.now(),
      nomContact: '',
      prenomContact: '',
      emailContact: '',
      telephoneContact: '',
      entrepriseExposante: '',
      posteContact: '',
      secteurActivite: '',
      numeroStand: '',
      descriptionEntreprise: '',
      linkedin: ''
    }]);
  };

  const updateExposant = (id: number, field: string, value: any) => {
    setExposants(prev => prev.map(exposant =>
      exposant.id === id ? { ...exposant, [field]: value } : exposant
    ));
  };

  const removeExposant = (id: number) => {
    setExposants(prev => prev.filter(exposant => exposant.id !== id));
  };

  // ========== FONCTIONS POUR INTERVENANTS (ÉTAPE 3) ==========
  const addIntervenant = () => {
    setIntervenants(prev => [...prev, {
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
  };

  const updateIntervenant = (id: number, field: string, value: any) => {
    setIntervenants(prev => prev.map(intervenant =>
      intervenant.id === id ? { ...intervenant, [field]: value } : intervenant
    ));
  };

  const removeIntervenant = (id: number) => {
    setIntervenants(prev => prev.filter(intervenant => intervenant.id !== id));
  };

  // Ajouter une session
  const addSession = () => {
    setSessions(prev => [...prev, {
      id: Date.now(),
      titre: '',
      description: '',
      date: '',
      heure_debut: '',
      heure_fin: '',
      lieu_session: '',
      intervenant: '',
      capacite_max: '',
      type_session: 'conference'
    }]);
  };

  // Mettre à jour une session
  const updateSession = (id: number, field: string, value: any) => {
    setSessions(prev => prev.map(session =>
      session.id === id ? { ...session, [field]: value } : session
    ));
  };

  // Supprimer une session
  const removeSession = (id: number) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  // Ajouter un participant
  const addParticipant = () => {
    if (newParticipant.nom && newParticipant.prenom && newParticipant.email) {
      setParticipants(prev => [...prev, {
        ...newParticipant,
        id: Date.now(),
        statutInscription: 'confirmé',
        dateInscription: new Date().toISOString()
      }]);
      setNewParticipant({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        entreprise: '',
        profession: '',
        objectifVisite: '',
        participantType: 'visiteur'
      });
      setShowAddParticipantForm(false);
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Créer l'événement
  const createEvent = async () => {
    setIsCreatingEvent(true);
    try {
      // Préparer les données pour l'API
      const eventData = {
        nom: formData.nom,
        description: formData.description,
        date_debut: formData.dateDebut,
        date_fin: formData.dateFin,
        lieu: formData.lieu,
        organisateur: formData.organisateur,
        email_contact: formData.emailContact,
        telephone_contact: formData.telephoneContact,
        places_disponibles: formData.placesDisponibles ? parseInt(formData.placesDisponibles) : null,
        type_evenement: formData.typeEvenement,
        statut: formData.statut,
        code_acces: formData.codeAcces,
        evenement_payant: formData.evenementPayant,
        prix: formData.prix,
        logo_url: formData.logoUrl,
        type_localisation: formData.typeLocalisation,
        email_template: formData.emailTemplate,
        email_subject: formData.emailSubject,
        couleur_header_email: formData.couleurHeaderEmail
      };

      // Créer l'événement principal via l'API
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de l\'événement');
      }

      const result = await response.json();
      const eventId = result.data.id;

      // TODO: Implémenter la création des données associées
      // - Ajouter les exposants dans la table salon_exposants
      // - Ajouter les intervenants dans la table salon_intervenants
      // - Ajouter les sessions dans la table inscription_sessions
      // - Ajouter les participants dans la table inscription_participants
      // - Configurer le système de check-in dans salon_configurations

      setEventCreated(true);
      setCreatedEventId(eventId);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Erreur lors de la création du salon:', error);
      setModalMessage(error instanceof Error ? error.message : 'Erreur lors de la création du salon');
      setShowErrorModal(true);
    } finally {
      setIsCreatingEvent(false);
    }
  };

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
                Wizard Salon Professionnel
              </h1>
              <p className="text-gray-600 font-medium">
                Créez votre salon professionnel avec système de check-in avancé
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
  
          {/* Step 1: Salon Details */}
          {currentStep === 1 && selectedWizardType === 'salon-professionnel' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Informations de votre salon
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Renseignez les détails essentiels de votre salon. Ces informations pourront être modifiées plus tard.
                </p>
              </div>

              {/* Simplified Event Details Form */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Colonne de gauche - Informations principales */}
                  <div className="space-y-6">
                    {/* Nom du salon */}
                    <div>
                      <label htmlFor="wizard-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du salon *
                      </label>
                      <input
                        type="text"
                        id="wizard-nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: Salon Tech 2024"
                      />
                    </div>

                    {/* Date et heure de début */}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Date et heure de fin */}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Lieu */}
                    <div>
                      <label htmlFor="wizard-lieu" className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu *
                      </label>
                      <input
                        type="text"
                        id="wizard-lieu"
                        value={formData.lieu}
                        onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: Paris Expo Porte de Versailles"
                      />
                    </div>
                  </div>

                  {/* Colonne de droite - Informations complémentaires */}
                  <div className="space-y-6">
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
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nom de l'organisateur"
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
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="contact@organisateur.fr"
                      />
                    </div>

                    {/* Téléphone de contact */}
                    <div>
                      <label htmlFor="wizard-telephoneContact" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone de contact
                      </label>
                      <input
                        type="tel"
                        id="wizard-telephoneContact"
                        value={formData.telephoneContact}
                        onChange={(e) => setFormData({...formData, telephoneContact: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>

                    {/* Places disponibles */}
                    <div>
                      <label htmlFor="wizard-placesDisponibles" className="block text-sm font-medium text-gray-700 mb-2">
                        Places disponibles
                      </label>
                      <input
                        type="number"
                        id="wizard-placesDisponibles"
                        value={formData.placesDisponibles}
                        onChange={(e) => setFormData({...formData, placesDisponibles: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="1000"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                  <label htmlFor="wizard-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description du salon
                  </label>
                  <textarea
                    id="wizard-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Décrivez votre salon, les exposants, les conférences prévues..."
                  />
                </div>

                {/* Nouveaux champs - Configuration avancée */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="wizard-codeAcces" className="block text-sm font-medium text-gray-700 mb-2">
                      Code d'accès (optionnel)
                    </label>
                    <input
                      type="text"
                      id="wizard-codeAcces"
                      value={formData.codeAcces}
                      onChange={(e) => setFormData({...formData, codeAcces: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="SALON2024"
                    />
                  </div>

                  <div>
                    <label htmlFor="wizard-prix" className="block text-sm font-medium text-gray-700 mb-2">
                      Prix d'entrée (€)
                    </label>
                    <input
                      type="number"
                      id="wizard-prix"
                      value={formData.prix}
                      onChange={(e) => setFormData({...formData, prix: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label htmlFor="wizard-typeLocalisation" className="block text-sm font-medium text-gray-700 mb-2">
                      Type de localisation
                    </label>
                    <select
                      id="wizard-typeLocalisation"
                      value={formData.typeLocalisation}
                      onChange={(e) => setFormData({...formData, typeLocalisation: e.target.value as 'lieu' | 'en_ligne' | 'non_applicable'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="lieu">En présentiel</option>
                      <option value="en_ligne">En ligne</option>
                      <option value="non_applicable">Non applicable</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="wizard-evenementPayant"
                      checked={formData.evenementPayant}
                      onChange={(e) => setFormData({...formData, evenementPayant: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="wizard-evenementPayant" className="text-sm font-medium text-gray-700">
                      Événement payant
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Exposants & Stands</h2>
              <div className="space-y-6">
                {exposants.map((exposant, index) => (
                  <div key={exposant.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Exposant {index + 1}</h3>
                      {exposants.length > 1 && (
                        <button
                          onClick={() => removeExposant(exposant.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact *</label>
                        <input
                          type="text"
                          value={exposant.nomContact}
                          onChange={(e) => updateExposant(exposant.id, 'nomContact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom du contact"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom du contact *</label>
                        <input
                          type="text"
                          value={exposant.prenomContact}
                          onChange={(e) => updateExposant(exposant.id, 'prenomContact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Prénom du contact"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise exposante *</label>
                        <input
                          type="text"
                          value={exposant.entrepriseExposante}
                          onChange={(e) => updateExposant(exposant.id, 'entrepriseExposante', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom de l'entreprise exposante"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email du contact *</label>
                        <input
                          type="email"
                          value={exposant.emailContact}
                          onChange={(e) => updateExposant(exposant.id, 'emailContact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="contact@entreprise.fr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du contact</label>
                        <input
                          type="tel"
                          value={exposant.telephoneContact}
                          onChange={(e) => updateExposant(exposant.id, 'telephoneContact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de Stand *</label>
                        <input
                          type="text"
                          value={exposant.numeroStand}
                          onChange={(e) => updateExposant(exposant.id, 'numeroStand', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="A12-B15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Poste du contact</label>
                        <input
                          type="text"
                          value={exposant.posteContact}
                          onChange={(e) => updateExposant(exposant.id, 'posteContact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Directeur commercial, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité *</label>
                        <input
                          type="text"
                          value={exposant.secteurActivite}
                          onChange={(e) => updateExposant(exposant.id, 'secteurActivite', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Industrie / Technologie / Services"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                          type="url"
                          value={exposant.linkedin}
                          onChange={(e) => updateExposant(exposant.id, 'linkedin', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://linkedin.com/in/profil"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description de l'entreprise</label>
                      <textarea
                        value={exposant.descriptionEntreprise}
                        onChange={(e) => updateExposant(exposant.id, 'descriptionEntreprise', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Description de l'entreprise, des produits/services exposés..."
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExposant}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  + Ajouter un exposant
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              {/* SECTION INTERVENANTS */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Intervenants</h2>
                <div className="space-y-6">
                  {intervenants.map((intervenant, index) => (
                    <div key={intervenant.id} className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Intervenant {index + 1}</h3>
                        {intervenants.length > 1 && (
                          <button
                            onClick={() => removeIntervenant(intervenant.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                          <input
                            type="text"
                            value={intervenant.nom}
                            onChange={(e) => updateIntervenant(intervenant.id, 'nom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom de l'intervenant"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                          <input
                            type="text"
                            value={intervenant.prenom}
                            onChange={(e) => updateIntervenant(intervenant.id, 'prenom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Prénom de l'intervenant"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                          <input
                            type="email"
                            value={intervenant.email}
                            onChange={(e) => updateIntervenant(intervenant.id, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="email@exemple.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                          <input
                            type="tel"
                            value={intervenant.telephone}
                            onChange={(e) => updateIntervenant(intervenant.id, 'telephone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="+33 1 23 45 67 89"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                          <input
                            type="text"
                            value={intervenant.entreprise}
                            onChange={(e) => updateIntervenant(intervenant.id, 'entreprise', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom de l'entreprise"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                          <input
                            type="text"
                            value={intervenant.poste}
                            onChange={(e) => updateIntervenant(intervenant.id, 'poste', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Poste ou fonction"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                          <input
                            type="url"
                            value={intervenant.linkedin}
                            onChange={(e) => updateIntervenant(intervenant.id, 'linkedin', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://linkedin.com/in/profil"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                          <input
                            type="url"
                            value={intervenant.twitter}
                            onChange={(e) => updateIntervenant(intervenant.id, 'twitter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://twitter.com/profil"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                        <textarea
                          value={intervenant.bio}
                          onChange={(e) => updateIntervenant(intervenant.id, 'bio', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Biographie de l'intervenant, expertise, etc..."
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addIntervenant}
                    className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 transition-colors"
                  >
                    + Ajouter un intervenant
                  </button>
                </div>
              </div>

              {/* SECTION SESSIONS */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Présentations et Sessions</h2>
                <div className="space-y-6">
                  {sessions.map((session, index) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Session {index + 1}</h3>
                        {sessions.length > 1 && (
                          <button
                            onClick={() => removeSession(session.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la session *</label>
                          <input
                            type="text"
                            value={session.titre}
                            onChange={(e) => updateSession(session.id, 'titre', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Titre de la session"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Intervenant principal</label>
                          <select
                            value={session.intervenant}
                            onChange={(e) => updateSession(session.id, 'intervenant', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Sélectionner un intervenant</option>
                            {intervenants.map((intervenant) => (
                              <option key={intervenant.id} value={intervenant.id.toString()}>
                                {intervenant.prenom} {intervenant.nom} {intervenant.entreprise && `- ${intervenant.entreprise}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                          <input
                            type="date"
                            value={session.date}
                            onChange={(e) => updateSession(session.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type de session</label>
                          <select
                            value={session.type_session}
                            onChange={(e) => updateSession(session.id, 'type_session', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="conference">Conférence</option>
                            <option value="workshop">Workshop</option>
                            <option value="table-ronde">Table ronde</option>
                            <option value="presentation">Présentation produit</option>
                            <option value="atelier">Atelier technique</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début *</label>
                          <input
                            type="time"
                            value={session.heure_debut}
                            onChange={(e) => updateSession(session.id, 'heure_debut', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin *</label>
                          <input
                            type="time"
                            value={session.heure_fin}
                            onChange={(e) => updateSession(session.id, 'heure_fin', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Espace dans le salon</label>
                          <input
                            type="text"
                            value={session.lieu_session}
                            onChange={(e) => updateSession(session.id, 'lieu_session', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Espace Conférence A, Auditorium"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Capacité maximale</label>
                          <input
                            type="number"
                            value={session.capacite_max}
                            onChange={(e) => updateSession(session.id, 'capacite_max', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="100"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description de la session</label>
                        <textarea
                          value={session.description}
                          onChange={(e) => updateSession(session.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Description détaillée de la session, sujets abordés..."
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addSession}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    + Ajouter une session
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuration du Salon</h2>

              {/* Configuration Check-in */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Système de Check-in</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de check-in
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div
                        onClick={() => setSalonConfig(prev => ({ ...prev, checkinType: 'qrcode' }))}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          salonConfig.checkinType === 'qrcode'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">📱</div>
                          <div className="font-medium">QR Code</div>
                          <div className="text-sm text-gray-600">Scan rapide des badges</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setSalonConfig(prev => ({ ...prev, checkinType: 'badge' }))}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          salonConfig.checkinType === 'badge'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🎫</div>
                          <div className="font-medium">Badge</div>
                          <div className="text-sm text-gray-600">Badges physiques</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setSalonConfig(prev => ({ ...prev, checkinType: 'manuel' }))}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          salonConfig.checkinType === 'manuel'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">✍️</div>
                          <div className="font-medium">Manuel</div>
                          <div className="text-sm text-gray-600">Saisie manuelle</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template de badge
                    </label>
                    <select
                      value={salonConfig.badgeTemplate}
                      onChange={(e) => setSalonConfig(prev => ({ ...prev, badgeTemplate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="professional">Professionnel</option>
                      <option value="modern">Moderne</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Configuration Emails */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Configuration des Emails</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template d'email d'invitation
                    </label>
                    <select
                      value={salonConfig.invitationEmailTemplate}
                      onChange={(e) => setSalonConfig(prev => ({ ...prev, invitationEmailTemplate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="template_salon">Professionnel Salon</option>
                      <option value="template_modern">Moderne</option>
                      <option value="template_elegant">Élégant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objet de l'email
                    </label>
                    <input
                      type="text"
                      value={salonConfig.emailSubject}
                      onChange={(e) => setSalonConfig(prev => ({ ...prev, emailSubject: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirmation d'inscription au Salon - {{event_name}}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur d'en-tête des emails
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={salonConfig.couleurHeaderEmail}
                        onChange={(e) => setSalonConfig(prev => ({ ...prev, couleurHeaderEmail: e.target.value }))}
                        className="w-20 h-12 px-2 py-1 border border-gray-300 rounded-lg"
                      />
                      <span className="text-sm text-gray-600">{salonConfig.couleurHeaderEmail}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Participants</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddParticipantForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter un participant
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Importer CSV
                  </button>
                </div>

                {showAddParticipantForm && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Participant</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          value={newParticipant.nom}
                          onChange={(e) => setNewParticipant(prev => ({ ...prev, nom: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom du participant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                        <input
                          type="text"
                          value={newParticipant.prenom}
                          onChange={(e) => setNewParticipant(prev => ({ ...prev, prenom: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Prénom du participant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={newParticipant.email}
                          onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                          type="tel"
                          value={newParticipant.telephone}
                          onChange={(e) => setNewParticipant(prev => ({ ...prev, telephone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <input
                          type="text"
                          value={newParticipant.entreprise}
                          onChange={(e) => setNewParticipant(prev => ({ ...prev, entreprise: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom de l'entreprise"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                        <input
                          type="text"
                          value={newParticipant.profession}
                          onChange={(e) => setNewParticipant(prev => ({ ...prev, profession: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Poste ou profession"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Objectif de visite</label>
                      <textarea
                        value={newParticipant.objectifVisite}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, objectifVisite: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Que recherchez-vous au salon ?"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de participant</label>
                      <select
                        value={newParticipant.participantType}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, participantType: e.target.value as 'visiteur' | 'exposant_staff' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="visiteur">Visiteur</option>
                        <option value="exposant_staff">Personnel exposant</option>
                      </select>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={addParticipant}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ajouter
                      </button>
                      <button
                        onClick={() => setShowAddParticipantForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {participants.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Participants ({participants.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-2 text-left">Nom</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Entreprise</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Objectif</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((participant) => (
                            <tr key={participant.id}>
                              <td className="border border-gray-200 px-4 py-2">
                                {participant.prenom} {participant.nom}
                              </td>
                              <td className="border border-gray-200 px-4 py-2">{participant.email}</td>
                              <td className="border border-gray-200 px-4 py-2">{participant.entreprise || '-'}</td>
                              <td className="border border-gray-200 px-4 py-2">{participant.objectifVisite || '-'}</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  participant.participantType === 'visiteur'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {participant.participantType === 'visiteur' ? 'Visiteur' : 'Personnel exposant'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirmation</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif du Salon</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <strong>Nom:</strong> {formData.nom}
                    </div>
                    <div>
                      <strong>Organisateur:</strong> {formData.organisateur}
                    </div>
                    <div>
                      <strong>Date:</strong> {formData.dateDebut} - {formData.dateFin}
                    </div>
                    <div>
                      <strong>Lieu:</strong> {formData.lieu}
                    </div>
                    <div>
                      <strong>Exposants:</strong> {exposants.length}
                    </div>
                    <div>
                      <strong>Intervenants:</strong> {intervenants.length}
                    </div>
                    <div>
                      <strong>Conférences:</strong> {sessions.length}
                    </div>
                    <div>
                      <strong>Participants:</strong> {participants.length}
                    </div>
                    <div>
                      <strong>Type de check-in:</strong> {salonConfig.checkinType}
                    </div>
                    <div>
                      <strong>Type d'événement:</strong> {formData.typeEvenement}
                    </div>
                    <div>
                      <strong>Statut:</strong> {formData.statut}
                    </div>
                  </div>
                </div>

                {exposants.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Exposants ({exposants.length})</h3>
                    <div className="space-y-2">
                      {exposants.map((exposant, index) => (
                        <div key={exposant.id} className="text-sm">
                          <strong>{exposant.entrepriseExposante}</strong> - Stand {exposant.numeroStand}
                          {exposant.nomContact && exposant.prenomContact &&
                            ` (${exposant.prenomContact} ${exposant.nomContact})`
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {intervenants.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Intervenants ({intervenants.length})</h3>
                    <div className="space-y-2">
                      {intervenants.map((intervenant, index) => (
                        <div key={intervenant.id} className="text-sm">
                          <strong>{intervenant.prenom} {intervenant.nom}</strong>
                          {intervenant.entreprise && ` - ${intervenant.entreprise}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sessions.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions ({sessions.length})</h3>
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div key={session.id} className="text-sm">
                          <strong>{session.titre}</strong> - {session.date} {session.heure_debut}-{session.heure_fin}
                          {session.intervenant && ` (${session.intervenant})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <FiArrowRight className="w-4 h-4 rotate-180" />
                  Précédent
                </button>
              )}
            </div>
            <div>
              {currentStep < steps.length ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-lg hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 font-medium shadow-lg border border-blue-400/30 backdrop-blur-sm"
                >
                  Suivant
                  <FiArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={createEvent}
                  disabled={isCreatingEvent}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingEvent ? 'Création en cours...' : 'Créer le salon'}
                  <FiZap className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Importer des participants</h3>
            <p className="text-gray-600 mb-4">
              Importez un fichier CSV avec les colonnes: nom, prénom, email, téléphone, entreprise, profession, objectif_visite
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleCSVFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Succès !</h3>
              <p className="text-gray-600 mb-4">
                {modalMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'erreur */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
              <p className="text-gray-600 mb-4">{modalMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmationModal && eventCreated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Salon créé avec succès !</h3>
              <p className="text-gray-600 mb-4">
                Votre salon "{formData.nom}" a été créé et prêt à accueillir les visiteurs.
              </p>
              <div className="space-y-2">
                <a
                  href={`/admin/evenements/${createdEventId}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Voir le salon
                </a>
                <a
                  href="/admin/evenements"
                  className="block w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Retour à la liste
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}