'use client'

import React, { useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface FormulaireDynamiqueProps {
  title?: string;
  description?: string;
  // Champs obligatoires (toujours présents)
  showNom?: boolean;
  showPrenom?: boolean;
  showEmail?: boolean;
  // Champs optionnels configurables
  showTelephone?: boolean;
  showEntreprise?: boolean;
  showProfession?: boolean;
  showSiteWeb?: boolean;
  showDateNaissance?: boolean;
  showUrlLinkedin?: boolean;
  showUrlFacebook?: boolean;
  showUrlTwitter?: boolean;
  showUrlInstagram?: boolean;
  // Style et apparence
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  buttonColor?: string;
  buttonText?: string;
  className?: string;
}

export const FormulaireDynamique = ({
  title = "Inscription à l'événement",
  description = "Remplissez ce formulaire pour vous inscrire",
  showNom = true,
  showPrenom = true,
  showEmail = true,
  showTelephone = true,
  showEntreprise = false,
  showProfession = false,
  showSiteWeb = false,
  showDateNaissance = false,
  showUrlLinkedin = false,
  showUrlFacebook = false,
  showUrlTwitter = false,
  showUrlInstagram = false,
  backgroundColor = '#ffffff',
  textColor = '#111827',
  padding = 24,
  margin = 0,
  borderRadius = 12,
  buttonColor = '#3B82F6',
  buttonText = "S'inscrire",
  className = '',
}: FormulaireDynamiqueProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    profession: '',
    site_web: '',
    date_naissance: '',
    url_linkedin: '',
    url_facebook: '',
    url_twitter: '',
    url_instagram: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enabled) return; // Ne pas soumettre en mode édition
    
    console.log('Données du formulaire:', formData);
    // Ici on intégrerait avec l'API d'inscription
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`relative ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        padding: `${padding}px`,
        margin: `${margin}px`,
        borderRadius: `${borderRadius}px`,
        border: enabled
          ? (selected || hovered ? '2px solid #3B82F6' : '2px dashed #e5e7eb')
          : 'none',
        transition: 'border 0.2s ease',
        minHeight: enabled ? '400px' : 'auto',
      }}
    >
      {/* Selection Indicator - Only in edit mode */}
      {enabled && (selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-t z-10">
          📝 Formulaire d'inscription {selected && '• Sélectionné'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* En-tête du formulaire */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
            {title}
          </h2>
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>

        {/* Champs du formulaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom - Obligatoire */}
          {showNom && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Nom *
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre nom"
                disabled={enabled}
              />
            </div>
          )}

          {/* Prénom - Obligatoire */}
          {showPrenom && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => handleInputChange('prenom', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre prénom"
                disabled={enabled}
              />
            </div>
          )}

          {/* Email - Obligatoire */}
          {showEmail && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre.email@example.com"
                disabled={enabled}
              />
            </div>
          )}

          {/* Téléphone */}
          {showTelephone && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="06 12 34 56 78"
                disabled={enabled}
              />
            </div>
          )}

          {/* Entreprise */}
          {showEntreprise && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Entreprise
              </label>
              <input
                type="text"
                value={formData.entreprise}
                onChange={(e) => handleInputChange('entreprise', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de votre entreprise"
                disabled={enabled}
              />
            </div>
          )}

          {/* Profession */}
          {showProfession && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Profession
              </label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre profession"
                disabled={enabled}
              />
            </div>
          )}

          {/* Site Web */}
          {showSiteWeb && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Site Web
              </label>
              <input
                type="url"
                value={formData.site_web}
                onChange={(e) => handleInputChange('site_web', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://votre-site.com"
                disabled={enabled}
              />
            </div>
          )}

          {/* Date de naissance */}
          {showDateNaissance && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.date_naissance}
                onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={enabled}
              />
            </div>
          )}

          {/* LinkedIn */}
          {showUrlLinkedin && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Profil LinkedIn
              </label>
              <input
                type="url"
                value={formData.url_linkedin}
                onChange={(e) => handleInputChange('url_linkedin', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/votre-profil"
                disabled={enabled}
              />
            </div>
          )}

          {/* Facebook */}
          {showUrlFacebook && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Profil Facebook
              </label>
              <input
                type="url"
                value={formData.url_facebook}
                onChange={(e) => handleInputChange('url_facebook', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://facebook.com/votre-profil"
                disabled={enabled}
              />
            </div>
          )}

          {/* Twitter */}
          {showUrlTwitter && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Profil Twitter/X
              </label>
              <input
                type="url"
                value={formData.url_twitter}
                onChange={(e) => handleInputChange('url_twitter', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/votre-profil"
                disabled={enabled}
              />
            </div>
          )}

          {/* Instagram */}
          {showUrlInstagram && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Profil Instagram
              </label>
              <input
                type="url"
                value={formData.url_instagram}
                onChange={(e) => handleInputChange('url_instagram', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/votre-profil"
                disabled={enabled}
              />
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={enabled}
            style={{
              backgroundColor: enabled ? '#gray' : buttonColor,
              color: 'white'
            }}
            className="px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonText}
          </button>
        </div>

        {/* Message d'aide en mode édition */}
        {enabled && (
          <div className="text-center mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Mode édition : Utilisez le panneau de propriétés pour configurer les champs du formulaire
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

// Settings component for the properties panel
export const FormulaireDynamiqueSettings = () => {
  const {
    actions: { setProp },
    title,
    description,
    showNom,
    showPrenom,
    showEmail,
    showTelephone,
    showEntreprise,
    showProfession,
    showSiteWeb,
    showDateNaissance,
    showUrlLinkedin,
    showUrlFacebook,
    showUrlTwitter,
    showUrlInstagram,
    backgroundColor,
    textColor,
    padding,
    margin,
    borderRadius,
    buttonColor,
    buttonText,
  } = useNode((node) => ({
    title: node.data.props.title,
    description: node.data.props.description,
    showNom: node.data.props.showNom,
    showPrenom: node.data.props.showPrenom,
    showEmail: node.data.props.showEmail,
    showTelephone: node.data.props.showTelephone,
    showEntreprise: node.data.props.showEntreprise,
    showProfession: node.data.props.showProfession,
    showSiteWeb: node.data.props.showSiteWeb,
    showDateNaissance: node.data.props.showDateNaissance,
    showUrlLinkedin: node.data.props.showUrlLinkedin,
    showUrlFacebook: node.data.props.showUrlFacebook,
    showUrlTwitter: node.data.props.showUrlTwitter,
    showUrlInstagram: node.data.props.showUrlInstagram,
    backgroundColor: node.data.props.backgroundColor,
    textColor: node.data.props.textColor,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
    borderRadius: node.data.props.borderRadius,
    buttonColor: node.data.props.buttonColor,
    buttonText: node.data.props.buttonText,
  }));

  return (
    <div className="space-y-6">
      {/* Info sur le composant */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-medium text-green-900 mb-1">📝 Formulaire d'inscription</p>
        <p className="text-xs text-green-700">
          Formulaire configurable pour l'inscription des participants. Choisissez quels champs afficher.
        </p>
      </div>

      {/* Contenu du formulaire */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contenu</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du formulaire
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Inscription à l'événement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.description = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Description du formulaire"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.buttonText = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="S'inscrire"
            />
          </div>
        </div>
      </div>

      {/* Champs à afficher */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Champs du formulaire</h4>
        
        <div className="space-y-3">
          {/* Champs obligatoires */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Champs obligatoires :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showNom}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showNom = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Nom *</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPrenom}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showPrenom = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Prénom *</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showEmail = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email *</span>
              </label>
            </div>
          </div>

          {/* Champs optionnels */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Champs optionnels :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showTelephone}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showTelephone = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Téléphone</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showEntreprise}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showEntreprise = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Entreprise</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showProfession}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showProfession = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Profession</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSiteWeb}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showSiteWeb = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Site Web</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDateNaissance}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showDateNaissance = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Date de naissance</span>
              </label>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Réseaux sociaux :</p>
            
            <div className="space-y-2 ml-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlLinkedin}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showUrlLinkedin = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">LinkedIn</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlFacebook}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showUrlFacebook = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Facebook</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlTwitter}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showUrlTwitter = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Twitter/X</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlInstagram}
                  onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.showUrlInstagram = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Instagram</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Apparence</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de fond
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.backgroundColor = e.target.value))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.backgroundColor = e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du texte
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.textColor = e.target.value))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.textColor = e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="#111827"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du bouton
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={buttonColor}
                onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.buttonColor = e.target.value))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={buttonColor}
                onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.buttonColor = e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Espacement intérieur (px)
            </label>
            <input
              type="number"
              value={padding}
              onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.padding = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marge extérieure (px)
            </label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.margin = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bordure arrondie (px)
            </label>
            <input
              type="number"
              value={borderRadius}
              onChange={(e) => setProp((props: FormulaireDynamiqueProps) => (props.borderRadius = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="50"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Comment utiliser</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Sélectionnez les champs que vous voulez dans votre formulaire</p>
          <p>• Les champs Nom, Prénom et Email sont obligatoires pour l'inscription</p>
          <p>• Personnalisez l'apparence avec les couleurs et espacements</p>
          <p>• Le formulaire sera fonctionnel sur la page publiée</p>
        </div>
      </div>
    </div>
  );
};

FormulaireDynamique.craft = {
  displayName: 'FormulaireDynamique',
  props: {
    title: "Inscription à l'événement",
    description: "Remplissez ce formulaire pour vous inscrire",
    showNom: true,
    showPrenom: true,
    showEmail: true,
    showTelephone: true,
    showEntreprise: false,
    showProfession: false,
    showSiteWeb: false,
    showDateNaissance: false,
    showUrlLinkedin: false,
    showUrlFacebook: false,
    showUrlTwitter: false,
    showUrlInstagram: false,
    backgroundColor: '#ffffff',
    textColor: '#111827',
    padding: 24,
    margin: 0,
    borderRadius: 12,
    buttonColor: '#3B82F6',
    buttonText: "S'inscrire",
  },
  related: {
    settings: FormulaireDynamiqueSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => false,
    canMoveIn: () => false,
    canMoveOut: () => true,
  },
};