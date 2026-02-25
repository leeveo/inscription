import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import AlertModal from './AlertModal';

interface StepParticipantsProps {
  participants: any[];
  setParticipants: (participants: any[]) => void;
  onNext: () => void;
  onBack: () => void;
  wizardType?: string | null;
}

export default function StepParticipants({ participants, setParticipants, onNext, onBack, wizardType }: StepParticipantsProps) {
  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  
  // State pour l'AlertModal
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const [newParticipant, setNewParticipant] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    profession: '',
    commentaires: ''
  });

  const getLabels = () => {
    switch (wizardType) {
      case 'concert-payant':
        return {
          title: 'Gestion des spectateurs',
          subtitle: 'Ajoutez des spectateurs à votre concert manuellement ou par import CSV.',
          listTitle: 'Spectateurs',
          addBtn: 'Ajouter un spectateur',
          empty: 'Aucun spectateur',
          emptySub: 'Commencez par ajouter des spectateurs à votre concert'
        };
      case 'salon-professionnel':
        return {
          title: 'Gestion des visiteurs',
          subtitle: 'Ajoutez des visiteurs à votre salon manuellement ou par import CSV.',
          listTitle: 'Visiteurs',
          addBtn: 'Ajouter un visiteur',
          empty: 'Aucun visiteur',
          emptySub: 'Commencez par ajouter des visiteurs à votre salon'
        };
      default:
        return {
          title: 'Gestion des participants',
          subtitle: 'Ajoutez des participants à votre conférence manuellement ou par import CSV.',
          listTitle: 'Participants',
          addBtn: 'Ajouter un participant',
          empty: 'Aucun participant',
          emptySub: 'Commencez par ajouter des participants à votre conférence'
        };
    }
  };

  const labels = getLabels();

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
            const participant: any = {
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

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {labels.title}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {labels.subtitle}
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Actions d'ajout de participants */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                👥 {labels.listTitle} 
                <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {participants.length}
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Gérez la liste des {labels.listTitle.toLowerCase()}
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
                {labels.addBtn}
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
                      setAlertMessage('Veuillez remplir au moins le nom, prénom et email');
                      setShowAlert(true);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-lg hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-lg border border-blue-400/30 backdrop-blur-sm"
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}

          {/* Alert Modal pour la validation */}
          <AlertModal 
            isOpen={showAlert} 
            onClose={() => setShowAlert(false)} 
            message={alertMessage}
            type="warning"
          />

          {/* Modal d'import CSV */}
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
              <h4 className="font-medium text-gray-900">Liste des {labels.listTitle.toLowerCase()} :</h4>
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
              <h4 className="text-lg font-medium text-gray-900 mb-2">{labels.empty}</h4>
              <p className="text-gray-600 text-sm">
                {labels.emptySub}
              </p>
            </div>
          )}
        </div>

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
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm"
          >
            Continuer
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal de succès d'import */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Import réussi !</h3>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{importedCount}
                </div>
                <p className="text-gray-700 font-medium">
                  {modalMessage}
                </p>
              </div>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-lg"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'erreur d'import */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-red-400/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Erreur d'import</h3>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-6">
                <p className="text-gray-700 font-medium mb-4">
                  {modalMessage}
                </p>
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
    </div>
  );
}
