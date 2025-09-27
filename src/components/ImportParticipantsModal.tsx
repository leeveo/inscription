'use client';

import React, { useState, useRef } from 'react';
import Modal from './Modal';

interface ImportParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  totalProcessed?: number;
  skippedDuplicates?: number;
  validationErrors?: Array<{
    row: number;
    field: string;
    error: string;
  }>;
}

interface CSVParticipant {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  profession?: string;
}

export default function ImportParticipantsModal({ 
  isOpen, 
  onClose, 
  eventId, 
  onSuccess 
}: ImportParticipantsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'result'>('upload');
  const [previewData, setPreviewData] = useState<CSVParticipant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        parseCSVPreview(droppedFile);
      } else {
        alert('Veuillez sélectionner un fichier CSV');
      }
    }
  };

  const parseCSVPreview = async (file: File) => {
    try {
      const content = await file.text();
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const preview: CSVParticipant[] = [];

      for (let i = 1; i < Math.min(6, lines.length); i++) { // Preview first 5 rows
        const rowData = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        const participant: CSVParticipant = {
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          profession: ''
        };

        headers.forEach((header, index) => {
          const value = rowData[index] || '';
          
          if (header.includes('nom') || header.includes('lastname')) {
            participant.nom = value;
          } else if (header.includes('prenom') || header.includes('firstname')) {
            participant.prenom = value;
          } else if (header.includes('email') || header.includes('mail')) {
            participant.email = value;
          } else if (header.includes('telephone') || header.includes('phone')) {
            participant.telephone = value;
          } else if (header.includes('profession') || header.includes('job')) {
            participant.profession = value;
          }
        });

        if (participant.nom && participant.prenom && participant.email) {
          preview.push(participant);
        }
      }

      setPreviewData(preview);
    } catch (error) {
      console.error('Error parsing CSV preview:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        parseCSVPreview(selectedFile);
      } else {
        alert('Veuillez sélectionner un fichier CSV');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    try {
      const response = await fetch('/api/participants/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message,
          importedCount: result.importedCount,
          totalProcessed: result.totalProcessed,
          skippedDuplicates: result.skippedDuplicates
        });
        onSuccess(); // Refresh la liste des participants
      } else {
        setImportResult({
          success: false,
          message: result.error,
          validationErrors: result.validationErrors
        });
      }
      
      setStep('result');
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Erreur lors de l\'import: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
      });
      setStep('result');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setPreviewData([]);
    setStep('upload');
    onClose();
  };

  const downloadExampleCSV = () => {
    const csvContent = 'nom,prenom,email,telephone,profession\nDupont,Jean,jean.dupont@email.com,0123456789,Développeur\nMartin,Marie,marie.martin@email.com,0198765432,Designer\nBernard,Pierre,pierre.bernard@email.com,0165432198,Manager\nDurand,Sophie,sophie.durand@email.com,0187654321,Analyste\nMoreau,Julien,julien.moreau@email.com,0143218765,Consultant';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemple_participants.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import CSV" size="3xl">
      <div className="relative">
        {/* Header avec glassmorphism bleu comme la sidebar */}
        <div className="relative h-32 rounded-t-2xl overflow-hidden">
          {/* Background dégradé Web 3.0 comme sidebar */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          
          {/* Effet de particules/mesh moderne */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-2 left-4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
            <div className="absolute top-6 right-6 w-16 h-16 bg-cyan-300/15 rounded-full blur-lg"></div>
            <div className="absolute -bottom-4 left-8 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between p-6 h-full">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400/30 to-indigo-600/30 
                            backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  Importer des participants
                </h2>
                <p className="text-blue-100/90 text-sm font-medium">
                  Ajoutez plusieurs participants via un fichier CSV
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md 
                       border border-white/10 flex items-center justify-center transition-all duration-200
                       hover:scale-110 shadow-lg"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content avec glassmorphism bleu */}
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 
                       backdrop-blur-md rounded-b-2xl border-x border-b border-blue-200/20">
          {/* Overlay subtil pour l'effet glassmorphism */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-b-2xl"></div>
          
          <div className="relative z-10">
            {step === 'upload' && (
              <div className="p-8 space-y-8">
              {/* Instructions avec design glassmorphism bleu */}
              <div className="relative rounded-2xl p-6 overflow-hidden">
                {/* Background glassmorphism bleu */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-indigo-50/60 to-cyan-50/40"></div>
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl"></div>
                <div className="absolute inset-0 border border-blue-200/30 rounded-2xl"></div>
                
                {/* Particules subtiles */}
                <div className="absolute top-2 right-4 w-16 h-16 bg-blue-300/10 rounded-full blur-lg"></div>
                <div className="absolute bottom-2 left-4 w-20 h-20 bg-indigo-300/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 
                                   flex items-center justify-center mr-3 shadow-md">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Format requis
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700">
                    <div>
                      <p className="font-semibold mb-3 text-slate-800">Colonnes obligatoires :</p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-mono bg-white/70 px-3 py-1 rounded-lg border border-blue-200/50 text-slate-800">nom</span>
                          <span className="ml-2 text-slate-600">(requis)</span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-mono bg-white/70 px-3 py-1 rounded-lg border border-blue-200/50 text-slate-800">prenom</span>
                          <span className="ml-2 text-slate-600">(requis)</span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-mono bg-white/70 px-3 py-1 rounded-lg border border-blue-200/50 text-slate-800">email</span>
                          <span className="ml-2 text-slate-600">(requis)</span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-mono bg-white/70 px-3 py-1 rounded-lg border border-blue-200/50 text-slate-800">telephone</span>
                          <span className="ml-2 text-slate-600">(requis)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-3 text-slate-800">Colonnes optionnelles :</p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                          <span className="font-mono bg-white/70 px-3 py-1 rounded-lg border border-indigo-200/50 text-slate-800">profession</span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                          <span className="font-mono bg-white/70 px-3 py-1 rounded-lg border border-indigo-200/50 text-slate-800">site_web</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton de téléchargement d'exemple avec design glassmorphism */}
              <div className="text-center">
                <button
                  onClick={downloadExampleCSV}
                  className="group relative px-8 py-4 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl
                           transform hover:scale-105 transition-all duration-300 
                           flex items-center space-x-3 mx-auto font-semibold"
                >
                  {/* Background glassmorphism */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 via-transparent to-cyan-400/10"></div>
                  <div className="absolute inset-0 backdrop-blur-sm"></div>
                  
                  {/* Particules sur hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                    <div className="absolute top-1 right-2 w-8 h-8 bg-white/20 rounded-full blur-sm"></div>
                    <div className="absolute bottom-1 left-2 w-6 h-6 bg-emerald-200/30 rounded-full blur-sm"></div>
                  </div>
                  
                  <div className="relative z-10 flex items-center space-x-3 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Télécharger un exemple CSV</span>
                  </div>
                </button>
              </div>

              {/* Zone de drop avec glassmorphism bleu */}
              <div
                className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center 
                           transition-all duration-300 cursor-pointer ${
                  dragActive 
                    ? 'border-blue-400 shadow-xl' 
                    : 'border-blue-300/50 hover:border-blue-400/70'
                } ${file ? 'shadow-xl scale-[1.02]' : 'hover:scale-[1.01]'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Background glassmorphism */}
                <div className={`absolute inset-0 rounded-2xl ${
                  file 
                    ? 'bg-gradient-to-br from-emerald-100/60 via-teal-50/40 to-cyan-50/30' 
                    : dragActive 
                      ? 'bg-gradient-to-br from-blue-100/60 via-indigo-50/40 to-cyan-50/30'
                      : 'bg-gradient-to-br from-slate-100/40 via-blue-50/30 to-indigo-50/20'
                }`}></div>
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl"></div>
                
                {/* Particules animées */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  dragActive || file ? 'opacity-40' : 'opacity-20'
                }`}>
                  <div className="absolute top-6 left-8 w-20 h-20 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute top-12 right-12 w-16 h-16 bg-indigo-300/15 rounded-full blur-lg animate-pulse delay-150"></div>
                  <div className="absolute bottom-8 left-12 w-24 h-24 bg-cyan-300/10 rounded-full blur-2xl animate-pulse delay-300"></div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="relative z-10">
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 
                                     flex items-center justify-center mx-auto shadow-xl animate-bounce">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800 mb-1">{file.name}</p>
                        <p className="text-sm text-slate-600 font-medium">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-cyan-500 
                                     flex items-center justify-center mx-auto shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800 mb-2">
                          Glissez votre fichier CSV ici
                        </p>
                        <p className="text-sm text-slate-600 font-medium">
                          ou cliquez pour sélectionner un fichier
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview data avec glassmorphism bleu */}
              {previewData.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl p-6 border border-blue-200/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-indigo-50/30"></div>
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl"></div>
                  
                  {/* Particules subtiles */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-6 w-16 h-16 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 bg-indigo-300/15 rounded-full blur-lg animate-pulse delay-150"></div>
                    <div className="absolute bottom-6 left-12 w-20 h-20 bg-cyan-300/10 rounded-full blur-2xl animate-pulse delay-300"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/30 to-indigo-600/30 
                                    backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg mr-3">
                        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <span>Aperçu des données (premières lignes)</span>
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-blue-200/30">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/40 backdrop-blur-sm">
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Prénom</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Téléphone</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Profession</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/30 backdrop-blur-sm divide-y divide-blue-200/20">
                          {previewData.map((participant, index) => (
                            <tr key={index} className="hover:bg-blue-50/30 transition-colors duration-200">
                              <td className="px-4 py-3 text-sm font-medium text-slate-800">{participant.nom}</td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-800">{participant.prenom}</td>
                              <td className="px-4 py-3 text-sm text-blue-700 font-medium">{participant.email}</td>
                              <td className="px-4 py-3 text-sm text-slate-700">{participant.telephone || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-700">{participant.profession || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons avec glassmorphism bleu */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-blue-200/30">
                <button
                  onClick={handleClose}
                  className="relative overflow-hidden px-8 py-3 rounded-xl font-semibold
                            text-slate-700 border border-slate-300/50
                            bg-gradient-to-r from-white/80 via-slate-50/60 to-white/80
                            backdrop-blur-sm shadow-lg
                            hover:shadow-xl hover:scale-105 
                            transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100/40 to-white/40 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Annuler</span>
                </button>
                
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="relative overflow-hidden px-8 py-3 rounded-xl font-bold
                            text-white shadow-xl
                            bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-500
                            hover:shadow-2xl hover:scale-105
                            focus:ring-4 focus:ring-blue-300/50
                            transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                            before:absolute before:inset-0 
                            before:bg-gradient-to-r before:from-blue-400 before:via-indigo-500 before:to-cyan-400 
                            before:opacity-0 before:hover:opacity-100 
                            before:transition-opacity before:duration-300"
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    {isUploading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Import en cours...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <span>Importer les participants</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 'result' && importResult && (
            <div className="p-8">
              {/* Import results avec glassmorphism bleu */}
              <div className={`relative overflow-hidden rounded-2xl p-6 mb-6 ${
                importResult.success 
                  ? 'bg-gradient-to-br from-emerald-100/80 via-teal-50/60 to-green-50/40' 
                  : 'bg-gradient-to-br from-red-100/80 via-pink-50/60 to-rose-50/40'
              }`}>
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl"></div>
                
                {/* Particules pour les résultats */}
                <div className={`absolute inset-0 opacity-30 ${
                  importResult.success ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  <div className="absolute top-3 left-6 w-12 h-12 bg-current/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="absolute top-6 right-8 w-8 h-8 bg-current/15 rounded-full blur-md animate-pulse delay-100"></div>
                  <div className="absolute bottom-4 left-8 w-16 h-16 bg-current/10 rounded-full blur-xl animate-pulse delay-200"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    {importResult.success ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-xl mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    <h3 className={`text-xl font-bold ${
                      importResult.success ? 'text-emerald-900' : 'text-red-900'
                    }`}>
                      {importResult.success ? 'Import réussi !' : 'Erreur d\'import'}
                    </h3>
                  </div>
                  
                  <p className={`text-sm font-medium mb-4 ${
                    importResult.success ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {importResult.message}
                  </p>
                  
                  {importResult.success && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-emerald-200/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30"></div>
                        <div className="relative z-10">
                          <p className="text-2xl font-bold text-emerald-600 mb-1">{importResult.importedCount}</p>
                          <p className="text-sm font-semibold text-emerald-700">Importés</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-200/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30"></div>
                        <div className="relative z-10">
                          <p className="text-2xl font-bold text-blue-600 mb-1">{importResult.totalProcessed}</p>
                          <p className="text-sm font-semibold text-blue-700">Traités</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-200/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/30"></div>
                        <div className="relative z-10">
                          <p className="text-2xl font-bold text-orange-600 mb-1">{importResult.skippedDuplicates || 0}</p>
                          <p className="text-sm font-semibold text-orange-700">Doublons</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {importResult.validationErrors && (
                  <div className="mt-4">
                    <p className="font-medium text-red-800 mb-2">Erreurs détectées :</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.validationErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700 bg-white/50 rounded px-3 py-2">
                          Ligne {error.row}, champ "{error.field}": {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setStep('upload');
                    setImportResult(null);
                    setFile(null);
                    setPreviewData([]);
                  }}
                  className="relative overflow-hidden px-8 py-3 rounded-xl font-semibold
                            text-slate-700 border border-slate-300/50
                            bg-gradient-to-r from-white/80 via-slate-50/60 to-white/80
                            backdrop-blur-sm shadow-lg
                            hover:shadow-xl hover:scale-105 
                            transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100/40 to-white/40 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Importer un autre fichier</span>
                </button>
                
                <button
                  onClick={handleClose}
                  className="relative overflow-hidden px-8 py-3 rounded-xl font-bold
                            text-white shadow-xl
                            bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-500
                            hover:shadow-2xl hover:scale-105
                            focus:ring-4 focus:ring-blue-300/50
                            transition-all duration-300
                            before:absolute before:inset-0 
                            before:bg-gradient-to-r before:from-blue-400 before:via-indigo-500 before:to-cyan-400 
                            before:opacity-0 before:hover:opacity-100 
                            before:transition-opacity before:duration-300"
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Fermer</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
