import React, { useState } from 'react';
import { FiArrowRight, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AlertModal from './AlertModal';

interface StepExposantsProps {
  exposants: any[];
  setExposants: (exposants: any[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepExposants({ exposants, setExposants, onNext, onBack }: StepExposantsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const [newExposant, setNewExposant] = useState({
    id: 0,
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    categorie: '',
    activite: '',
    nom_representant: '',
    telephone_representant: '',
    email_representant: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  // Theme configuration for Salon Professionnel (Blue)
  const theme = {
    gradient: 'from-blue-600 via-blue-700 to-cyan-600',
    bgGradient: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600',
    textGradient: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600',
    buttonGradient: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    focusRing: 'focus:ring-blue-500',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600'
  };

  const handleSaveExposant = () => {
    if (!newExposant.nom) {
      setAlertMessage('Le nom de l\'exposant est obligatoire');
      setShowAlert(true);
      return;
    }

    if (isEditing) {
      setExposants(exposants.map(e => e.id === newExposant.id ? newExposant : e));
    } else {
      setExposants([...exposants, { ...newExposant, id: Date.now() }]);
    }

    resetForm();
  };

  const handleEdit = (exposant: any) => {
    setNewExposant(exposant);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    setExposants(exposants.filter(e => e.id !== id));
  };

  const resetForm = () => {
    setNewExposant({
      id: 0,
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      categorie: '',
      activite: '',
      nom_representant: '',
      telephone_representant: '',
      email_representant: ''
    });
    setIsEditing(false);
    setShowAddForm(false);
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
          Gestion des Exposants
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ajoutez et gérez les exposants de votre salon professionnel.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🏢 Liste des Exposants
                <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {exposants.length}
                </span>
              </h3>
            </div>
            
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 ${theme.buttonGradient} text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <FiPlus className="w-4 h-4" />
                Ajouter un exposant
              </button>
            )}
          </div>

          {/* Formulaire d'ajout/édition */}
          {showAddForm && (
            <div className={`mb-6 p-6 ${theme.lightBg} rounded-xl border ${theme.borderColor} animate-fadeIn`}>
              <div className="flex justify-between items-center mb-6">
                <h4 className={`text-lg font-semibold ${theme.textColor}`}>
                  {isEditing ? 'Modifier l\'exposant' : 'Nouvel exposant'}
                </h4>
                <button onClick={resetForm} className={`${theme.iconColor} hover:opacity-80`}>
                  Fermer
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations Générales */}
                <div className="space-y-4">
                  <h5 className={`font-medium ${theme.textColor} border-b ${theme.borderColor} pb-2`}>Informations Générales</h5>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'exposant *</label>
                    <input
                      type="text"
                      value={newExposant.nom}
                      onChange={(e) => setNewExposant({...newExposant, nom: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <input
                      type="text"
                      value={newExposant.categorie}
                      onChange={(e) => setNewExposant({...newExposant, categorie: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      placeholder="Ex: Technologie, Alimentaire..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activité</label>
                    <textarea
                      value={newExposant.activite}
                      onChange={(e) => setNewExposant({...newExposant, activite: e.target.value})}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing} resize-none`}
                      placeholder="Description de l'activité..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={newExposant.adresse}
                      onChange={(e) => setNewExposant({...newExposant, adresse: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      placeholder="Adresse complète"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newExposant.email}
                        onChange={(e) => setNewExposant({...newExposant, email: e.target.value})}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                        placeholder="contact@entreprise.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={newExposant.telephone}
                        onChange={(e) => setNewExposant({...newExposant, telephone: e.target.value})}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                        placeholder="+33..."
                      />
                    </div>
                  </div>
                </div>

                {/* Informations Représentant */}
                <div className="space-y-4">
                  <h5 className={`font-medium ${theme.textColor} border-b ${theme.borderColor} pb-2`}>Représentant</h5>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du représentant</label>
                    <input
                      type="text"
                      value={newExposant.nom_representant}
                      onChange={(e) => setNewExposant({...newExposant, nom_representant: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      placeholder="Nom complet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email du représentant</label>
                    <input
                      type="email"
                      value={newExposant.email_representant}
                      onChange={(e) => setNewExposant({...newExposant, email_representant: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      placeholder="email@representant.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du représentant</label>
                    <input
                      type="tel"
                      value={newExposant.telephone_representant}
                      onChange={(e) => setNewExposant({...newExposant, telephone_representant: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                      placeholder="+33..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveExposant}
                  className={`px-6 py-2 ${theme.buttonGradient} text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all`}
                >
                  {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* Liste des exposants */}
          {exposants.length > 0 ? (
            <div className="grid gap-4">
              {exposants.map((exposant) => (
                <div key={exposant.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{exposant.nom}</h4>
                        {exposant.categorie && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {exposant.categorie}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Email:</span> {exposant.email || '-'}</p>
                          <p><span className="font-medium">Tél:</span> {exposant.telephone || '-'}</p>
                          <p><span className="font-medium">Adresse:</span> {exposant.adresse || '-'}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Représentant:</span> {exposant.nom_representant || '-'}</p>
                          <p><span className="font-medium">Email Rep:</span> {exposant.email_representant || '-'}</p>
                          <p><span className="font-medium">Tél Rep:</span> {exposant.telephone_representant || '-'}</p>
                        </div>
                      </div>
                      
                      {exposant.activite && (
                        <div className="mt-3 text-sm text-gray-500 italic border-t border-gray-200 pt-2">
                          "{exposant.activite}"
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(exposant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exposant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl">🏢</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun exposant</h4>
              <p className="text-gray-600 text-sm">
                Commencez par ajouter les exposants qui seront présents à votre salon.
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
            className={`inline-flex items-center gap-2 px-6 py-3 ${theme.buttonGradient} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm`}
          >
            Continuer
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
