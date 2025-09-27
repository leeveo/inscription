'use client'

import { useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

// Types pour les modèles de landing page
export interface LandingPageTemplate {
  id: string
  name: string
  description: string
  preview: string
  thumbnail: string
  category: 'business' | 'creative' | 'minimal' | 'modern'
  features: string[]
  isPremium?: boolean
}

export interface LandingPageConfig {
  templateId: string
  customization: {
    primaryColor: string
    secondaryColor: string
    heroTitle?: string
    heroSubtitle?: string
    heroImage?: string
    ctaButtonText?: string
    logoUrl?: string
    backgroundImage?: string
    customCSS?: string
  }
}

// Modèles de landing page disponibles
const LANDING_PAGE_TEMPLATES: LandingPageTemplate[] = [
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    description: 'Design moderne avec dégradés colorés et animations fluides',
    preview: '/api/templates/modern-gradient/preview',
    thumbnail: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop',
    category: 'modern',
    features: ['Responsive', 'Animations CSS', 'Dégradés', 'Design mobile-first'],
  },
  {
    id: 'classic-business',
    name: 'Classic Business',
    description: 'Template professionnel et élégant pour événements corporate',
    preview: '/api/templates/classic-business/preview',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop',
    category: 'business',
    features: ['Professionnel', 'Formulaire intégré', 'Section témoignages', 'FAQ'],
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Design épuré et minimaliste, focus sur le contenu',
    preview: '/api/templates/minimal-clean/preview',
    thumbnail: 'https://images.unsplash.com/photo-1586281010774-7e82ba1bb5c2?w=400&h=300&fit=crop',
    category: 'minimal',
    features: ['Épuré', 'Typographie claire', 'Chargement rapide', 'Accessibilité'],
  },
  {
    id: 'creative-event',
    name: 'Creative Event',
    description: 'Template coloré et créatif pour événements artistiques',
    preview: '/api/templates/creative-event/preview',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    category: 'creative',
    features: ['Couleurs vives', 'Animations créatives', 'Galerie photos', 'Social media'],
  },
  {
    id: 'conference-pro',
    name: 'Conference Pro',
    description: 'Spécialement conçu pour conférences et événements professionnels',
    preview: '/api/templates/conference-pro/preview',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    category: 'business',
    features: ['Planning intégré', 'Liste intervenants', 'Countdown timer', 'Newsletter'],
    isPremium: true,
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Design ultra-moderne avec effets de verre et blur avancés',
    preview: '/api/templates/glassmorphism/preview',
    thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop',
    category: 'modern',
    features: ['Effet verre', 'Backdrop blur', 'Animations fluides', 'Design futuriste'],
    isPremium: true,
  },
  {
    id: 'neomorphism',
    name: 'Neomorphism',
    description: 'Style soft UI avec des ombres subtiles et design tactile',
    preview: '/api/templates/neomorphism/preview',
    thumbnail: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=400&h=300&fit=crop',
    category: 'minimal',
    features: ['Soft shadows', 'UI tactile', 'Design épuré', 'Interactions naturelles'],
    isPremium: true,
  },
  {
    id: 'fullscreen-video',
    name: 'Fullscreen Video',
    description: 'Template cinématographique avec vidéo en plein écran',
    preview: '/api/templates/fullscreen-video/preview',
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
    category: 'creative',
    features: ['Vidéo background', 'Design cinéma', 'Modal inscription', 'Immersif'],
    isPremium: true,
  },
  {
    id: 'parallax-3d',
    name: 'Parallax 3D',
    description: 'Expérience 3D interactive avec effets parallax avancés',
    preview: '/api/templates/parallax-3d/preview',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    category: 'modern',
    features: ['Effets 3D', 'Parallax avancé', 'Interactions souris', 'Design immersif'],
    isPremium: true,
  },
  {
    id: 'onepage-scroll',
    name: 'One-page Scroll',
    description: 'Navigation fullscreen avec défilement section par section',
    preview: '/api/templates/onepage-scroll/preview',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
    category: 'creative',
    features: ['Scroll fullscreen', 'Navigation fluide', 'Animations timing', 'UX moderne'],
    isPremium: true,
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Design moderne et dynamique pour startups et événements tech',
    preview: '/api/templates/tech-startup/preview',
    thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    category: 'modern',
    features: ['Dark mode', 'Animations fluides', 'Code highlighting', 'API integration'],
  },
  {
    id: 'elegant-gala',
    name: 'Elegant Gala',
    description: 'Template élégant et sophistiqué pour galas et événements de prestige',
    preview: '/api/templates/elegant-gala/preview',
    thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
    category: 'business',
    features: ['Design luxueux', 'Animations élégantes', 'Galerie photos', 'Dress code'],
  },
  {
    id: 'festival-fun',
    name: 'Festival Fun',
    description: 'Template coloré et festif pour festivals et événements musicaux',
    preview: '/api/templates/festival-fun/preview',
    thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
    category: 'creative',
    features: ['Couleurs vibrantes', 'Animations ludiques', 'Playlist intégrée', 'Programme détaillé'],
  },
  {
    id: 'workshop-learning',
    name: 'Workshop & Learning',
    description: 'Template éducatif pour ateliers et formations',
    preview: '/api/templates/workshop-learning/preview',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
    category: 'business',
    features: ['Planning détaillé', 'Ressources téléchargeables', 'Quiz intéractif', 'Certificats'],
  }
]

interface LandingPageTemplateSelectorProps {
  eventId: string
  currentConfig?: LandingPageConfig | null
  onConfigUpdate: (config: LandingPageConfig) => Promise<void>
  onPreview: (templateId: string, config: LandingPageConfig) => void
}

export default function LandingPageTemplateSelector({
  eventId,
  currentConfig,
  onConfigUpdate,
  onPreview
}: LandingPageTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    currentConfig?.templateId || LANDING_PAGE_TEMPLATES[0].id
  )
  const [showCustomization, setShowCustomization] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [customization, setCustomization] = useState<LandingPageConfig['customization']>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    ctaButtonText: 'S\'inscrire maintenant',
    logoUrl: '',
    backgroundImage: '',
    customCSS: '',
    ...currentConfig?.customization
  })

  // Filtrer les templates par catégorie
  const filteredTemplates = selectedCategory === 'all' 
    ? LANDING_PAGE_TEMPLATES 
    : LANDING_PAGE_TEMPLATES.filter(t => t.category === selectedCategory)

  // Catégories disponibles
  const categories = [
    { id: 'all', name: 'Tous', count: LANDING_PAGE_TEMPLATES.length },
    { id: 'modern', name: 'Moderne', count: LANDING_PAGE_TEMPLATES.filter(t => t.category === 'modern').length },
    { id: 'business', name: 'Professionnel', count: LANDING_PAGE_TEMPLATES.filter(t => t.category === 'business').length },
    { id: 'minimal', name: 'Minimaliste', count: LANDING_PAGE_TEMPLATES.filter(t => t.category === 'minimal').length },
    { id: 'creative', name: 'Créatif', count: LANDING_PAGE_TEMPLATES.filter(t => t.category === 'creative').length }
  ]

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    
    // Appliquer des couleurs par défaut selon le template
    let defaultColors = { ...customization }
    const template = LANDING_PAGE_TEMPLATES.find(t => t.id === templateId)
    
    if (template) {
      switch (template.category) {
        case 'modern':
          defaultColors.primaryColor = '#3B82F6'
          defaultColors.secondaryColor = '#1E40AF'
          break
        case 'business':
          defaultColors.primaryColor = '#1F2937'
          defaultColors.secondaryColor = '#374151'
          break
        case 'minimal':
          defaultColors.primaryColor = '#000000'
          defaultColors.secondaryColor = '#6B7280'
          break
        case 'creative':
          defaultColors.primaryColor = '#EC4899'
          defaultColors.secondaryColor = '#F59E0B'
          break
      }
      setCustomization(defaultColors)
    }
    
    const newConfig: LandingPageConfig = {
      templateId,
      customization: defaultColors
    }
    onConfigUpdate(newConfig)
  }

  const handleCustomizationChange = (field: string, value: string) => {
    const newCustomization = { ...customization, [field]: value }
    setCustomization(newCustomization)
    
    const newConfig: LandingPageConfig = {
      templateId: selectedTemplate,
      customization: newCustomization
    }
    onConfigUpdate(newConfig)
  }

  const handlePreview = () => {
    const config: LandingPageConfig = {
      templateId: selectedTemplate,
      customization
    }
    onPreview(selectedTemplate, config)
  }

  const generateLandingPageUrl = () => {
    return `${window.location.origin}/landing/${eventId}?template=${selectedTemplate}`
  }

  const copyUrlToClipboard = async () => {
    try {
      const url = generateLandingPageUrl()
      await navigator.clipboard.writeText(url)
      
      // Feedback visuel
      const button = document.getElementById('copy-url-btn')
      if (button) {
        const originalText = button.textContent
        button.textContent = '✓ Copié!'
        button.classList.add('bg-green-600')
        setTimeout(() => {
          button.textContent = originalText
          button.classList.remove('bg-green-600')
        }, 2000)
      }
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const selectedTemplateData = LANDING_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Modèle de Page d'Inscription
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choisissez un modèle pour la page d'inscription publique de votre événement
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Prévisualiser
          </button>
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Personnaliser
          </button>
        </div>
      </div>

      {/* URL publique avec design amélioré */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h4 className="font-semibold text-blue-900">URL publique de votre page d'inscription</h4>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white rounded-md p-3 border border-blue-200">
                <code className="text-sm text-blue-800 font-mono break-all">
                  {generateLandingPageUrl()}
                </code>
              </div>
              <button
                id="copy-url-btn"
                onClick={copyUrlToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copier</span>
              </button>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              💡 Cette URL se met automatiquement à jour avec le template sélectionné
            </p>
          </div>
          <button
            onClick={handlePreview}
            className="ml-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Prévisualiser</span>
          </button>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories de modèles</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Sélection de modèle avec grille améliorée */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedCategory === 'all' ? 'Tous les modèles' : `Modèles ${categories.find(c => c.id === selectedCategory)?.name}`}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredTemplates.length} modèle{filteredTemplates.length > 1 ? 's' : ''} disponible{filteredTemplates.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Badge Premium */}
              {template.isPremium && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm z-10">
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </div>
              )}

              {/* Thumbnail avec overlay */}
              <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden relative group">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                
                {/* Preview button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Créer une configuration temporaire avec les couleurs spécifiques à ce template
                      let templateColors = { ...customization };
                      switch (template.id) {
                        case 'modern-gradient':
                          templateColors.primaryColor = '#3B82F6';
                          templateColors.secondaryColor = '#8B5CF6';
                          break;
                        case 'classic-business':
                          templateColors.primaryColor = '#1F2937';
                          templateColors.secondaryColor = '#374151';
                          break;
                        case 'minimal-clean':
                          templateColors.primaryColor = '#000000';
                          templateColors.secondaryColor = '#6B7280';
                          break;
                        case 'creative-event':
                          templateColors.primaryColor = '#EC4899';
                          templateColors.secondaryColor = '#F59E0B';
                          break;
                        case 'conference-pro':
                          templateColors.primaryColor = '#1E40AF';
                          templateColors.secondaryColor = '#075985';
                          break;
                        case 'glassmorphism':
                          templateColors.primaryColor = '#8B5CF6';
                          templateColors.secondaryColor = '#06B6D4';
                          break;
                        case 'neomorphism':
                          templateColors.primaryColor = '#E2E8F0';
                          templateColors.secondaryColor = '#94A3B8';
                          break;
                        case 'fullscreen-video':
                          templateColors.primaryColor = '#FF6B6B';
                          templateColors.secondaryColor = '#4ECDC4';
                          break;
                        case 'parallax-3d':
                          templateColors.primaryColor = '#667EEA';
                          templateColors.secondaryColor = '#764BA2';
                          break;
                        case 'onepage-scroll':
                          templateColors.primaryColor = '#6366F1';
                          templateColors.secondaryColor = '#EC4899';
                          break;
                        case 'tech-startup':
                          templateColors.primaryColor = '#06B6D4';
                          templateColors.secondaryColor = '#0F172A';
                          break;
                        case 'elegant-gala':
                          templateColors.primaryColor = '#7C3AED';
                          templateColors.secondaryColor = '#A855F7';
                          break;
                        case 'festival-fun':
                          templateColors.primaryColor = '#F59E0B';
                          templateColors.secondaryColor = '#EF4444';
                          break;
                        case 'workshop-learning':
                          templateColors.primaryColor = '#059669';
                          templateColors.secondaryColor = '#047857';
                          break;
                        default:
                          // Couleurs par catégorie par défaut
                          switch (template.category) {
                            case 'modern':
                              templateColors.primaryColor = '#3B82F6';
                              templateColors.secondaryColor = '#1E40AF';
                              break;
                            case 'business':
                              templateColors.primaryColor = '#1F2937';
                              templateColors.secondaryColor = '#374151';
                              break;
                            case 'minimal':
                              templateColors.primaryColor = '#000000';
                              templateColors.secondaryColor = '#6B7280';
                              break;
                            case 'creative':
                              templateColors.primaryColor = '#EC4899';
                              templateColors.secondaryColor = '#F59E0B';
                              break;
                          }
                      }
                      
                      const config: LandingPageConfig = {
                        templateId: template.id,
                        customization: templateColors
                      };
                      onPreview(template.id, config);
                    }}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    Aperçu
                  </button>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.category === 'business' ? 'bg-gray-100 text-gray-800' :
                      template.category === 'creative' ? 'bg-purple-100 text-purple-800' :
                      template.category === 'minimal' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {template.category === 'business' && '💼 Professionnel'}
                      {template.category === 'creative' && '🎨 Créatif'}
                      {template.category === 'minimal' && '✨ Minimaliste'}
                      {template.category === 'modern' && '🚀 Moderne'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                
                {/* Fonctionnalités avec icônes */}
                <div className="space-y-2">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-500">
                      <svg className="h-3 w-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                  {template.features.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{template.features.length - 3} autre{template.features.length - 3 > 1 ? 's' : ''} fonctionnalité{template.features.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Indicateur de sélection */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 left-3 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panneau de personnalisation */}
      {showCustomization && selectedTemplateData && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-4">
            Personnalisation - {selectedTemplateData.name}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Couleurs */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Couleurs</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Couleur principale</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={customization.primaryColor}
                      onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Couleur secondaire</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customization.secondaryColor}
                      onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={customization.secondaryColor}
                      onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="#1F2937"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Contenu</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Titre principal</label>
                  <input
                    type="text"
                    value={customization.heroTitle}
                    onChange={(e) => handleCustomizationChange('heroTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Titre de votre événement"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Sous-titre</label>
                  <textarea
                    value={customization.heroSubtitle}
                    onChange={(e) => handleCustomizationChange('heroSubtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Description de votre événement"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Texte du bouton</label>
                  <input
                    type="text"
                    value={customization.ctaButtonText}
                    onChange={(e) => handleCustomizationChange('ctaButtonText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="S'inscrire maintenant"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Images</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Logo (URL)</label>
                  <input
                    type="url"
                    value={customization.logoUrl}
                    onChange={(e) => handleCustomizationChange('logoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://exemple.com/logo.png"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Image hero (URL)</label>
                  <input
                    type="url"
                    value={customization.heroImage}
                    onChange={(e) => handleCustomizationChange('heroImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://exemple.com/hero.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Image de fond (URL)</label>
                  <input
                    type="url"
                    value={customization.backgroundImage}
                    onChange={(e) => handleCustomizationChange('backgroundImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://exemple.com/background.jpg"
                  />
                </div>
              </div>
            </div>

            {/* CSS personnalisé */}
            <div>
              <h5 className="font-medium text-gray-700 mb-3">CSS Personnalisé</h5>
              <textarea
                value={customization.customCSS}
                onChange={(e) => handleCustomizationChange('customCSS', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={4}
                placeholder="/* Votre CSS personnalisé */&#10;.hero-section {&#10;  /* styles personnalisés */&#10;}"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}