'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { UploadDropzone } from "@/utils/uploadthing"
import type { ClientUploadedFileData } from "uploadthing/types"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (url: string) => void
  className?: string
}

export default function ImageUpload({ currentImageUrl, onImageUploaded, className = '' }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (res: ClientUploadedFileData<{ uploadedBy: string; url: string }>[]) => {
    if (res && res.length > 0) {
      const fileUrl = res[0].url
      console.log('=== DEBUG IMAGE UPLOAD ===');
      console.log('File URL from UploadThing:', fileUrl);
      
      setPreviewUrl(fileUrl)
      onImageUploaded(fileUrl)
      setError(null)
      
      console.log('onImageUploaded callback called with:', fileUrl);
      console.log("Upload réussi:", fileUrl)
    }
    setIsUploading(false)
  }

  const handleUploadError = (error: Error) => {
    console.error("Erreur d'upload:", error)
    setError(`Erreur lors de l'upload: ${error.message}`)
    setIsUploading(false)
  }

  const handleUploadBegin = () => {
    setIsUploading(true)
    setError(null)
  }

  const removeImage = () => {
    setPreviewUrl('')
    onImageUploaded('')
    setError(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview de l'image actuelle */}
      {previewUrl && (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={previewUrl}
              alt="Logo de l'événement"
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Zone d'upload UploadThing */}
      {!previewUrl && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg">
          <UploadDropzone
            endpoint="eventImageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={handleUploadBegin}
            config={{
              mode: "auto",
            }}
            appearance={{
              container: "w-full h-64 border-none",
              uploadIcon: "text-gray-400 w-10 h-10",
              label: "text-gray-600 text-lg font-medium",
              allowedContent: "text-gray-500 text-sm",
              button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ut-ready:bg-blue-600 ut-uploading:cursor-not-allowed ut-uploading:bg-blue-400",
            }}
            content={{
              label: "Cliquez ou glissez votre logo ici",
              allowedContent: "PNG, JPG, WEBP jusqu'à 4MB",
              button: "Choisir un fichier",
            }}
          />
        </div>
      )}

      {/* Messages d'état */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Upload en cours...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {previewUrl && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-600 text-sm">✓ Logo uploadé avec succès</p>
        </div>
      )}
    </div>
  )
}