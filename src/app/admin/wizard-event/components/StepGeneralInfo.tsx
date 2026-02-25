import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import AlertModal from './AlertModal';

interface StepGeneralInfoProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  wizardType: string;
}

export default function StepGeneralInfo({ formData, setFormData, onNext, onBack, wizardType }: StepGeneralInfoProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const getPlaceholders = () => {
    switch (wizardType) {
      case 'concert-payant':
        return {
          nom: "Ex: Concert Summer Vibes 2024",
          description: "Description du concert, artistes invités...",
          lieu: "Ex: Zénith de Paris",
          organisateur: "Producteur / Organisateur"
        };
      case 'salon-professionnel':
        return {
          nom: "Ex: Salon de l'Agriculture 2024",
          description: "Description du salon, thématique...",
          lieu: "Ex: Paris Expo Porte de Versailles",
          organisateur: "Organisateur du salon"
        };
      default:
        return {
          nom: "Ex: Conférence Tech 2024",
          description: "Décrivez brièvement votre événement...",
          lieu: "Ex: Palais des Congrès, Paris",
          organisateur: "Nom de l'organisateur ou entreprise"
        };
    }
  };

  const getThemeClasses = () => {
    switch (wizardType) {
      case 'concert-payant':
        return {
          ring: 'focus:ring-orange-500',
          radioText: 'text-orange-600',
          button: 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 border-orange-400/30'
        };
      case 'salon-professionnel':
        return {
          ring: 'focus:ring-blue-500',
          radioText: 'text-blue-600',
          button: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 border-blue-400/30'
        };
      default:
        return {
          ring: 'focus:ring-violet-500',
          radioText: 'text-violet-600',
          button: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 border-violet-400/30'
        };
    }
  };

  const placeholders = getPlaceholders();
  const theme = getThemeClasses();

  const handleNext = () => {
    if (formData.nom && formData.dateDebut && formData.dateFin && formData.organisateur && formData.emailContact) {
      onNext();
    } else {
      setAlertMessage('Veuillez remplir tous les champs obligatoires (*)');
      setShowAlert(true);
    }
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
          Informations de votre événement
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Renseignez les détails essentiels. Ces informations pourront être modifiées plus tard.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne de gauche - Informations principales */}
          <div className="space-y-6">
            {/* Nom de l'événement */}
            <div>
              <label htmlFor="wizard-nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'événement *
              </label>
              <input
                type="text"
                id="wizard-nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                required
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200`}
                placeholder={placeholders.nom}
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200 resize-none`}
                placeholder={placeholders.description}
              />
            </div>

            {/* Type de localisation */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Format de l'événement *
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="wizard-lieu-physique"
                    name="wizard_type_localisation"
                    value="lieu"
                    checked={formData.typeLocalisation === 'lieu'}
                    onChange={(e) => setFormData({...formData, typeLocalisation: 'lieu'})}
                    className={`h-4 w-4 ${theme.radioText} ${theme.ring} border-gray-300`}
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
                    onChange={(e) => setFormData({...formData, typeLocalisation: 'en_ligne'})}
                    className={`h-4 w-4 ${theme.radioText} ${theme.ring} border-gray-300`}
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
                    onChange={(e) => setFormData({...formData, typeLocalisation: 'non_applicable'})}
                    className={`h-4 w-4 ${theme.radioText} ${theme.ring} border-gray-300`}
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
                  Lieu de l'événement *
                </label>
                <input
                  type="text"
                  id="wizard-lieu"
                  value={formData.lieu}
                  onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200`}
                  placeholder={placeholders.lieu}
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200`}
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200`}
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200`}
                placeholder={placeholders.organisateur}
              />
            </div>

            {/* Champs spécifiques selon le type de wizard */}
            {wizardType === 'salon-professionnel' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label htmlFor="wizard-secteur" className="block text-sm font-medium text-blue-900 mb-2">
                  Secteur d'activité (Spécifique Salon)
                </label>
                <input
                  type="text"
                  id="wizard-secteur"
                  value={formData.secteurActivite || ''}
                  onChange={(e) => setFormData({...formData, secteurActivite: e.target.value})}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Technologie, Agroalimentaire, BTP..."
                />
              </div>
            )}

            {wizardType === 'concert-payant' && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <label htmlFor="wizard-ouverture-portes" className="block text-sm font-medium text-orange-900 mb-2">
                  Heure d'ouverture des portes (Spécifique Concert)
                </label>
                <input
                  type="time"
                  id="wizard-ouverture-portes"
                  value={formData.ouverturePortes || ''}
                  onChange={(e) => setFormData({...formData, ouverturePortes: e.target.value})}
                  className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}

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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200`}
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
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent transition-all duration-200`}
                placeholder="100"
                min="1"
              />
            </div>
          </div>
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
            onClick={handleNext}
            className={`inline-flex items-center gap-2 px-6 py-3 ${theme.button} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border backdrop-blur-sm`}
          >
            Continuer
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
