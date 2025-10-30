'use client'

import React, { useState } from 'react';
import { FiZap, FiArrowRight, FiCheck, FiCalendar, FiUsers, FiSettings, FiMail, FiMapPin, FiClock, FiUser, FiCheckCircle, FiAlertCircle, FiMusic, FiCreditCard } from 'react-icons/fi';

export default function WizardConcertPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWizardType, setSelectedWizardType] = useState<string | null>('concert-payant');

  // Form data pour le wizard Concert
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
    emailTemplate: 'concert',
    emailSubject: 'Confirmation de votre billet pour {{event_name}} - {{participant_firstname}}',
    couleurHeaderEmail: '#ef4444'
  });

  // Artistes et Programmes
  const [artistes, setArtistes] = useState([
    {
      id: Date.now(),
      nom: '',
      nom_groupe: '',
      style_musical: '',
      heure_scene: '',
      ordre_passage: 1,
      bio: '',
      photo_url: '',
      reseaux_sociaux: ''
    }
  ]);

  // Billetterie - Types de billets
  const [billets, setBillets] = useState([
    {
      id: Date.now(),
      nom: '',
      type_billet: 'standard' as 'standard' | 'vip' | 'early_bird' | 'etudiant',
      prix: '',
      description: '',
      places_disponibles: '',
      date_debut_vente: '',
      date_fin_vente: '',
      avantages: []
    }
  ]);

  // Sponsors et Partenaires
  const [sponsors, setSponsors] = useState([
    {
      id: Date.now(),
      nom: '',
      type_sponsor: 'gold' as 'gold' | 'silver' | 'bronze' | 'partenaire',
      logo_url: '',
      site_web: '',
      description: '',
      avantages: []
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

  // États pour les configurations email et billetterie
  const [invitationEmailTemplate, setInvitationEmailTemplate] = useState('template_concert');
  const [billetterieActive, setBilletterieActive] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paypal'>('stripe');
  const [newParticipant, setNewParticipant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type_billet: 'standard',
    code_promo: ''
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
              type_billet: 'standard',
              code_promo: '',
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
                  case 'type_billet':
                  case 'billet':
                  case 'ticket':
                    participant.type_billet = values[index];
                    break;
                  case 'code_promo':
                  case 'promo':
                    participant.code_promo = values[index];
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
      tags: ['Billetterie', 'Paiements', 'Artistes', 'Sponsors'],
      tagColors: ['bg-orange-100 text-orange-700', 'bg-red-100 text-red-700', 'bg-pink-100 text-pink-700', 'bg-purple-100 text-purple-700']
    }
  ];

  // Étapes du wizard (adaptées pour concert)
  const steps = [
    { id: 1, title: 'Informations générales', icon: <FiSettings className="w-5 h-5" /> },
    { id: 2, title: 'Artistes', icon: <FiMusic className="w-5 h-5" /> },
    { id: 3, title: 'Billetterie', icon: <FiCreditCard className="w-5 h-5" /> },
    { id: 4, title: 'Sponsors', icon: <FiUsers className="w-5 h-5" /> },
    { id: 5, title: 'Formulaires et emails', icon: <FiMail className="w-5 h-5" /> },
    { id: 6, title: 'Finalisation', icon: <FiCheck className="w-5 h-5" /> },
  ];

  // Mise à jour du formulaire
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Ajouter un artiste
  const addArtiste = () => {
    setArtistes(prev => [...prev, {
      id: Date.now(),
      nom: '',
      nom_groupe: '',
      style_musical: '',
      heure_scene: '',
      ordre_passage: prev.length + 1,
      bio: '',
      photo_url: '',
      reseaux_sociaux: ''
    }]);
  };

  // Mettre à jour un artiste
  const updateArtiste = (id: number, field: string, value: any) => {
    setArtistes(prev => prev.map(art =>
      art.id === id ? { ...art, [field]: value } : art
    ));
  };

  // Supprimer un artiste
  const removeArtiste = (id: number) => {
    setArtistes(prev => prev.filter(art => art.id !== id));
  };

  // Ajouter un type de billet
  const addBillet = () => {
    setBillets(prev => [...prev, {
      id: Date.now(),
      nom: '',
      type_billet: 'standard',
      prix: '',
      description: '',
      places_disponibles: '',
      date_debut_vente: '',
      date_fin_vente: '',
      avantages: []
    }]);
  };

  // Mettre à jour un billet
  const updateBillet = (id: number, field: string, value: any) => {
    setBillets(prev => prev.map(billet =>
      billet.id === id ? { ...billet, [field]: value } : billet
    ));
  };

  // Supprimer un billet
  const removeBillet = (id: number) => {
    setBillets(prev => prev.filter(billet => billet.id !== id));
  };

  // Ajouter un sponsor
  const addSponsor = () => {
    setSponsors(prev => [...prev, {
      id: Date.now(),
      nom: '',
      type_sponsor: 'bronze',
      logo_url: '',
      site_web: '',
      description: '',
      avantages: []
    }]);
  };

  // Mettre à jour un sponsor
  const updateSponsor = (id: number, field: string, value: any) => {
    setSponsors(prev => prev.map(sponsor =>
      sponsor.id === id ? { ...sponsor, [field]: value } : sponsor
    ));
  };

  // Supprimer un sponsor
  const removeSponsor = (id: number) => {
    setSponsors(prev => prev.filter(sponsor => sponsor.id !== id));
  };

  // Ajouter un participant
  const addParticipant = () => {
    if (newParticipant.nom && newParticipant.prenom && newParticipant.email) {
      setParticipants(prev => [...prev, { ...newParticipant, id: Date.now() }]);
      setNewParticipant({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        type_billet: 'standard',
        code_promo: ''
      });
      setShowAddParticipantForm(false);
    }
  };

  // Créer l'événement
  const createEvent = async () => {
    setIsCreatingEvent(true);
    try {
      // TODO: Implémenter la création de l'événement dans Supabase
      // Créer l'événement
      // Ajouter les artistes
      // Configurer la billetterie
      // Ajouter les sponsors
      // Ajouter les participants

      setEventCreated(true);
      setCreatedEventId('new-event-id'); // TODO: Remplacer par l'ID réel
      setShowConfirmationModal(true);
    } catch (error) {
      setModalMessage('Erreur lors de la création du concert');
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg border border-red-400/30 backdrop-blur-sm">
              <FiMusic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Wizard Concert
              </h1>
              <p className="text-gray-600 font-medium">
                Créez votre concert payant avec billetterie complète
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
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg border border-red-400/30'
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
                    currentStep > step.id ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">

          {/* Step 1: Concert Details */}
          {currentStep === 1 && selectedWizardType === 'concert-payant' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Informations de votre concert
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Renseignez les détails essentiels de votre concert. Ces informations pourront être modifiées plus tard.
                </p>
              </div>

              {/* Simplified Event Details Form */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Colonne de gauche - Informations principales */}
                  <div className="space-y-6">
                    {/* Nom du concert */}
                    <div>
                      <label htmlFor="wizard-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du concert *
                      </label>
                      <input
                        type="text"
                        id="wizard-nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: Festival Rock 2024"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: Zénith de Paris"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>

                    {/* Places disponibles */}
                    <div>
                      <label htmlFor="wizard-placesDisponibles" className="block text-sm font-medium text-gray-700 mb-2">
                        Places disponibles *
                      </label>
                      <input
                        type="number"
                        id="wizard-placesDisponibles"
                        value={formData.placesDisponibles}
                        onChange={(e) => setFormData({...formData, placesDisponibles: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="5000"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                  <label htmlFor="wizard-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description du concert
                  </label>
                  <textarea
                    id="wizard-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Décrivez votre concert, les artistes, l'ambiance..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Artistes */}
          {currentStep === 2 && selectedWizardType === 'concert-payant' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Artistes et Programme
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Ajoutez les artistes qui se produiront lors de votre concert.
                </p>
              </div>

              <div className="space-y-6">
                {artistes.map((artiste, index) => (
                  <div key={artiste.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Artiste {index + 1}</h3>
                      {artistes.length > 1 && (
                        <button
                          onClick={() => removeArtiste(artiste.id)}
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
                          value={artiste.nom}
                          onChange={(e) => updateArtiste(artiste.id, 'nom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Nom de l'artiste"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Groupe</label>
                        <input
                          type="text"
                          value={artiste.nom_groupe}
                          onChange={(e) => updateArtiste(artiste.id, 'nom_groupe', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Nom du groupe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Style musical</label>
                        <input
                          type="text"
                          value={artiste.style_musical}
                          onChange={(e) => updateArtiste(artiste.id, 'style_musical', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Rock, Jazz, Electro..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heure de scène</label>
                        <input
                          type="time"
                          value={artiste.heure_scene}
                          onChange={(e) => updateArtiste(artiste.id, 'heure_scene', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordre de passage</label>
                        <input
                          type="number"
                          value={artiste.ordre_passage}
                          onChange={(e) => updateArtiste(artiste.id, 'ordre_passage', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                      <textarea
                        value={artiste.bio}
                        onChange={(e) => updateArtiste(artiste.id, 'bio', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Présentation de l'artiste..."
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addArtiste}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  + Ajouter un artiste
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Billetterie */}
          {currentStep === 3 && selectedWizardType === 'concert-payant' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Billetterie
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Configurez les différents types de billets pour votre concert.
                </p>
              </div>

              <div className="space-y-6">
                {billets.map((billet, index) => (
                  <div key={billet.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Type de billet {index + 1}</h3>
                      {billets.length > 1 && (
                        <button
                          onClick={() => removeBillet(billet.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du billet *</label>
                        <input
                          type="text"
                          value={billet.nom}
                          onChange={(e) => updateBillet(billet.id, 'nom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Billet Standard"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={billet.type_billet}
                          onChange={(e) => updateBillet(billet.id, 'type_billet', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="standard">Standard</option>
                          <option value="vip">VIP</option>
                          <option value="early_bird">Early Bird</option>
                          <option value="etudiant">Étudiant</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                        <input
                          type="number"
                          value={billet.prix}
                          onChange={(e) => updateBillet(billet.id, 'prix', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="25.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Places disponibles</label>
                        <input
                          type="number"
                          value={billet.places_disponibles}
                          onChange={(e) => updateBillet(billet.id, 'places_disponibles', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="100"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Début des ventes</label>
                        <input
                          type="datetime-local"
                          value={billet.date_debut_vente}
                          onChange={(e) => updateBillet(billet.id, 'date_debut_vente', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin des ventes</label>
                        <input
                          type="datetime-local"
                          value={billet.date_fin_vente}
                          onChange={(e) => updateBillet(billet.id, 'date_fin_vente', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={billet.description}
                        onChange={(e) => updateBillet(billet.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Description du billet..."
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addBillet}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  + Ajouter un type de billet
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Sponsors */}
          {currentStep === 4 && selectedWizardType === 'concert-payant' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sponsors et Partenaires
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Ajoutez les sponsors et partenaires de votre événement.
                </p>
              </div>

              <div className="space-y-6">
                {sponsors.map((sponsor, index) => (
                  <div key={sponsor.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Sponsor {index + 1}</h3>
                      {sponsors.length > 1 && (
                        <button
                          onClick={() => removeSponsor(sponsor.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          value={sponsor.nom}
                          onChange={(e) => updateSponsor(sponsor.id, 'nom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Nom du sponsor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de sponsor</label>
                        <select
                          value={sponsor.type_sponsor}
                          onChange={(e) => updateSponsor(sponsor.id, 'type_sponsor', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                          <option value="bronze">Bronze</option>
                          <option value="partenaire">Partenaire</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                        <input
                          type="url"
                          value={sponsor.site_web}
                          onChange={(e) => updateSponsor(sponsor.id, 'site_web', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input
                          type="url"
                          value={sponsor.logo_url}
                          onChange={(e) => updateSponsor(sponsor.id, 'logo_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={sponsor.description}
                        onChange={(e) => updateSponsor(sponsor.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Description du sponsor..."
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSponsor}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  + Ajouter un sponsor
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Formulaires et emails */}
          {currentStep === 5 && selectedWizardType === 'concert-payant' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Formulaires et Emails
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Configurez les emails de confirmation et les formulaires d'inscription.
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template d'email
                  </label>
                  <select
                    value={invitationEmailTemplate}
                    onChange={(e) => setInvitationEmailTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="template_concert">Template Concert</option>
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
                    value={formData.emailSubject}
                    onChange={(e) => setFormData({...formData, emailSubject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Confirmation de votre billet pour {{event_name}}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur d'en-tête
                  </label>
                  <input
                    type="color"
                    value={formData.couleurHeaderEmail}
                    onChange={(e) => setFormData({...formData, couleurHeaderEmail: e.target.value})}
                    className="w-full h-12 px-2 py-1 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={billetterieActive}
                      onChange={(e) => setBilletterieActive(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Activer la billetterie en ligne</span>
                  </label>
                </div>
                {billetterieActive && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fournisseur de paiement
                    </label>
                    <select
                      value={paymentProvider}
                      onChange={(e) => setPaymentProvider(e.target.value as 'stripe' | 'paypal')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Finalisation */}
          {currentStep === 6 && selectedWizardType === 'concert-payant' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Récapitulatif et Finalisation
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Vérifiez toutes les informations avant de créer votre concert.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du concert</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><strong>Nom:</strong> {formData.nom}</div>
                    <div><strong>Organisateur:</strong> {formData.organisateur}</div>
                    <div><strong>Date:</strong> {formData.dateDebut} - {formData.dateFin}</div>
                    <div><strong>Lieu:</strong> {formData.lieu}</div>
                    <div><strong>Places:</strong> {formData.placesDisponibles}</div>
                    <div><strong>Email contact:</strong> {formData.emailContact}</div>
                  </div>
                </div>

                {artistes.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Artistes ({artistes.length})</h3>
                    <div className="space-y-2">
                      {artistes.map((artiste) => (
                        <div key={artiste.id} className="text-sm">
                          <strong>{artiste.nom}</strong> {artiste.nom_groupe && `(${artiste.nom_groupe})`}
                          {artiste.heure_scene && ` - ${artiste.heure_scene}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {billets.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de billets ({billets.length})</h3>
                    <div className="space-y-2">
                      {billets.map((billet) => (
                        <div key={billet.id} className="text-sm">
                          <strong>{billet.nom}</strong> - {billet.prix}€
                          {billet.places_disponibles && ` (${billet.places_disponibles} places)`}
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg border border-red-400/30 backdrop-blur-sm"
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
                  {isCreatingEvent ? 'Création en cours...' : 'Créer le concert'}
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
              Importez un fichier CSV avec les colonnes: nom, prénom, email, téléphone, type_billet, code_promo
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleCSVFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Concert créé avec succès !</h3>
              <p className="text-gray-600 mb-4">
                Votre concert "{formData.nom}" a été créé et prêt à vendre des billets.
              </p>
              <div className="space-y-2">
                <a
                  href={`/admin/evenements/${createdEventId}`}
                  className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Voir le concert
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