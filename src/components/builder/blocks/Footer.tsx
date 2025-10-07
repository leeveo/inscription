'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import type { FooterBlockProps } from '@/types/builder';
import { FiLinkedin, FiTwitter, FiFacebook, FiInstagram, FiMail } from 'react-icons/fi';

export const Footer = ({
  logo = '',
  companyName = 'Votre Entreprise',
  description = 'Organisateur d\'événements professionnels de qualité',
  links = [
    { label: 'À propos', url: '#about' },
    { label: 'Contact', url: '#contact' },
    { label: 'Mentions légales', url: '#legal' },
  ],
  socialLinks = [
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
  ],
  copyrightText = '© 2025 Tous droits réservés.',
}: FooterBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <FiLinkedin className="w-5 h-5" />;
      case 'twitter':
      case 'x':
        return <FiTwitter className="w-5 h-5" />;
      case 'facebook':
        return <FiFacebook className="w-5 h-5" />;
      case 'instagram':
        return <FiInstagram className="w-5 h-5" />;
      case 'email':
        return <FiMail className="w-5 h-5" />;
      default:
        return <FiMail className="w-5 h-5" />;
    }
  };

  return (
    <footer
      ref={(ref) => ref && connect(drag(ref))}
      className="relative w-full bg-gray-900 text-white"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          Footer {selected && '• Sélectionné'}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            {logo ? (
              <img src={logo} alt={companyName} className="h-10 mb-4" />
            ) : (
              <h3 className="text-2xl font-bold mb-4">{companyName}</h3>
            )}
            {description && (
              <p className="text-gray-400 text-sm mb-4">{description}</p>
            )}

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {links && links.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Liens rapides</h4>
                  <ul className="space-y-2">
                    {links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

// Settings component
export const FooterSettings = () => {
  const {
    actions: { setProp },
    logo,
    companyName,
    description,
    links,
    socialLinks,
    copyrightText,
  } = useNode((node) => ({
    logo: node.data.props.logo,
    companyName: node.data.props.companyName,
    description: node.data.props.description,
    links: node.data.props.links,
    socialLinks: node.data.props.socialLinks,
    copyrightText: node.data.props.copyrightText,
  }));

  const addLink = () => {
    setProp((props: FooterBlockProps) => {
      if (!props.links) props.links = [];
      props.links.push({ label: 'Nouveau lien', url: '#' });
    });
  };

  const removeLink = (index: number) => {
    setProp((props: FooterBlockProps) => {
      if (props.links) {
        props.links.splice(index, 1);
      }
    });
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    setProp((props: FooterBlockProps) => {
      if (props.links && props.links[index]) {
        props.links[index][field] = value;
      }
    });
  };

  const addSocialLink = () => {
    setProp((props: FooterBlockProps) => {
      if (!props.socialLinks) props.socialLinks = [];
      props.socialLinks.push({ platform: 'linkedin', url: 'https://' });
    });
  };

  const removeSocialLink = (index: number) => {
    setProp((props: FooterBlockProps) => {
      if (props.socialLinks) {
        props.socialLinks.splice(index, 1);
      }
    });
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setProp((props: FooterBlockProps) => {
      if (props.socialLinks && props.socialLinks[index]) {
        props.socialLinks[index][field] = value;
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Company Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Informations</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (URL)
            </label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setProp((props: FooterBlockProps) => (props.logo = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setProp((props: FooterBlockProps) => (props.companyName = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setProp((props: FooterBlockProps) => (props.description = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copyright
            </label>
            <input
              type="text"
              value={copyrightText}
              onChange={(e) => setProp((props: FooterBlockProps) => (props.copyrightText = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Liens ({links?.length || 0})</h4>
          <button
            onClick={addLink}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {links && links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(index, 'label', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="Label"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="URL"
              />
              <button
                onClick={() => removeLink(index)}
                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Réseaux sociaux ({socialLinks?.length || 0})</h4>
          <button
            onClick={addSocialLink}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {socialLinks && socialLinks.map((social, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={social.platform}
                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter/X</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="email">Email</option>
              </select>
              <input
                type="text"
                value={social.url}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="https://..."
              />
              <button
                onClick={() => removeSocialLink(index)}
                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Footer.craft = {
  displayName: 'Footer',
  props: {
    logo: '',
    companyName: 'Votre Entreprise',
    description: 'Organisateur d\'événements professionnels de qualité',
    links: [
      { label: 'À propos', url: '#about' },
      { label: 'Contact', url: '#contact' },
      { label: 'Mentions légales', url: '#legal' },
    ],
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
    copyrightText: '© 2025 Tous droits réservés.',
  },
  related: {
    settings: FooterSettings,
  },
};
