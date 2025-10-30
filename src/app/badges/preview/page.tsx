'use client'

import { useEffect, useState } from 'react'
import { FiPrinter, FiDownload, FiArrowLeft } from 'react-icons/fi'
import { BadgeData, ExtendedBadgeTemplate } from '@/types/badge-templates'

export default function BadgePreviewPage() {
  const [previewData, setPreviewData] = useState<{
    template: ExtendedBadgeTemplate;
    data: BadgeData;
    options: any;
  } | null>(null)

  useEffect(() => {
    // Récupérer les données depuis sessionStorage
    const stored = sessionStorage.getItem('badgePreview')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setPreviewData(data)
      } catch (error) {
        console.error('Error parsing preview data:', error)
      }
    }
  }, [])

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aperçu non disponible</h1>
          <p className="text-gray-600 mb-6">
            Les données d'aperçu n'ont pas pu être chargées.
          </p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  const { template, data, options } = previewData

  // Fonction pour résoudre les variables dans le contenu
  const resolveVariable = (content: string): string => {
    return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const variableMap: Record<string, string> = {
        'eventName': data.eventName,
        'fullName': data.fullName,
        'firstName': data.firstName,
        'lastName': data.lastName,
        'company': data.company || '',
        'profession': data.profession || '',
        'role': data.role || '',
        'badgeNumber': data.badgeNumber,
        'participant_name': data.fullName,
        'participant_company': data.company || '',
        'participant_role': data.role || '',
        'badge_number': data.badgeNumber,
        'event_name': data.eventName
      }
      return variableMap[varName] || match
    })
  }

  // Rendu d'un badge
  const renderBadge = (scale = 1) => {
    const zones = template.schema?.zones || template.zones || []
    const badgeWidth = template.width || 340
    const badgeHeight = template.height || 220
    const backgroundColor = template.background?.color || '#ffffff'
    const backgroundImage = template.background?.image || ''

    return (
      <div
        className="relative bg-white border border-gray-300 shadow-lg mx-auto print:shadow-none print:border-black"
        style={{
          width: `${badgeWidth * scale}px`,
          height: `${badgeHeight * scale}px`,
          backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {zones.map((zone) => {
          const content = zone.content?.text || zone.content?.variable || ''
          const resolvedContent = resolveVariable(content)

          return (
            <div
              key={zone.id}
              className="absolute overflow-hidden"
              style={{
                left: `${zone.position.x * scale}px`,
                top: `${zone.position.y * scale}px`,
                width: `${zone.position.width * scale}px`,
                height: `${zone.position.height * scale}px`,
                backgroundColor: zone.style?.background || 'transparent',
                borderRadius: `${(zone.style?.border_radius || 0) * scale}px`,
                border: zone.style?.border || 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: zone.style?.text_align === 'center' ? 'center' :
                               zone.style?.text_align === 'right' ? 'flex-end' : 'flex-start',
                padding: `${(Number(zone.style?.padding) || 0) * scale}px`,
                color: zone.style?.color || '#000000',
                fontSize: `${(zone.style?.font_size || 12) * scale}px`,
                fontFamily: zone.style?.font_family || 'Arial, sans-serif',
                fontWeight: zone.style?.font_weight || 'normal',
                textAlign: zone.style?.text_align as any || 'left'
              }}
            >
              {zone.type === 'text' && (
                <div>{resolvedContent}</div>
              )}
              {zone.type === 'image' && (
                <img
                  src={zone.content?.image_url || '/placeholder-image.png'}
                  alt={zone.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: (zone.style?.object_fit as any) || 'cover'
                  }}
                />
              )}
              {zone.type === 'qr' && (
                <div className="w-full h-full bg-white flex items-center justify-center border border-gray-300">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.qrCode || data.badgeNumber)}`}
                    alt="QR Code"
                    style={{ width: '90%', height: '90%' }}
                  />
                </div>
              )}
              {zone.type === 'shape' && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: zone.style?.background || '#3B82F6',
                    borderRadius: `${(zone.style?.border_radius || 0) * scale}px`
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/badges/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData)
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
      } else {
        alert('Erreur lors du téléchargement du PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Erreur lors du téléchargement du PDF')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header avec actions */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.close()}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Retour
              </button>
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  Aperçu Badge - {data.fullName}
                </h1>
                <p className="text-sm text-gray-600">
                  Template: {template.name} | Badge: {data.badgeNumber}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <FiDownload className="w-4 h-4" />
                Télécharger PDF
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <FiPrinter className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone d'aperçu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Informations sur l'impression */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Paramètres d'impression</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Format:</span> {options.format}
              </div>
              <div>
                <span className="font-medium">Qualité:</span> {options.quality === 'high' ? 'Haute' : options.quality === 'medium' ? 'Moyenne' : 'Basse'}
              </div>
              <div>
                <span className="font-medium">Exemplaires:</span> {options.copies}
              </div>
              <div>
                <span className="font-medium">Couleur:</span> {options.color ? 'Oui' : 'Noir et blanc'}
              </div>
            </div>
          </div>

          {/* Aperçu du badge */}
          <div className="flex flex-col items-center">
            <div className="mb-6 print:hidden">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Aperçu du badge
              </h2>
              <p className="text-gray-600 text-center">
                Taille réelle: {template.width}mm × {template.height}mm
              </p>
            </div>

            {/* Badge à l'écran (agrandi) */}
            <div className="print:hidden">
              {renderBadge(3)}
            </div>

            {/* Badge pour impression (taille réelle) */}
            <div className="hidden print:block">
              {renderBadge(1)}
            </div>

            {/* Grille de badges pour impression multiple */}
            {options.copies > 1 && (
              <div className="mt-8 print:mt-0 print:grid print:grid-cols-2 print:gap-4">
                {Array.from({ length: Math.min(options.copies - 1, 5) }).map((_, index) => (
                  <div key={index} className="print:block hidden">
                    {renderBadge(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations sur le participant */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg print:hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du participant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nom complet:</span>
                <p className="text-gray-900">{data.fullName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{data.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Entreprise:</span>
                <p className="text-gray-900">{data.company || 'Non renseignée'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Profession:</span>
                <p className="text-gray-900">{data.profession || 'Non renseignée'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Rôle:</span>
                <p className="text-gray-900">{data.role || 'Participant'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Numéro de badge:</span>
                <p className="text-gray-900">{data.badgeNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          @page {
            ${options.format === 'A4' ? 'size: A4;' : ''}
            ${options.format === 'Letter' ? 'size: Letter;' : ''}
            ${options.format === '85mm x 55mm' ? 'size: 85mm 55mm;' : ''}
            ${options.format === 'credit-card' ? 'size: 86mm 54mm;' : ''}
            margin: ${options.margins.top}mm ${options.margins.right}mm ${options.margins.bottom}mm ${options.margins.left}mm;
          }
          
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}