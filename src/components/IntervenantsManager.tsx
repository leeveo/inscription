'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import ImageUpload from './ImageUpload'

export type Intervenant = {
  id?: number
  evenement_id: string
  nom: string
  prenom: string
  titre?: string
  biographie?: string
  photo_url?: string
  email?: string
  telephone?: string
  entreprise?: string
  site_web?: string
  url_linkedin?: string
  url_twitter?: string
  url_facebook?: string
  ordre?: number
}

interface IntervenantsManagerProps {
  eventId: string
}

export default function IntervenantsManager({ eventId }: IntervenantsManagerProps) {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingIntervenant, setEditingIntervenant] = useState<Intervenant | null>(null)
  const [formData, setFormData] = useState<Intervenant>({
    evenement_id: eventId,
    nom: '',
    prenom: '',
    titre: '',
    biographie: '',
    photo_url: '',
    email: '',
    telephone: '',
    entreprise: '',
    site_web: '',
    url_linkedin: '',
    url_twitter: '',
    url_facebook: '',
    ordre: 0
  })

  useEffect(() => {
    fetchIntervenants()
  }, [eventId])

  const fetchIntervenants = async () => {
    try {
      setIsLoading(true)
      const supabase = supabaseBrowser()

      const { data, error } = await supabase
        .from('inscription_intervenants')
        .select('*')
        .eq('evenement_id', eventId)
        .order('ordre', { ascending: true })

      if (error) throw error

      setIntervenants(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des intervenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = supabaseBrowser()

      if (editingIntervenant?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('inscription_intervenants')
          .update(formData)
          .eq('id', editingIntervenant.id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('inscription_intervenants')
          .insert([{ ...formData, evenement_id: eventId }])

        if (error) throw error
      }

      fetchIntervenants()
      resetForm()
      setShowAddModal(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de l\'intervenant')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet intervenant ?')) return

    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase
        .from('inscription_intervenants')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchIntervenants()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEdit = (intervenant: Intervenant) => {
    setEditingIntervenant(intervenant)
    setFormData(intervenant)
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      evenement_id: eventId,
      nom: '',
      prenom: '',
      titre: '',
      biographie: '',
      photo_url: '',
      email: '',
      telephone: '',
      entreprise: '',
      site_web: '',
      url_linkedin: '',
      url_twitter: '',
      url_facebook: '',
      ordre: 0
    })
    setEditingIntervenant(null)
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement des intervenants...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Intervenants</h3>
          <p className="text-sm text-gray-600">Gérez les speakers et conférenciers de votre événement</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Ajouter un intervenant</span>
        </button>
      </div>

      {/* Liste des intervenants */}
      {intervenants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Aucun intervenant pour le moment</p>
          <p className="text-xs text-gray-500">Cliquez sur "Ajouter un intervenant" pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intervenants.map((intervenant) => (
            <div key={intervenant.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                {intervenant.photo_url ? (
                  <img
                    src={intervenant.photo_url}
                    alt={`${intervenant.prenom} ${intervenant.nom}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {intervenant.prenom} {intervenant.nom}
                  </h4>
                  {intervenant.titre && (
                    <p className="text-sm text-gray-600 truncate">{intervenant.titre}</p>
                  )}
                  {intervenant.entreprise && (
                    <p className="text-xs text-gray-500 truncate">{intervenant.entreprise}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleEdit(intervenant)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Modifier
                </button>
                <button
                  onClick={() => intervenant.id && handleDelete(intervenant.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingIntervenant ? 'Modifier l\'intervenant' : 'Ajouter un intervenant'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre / Fonction
                </label>
                <input
                  type="text"
                  value={formData.titre || ''}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: CEO, Expert en IA, Conférencier"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>
                <ImageUpload
                  currentImageUrl={formData.photo_url || ''}
                  onImageUploaded={(url) => setFormData({ ...formData, photo_url: url })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biographie
                </label>
                <textarea
                  value={formData.biographie || ''}
                  onChange={(e) => setFormData({ ...formData, biographie: e.target.value })}
                  rows={4}
                  placeholder="Présentation de l'intervenant..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone || ''}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={formData.entreprise || ''}
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  value={formData.site_web || ''}
                  onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.url_linkedin || ''}
                    onChange={(e) => setFormData({ ...formData, url_linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.url_twitter || ''}
                    onChange={(e) => setFormData({ ...formData, url_twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.url_facebook || ''}
                    onChange={(e) => setFormData({ ...formData, url_facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingIntervenant ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
