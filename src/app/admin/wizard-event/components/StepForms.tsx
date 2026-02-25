import React, { useState } from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import AlertModal from './AlertModal';

interface StepFormsProps {
  formData: any;
  setFormData: (data: any) => void;
  invitationEmailTemplate: string;
  setInvitationEmailTemplate: (template: string) => void;
  registrationFormType: string;
  setRegistrationFormType: (type: string) => void;
  onNext: () => void;
  onBack: () => void;
  wizardType: string;
}

export default function StepForms({ 
  formData, 
  setFormData, 
  invitationEmailTemplate, 
  setInvitationEmailTemplate, 
  registrationFormType, 
  setRegistrationFormType, 
  onNext, 
  onBack,
  wizardType
}: StepFormsProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleNext = () => {
    if (!formData.emailSubject || formData.emailSubject.trim() === '') {
      setAlertMessage("Veuillez renseigner l'objet de l'email de confirmation");
      setShowAlert(true);
      return;
    }
    onNext();
  };

  const getButtonClass = () => {
    if (wizardType === 'salon-professionnel') {
      return "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700";
    }
    return "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800";
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
            className={`inline-flex items-center gap-2 px-6 py-3 ${getButtonClass()} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm`}
          >
            Continuer
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
