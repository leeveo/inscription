'use client'

import React, { useState, useEffect } from 'react'
import { FiEdit3, FiTrash2, FiSave, FiEye, FiDownload, FiPlus, FiMove, FiType, FiImage, FiGrid } from 'react-icons/fi'
import { TicketTemplate, TicketZone, TicketData, TemplateEditorState } from '@/types/ticket-templates'

interface TicketEditorProps {
  template: TicketTemplate
  onTemplateChange: (template: TicketTemplate) => void
  onSave: () => void
  data: TicketData
  onDataChange: (data: TicketData) => void
}

export default function TicketEditor({ template, onTemplateChange, onSave, data, onDataChange }: TicketEditorProps) {
  const [selectedZone, setSelectedZone] = useState<TicketZone | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  // Calculer le ratio pour l'aperçu
  const scale = Math.min(500 / template.width, 800 / template.height) * zoom

  const handleZoneMouseDown = (e: React.MouseEvent, zone: TicketZone) => {
    if (previewMode) return

    setSelectedZone(zone)
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedZone || previewMode) return

    const container = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - container.left - dragStart.x) / scale
    const y = (e.clientY - container.top - dragStart.y) / scale

    const updatedZone = {
      ...selectedZone,
      x: Math.max(0, Math.min(x, template.width - selectedZone.width)),
      y: Math.max(0, Math.min(y, template.height - selectedZone.height))
    }

    const updatedTemplate = {
      ...template,
      zones: template.zones.map(z => z.id === selectedZone.id ? updatedZone : z)
    }

    onTemplateChange(updatedTemplate)
    setSelectedZone(updatedZone)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updateZoneProperty = (property: string, value: any) => {
    if (!selectedZone) return

    const updatedZone = {
      ...selectedZone,
      [property]: value
    }

    const updatedTemplate = {
      ...template,
      zones: template.zones.map(z => z.id === selectedZone.id ? updatedZone : z)
    }

    onTemplateChange(updatedTemplate)
    setSelectedZone(updatedZone)
  }

  const addZone = (type: TicketZone['type']) => {
    const newZone: TicketZone = {
      id: `zone-${Date.now()}`,
      type,
      name: `Nouveau ${type}`,
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      content: {
        type: 'static',
        value: type === 'text' ? 'Texte' : ''
      },
      style: {
        backgroundColor: type === 'text' ? 'transparent' : '#3B82F6',
        color: '#000000',
        fontSize: 14,
        textAlign: 'center'
      }
    }

    const updatedTemplate = {
      ...template,
      zones: [...template.zones, newZone]
    }

    onTemplateChange(updatedTemplate)
    setSelectedZone(newZone)
  }

  const deleteZone = (zoneId: string) => {
    const updatedTemplate = {
      ...template,
      zones: template.zones.filter(z => z.id !== zoneId)
    }
    onTemplateChange(updatedTemplate)
    setSelectedZone(null)
  }

  const renderZone = (zone: TicketZone) => {
    const isSelected = selectedZone?.id === zone.id
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: zone.x * scale,
      top: zone.y * scale,
      width: zone.width * scale,
      height: zone.height * scale,
      border: isSelected ? '2px solid #3B82F6' : '1px dashed #D1D5DB',
      backgroundColor: zone.style.backgroundColor || 'transparent',
      color: zone.style.color || '#000000',
      fontSize: (zone.style.fontSize || 14) * scale,
      fontWeight: zone.style.fontWeight || 'normal',
      textAlign: zone.style.textAlign as any || 'left',
      fontFamily: zone.style.fontFamily || 'Arial',
      borderRadius: (zone.style.borderRadius || 0) * scale,
      padding: (zone.style.padding || 0) * scale,
      cursor: previewMode ? 'default' : 'move',
      opacity: zone.style.opacity || 1,
      transform: `rotate(${zone.style.rotation || 0}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: zone.style.textAlign === 'center' ? 'center' : 'flex-start',
      overflow: 'hidden'
    }

    const content = (() => {
      if (previewMode && zone.content.variable) {
        const rawValue = data[zone.content.variable as keyof TicketData]
        
        // Convertir les valeurs en chaînes appropriées
        if (zone.content.variable === 'venue' && typeof rawValue === 'object' && rawValue !== null) {
          return (rawValue as any).name || zone.content.placeholder || ''
        } else if (zone.content.variable === 'venue.address') {
          const venue = data.venue
          return venue?.address || zone.content.placeholder || ''
        } else if (zone.content.variable === 'price' && typeof rawValue === 'number') {
          return `${rawValue} €`
        } else if (zone.content.variable === 'seating' && typeof rawValue === 'object' && rawValue !== null) {
          const seat = rawValue as any
          return `${seat.section} - ${seat.row} - ${seat.seat}`
        } else if (typeof rawValue === 'string') {
          return rawValue
        } else if (typeof rawValue === 'number') {
          return String(rawValue)
        }
        return zone.content.placeholder || ''
      }
      return zone.content.value || zone.content.placeholder || (zone.type === 'text' ? 'Texte' : '')
    })()

    return (
      <div
        key={zone.id}
        style={baseStyle}
        onMouseDown={(e) => handleZoneMouseDown(e, zone)}
        className={`${previewMode ? '' : 'hover:border-blue-400'} ${isSelected ? 'ring-2 ring-blue-200' : ''}`}
      >
        {zone.type === 'text' && <div style={{ padding: '4px' }}>{content}</div>}
        {zone.type === 'image' && (
          zone.content.imageUrl ? (
            <img src={zone.content.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiImage className="w-8 h-8" />
            </div>
          )
        )}
        {zone.type === 'barcode' && (
          <div className="w-full h-full bg-white rounded flex items-center justify-center">
            <div className="text-xs text-gray-600">{content || '1234567890'}</div>
          </div>
        )}
        {zone.type === 'qrcode' && (
          <div className="w-full h-full bg-white rounded flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-300 rounded"></div>
          </div>
        )}
        {zone.type === 'rectangle' && content}
        {zone.type === 'circle' && (
          <div className="w-full h-full rounded-full" style={{ backgroundColor: zone.style.backgroundColor }}></div>
        )}

        {!previewMode && isSelected && (
          <div className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded">
            {zone.name}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Éditeur de ticket: {template.name}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                previewMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <FiEye className="w-4 h-4" />
              {previewMode ? 'Aperçu' : 'Édition'}
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <FiGrid className="w-4 h-4" />
              Grille
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Zoom:</span>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="px-2 py-1 bg-gray-100 rounded"
            >
              -
            </button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="px-2 py-1 bg-gray-100 rounded"
            >
              +
            </button>
          </div>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <FiSave className="w-4 h-4" />
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Zone d'édition */}
        <div className="flex-1 p-6">
          {/* Barre d'outils */}
          {!previewMode && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => addZone('text')}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded"
              >
                <FiType className="w-4 h-4" />
                Texte
              </button>
              <button
                onClick={() => addZone('image')}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded"
              >
                <FiImage className="w-4 h-4" />
                Image
              </button>
              <button
                onClick={() => addZone('barcode')}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded"
              >
                <FiGrid className="w-4 h-4" />
                Code-barres
              </button>
              <button
                onClick={() => addZone('rectangle')}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded"
              >
                Rectangle
              </button>
            </div>
          )}

          {/* Zone de prévisualisation */}
          <div className="flex justify-center">
            <div
              className="relative bg-gray-100 rounded-lg overflow-hidden"
              style={{
                width: template.width * scale,
                height: template.height * scale,
                backgroundImage: template.background.image
                  ? `url(${template.background.image})`
                  : template.background.gradient
                  ? `linear-gradient(${template.background.gradient.direction === 'diagonal' ? '135deg' : template.background.gradient.direction === 'horizontal' ? '90deg' : '180deg'}, ${template.background.gradient.start}, ${template.background.gradient.end})`
                  : 'none',
                backgroundColor: !template.background.image && !template.background.gradient ? template.background.color : 'transparent',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grille */}
              {showGrid && !previewMode && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: `${20 * scale}px ${20 * scale}px`
                  }}
                />
              )}

              {/* Zones */}
              {template.zones.map(renderZone)}
            </div>
          </div>

          {/* Dimensions */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Dimensions: {template.width} × {template.height} pixels
          </div>
        </div>

        {/* Panneau de propriétés */}
        {selectedZone && !previewMode && (
          <div className="w-80 p-4 border-l border-gray-200 bg-gray-50">
            <h4 className="font-semibold mb-4">Propriétés de la zone</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={selectedZone.name}
                  onChange={(e) => updateZoneProperty('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X</label>
                  <input
                    type="number"
                    value={selectedZone.x}
                    onChange={(e) => updateZoneProperty('x', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y</label>
                  <input
                    type="number"
                    value={selectedZone.y}
                    onChange={(e) => updateZoneProperty('y', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Largeur</label>
                  <input
                    type="number"
                    value={selectedZone.width}
                    onChange={(e) => updateZoneProperty('width', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur</label>
                  <input
                    type="number"
                    value={selectedZone.height}
                    onChange={(e) => updateZoneProperty('height', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {selectedZone.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                    <input
                      type="text"
                      value={selectedZone.content.value || ''}
                      onChange={(e) => updateZoneProperty('content', { ...selectedZone.content, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variable</label>
                    <select
                      value={selectedZone.content.variable || ''}
                      onChange={(e) => updateZoneProperty('content', { ...selectedZone.content, variable: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Aucune</option>
                      <option value="eventName">Nom de l'événement</option>
                      <option value="venue">Nom du lieu</option>
                      <option value="venue.address">Adresse du lieu</option>
                      <option value="price">Prix du billet</option>
                      <option value="fullName">Nom du participant</option>
                      <option value="seating">Infos siège</option>
                      <option value="ticketNumber">Numéro ticket</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taille de police</label>
                <input
                  type="number"
                  value={selectedZone.style.fontSize || 14}
                  onChange={(e) => updateZoneProperty('style', { ...selectedZone.style, fontSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                <input
                  type="color"
                  value={selectedZone.style.color || '#000000'}
                  onChange={(e) => updateZoneProperty('style', { ...selectedZone.style, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
                <input
                  type="color"
                  value={selectedZone.style.backgroundColor || '#ffffff'}
                  onChange={(e) => updateZoneProperty('style', { ...selectedZone.style, backgroundColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Coin arrondi</label>
                <input
                  type="number"
                  value={selectedZone.style.borderRadius || 0}
                  onChange={(e) => updateZoneProperty('style', { ...selectedZone.style, borderRadius: parseInt(e.target.value) })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <button
                onClick={() => deleteZone(selectedZone.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                <FiTrash2 className="w-4 h-4" />
                Supprimer la zone
              </button>
            </div>
          </div>
        )}

        {/* Panneau de données pour l'aperçu */}
        {previewMode && (
          <div className="w-80 p-4 border-l border-gray-200 bg-gray-50">
            <h4 className="font-semibold mb-4">Données du ticket</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement</label>
                <input
                  type="text"
                  value={data.eventName}
                  onChange={(e) => onDataChange({ ...data, eventName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <textarea
                  value={data.venue.name}
                  onChange={(e) => onDataChange({ ...data, venue: {...data.venue, name: e.target.value} })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du participant</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => onDataChange({ ...data, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Infos siège</label>
                <input
                  type="text"
                  value={data.seating.section + ' - ' + data.seating.row + ' - ' + data.seating.seat}
                  onChange={(e) => onDataChange({ ...data, seating: {...data.seating, section: e.target.value} })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro ticket</label>
                <input
                  type="text"
                  value={data.ticketNumber}
                  onChange={(e) => onDataChange({ ...data, ticketNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}