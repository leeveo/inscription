'use client'

import { useState, useEffect } from 'react'

type BrevoTemplate = {
  id: number
  name: string
  subject?: string
  htmlContent?: string
  content?: string
  tag?: string
  isActive?: boolean
}

type BrevoTemplateSelectorProps = {
  onSelectTemplate: (htmlContent: string) => void
  onClose: () => void
}

export default function BrevoTemplateSelector({ onSelectTemplate, onClose }: BrevoTemplateSelectorProps) {
  const [templates, setTemplates] = useState<BrevoTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<BrevoTemplate | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/brevo-templates')
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setTemplates(data.templates || [])
      } catch (err) {
        console.error('Error fetching Brevo templates:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleSelectTemplate = (template: BrevoTemplate) => {
    const content = template.htmlContent || template.content || ''
    onSelectTemplate(content)
    onClose()
  }

  const handlePreviewTemplate = (template: BrevoTemplate) => {
    setSelectedTemplate(template)
  }

  const handleClosePreview = () => {
    setSelectedTemplate(null)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Templates Brevo</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-medium">Erreur lors du chargement des templates</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Chargement des templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun template trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vérifiez votre configuration Brevo ou créez des templates dans votre compte Brevo
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {template.name || `Template ${template.id}`}
                        </h3>
                        {template.subject && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            Sujet: {template.subject}
                          </p>
                        )}
                        {template.tag && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                            {template.tag}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        {template.isActive !== false && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Actif
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreviewTemplate(template)}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
                      >
                        Aperçu
                      </button>
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Utiliser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Aperçu: {selectedTemplate.name || `Template ${selectedTemplate.id}`}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSelectTemplate(selectedTemplate)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Utiliser ce template
                </button>
                <button
                  onClick={handleClosePreview}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="border rounded p-4 bg-gray-50">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: selectedTemplate.htmlContent || selectedTemplate.content || '<p>Pas de contenu disponible</p>' 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}