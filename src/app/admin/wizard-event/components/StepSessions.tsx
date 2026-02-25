import React, { useState } from 'react';
import { FiArrowRight, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import AlertModal from './AlertModal';

interface StepSessionsProps {
  intervenants: any[];
  setIntervenants: (intervenants: any[]) => void;
  sessions: any[];
  setSessions: (sessions: any[]) => void;
  onNext: () => void;
  onBack: () => void;
  wizardType: string;
}

export default function StepSessions({ intervenants, setIntervenants, sessions, setSessions, onNext, onBack, wizardType }: StepSessionsProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [hasSessions, setHasSessions] = useState(true);

  const getTheme = () => {
    if (wizardType === 'salon-professionnel') {
      return {
        headerGradient: 'from-blue-600 via-blue-700 to-cyan-600',
        buttonGradient: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700',
        addButtonBg: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        focusRing: 'focus:ring-blue-500',
        toggleActive: 'bg-blue-600',
        border: 'border-blue-400/30'
      };
    }
    // Default / Conference
    return {
      headerGradient: 'from-violet-600 via-purple-600 to-indigo-600',
      buttonGradient: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700',
      addButtonBg: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      focusRing: 'focus:ring-purple-500',
      toggleActive: 'bg-purple-600',
      border: 'border-violet-400/30'
    };
  };

  const theme = getTheme();

  const handleNext = () => {
    if (!hasSessions) {
      onNext();
      return;
    }

    // Validation des intervenants (au moins un avec nom/prénom/email)
    const validIntervenants = intervenants.filter(i => i.nom && i.prenom && i.email);
    // Validation des sessions (au moins une avec titre)
    const validSessions = sessions.filter(s => s.titre);
    
    if (validIntervenants.length === 0) {
      setAlertMessage('Veuillez ajouter au moins un intervenant avec nom, prénom et email');
      setShowAlert(true);
      return;
    }
    
    if (validSessions.length === 0) {
      setAlertMessage('Veuillez ajouter au moins une session avec un titre');
      setShowAlert(true);
      return;
    }
    
    onNext();
  };

  return (
    <div>
      <AlertModal 
        isOpen={showAlert} 
        onClose={() => setShowAlert(false)} 
        message={alertMessage}
        type="warning"
      />
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {wizardType === 'salon-professionnel' ? 'Programme et Intervenants' : 'Sessions et Intervenants'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          {wizardType === 'salon-professionnel' 
            ? 'Configurez le programme de votre salon et présentez les intervenants.' 
            : 'Configurez vos sessions et ajoutez les intervenants de votre conférence.'}
        </p>

        {/* Toggle Switch for Skipping Step */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${!hasSessions ? 'text-gray-900' : 'text-gray-500'}`}>
            Je n'ai pas de sessions/intervenants à renseigner
          </span>
          <button
            onClick={() => setHasSessions(!hasSessions)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.focusRing} ${
              hasSessions ? theme.toggleActive : 'bg-gray-200'
            }`}
          >
            <span
              className={`${
                hasSessions ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
          <span className={`text-sm font-medium ${hasSessions ? 'text-gray-900' : 'text-gray-500'}`}>
            Configurer le programme
          </span>
        </div>
      </div>

      {hasSessions && (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
          {/* Section Intervenants */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${theme.headerGradient} px-6 py-4`}>
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent resize-none`}
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
                className={`mt-4 inline-flex items-center gap-2 px-4 py-2 ${theme.addButtonBg} rounded-lg transition-colors`}
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
            <div className={`bg-gradient-to-r ${theme.headerGradient} px-6 py-4`}>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                📋 {wizardType === 'salon-professionnel' ? 'Programme' : 'Sessions de conférence'}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent resize-none`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
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
                className={`mt-4 inline-flex items-center gap-2 px-4 py-2 ${theme.addButtonBg} rounded-lg transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        
        <button 
          onClick={handleNext}
          className={`inline-flex items-center gap-2 px-6 py-3 ${theme.buttonGradient} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${theme.border} backdrop-blur-sm`}
        >
          Continuer
          <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
