import React, { useState } from 'react';
import { FiArrowRight, FiPlus, FiTrash2, FiDollarSign } from 'react-icons/fi';
import AlertModal from './AlertModal';

interface TicketType {
  id: number;
  nom: string;
  description: string;
  prix: string;
  quantite_totale: string;
  emplacement: string;
}

interface StepTicketingProps {
  ticketTypes: TicketType[];
  setTicketTypes: (types: TicketType[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTicketing({ ticketTypes, setTicketTypes, onNext, onBack }: StepTicketingProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleNext = () => {
    // Validation : au moins un type de billet
    if (ticketTypes.length === 0) {
      setAlertMessage('Veuillez ajouter au moins un type de billet');
      setShowAlert(true);
      return;
    }

    // Validation des champs obligatoires
    const invalidTicket = ticketTypes.find(t => !t.nom || !t.prix);
    if (invalidTicket) {
      setAlertMessage('Tous les billets doivent avoir un nom et un prix');
      setShowAlert(true);
      return;
    }

    onNext();
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: Date.now(),
        nom: '',
        description: '',
        prix: '',
        quantite_totale: '',
        emplacement: ''
      }
    ]);
  };

  const updateTicketType = (id: number, field: keyof TicketType, value: string) => {
    setTicketTypes(ticketTypes.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const removeTicketType = (id: number) => {
    setTicketTypes(ticketTypes.filter(t => t.id !== id));
  };

  return (
    <div>
      <AlertModal 
        isOpen={showAlert} 
        onClose={() => setShowAlert(false)} 
        message={alertMessage}
        type="warning"
      />
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Billetterie et Tarifs
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configurez les différents types de billets disponibles pour votre concert.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {ticketTypes.map((ticket, index) => (
          <div key={ticket.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                  Billet #{index + 1}
                </span>
              </h3>
              <button
                onClick={() => removeTicketType(ticket.id)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer ce billet"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du billet *</label>
                <input
                  type="text"
                  value={ticket.nom}
                  onChange={(e) => updateTicketType(ticket.id, 'nom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Carré Or, Fosse, VIP..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">€</span>
                  </div>
                  <input
                    type="number"
                    value={ticket.prix}
                    onChange={(e) => updateTicketType(ticket.id, 'prix', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité disponible</label>
                <input
                  type="number"
                  value={ticket.quantite_totale}
                  onChange={(e) => updateTicketType(ticket.id, 'quantite_totale', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Laisser vide pour illimité"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement / Zone</label>
                <input
                  type="text"
                  value={ticket.emplacement}
                  onChange={(e) => updateTicketType(ticket.id, 'emplacement', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Zone A, Rang 12, Balcon..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                <textarea
                  value={ticket.description}
                  onChange={(e) => updateTicketType(ticket.id, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Avantages inclus, placement, etc."
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addTicketType}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <FiPlus className="w-5 h-5" />
          Ajouter un type de billet
        </button>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          <button 
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 backdrop-blur-sm"
          >
            Continuer
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
