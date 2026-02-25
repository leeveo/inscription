import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiArrowRight, FiDollarSign } from 'react-icons/fi';
import AlertModal from './AlertModal';

interface TicketType {
  id: number;
  nom: string;
  description: string;
  prix: string;
  quantite_totale: string;
}

interface StepTicketTypesProps {
  ticketTypes: TicketType[];
  setTicketTypes: (types: TicketType[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTicketTypes({ ticketTypes, setTicketTypes, onNext, onBack }: StepTicketTypesProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleAddTicket = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: Date.now(),
        nom: '',
        description: '',
        prix: '',
        quantite_totale: ''
      }
    ]);
  };

  const handleRemoveTicket = (id: number) => {
    setTicketTypes(ticketTypes.filter(t => t.id !== id));
  };

  const handleChange = (id: number, field: keyof TicketType, value: string) => {
    setTicketTypes(ticketTypes.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleNext = () => {
    // Validation : au moins un type de billet valide
    const validTickets = ticketTypes.filter(t => t.nom && t.prix);
    
    if (validTickets.length === 0) {
      setAlertMessage('Veuillez configurer au moins un type de billet avec un nom et un prix.');
      setShowAlert(true);
      return;
    }
    
    onNext();
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
          Billetterie & Tarifs
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configurez les différents types de billets, tarifs et quotas pour votre concert.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {ticketTypes.map((ticket, index) => (
          <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 relative transition-all hover:shadow-lg">
            <div className="absolute top-4 right-4">
              {ticketTypes.length > 1 && (
                <button 
                  onClick={() => handleRemoveTicket(ticket.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Informations principales */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du billet *</label>
                  <input
                    type="text"
                    value={ticket.nom}
                    onChange={(e) => handleChange(ticket.id, 'nom', e.target.value)}
                    placeholder="Ex: Carré Or, Fosse, VIP..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={ticket.description}
                    onChange={(e) => handleChange(ticket.id, 'description', e.target.value)}
                    placeholder="Avantages inclus, placement..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Prix et Quota */}
              <div className="md:col-span-4 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={ticket.prix}
                      onChange={(e) => handleChange(ticket.id, 'prix', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quota (Optionnel)</label>
                  <input
                    type="number"
                    value={ticket.quantite_totale}
                    onChange={(e) => handleChange(ticket.id, 'quantite_totale', e.target.value)}
                    placeholder="Illimité"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Laissez vide pour illimité</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddTicket}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Ajouter un type de billet
        </button>

        {/* Navigation */}
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
