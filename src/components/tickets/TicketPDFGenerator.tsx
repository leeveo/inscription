'use client'

import React, { useState } from 'react'
import { FiDownload, FiPrinter, FiEye, FiLoader } from 'react-icons/fi'
import { TicketTemplate, TicketData } from '@/types/ticket-templates'

interface TicketPDFGeneratorProps {
  template: TicketTemplate
  data: TicketData
}

export default function TicketPDFGenerator({ template, data }: TicketPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateHTML = () => {
    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: ${template.styles.global.fontFamily};
          background: #f0f0f0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        .ticket-container {
          width: ${template.width}px;
          height: ${template.height}px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .zone {
          position: absolute;
        }
        ${template.styles.customCSS || ''}
      </style>
    `

    const backgroundStyle = template.background.image
      ? `background-image: url('${template.background.image}'); background-size: cover; background-position: center;`
      : template.background.gradient
      ? `background: linear-gradient(${template.background.gradient.direction}, ${template.background.gradient.start}, ${template.background.gradient.end});`
      : `background-color: ${template.background.color};`

    const zones = template.zones.map(zone => {
      const rawContent = (() => {
        if (!zone.content.variable) {
          return zone.content.value || zone.content.placeholder || ''
        }
        
        // Gérer les variables avec points (ex: venue.address)
        if (zone.content.variable.includes('.')) {
          const [obj, prop] = zone.content.variable.split('.')
          const objValue = data[obj as keyof TicketData]
          if (objValue && typeof objValue === 'object' && objValue !== null) {
            return (objValue as any)[prop] || zone.content.placeholder || ''
          }
          return zone.content.placeholder || ''
        }
        
        // Variables simples
        return data[zone.content.variable as keyof TicketData] || zone.content.placeholder || ''
      })()
      
      // S'assurer que le contenu est une chaîne de caractères
      const content = typeof rawContent === 'string' ? rawContent : 
                     typeof rawContent === 'object' && rawContent !== null ? JSON.stringify(rawContent) :
                     String(rawContent || '')

      const style = `
        left: ${zone.x}px;
        top: ${zone.y}px;
        width: ${zone.width}px;
        height: ${zone.height}px;
        background-color: ${zone.style.backgroundColor || 'transparent'};
        color: ${zone.style.color || '#000'};
        font-size: ${zone.style.fontSize || 14}px;
        font-weight: ${zone.style.fontWeight || 'normal'};
        text-align: ${zone.style.textAlign || 'left'};
        font-family: ${zone.style.fontFamily || 'Arial'};
        border-radius: ${zone.style.borderRadius || 0}px;
        padding: ${zone.style.padding || 0}px;
        opacity: ${zone.style.opacity || 1};
        transform: rotate(${zone.style.rotation || 0}deg);
        display: flex;
        align-items: ${zone.style.textAlign === 'center' ? 'center' : zone.style.textAlign === 'right' ? 'flex-end' : 'flex-start'};
        justify-content: center;
        overflow: hidden;
        border: ${zone.style.borderWidth || 0}px solid ${zone.style.borderColor || '#000'};
      `

      let zoneContent = ''
      if (zone.type === 'text') {
        zoneContent = `<div style="padding: 4px;">${content.replace(/\n/g, '<br>')}</div>`
      } else if (zone.type === 'image' && zone.content.imageUrl) {
        zoneContent = `<img src="${zone.content.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
      } else if (zone.type === 'barcode') {
        zoneContent = `<div style="width: 100%; height: 100%; background: white; display: flex; align-items: center; justify-content: center;">
          <svg width="100%" height="100%" viewBox="0 0 200 60">
            <rect x="10" y="10" width="3" height="40" fill="black"/>
            <rect x="15" y="10" width="2" height="40" fill="black"/>
            <rect x="19" y="10" width="4" height="40" fill="black"/>
            <rect x="25" y="10" width="2" height="40" fill="black"/>
            <rect x="29" y="10" width="3" height="40" fill="black"/>
            <rect x="34" y="10" width="2" height="40" fill="black"/>
            <rect x="38" y="10" width="1" height="40" fill="black"/>
            <rect x="41" y="10" width="3" height="40" fill="black"/>
            <rect x="46" y="10" width="2" height="40" fill="black"/>
            <rect x="50" y="10" width="4" height="40" fill="black"/>
            <rect x="56" y="10" width="2" height="40" fill="black"/>
            <rect x="60" y="10" width="3" height="40" fill="black"/>
            <rect x="65" y="10" width="1" height="40" fill="black"/>
            <rect x="68" y="10" width="2" height="40" fill="black"/>
            <rect x="72" y="10" width="3" height="40" fill="black"/>
            <rect x="77" y="10" width="2" height="40" fill="black"/>
            <rect x="81" y="10" width="4" height="40" fill="black"/>
            <rect x="87" y="10" width="2" height="40" fill="black"/>
            <rect x="91" y="10" width="3" height="40" fill="black"/>
            <rect x="96" y="10" width="1" height="40" fill="black"/>
            <rect x="99" y="10" width="2" height="40" fill="black"/>
            <rect x="103" y="10" width="3" height="40" fill="black"/>
            <rect x="108" y="10" width="2" height="40" fill="black"/>
            <rect x="112" y="10" width="4" height="40" fill="black"/>
            <rect x="118" y="10" width="2" height="40" fill="black"/>
            <rect x="122" y="10" width="3" height="40" fill="black"/>
            <rect x="127" y="10" width="1" height="40" fill="black"/>
            <rect x="130" y="10" width="2" height="40" fill="black"/>
            <rect x="134" y="10" width="3" height="40" fill="black"/>
            <rect x="139" y="10" width="2" height="40" fill="black"/>
            <rect x="143" y="10" width="4" height="40" fill="black"/>
            <rect x="149" y="10" width="2" height="40" fill="black"/>
            <rect x="153" y="10" width="3" height="40" fill="black"/>
            <rect x="158" y="10" width="1" height="40" fill="black"/>
            <rect x="161" y="10" width="2" height="40" fill="black"/>
            <rect x="165" y="10" width="3" height="40" fill="black"/>
            <rect x="170" y="10" width="2" height="40" fill="black"/>
            <rect x="174" y="10" width="4" height="40" fill="black"/>
            <rect x="180" y="10" width="2" height="40" fill="black"/>
            <rect x="184" y="10" width="3" height="40" fill="black"/>
            <rect x="189" y="10" width="1" height="40" fill="black"/>
          </svg>
        </div>`
      } else if (zone.type === 'qrcode') {
        zoneContent = `<div style="width: 100%; height: 100%; background: white; display: flex; align-items: center; justify-content: center;">
          <div style="width: 80%; height: 80%; background: black; display: grid; grid-template-columns: repeat(8, 1fr); gap: 1px;">
            ${Array(64).fill(0).map((_, i) => `<div style="${Math.random() > 0.5 ? 'background: white' : 'background: black'}"></div>`).join('')}
          </div>
        </div>`
      } else if (zone.type === 'rectangle') {
        zoneContent = `<div style="width: 100%; height: 100%; background: ${zone.style.backgroundColor || '#ccc'}; border-radius: ${zone.style.borderRadius || 0}px;"></div>`
      } else if (zone.type === 'circle') {
        zoneContent = `<div style="width: 100%; height: 100%; background: ${zone.style.backgroundColor || '#ccc'}; border-radius: 50%;"></div>`
      }

      return `
        <div class="zone" style="${style}">
          ${zoneContent}
        </div>
      `
    }).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket - ${data.eventName}</title>
        ${styles}
      </head>
      <body>
        <div class="ticket-container" style="${backgroundStyle}">
          ${zones}
        </div>
      </body>
      </html>
    `
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const html = generateHTML()

      // Utiliser l'API pour générer le PDF
      const response = await fetch('/api/tickets/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          options: {
            format: 'A4',
            orientation: 'portrait',
            border: {
              top: '20mm',
              right: '20mm',
              bottom: '20mm',
              left: '20mm'
            }
          }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ticket-${data.ticketNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Erreur lors de la génération du PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const printTicket = async () => {
    setIsGenerating(true)
    try {
      const html = generateHTML()

      // Ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    } catch (error) {
      console.error('Error printing ticket:', error)
      alert('Erreur lors de l\'impression')
    } finally {
      setIsGenerating(false)
    }
  }

  const previewTicket = () => {
    const html = generateHTML()
    const previewWindow = window.open('', '_blank', 'width=600,height=800')
    if (previewWindow) {
      previewWindow.document.write(html)
      previewWindow.document.close()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Génération et impression</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Générer le ticket PDF</p>
            <p className="text-sm text-gray-600">Créez un fichier PDF haute qualité du ticket</p>
          </div>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiDownload className="w-4 h-4" />
            )}
            {isGenerating ? 'Génération...' : 'Télécharger PDF'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Imprimer directement</p>
            <p className="text-sm text-gray-600">Imprimez le ticket via l'imprimante système</p>
          </div>
          <button
            onClick={printTicket}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiPrinter className="w-4 h-4" />
            )}
            {isGenerating ? 'Préparation...' : 'Imprimer'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Aperçu du ticket</p>
            <p className="text-sm text-gray-600">Visualisez le ticket dans une nouvelle fenêtre</p>
          </div>
          <button
            onClick={previewTicket}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FiEye className="w-4 h-4" />
            Aperçu
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Conseil:</strong> Utilisez l'aperçu pour vérifier que toutes les informations sont correctes avant de générer le PDF ou d'imprimer.
        </p>
      </div>
    </div>
  )
}