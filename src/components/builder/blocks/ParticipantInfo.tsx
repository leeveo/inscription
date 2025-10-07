'use client'

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ParticipantInfoProps {
  title?: string;
  showNom?: boolean;
  showPrenom?: boolean;
  showEmail?: boolean;
  showTelephone?: boolean;
  showEntreprise?: boolean;
  showProfession?: boolean;
  showSiteWeb?: boolean;
  showDateNaissance?: boolean;
  showUrlLinkedin?: boolean;
  showUrlFacebook?: boolean;
  showUrlTwitter?: boolean;
  showUrlInstagram?: boolean;
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  className?: string;
}

export const ParticipantInfo = ({
  title = "Informations du participant",
  showNom = true,
  showPrenom = true,
  showEmail = true,
  showTelephone = false,
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
  padding = 16,
  margin = 0,
  borderRadius = 8,
  className = '',
}: ParticipantInfoProps) => {
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

  // Données d'exemple pour la prévisualisation
  const sampleParticipant = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    telephone: '06 12 34 56 78',
    entreprise: 'TechCorp Solutions',
    profession: 'Développeur Web',
    site_web: 'https://jeandupont.dev',
    date_naissance: '1990-05-15',
    url_linkedin: 'https://linkedin.com/in/jean-dupont',
    url_facebook: 'https://facebook.com/jean.dupont',
    url_twitter: 'https://twitter.com/jeandupont',
    url_instagram: 'https://instagram.com/jeandupont'
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
        minHeight: enabled ? '120px' : 'auto',
      }}
    >
      {/* Selection Indicator - Only in edit mode */}
      {enabled && (selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-t z-10">
          👤 Informations Participant {selected && '• Sélectionné'}
        </div>
      )}

      <div className="space-y-3">
        {/* Titre */}
        <h3 className="text-lg font-semibold" style={{ color: textColor }}>
          {title}
        </h3>

        {/* Informations du participant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {showNom && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Nom :</span>
              <span className="text-gray-600">{sampleParticipant.nom}</span>
            </div>
          )}

          {showPrenom && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Prénom :</span>
              <span className="text-gray-600">{sampleParticipant.prenom}</span>
            </div>
          )}

          {showEmail && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Email :</span>
              <span className="text-gray-600">{sampleParticipant.email}</span>
            </div>
          )}

          {showTelephone && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Téléphone :</span>
              <span className="text-gray-600">{sampleParticipant.telephone}</span>
            </div>
          )}

          {showEntreprise && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Entreprise :</span>
              <span className="text-gray-600">{sampleParticipant.entreprise}</span>
            </div>
          )}

          {showProfession && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Profession :</span>
              <span className="text-gray-600">{sampleParticipant.profession}</span>
            </div>
          )}

          {showSiteWeb && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Site Web :</span>
              <a href={sampleParticipant.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {sampleParticipant.site_web}
              </a>
            </div>
          )}

          {showDateNaissance && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Date de naissance :</span>
              <span className="text-gray-600">{new Date(sampleParticipant.date_naissance).toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          {showUrlLinkedin && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">LinkedIn :</span>
              <a href={sampleParticipant.url_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Profil LinkedIn
              </a>
            </div>
          )}

          {showUrlFacebook && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Facebook :</span>
              <a href={sampleParticipant.url_facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Profil Facebook
              </a>
            </div>
          )}

          {showUrlTwitter && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Twitter/X :</span>
              <a href={sampleParticipant.url_twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Profil Twitter
              </a>
            </div>
          )}

          {showUrlInstagram && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Instagram :</span>
              <a href={sampleParticipant.url_instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Profil Instagram
              </a>
            </div>
          )}
        </div>

        {/* Message si aucun champ sélectionné */}
        {!showNom && !showPrenom && !showEmail && !showTelephone && !showEntreprise && !showProfession && 
         !showSiteWeb && !showDateNaissance && !showUrlLinkedin && !showUrlFacebook && !showUrlTwitter && !showUrlInstagram && enabled && (
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">Aucun champ sélectionné pour l'affichage</p>
            <p className="text-xs mt-1">Utilisez les paramètres pour choisir les informations à afficher</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings component for the properties panel
export const ParticipantInfoSettings = () => {
  const {
    actions: { setProp },
    title,
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
  } = useNode((node) => ({
    title: node.data.props.title,
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
  }));

  return (
    <div className="space-y-4">
      {/* Info sur le composant */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-1">👤 Informations Participant</p>
        <p className="text-xs text-blue-700">
          Affiche les données du participant. Utilisez les cases à cocher pour choisir quelles informations montrer.
        </p>
      </div>

      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre du bloc
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setProp((props: ParticipantInfoProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Informations du participant"
        />
      </div>

      {/* Champs à afficher */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Champs à afficher</h4>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showNom}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showNom = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Nom</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPrenom}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showPrenom = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Prénom</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showEmail}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showEmail = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Email</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTelephone}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showTelephone = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Téléphone</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showEntreprise}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showEntreprise = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Entreprise</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showProfession}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showProfession = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Profession</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSiteWeb}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showSiteWeb = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Site Web</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDateNaissance}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showDateNaissance = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Date de naissance</span>
          </label>

          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-2">Réseaux sociaux :</p>
            
            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={showUrlLinkedin}
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showUrlLinkedin = e.target.checked))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">LinkedIn</span>
            </label>

            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={showUrlFacebook}
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showUrlFacebook = e.target.checked))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Facebook</span>
            </label>

            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={showUrlTwitter}
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showUrlTwitter = e.target.checked))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Twitter/X</span>
            </label>

            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={showUrlInstagram}
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.showUrlInstagram = e.target.checked))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Instagram</span>
            </label>
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
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.backgroundColor = e.target.value))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.backgroundColor = e.target.value))}
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
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.textColor = e.target.value))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setProp((props: ParticipantInfoProps) => (props.textColor = e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="#111827"
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
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.padding = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marge extérieure (px)
            </label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.margin = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bordure arrondie (px)
            </label>
            <input
              type="number"
              value={borderRadius}
              onChange={(e) => setProp((props: ParticipantInfoProps) => (props.borderRadius = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="30"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Comment utiliser</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Cochez les champs que vous voulez afficher</p>
          <p>• Ce bloc affichera les vraies données du participant en mode preview</p>
          <p>• En mode édition, des données d'exemple sont affichées</p>
          <p>• Personnalisez l'apparence avec les couleurs et espacements</p>
        </div>
      </div>
    </div>
  );
};

ParticipantInfo.craft = {
  displayName: 'ParticipantInfo',
  props: {
    title: "Informations du participant",
    showNom: true,
    showPrenom: true,
    showEmail: true,
    showTelephone: false,
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
    padding: 16,
    margin: 0,
    borderRadius: 8,
  },
  related: {
    settings: ParticipantInfoSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => false,
    canMoveIn: () => false,
    canMoveOut: () => true,
  },
};