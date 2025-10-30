'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

interface TemplateLibraryModalProps {
  eventId: string
  onClose: () => void
  onTemplateSelected: (formId: string) => void
}

interface FormBuilderTemplate {
  id: string
  name: string
  description: string
  category: string
  preview_image?: string
  tree_data?: any
  is_featured?: boolean
}

interface FormBuilderForm {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  updated_at: string
  tree?: any
}

export default function TemplateLibraryModal({
  eventId,
  onClose,
  onTemplateSelected
}: TemplateLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'my-forms' | 'create-new'>('templates')
  const [templates, setTemplates] = useState<FormBuilderTemplate[]>([])
  const [myForms, setMyForms] = useState<FormBuilderForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates()
    } else if (activeTab === 'my-forms') {
      fetchMyForms()
    }
  }, [activeTab])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      // Templates simples avec bloc formulaire intégré qui fonctionnent immédiatement
      const mockTemplates: FormBuilderTemplate[] = [
        {
          id: '1',
          name: 'Conference Premium',
          description: 'Template complet pour conférences avec formulaire design intégré',
          category: 'Conférence',
          preview_image: '/api/placeholder/300/200',
          is_featured: true,
          tree_data: {
            rootNodeId: "root",
            nodes: {
              "root": {
                id: "root",
                type: "Container",
                children: ["title", "form-container"],
                props: {
                  background: "#ffffff",
                  padding: 32,
                  margin: 0,
                  className: "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
                },
                version: "1.0"
              },
              "title": {
                id: "title",
                type: "Text",
                children: [],
                props: {
                  content: "Conférence Innovation 2024",
                  tag: "h1",
                  className: "text-4xl font-bold text-center mb-4 text-gray-900"
                },
                version: "1.0"
              },
              "form-container": {
                id: "form-container",
                type: "Container",
                children: ["form-intro", "registration-form"],
                props: {
                  background: "#ffffff",
                  padding: 40,
                  className: "max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                },
                version: "1.0"
              },
              "form-intro": {
                id: "form-intro",
                type: "Text",
                children: [],
                props: {
                  content: "Réservez votre place pour notre conférence annuelle sur l'innovation technologique",
                  tag: "p",
                  className: "text-center text-gray-600 mb-8"
                },
                version: "1.0"
              },
              "registration-form": {
                id: "registration-form",
                type: "RegistrationForm",
                children: [],
                props: {
                  eventId: "{{EVENT_ID}}",
                  title: "Formulaire d'inscription",
                  description: "Les champs marqués d'un astérisque sont obligatoires",
                  showSessions: true,
                  showSocialMedia: true,
                  requiredFields: ['nom', 'prenom', 'email', 'telephone'],
                  submitButtonText: "Confirmer mon inscription",
                  successMessage: "Inscription réussie ! Vous recevrez un email de confirmation.",
                  errorMessage: "Une erreur est survenue lors de l'inscription.",
                  className: "space-y-6"
                },
                version: "1.0"
              }
            }
          }
        },
        {
          id: '2',
          name: 'Workshop Intensif',
          description: 'Template élégant pour ateliers avec formulaire moderne intégré',
          category: 'Formation',
          preview_image: '/api/placeholder/300/200',
          tree_data: {
            rootNodeId: "root",
            nodes: {
              "root": {
                id: "root",
                type: "Container",
                children: ["hero-section", "content-section", "form-section"],
                props: {
                  background: "#ffffff",
                  padding: 0,
                  margin: 0,
                  className: "min-h-screen"
                },
                version: "1.0"
              },
              "hero-section": {
                id: "hero-section",
                type: "Container",
                children: ["hero-title", "hero-subtitle"],
                props: {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: 80,
                  className: "text-center text-white py-16"
                },
                version: "1.0"
              },
              "hero-title": {
                id: "hero-title",
                type: "Text",
                children: [],
                props: {
                  content: "Workshop Digital Marketing",
                  tag: "h1",
                  className: "text-5xl font-bold mb-4"
                },
                version: "1.0"
              },
              "hero-subtitle": {
                id: "hero-subtitle",
                type: "Text",
                children: [],
                props: {
                  content: "Une journée intensive pour maîtriser les stratégies marketing digitales",
                  tag: "p",
                  className: "text-xl opacity-90 max-w-3xl mx-auto"
                },
                version: "1.0"
              },
              "content-section": {
                id: "content-section",
                type: "Container",
                children: ["info-grid"],
                props: {
                  background: "#ffffff",
                  padding: 80,
                  className: "py-16"
                },
                version: "1.0"
              },
              "info-grid": {
                id: "info-grid",
                type: "Container",
                children: ["date-card", "location-card", "price-card"],
                props: {
                  background: "transparent",
                  padding: 0,
                  className: "max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
                },
                version: "1.0"
              },
              "date-card": {
                id: "date-card",
                type: "Container",
                children: ["date-icon", "date-text"],
                props: {
                  background: "#f8fafc",
                  padding: 32,
                  className: "bg-gray-50 rounded-xl p-8 text-center"
                },
                version: "1.0"
              },
              "date-icon": {
                id: "date-icon",
                type: "Text",
                children: [],
                props: {
                  content: "📅",
                  tag: "div",
                  className: "text-4xl mb-4"
                },
                version: "1.0"
              },
              "date-text": {
                id: "date-text",
                type: "Text",
                children: [],
                props: {
                  content: "25 Mars 2024\n9h00 - 17h00",
                  tag: "div",
                  className: "text-gray-700 font-semibold"
                },
                version: "1.0"
              },
              "location-card": {
                id: "location-card",
                type: "Container",
                children: ["location-icon", "location-text"],
                props: {
                  background: "#f8fafc",
                  padding: 32,
                  className: "bg-gray-50 rounded-xl p-8 text-center"
                },
                version: "1.0"
              },
              "location-icon": {
                id: "location-icon",
                type: "Text",
                children: [],
                props: {
                  content: "📍",
                  tag: "div",
                  className: "text-4xl mb-4"
                },
                version: "1.0"
              },
              "location-text": {
                id: "location-text",
                type: "Text",
                children: [],
                props: {
                  content: "Espace CoWorking\n15 Rue de la Paix, Paris",
                  tag: "div",
                  className: "text-gray-700 font-semibold"
                },
                version: "1.0"
              },
              "price-card": {
                id: "price-card",
                type: "Container",
                children: ["price-icon", "price-text"],
                props: {
                  background: "#f8fafc",
                  padding: 32,
                  className: "bg-gray-50 rounded-xl p-8 text-center"
                },
                version: "1.0"
              },
              "price-icon": {
                id: "price-icon",
                type: "Text",
                children: [],
                props: {
                  content: "💰",
                  tag: "div",
                  className: "text-4xl mb-4"
                },
                version: "1.0"
              },
              "price-text": {
                id: "price-text",
                type: "Text",
                children: [],
                props: {
                  content: "299€ HT\nDéjeuner inclus",
                  tag: "div",
                  className: "text-gray-700 font-semibold"
                },
                version: "1.0"
              },
              "form-section": {
                id: "form-section",
                type: "Container",
                children: ["form-title", "registration-form", "form-footer"],
                props: {
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  padding: 80,
                  className: "py-16"
                },
                version: "1.0"
              },
              "form-title": {
                id: "form-title",
                type: "Text",
                children: [],
                props: {
                  content: "Réservez votre place",
                  tag: "h2",
                  className: "text-4xl font-bold text-white text-center mb-8"
                },
                version: "1.0"
              },
              "registration-form": {
                id: "registration-form",
                type: "RegistrationForm",
                children: [],
                props: {
                  eventId: "{{EVENT_ID}}",
                  title: "Inscription au Workshop",
                  description: "Les places sont limitées à 20 participants pour garantir une expérience optimale",
                  showSessions: false,
                  showSocialMedia: false,
                  requiredFields: ['nom', 'prenom', 'email', 'telephone'],
                  submitButtonText: "Confirmer mon inscription",
                  successMessage: "Inscription confirmée ! Vous recevrez un email de confirmation.",
                  errorMessage: "Une erreur est survenue lors de l'inscription.",
                  className: "max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8"
                },
                version: "1.0"
              },
              "form-footer": {
                id: "form-footer",
                type: "Text",
                children: [],
                props: {
                  content: "Pour toute question, contactez-nous à workshop@marketing.fr",
                  tag: "p",
                  className: "text-center text-white opacity-90 mt-6"
                },
                version: "1.0"
              }
            }
          }
        }
      ]
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMyForms = async () => {
    try {
      setIsLoading(true)
      const supabase = supabaseBrowser()

      const { data, error } = await supabase
        .from('registration_form_builders')
        .select('id, name, slug, status, updated_at, tree')
        .order('updated_at', { ascending: false })

      if (error) throw error

      setMyForms(data || [])
    } catch (error) {
      console.error('Error fetching my forms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFromTemplate = async (template: FormBuilderTemplate) => {
    try {
      setIsCreating(true)
      const supabase = supabaseBrowser()

      // Cloner le template et remplacer les variables
      const processedTree = JSON.parse(JSON.stringify(template.tree_data))

      // Remplacer {{EVENT_ID}} par l'eventId réel dans tous les nœuds
      const replaceEventId = (nodes: any) => {
        Object.keys(nodes).forEach(nodeId => {
          const node = nodes[nodeId]
          if (node.props && node.props.eventId === '{{EVENT_ID}}') {
            node.props.eventId = eventId
          }
        })
        return nodes
      }

      processedTree.nodes = replaceEventId(processedTree.nodes)

      // S'assurer que le tree est correctement formaté pour Craft.js
      const finalTree = JSON.stringify(processedTree)

      console.log('Creating form with tree:', finalTree)

      const { data, error } = await supabase
        .from('registration_form_builders')
        .insert({
          name: `${template.name} - ${new Date().toLocaleDateString()}`,
          slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          tree: finalTree, // Stocker comme string JSON
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        onTemplateSelected(data.id)
      }
    } catch (error) {
      console.error('Error creating form from template:', error)
      alert('Erreur lors de la création du formulaire depuis le template')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateNewForm = async () => {
    if (!newFormName.trim()) return

    try {
      setIsCreating(true)
      const supabase = supabaseBrowser()

      const slug = newFormName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Créer un tree de base Craft.js valide
      const baseTree = {
        rootNodeId: "root",
        nodes: {
          "root": {
            id: "root",
            type: "Container",
            children: ["title", "form-container"],
            props: {
              background: "#ffffff",
              padding: 32,
              margin: 0,
              className: "min-h-screen bg-gray-50"
            },
            version: "1.0"
          },
          "title": {
            id: "title",
            type: "Text",
            children: [],
            props: {
              content: newFormName,
              tag: "h1",
              className: "text-3xl font-bold text-center mb-8 text-gray-900"
            },
            version: "1.0"
          },
          "form-container": {
            id: "form-container",
            type: "Container",
            children: ["registration-form"],
            props: {
              background: "#ffffff",
              padding: 40,
              className: "max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8"
            },
            version: "1.0"
          },
          "registration-form": {
            id: "registration-form",
            type: "RegistrationForm",
            children: [],
            props: {
              eventId: eventId,
              title: "Formulaire d'inscription",
              description: "Remplissez ce formulaire pour vous inscrire",
              showSessions: false,
              showSocialMedia: false,
              requiredFields: ['nom', 'prenom', 'email', 'telephone'],
              submitButtonText: "S'inscrire",
              successMessage: "Inscription réussie !",
              errorMessage: "Une erreur est survenue.",
              className: "space-y-4"
            },
            version: "1.0"
          }
        }
      }

      const finalTree = JSON.stringify(baseTree)

      const { data, error } = await supabase
        .from('registration_form_builders')
        .insert({
          name: newFormName,
          slug: `${slug}-${Date.now()}`,
          tree: finalTree, // Stocker comme string JSON
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        onTemplateSelected(data.id)
      }
    } catch (error) {
      console.error('Error creating new form:', error)
      alert('Erreur lors de la création du formulaire')
    } finally {
      setIsCreating(false)
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Bibliothèque de Templates</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'templates'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates Prédéfinis
            </button>
            <button
              onClick={() => setActiveTab('my-forms')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'my-forms'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes Formulaires
            </button>
            <button
              onClick={() => setActiveTab('create-new')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'create-new'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Créer un Formulaire
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un template..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Templates Grid */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement des templates...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
                    >
                      {/* Preview Image */}
                      <div className="h-40 bg-gradient-to-br from-purple-100 to-blue-100 relative">
                        {template.preview_image ? (
                          <img
                            src={template.preview_image}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                        {template.is_featured && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                            Populaire
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {template.category}
                          </span>
                          <button
                            onClick={() => handleCreateFromTemplate(template)}
                            disabled={isCreating}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {isCreating ? 'Création...' : 'Utiliser'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-forms' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement de vos formulaires...</p>
                </div>
              ) : myForms.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun formulaire créé</h3>
                  <p className="text-gray-600 mb-4">Commencez par créer votre premier formulaire</p>
                  <button
                    onClick={() => setActiveTab('create-new')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Créer un formulaire
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myForms.map((form) => (
                    <div
                      key={form.id}
                      onClick={() => onTemplateSelected(form.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{form.name}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          form.status === 'published' ? 'bg-green-100 text-green-800' :
                          form.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {form.status === 'published' ? 'Publié' :
                           form.status === 'draft' ? 'Brouillon' : 'Archivé'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(form.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create-new' && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Créer un nouveau formulaire</h3>
                <p className="text-gray-600">Commencez avec un formulaire vierge que vous personnaliserez avec notre éditeur drag & drop</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="form-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du formulaire
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    value={newFormName}
                    onChange={(e) => setNewFormName(e.target.value)}
                    placeholder="Ex: Inscription à l'événement 2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">✨ Fonctionnalités du form builder</h4>
                  <ul className="space-y-1 text-sm text-purple-700">
                    <li>• Éditeur drag & drop intuitif</li>
                    <li>• Champ de texte, email, téléphone, date</li>
                    <li>• Cases à cocher et boutons radio</li>
                    <li>• Listes déroulantes et sélections multiples</li>
                    <li>• Upload de fichiers</li>
                    <li>• Conditions et logique avancée</li>
                    <li>• Personnalisation complète du style</li>
                  </ul>
                </div>

                <button
                  onClick={handleCreateNewForm}
                  disabled={isCreating || !newFormName.trim()}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Création en cours...' : 'Créer le formulaire'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}