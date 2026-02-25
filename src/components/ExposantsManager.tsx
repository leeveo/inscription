'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

export type Exposant = {
  id?: number
  evenement_id: string
  nom: string
  adresse?: string
  telephone?: string
  email?: string
  categorie?: string
  activite?: string
  nom_representant?: string
  telephone_representant?: string
  email_representant?: string
  created_at?: string
}

interface ExposantsManagerProps {
  eventId: string
}

export default function ExposantsManager({ eventId }: ExposantsManagerProps) {
  const [exposants, setExposants] = useState<Exposant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExposant, setEditingExposant] = useState<Exposant | null>(null)
  const [formData, setFormData] = useState<Exposant>({
    evenement_id: eventId,
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    categorie: '',
    activite: '',
    nom_representant: '',
    telephone_representant: '',
    email_representant: ''
  })

  useEffect(() => {
    fetchExposants()
  }, [eventId])

  const fetchExposants = async () => {
    try {
      setIsLoading(true)
      const supabase = supabaseBrowser()

      const { data, error } = await supabase
        .from('inscription_exposants')
        .select('*')
        .eq('evenement_id', eventId)
        .order('nom', { ascending: true })

      if (error) throw error

      setExposants(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des exposants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom) {
      alert("Le nom de l'exposant est obligatoire")
      return
    }

    try {
      const supabase = supabaseBrowser()

      if (editingExposant?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('inscription_exposants')
          .update(formData)
          .eq('id', editingExposant.id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('inscription_exposants')
          .insert([{ ...formData, evenement_id: eventId }])

        if (error) throw error
      }

      fetchExposants()
      resetForm()
      setShowAddModal(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de l\'exposant')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet exposant ?')) return

    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase
        .from('inscription_exposants')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchExposants()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEdit = (exposant: Exposant) => {
    setEditingExposant(exposant)
    setFormData(exposant)
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      evenement_id: eventId,
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      categorie: '',
      activite: '',
      nom_representant: '',
      telephone_representant: '',
      email_representant: ''
    })
    setEditingExposant(null)
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement des exposants...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Exposants</h3>
          <p className="text-sm text-gray-600">Gérez les exposants de votre salon</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Ajouter un exposant</span>
        </button>
      </div>

      {/* Liste des exposants */}
      {exposants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-3xl">🏢</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Aucun exposant pour le moment</p>
          <p className="text-xs text-gray-500">Cliquez sur "Ajouter un exposant" pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exposants.map((exposant) => (
            <div key={exposant.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{exposant.nom}</h4>
                    {exposant.categorie && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {exposant.categorie}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-1 text-sm text-gray-600">
                    {exposant.email && <p><span className="font-medium">Email:</span> {exposant.email}</p>}
                    {exposant.telephone && <p><span className="font-medium">Tél:</span> {exposant.telephone}</p>}
                    {exposant.nom_representant && <p><span className="font-medium">Représentant:</span> {exposant.nom_representant}</p>}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(exposant)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => exposant.id && handleDelete(exposant.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
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
                {editingExposant ? 'Modifier l\'exposant' : 'Ajouter un exposant'}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations Générales */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Informations Générales</h5>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'exposant *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <input
                      type="text"
                      value={formData.categorie || ''}
                      onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Technologie"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activité</label>
                    <input
                      type="text"
                      value={formData.activite || ''}
                      onChange={(e) => setFormData({...formData, activite: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description courte"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={formData.adresse || ''}
                    onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone || ''}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+33..."
                    />
                  </div>
                </div>
              </div>

              {/* Informations Représentant */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Représentant</h5>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du représentant</label>
                  <input
                    type="text"
                    value={formData.nom_representant || ''}
                    onChange={(e) => setFormData({...formData, nom_representant: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom complet"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email du représentant</label>
                    <input
                      type="email"
                      value={formData.email_representant || ''}
                      onChange={(e) => setFormData({...formData, email_representant: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@representant.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du représentant</label>
                    <input
                      type="tel"
                      value={formData.telephone_representant || ''}
                      onChange={(e) => setFormData({...formData, telephone_representant: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+33..."
                    />
                  </div>
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
                  {editingExposant ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
