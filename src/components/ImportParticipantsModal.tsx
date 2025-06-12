'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'

interface ImportParticipantsModalProps {
  eventId: string
  onClose: () => void
  onImportComplete: (importedCount: number) => void
}

type ParticipantRow = {
  nom: string
  prenom: string
  email: string
  telephone: string
  site_web?: string
}

export default function ImportParticipantsModal({ 
  eventId, 
  onClose,
  onImportComplete
}: ImportParticipantsModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<ParticipantRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<{
    total: number
    imported: number
    errors: number
    inProgress: boolean
  }>({ total: 0, imported: 0, errors: 0, inProgress: false })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return
    
    // Check file type
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase()
    if (fileExt !== 'xlsx' && fileExt !== 'xls' && fileExt !== 'csv') {
      setError('Format de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx, .xls) ou CSV (.csv).')
      return
    }
    
    setFile(selectedFile)
    try {
      // Read file content to preview data
      const data = await readFileData(selectedFile)
      setPreviewData(data.slice(0, 5)) // Preview first 5 rows
    } catch (err: FileReadError | Error) {
      setError(`Erreur lors de la lecture du fichier: ${err.message}`)
      setFile(null)
    }
  }
  
  // Read file data using SheetJS
  const readFileData = (file: File): Promise<ParticipantRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) throw new Error('Failed to read file')
          
          const workbook = XLSX.read(data, { type: 'binary' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json<ParticipantRow>(worksheet, {
            raw: false,
            defval: ''
          })
          
          // Validate required fields
          const validData = jsonData.filter(row => 
            row.nom && row.prenom && row.email && row.telephone
          )
          
          if (validData.length === 0) {
            throw new Error('Aucune donnée valide trouvée dans le fichier')
          }
          
          resolve(validData)
        } catch (err) {
          reject(err)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'))
      }
      
      reader.readAsBinaryString(file)
    })
  }
  
  // Process import
  const handleImport = async () => {
    if (!file) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Read all data from file
      const participantData = await readFileData(file)
      
      // Update status
      setImportStatus({
        total: participantData.length,
        imported: 0,
        errors: 0,
        inProgress: true
      })
      
      // Send data to API for import
      const response = await fetch('/api/participants/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          participants: participantData
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Error importing participants')
      }
      
      // Update status with final results
      setImportStatus({
        total: participantData.length,
        imported: result.imported || 0,
        errors: result.errors || 0,
        inProgress: false
      })
      
      // Notify parent component
      onImportComplete(result.imported || 0)
      
    } catch (err: ImportError | Error) {
      console.error('Error during import:', err)
      setError(err.message || 'Une erreur est survenue lors de l\'importation')
      setImportStatus(prev => ({
        ...prev,
        inProgress: false
      }))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Reset form
  const handleReset = () => {
    setFile(null)
    setPreviewData([])
    setError(null)
    setImportStatus({ total: 0, imported: 0, errors: 0, inProgress: false })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
        <h2 className="text-xl font-bold">Importer des participants</h2>
        <p className="mt-1 text-sm text-blue-100">
          Importez plusieurs participants à partir d&apos;un fichier Excel ou CSV
        </p>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {importStatus.inProgress ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700">Importation en cours...</p>
            <p className="text-sm text-gray-500 mt-2">
              {importStatus.imported} sur {importStatus.total} participants importés
            </p>
          </div>
        ) : importStatus.imported > 0 ? (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h3 className="text-green-800 font-medium">Importation terminée</h3>
            <p className="mt-1 text-green-700">
              {importStatus.imported} participant(s) importé(s) avec succès.
              {importStatus.errors > 0 && ` ${importStatus.errors} erreur(s).`}
            </p>
            <button
              className="mt-3 text-sm text-green-700 underline"
              onClick={handleReset}
            >
              Importer un autre fichier
            </button>
          </div>
        ) : (
          <>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                id="file-upload"
              />
              
              {file ? (
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(file.size / 1024)} KB
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500">
                    Cliquez pour sélectionner un fichier ou glissez-déposez le ici
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Excel (.xlsx, .xls) ou CSV (.csv)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sélectionner un fichier
                  </button>
                </div>
              )}
            </div>
            
            {previewData.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu des données</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.nom}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.prenom}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.email}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.telephone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Affichage des 5 premières entrées. Le fichier contient plus de données.
                </p>
              </div>
            )}
            
            <div className="mt-2 text-sm text-gray-500">
              <p className="font-medium mb-1">Format attendu:</p>
              <ul className="list-disc list-inside">
                <li>Les colonnes nécessaires sont: nom, prenom, email, telephone</li>
                <li>Le site web est optionnel</li>
                <li>Chaque ligne représente un participant</li>
              </ul>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Fermer
        </button>
        
        {file && !importStatus.inProgress && importStatus.imported === 0 && (
          <button
            type="button"
            onClick={handleImport}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Traitement...' : 'Importer'}
          </button>
        )}
      </div>
    </div>
  )
}
