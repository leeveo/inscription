'use client'

import React, { useState, useEffect } from 'react'
import { FiEdit3, FiTrash2, FiSave, FiEye, FiDownload, FiPlus, FiMove, FiType, FiImage, FiGrid } from 'react-icons/fi'
import { BadgeTemplate, BadgeZone, BadgeData, ExtendedBadgeTemplate } from '@/types/badge'

interface BadgeEditorProps {
  template: ExtendedBadgeTemplate
  onTemplateChange: (template: ExtendedBadgeTemplate) => void
  onSave: () => void
  data: BadgeData
  onDataChange: (data: BadgeData) => void
}

export default function BadgeEditor({ template, onTemplateChange, onSave, data, onDataChange }: BadgeEditorProps) {
  const [selectedZone, setSelectedZone] = useState<BadgeZone | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  // Calculer le ratio pour l'aperçu
  const scale = Math.min(500 / template.width, 800 / template.height) * zoom

  const handleZoneMouseDown = (e: React.MouseEvent, zone: BadgeZone) => {
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
      position: {
        ...selectedZone.position,
        x: Math.max(0, Math.min(x, template.width - selectedZone.position.width)),
        y: Math.max(0, Math.min(y, template.height - selectedZone.position.height))
      }
    }

    const updatedTemplate = {
      ...template,
      schema: {
        ...template.schema,
        zones: template.schema.zones.map(z => z.id === selectedZone.id ? updatedZone : z)
      }
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
      schema: {
        ...template.schema,
        zones: template.schema.zones.map(z => z.id === selectedZone.id ? updatedZone : z)
      }
    }

    onTemplateChange(updatedTemplate)
    setSelectedZone(updatedZone)
  }

  const updateZoneStyle = (styleProperty: string, styleValue: any) => {
    if (!selectedZone) return

    const updatedZone = {
      ...selectedZone,
      style: {
        ...selectedZone.style,
        [styleProperty]: styleValue
      }
    }

    const updatedTemplate = {
      ...template,
      schema: {
        ...template.schema,
        zones: template.schema.zones.map(z => z.id === selectedZone.id ? updatedZone : z)
      }
    }

    onTemplateChange(updatedTemplate)
    setSelectedZone(updatedZone)
  }

  const updateZoneContent = (contentProperty: string, contentValue: any) => {
    if (!selectedZone) return

    const updatedZone = {
      ...selectedZone,
      content: {
        ...selectedZone.content,
        [contentProperty]: contentValue
      }
    }

    const updatedTemplate = {
      ...template,
      schema: {
        ...template.schema,
        zones: template.schema.zones.map(z => z.id === selectedZone.id ? updatedZone : z)
      }
    }

    onTemplateChange(updatedTemplate)
    setSelectedZone(updatedZone)
  }

  const addZone = (type: BadgeZone['type']) => {
    const newZone: BadgeZone = {
      id: `zone-${Date.now()}`,
      type,
      name: `Nouveau ${type}`,
      position: { x: 10, y: 10, width: 50, height: 20 },
      content: {
        text: type === 'text' ? 'Texte' : ''
      },
      style: {
        background: type === 'text' ? 'transparent' : '#3B82F6',
        color: '#000000',
        font_size: 12,
        text_align: 'center'
      }
    }

    const updatedTemplate = {
      ...template,
      schema: {
        ...template.schema,
        zones: [...template.schema.zones, newZone]
      }
    }

    onTemplateChange(updatedTemplate)
    setSelectedZone(newZone)
  }

  const deleteZone = (zoneId: string) => {
    const updatedTemplate = {
      ...template,
      schema: {
        ...template.schema,
        zones: template.schema.zones.filter(z => z.id !== zoneId)
      }
    }
    onTemplateChange(updatedTemplate)
    setSelectedZone(null)
  }

  const renderZone = (zone: BadgeZone) => {
    const isSelected = selectedZone?.id === zone.id
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: zone.position.x * scale,
      top: zone.position.y * scale,
      width: zone.position.width * scale,
      height: zone.position.height * scale,
      border: isSelected ? '2px solid #3B82F6' : '1px dashed #D1D5DB',
      backgroundColor: zone.style.background || zone.style.backgroundColor || 'transparent',
      color: zone.style.color || '#000000',
      fontSize: (zone.style.font_size || 12) * scale,
      fontWeight: zone.style.font_weight || 'normal',
      textAlign: zone.style.text_align as any || 'left',
      fontFamily: zone.style.font_family || 'Arial',
      borderRadius: (zone.style.border_radius || 0) * scale,
      padding: (zone.style.padding || 0) * scale,
      cursor: previewMode ? 'default' : 'move',
      opacity: zone.style.opacity || 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: zone.style.text_align === 'center' ? 'center' : 'flex-start',
      overflow: 'hidden'
    }

    const getContent = () => {
      if (previewMode && zone.content.variable) {
        const variablePath = zone.content.variable as keyof BadgeData
        if (typeof data[variablePath] === 'object' && data[variablePath] !== null) {
          // Handle nested objects like venue
          const obj = data[variablePath] as any
          return obj.name || obj.toString() || ''
        }
        return data[variablePath] || zone.content.placeholder || ''
      }
      return zone.content.text || zone.content.placeholder || (zone.type === 'text' ? 'Texte' : '')
    }

    return (
      <div
        key={zone.id}
        style={baseStyle}
        onMouseDown={(e) => handleZoneMouseDown(e, zone)}
        className={`${previewMode ? '' : 'hover:border-blue-400'} ${isSelected ? 'ring-2 ring-blue-200' : ''}`}
      >
        {zone.type === 'text' && <div style={{ padding: '2px' }}>{getContent()}</div>}
        {zone.type === 'image' && (
          zone.content.image_url ? (
            <img src={zone.content.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiImage className="w-4 h-4" />
            </div>
          )
        )}
        {zone.type === 'qr' && (
          <div className="w-full h-full bg-white rounded flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
        )}
        {zone.type === 'shape' && (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: zone.style.background,
              borderRadius: zone.style.border_radius ? `${zone.style.border_radius}px` : '0'
            }}
          ></div>
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
          <h3 className="text-lg font-semibold">Éditeur de badge: {template.name}</h3>
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
                onClick={() => addZone('qr')}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded"
              >
                <FiGrid className="w-4 h-4" />
                QR Code
              </button>
              <button
                onClick={() => addZone('shape')}
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
                backgroundImage: template.background?.image
                  ? `url(${template.background.image})`
                  : template.background?.gradient
                  ? `linear-gradient(${template.background.gradient.direction === 'diagonal' ? '135deg' : template.background.gradient.direction === 'horizontal' ? '90deg' : '180deg'}, ${template.background.gradient.start}, ${template.background.gradient.end})`
                  : 'none',
                backgroundColor: !template.background?.image && !template.background?.gradient ? template.background?.color || '#FFFFFF' : 'transparent',
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
                    backgroundSize: `${10 * scale}px ${10 * scale}px`
                  }}
                />
              )}

              {/* Zones */}
              {template.schema.zones.map(renderZone)}
            </div>
          </div>

          {/* Dimensions */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Dimensions: {template.width} × {template.height}mm
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
                    value={selectedZone.position.x}
                    onChange={(e) => updateZoneProperty('position', { ...selectedZone.position, x: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y</label>
                  <input
                    type="number"
                    value={selectedZone.position.y}
                    onChange={(e) => updateZoneProperty('position', { ...selectedZone.position, y: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Largeur</label>
                  <input
                    type="number"
                    value={selectedZone.position.width}
                    onChange={(e) => updateZoneProperty('position', { ...selectedZone.position, width: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur</label>
                  <input
                    type="number"
                    value={selectedZone.position.height}
                    onChange={(e) => updateZoneProperty('position', { ...selectedZone.position, height: parseInt(e.target.value) })}
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
                      value={selectedZone.content.text || ''}
                      onChange={(e) => updateZoneContent('text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variable</label>
                    <select
                      value={selectedZone.content.variable || ''}
                      onChange={(e) => updateZoneContent('variable', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Aucune</option>
                      <option value="eventName">Nom de l'événement</option>
                      <option value="fullName">Nom du participant</option>
                      <option value="company">Entreprise</option>
                      <option value="profession">Profession</option>
                      <option value="role">Rôle</option>
                      <option value="badgeNumber">Numéro de badge</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taille de police</label>
                <input
                  type="number"
                  value={selectedZone.style.font_size || 12}
                  onChange={(e) => updateZoneStyle('font_size', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                <input
                  type="color"
                  value={selectedZone.style.color || '#000000'}
                  onChange={(e) => updateZoneStyle('color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
                <input
                  type="color"
                  value={selectedZone.style.background || '#ffffff'}
                  onChange={(e) => updateZoneStyle('background', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Coin arrondi</label>
                <input
                  type="number"
                  value={selectedZone.style.border_radius || 0}
                  onChange={(e) => updateZoneStyle('border_radius', parseInt(e.target.value))}
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
            <h4 className="font-semibold mb-4">Données du badge</h4>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisateur</label>
                <input
                  type="text"
                  value={data.organizerName}
                  onChange={(e) => onDataChange({ ...data, organizerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                <input
                  type="text"
                  value={data.company || ''}
                  onChange={(e) => onDataChange({ ...data, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <input
                  type="text"
                  value={data.profession || ''}
                  onChange={(e) => onDataChange({ ...data, profession: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <input
                  type="text"
                  value={data.role || ''}
                  onChange={(e) => onDataChange({ ...data, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de badge</label>
                <input
                  type="text"
                  value={data.badgeNumber}
                  onChange={(e) => onDataChange({ ...data, badgeNumber: e.target.value })}
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