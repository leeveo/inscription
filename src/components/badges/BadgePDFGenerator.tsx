'use client'

import React, { useState } from 'react'
import {
  FiDownload,
  FiPrinter,
  FiEye,
  FiSettings,
  FiFile,
  FiImage,
  FiGrid,
  FiCheck,
  FiAlertCircle,
  FiLoader
} from 'react-icons/fi'
import { ExtendedBadgeTemplate, BadgeData } from '@/types/badge-templates'

interface BadgePDFGeneratorProps {
  template: ExtendedBadgeTemplate
  data: BadgeData
}

interface PrintOptions {
  format: 'A4' | 'Letter' | '85mm x 55mm' | 'credit-card'
  quality: 'low' | 'medium' | 'high'
  copies: number
  color: boolean
  duplex: boolean
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  badgesPerPage: number
}

export default function BadgePDFGenerator({ template, data }: BadgePDFGeneratorProps) {
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    format: 'A4',
    quality: 'high',
    copies: 1,
    color: true,
    duplex: false,
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    badgesPerPage: 8
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState<'single' | 'grid'>('single')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Calculer le nombre de badges par page selon le format
  const calculateBadgesPerPage = (format: string): number => {
    switch (format) {
      case 'A4':
        return 8
      case 'Letter':
        return 6
      case '85mm x 55mm':
        return 1
      case 'credit-card':
        return 1
      default:
        return 8
    }
  }

  // Mettre à jour le format et ajuster le nombre de badges par page
  const handleFormatChange = (format: PrintOptions['format']) => {
    const badgesPerPage = calculateBadgesPerPage(format)
    setPrintOptions(prev => ({ ...prev, format, badgesPerPage }))
  }

  // Générer le PDF
  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      console.log('🎫 Génération du PDF badge pour:', data.fullName)
      
      // Appeler l'API de génération de PDF
      const response = await fetch('/api/badges/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          data,
          options: printOptions
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `badge-${data.badgeNumber}-${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        console.log('✅ PDF généré et téléchargé avec succès')
        alert('✅ Badge PDF téléchargé avec succès!')
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur lors de la génération du PDF:', errorData)
        alert('❌ Erreur lors de la génération du PDF: ' + (errorData.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error)
      alert('❌ Erreur lors de la génération du PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  // Imprimer directement
  const printDirectly = async () => {
    setIsGenerating(true)
    try {
      console.log('🖨️ Envoi du badge à l\'imprimante:', data.fullName)

      // Appeler l'API d'impression
      const response = await fetch('/api/badges/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          data,
          options: printOptions
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('✅ Badge envoyé à l\'imprimante:', result.printJobId)
          alert(`✅ Badge envoyé à l'imprimante avec succès!\n\nID du travail: ${result.printJobId}\nParticipant: ${result.details.participant}`)
        } else {
          alert('❌ Erreur lors de l\'impression: ' + (result.error || 'Erreur inconnue'))
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur impression:', errorData)
        alert('❌ Erreur lors de l\'impression: ' + (errorData.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('❌ Erreur impression:', error)
      alert('❌ Erreur lors de l\'impression')
    } finally {
      setIsGenerating(false)
    }
  }

  // Aperçu avant impression
  const previewPDF = () => {
    try {
      // Ouvrir un nouvel onglet avec l'aperçu
      const previewData = {
        template,
        data,
        options: printOptions
      }

      sessionStorage.setItem('badgePreview', JSON.stringify(previewData))
      const previewWindow = window.open('/badges/preview', '_blank')
      
      if (!previewWindow) {
        alert('⚠️ Veuillez autoriser les pop-ups pour afficher l\'aperçu')
      }
    } catch (error) {
      console.error('Error opening preview:', error)
      alert('❌ Erreur lors de l\'ouverture de l\'aperçu')
    }
  }

  // Rendu du badge en aperçu
  const renderBadgePreview = (scale: number = 1) => {
    return (
      <div
        className="relative bg-white border border-gray-300 shadow-md"
        style={{
          width: `${template.width * scale}px`,
          height: `${template.height * scale}px`,
          backgroundColor: template.background?.color || '#ffffff',
          backgroundImage: template.background?.image ? `url(${template.background.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Zones du badge */}
        {(template.schema?.zones || template.zones || []).map((zone) => {
          const content = zone.content.text || zone.content.variable || ''
          const resolvedContent = content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            const value = getVariableValue(varName, data)
            return value || match
          })

          return (
            <div
              key={zone.id}
              className="absolute overflow-hidden"
              style={{
                left: `${zone.position.x * scale}px`,
                top: `${zone.position.y * scale}px`,
                width: `${zone.position.width * scale}px`,
                height: `${zone.position.height * scale}px`,
                backgroundColor: zone.style.background || 'transparent',
                borderRadius: `${zone.style.border_radius || 0}px`,
                border: zone.style.border || 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: zone.style.text_align === 'center' ? 'center' :
                               zone.style.text_align === 'right' ? 'flex-end' : 'flex-start',
                padding: `${(Number(zone.style.padding) || 0) * scale}px`,
                color: zone.style.color || '#000000',
                fontSize: `${(zone.style.font_size || 12) * scale}px`,
                fontFamily: zone.style.font_family || 'Arial',
                fontWeight: zone.style.font_weight || 'normal',
                textAlign: zone.style.text_align || 'left'
              }}
            >
              {zone.type === 'text' && (
                <div style={{ fontSize: `${(zone.style.font_size || 12) * scale}px` }}>
                  {resolvedContent}
                </div>
              )}
              {zone.type === 'image' && (
                <img
                  src={zone.content.image_url || '/placeholder-image.png'}
                  alt={zone.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: zone.style.object_fit || 'cover'
                  }}
                />
              )}
              {zone.type === 'qr' && (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <div className="w-4/5 h-4/5 bg-black rounded" />
                </div>
              )}
              {zone.type === 'shape' && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: zone.style.background || '#3B82F6',
                    borderRadius: `${zone.style.border_radius || 0}px`
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Obtenir la valeur d'une variable
  const getVariableValue = (varName: string, data: BadgeData): string => {
    const variableMap: Record<string, string> = {
      'eventName': data.eventName,
      'fullName': data.fullName,
      'firstName': data.firstName,
      'lastName': data.lastName,
      'company': data.company || '',
      'profession': data.profession || '',
      'role': data.role || '',
      'badgeNumber': data.badgeNumber,
      'qrCode': data.qrCode,
      'logoUrl': data.logoUrl || ''
    }
    return variableMap[varName] || ''
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiFile className="w-5 h-5" />
            Génération et Impression
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Générez des PDFs ou imprimez directement vos badges
          </p>
        </div>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            showAdvancedOptions ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <FiSettings className="w-4 h-4" />
          Options avancées
        </button>
      </div>

      {/* Options d'impression */}
      {showAdvancedOptions && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select
                value={printOptions.format}
                onChange={(e) => handleFormatChange(e.target.value as PrintOptions['format'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (216 × 279 mm)</option>
                <option value="85mm x 55mm">85mm × 55mm (Format badge)</option>
                <option value="credit-card">Carte de crédit (54 × 86 mm)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualité</label>
              <select
                value={printOptions.quality}
                onChange={(e) => setPrintOptions(prev => ({ ...prev, quality: e.target.value as PrintOptions['quality'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Basse (rapide)</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute (recommandée)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'exemplaires</label>
              <input
                type="number"
                min="1"
                max="100"
                value={printOptions.copies}
                onChange={(e) => setPrintOptions(prev => ({ ...prev, copies: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Badges par page</label>
              <input
                type="number"
                min="1"
                max="20"
                value={printOptions.badgesPerPage}
                onChange={(e) => setPrintOptions(prev => ({ ...prev, badgesPerPage: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printOptions.color}
                onChange={(e) => setPrintOptions(prev => ({ ...prev, color: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Impression couleur</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printOptions.duplex}
                onChange={(e) => setPrintOptions(prev => ({ ...prev, duplex: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Recto-verso</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marges (mm)</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                placeholder="Haut"
                value={printOptions.margins.top}
                onChange={(e) => setPrintOptions(prev => ({
                  ...prev,
                  margins: { ...prev.margins, top: parseInt(e.target.value) }
                }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Droite"
                value={printOptions.margins.right}
                onChange={(e) => setPrintOptions(prev => ({
                  ...prev,
                  margins: { ...prev.margins, right: parseInt(e.target.value) }
                }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Bas"
                value={printOptions.margins.bottom}
                onChange={(e) => setPrintOptions(prev => ({
                  ...prev,
                  margins: { ...prev.margins, bottom: parseInt(e.target.value) }
                }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Gauche"
                value={printOptions.margins.left}
                onChange={(e) => setPrintOptions(prev => ({
                  ...prev,
                  margins: { ...prev.margins, left: parseInt(e.target.value) }
                }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode d'aperçu */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Mode d'aperçu:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('single')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                previewMode === 'single'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiEye className="w-4 h-4 inline mr-1" />
              Solo
            </button>
            <button
              onClick={() => setPreviewMode('grid')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                previewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiGrid className="w-4 h-4 inline mr-1" />
              Grille
            </button>
          </div>
        </div>

        {/* Zone d'aperçu */}
        <div className="bg-gray-50 rounded-lg p-6 overflow-auto min-h-[400px] flex items-center justify-center">
          {previewMode === 'single' ? (
            <div className="flex justify-center">
              {renderBadgePreview(5)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {Array.from({ length: Math.min(6, printOptions.badgesPerPage) }).map((_, index) => (
                <div key={index} className="flex justify-center">
                  {renderBadgePreview(3)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informations sur l'impression */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Informations d'impression</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Format: {printOptions.format}</li>
              <li>• Qualité: {printOptions.quality === 'high' ? 'Haute' : printOptions.quality === 'medium' ? 'Moyenne' : 'Basse'}</li>
              <li>• Nombre d'exemplaires: {printOptions.copies}</li>
              <li>• Badges par page: {printOptions.badgesPerPage}</li>
              <li>• Impression {printOptions.color ? 'couleur' : 'noir et blanc'}</li>
              <li>• {printOptions.duplex ? 'Recto-verso' : 'Recto seul'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
        >
          {isGenerating ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <FiDownload className="w-4 h-4" />
              Télécharger PDF
            </>
          )}
        </button>

        <button
          onClick={printDirectly}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors font-medium"
        >
          {isGenerating ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Impression...
            </>
          ) : (
            <>
              <FiPrinter className="w-4 h-4" />
              Imprimer directement
            </>
          )}
        </button>

        <button
          onClick={previewPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
        >
          <FiEye className="w-4 h-4" />
          Aperçu
        </button>

        <button
          onClick={() => {
            const options = JSON.stringify(printOptions, null, 2)
            navigator.clipboard.writeText(options)
            alert('Options d\'impression copiées dans le presse-papiers')
          }}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
        >
          <FiImage className="w-4 h-4" />
          Copier options
        </button>
      </div>

      {/* Statut */}
      {isGenerating && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FiLoader className="w-4 h-4 text-yellow-600 animate-spin" />
            <span className="text-sm text-yellow-800">
              Génération en cours... Veuillez patienter.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}