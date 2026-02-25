import React from 'react';
import { FiCheck, FiCalendar, FiMapPin, FiUsers, FiMail, FiClock, FiMic } from 'react-icons/fi';

interface StepFinalizationProps {
  formData: any;
  intervenants: any[];
  sessions: any[];
  participants: any[];
  ticketTypes?: any[];
  wizardType?: string | null;
  invitationEmailTemplate: string;
  registrationFormType: string;
  emailTemplates: any[];
  handleCreateEvent: () => void;
  isCreatingEvent: boolean;
  onBack: () => void;
}

export default function StepFinalization({
  formData,
  intervenants,
  sessions,
  participants,
  ticketTypes = [],
  wizardType,
  invitationEmailTemplate,
  registrationFormType,
  emailTemplates,
  handleCreateEvent,
  isCreatingEvent,
  onBack
}: StepFinalizationProps) {

  const getThemeClass = () => {
    if (wizardType === 'salon-professionnel') {
      return {
        button: "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 shadow-blue-500/30",
        cardGradient: "bg-gradient-to-br from-blue-600 to-cyan-700",
        icon: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        badge: "bg-blue-100 text-blue-700",
        text: "text-blue-700"
      };
    } else if (wizardType === 'concert-payant') {
      return {
        button: "bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 shadow-orange-500/30",
        cardGradient: "bg-gradient-to-br from-orange-600 to-red-600",
        icon: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        badge: "bg-orange-100 text-orange-700",
        text: "text-orange-700"
      };
    }
    // Default / Conference -> Purple
    return {
      button: "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 shadow-purple-500/30",
      cardGradient: "bg-gradient-to-br from-violet-600 to-fuchsia-700",
      icon: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      badge: "bg-purple-100 text-purple-700",
      text: "text-purple-700"
    };
  };

  const theme = getThemeClass();

  return (
    <div className="animate-fadeIn pb-12">
      
      {/* Header Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Récapitulatif final
        </h2>
        <p className="text-gray-500">
          Vérifiez les informations ci-dessous avant de lancer votre événement.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE EVENT CARD (Sticky) - Takes 4/12 columns */}
        <div className="lg:col-span-4">
          <div className={`sticky top-8 rounded-3xl overflow-hidden shadow-2xl ${theme.cardGradient} text-white p-8 relative transition-transform hover:scale-[1.02] duration-300`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full min-h-[400px]">
              <div className="mb-auto">
                <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-6 border border-white/30 uppercase tracking-wider">
                  {wizardType === 'salon-professionnel' ? 'Salon Professionnel' : 
                   wizardType === 'concert-payant' ? 'Concert / Festival' : 
                   'Conférence'}
                </div>
                
                <h1 className="text-3xl font-extrabold leading-tight mb-2 break-words">
                  {formData.nom || 'Nom de l\'événement'}
                </h1>
                <p className="text-white/80 text-sm font-medium line-clamp-2">
                  {formData.description || 'Aucune description fournie.'}
                </p>
              </div>
              
              <div className="mt-8 space-y-6">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
                    <FiCalendar />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Date</div>
                    <div className="font-bold text-lg">
                      {formData.dateDebut ? new Date(formData.dateDebut).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' }) : 'Date à définir'}
                    </div>
                    <div className="text-white/80 text-sm">
                      {formData.dateDebut ? new Date(formData.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'} - {formData.dateFin ? new Date(formData.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
                    <FiMapPin />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Lieu</div>
                    <div className="font-bold text-lg leading-tight">{formData.lieu || 'Lieu à définir'}</div>
                    <div className="text-white/80 text-sm mt-0.5">
                      {formData.typeLocalisation === 'en_ligne' ? 'Événement en ligne' : 'Présentiel'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer of Card */}
              <div className="mt-10 pt-6 border-t border-white/20 flex justify-between items-end">
                <div>
                  <div className="text-4xl font-bold tracking-tighter">{formData.placesDisponibles || '∞'}</div>
                  <div className="text-xs text-white/60 font-bold uppercase">Places dispo.</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/60 font-bold uppercase mb-1">Organisateur</div>
                  <div className="font-bold text-sm truncate max-w-[150px]">{formData.emailContact || 'Vous'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DASHBOARD - Takes 8/12 columns */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all group">
              <div className={`w-12 h-12 rounded-full ${theme.bg} flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform`}>
                👥
              </div>
              <div className="text-3xl font-bold text-gray-900">{participants.length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invités</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all group">
              <div className={`w-12 h-12 rounded-full ${theme.bg} flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform`}>
                🎤
              </div>
              <div className="text-3xl font-bold text-gray-900">{intervenants.length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Speakers</div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FiClock className={theme.icon} /> Programme
              </h3>
              <span className="text-xs font-bold text-gray-400">{sessions.length} sessions</span>
            </div>
            <div className="divide-y divide-gray-100">
              {sessions.length > 0 ? (
                sessions.slice(0, 3).map((session, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${theme.bg} ${theme.text} min-w-[60px] text-center`}>
                      {session.heure_debut || '--:--'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm">{session.titre}</div>
                      <div className="text-xs text-gray-500">{session.description || 'Pas de description'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">Aucune session configurée</div>
              )}
              {sessions.length > 3 && (
                <div className="p-3 text-center text-xs font-bold text-gray-500 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  Voir les {sessions.length - 3} autres sessions...
                </div>
              )}
            </div>
          </div>

          {/* Speakers Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FiMic className={theme.icon} /> Intervenants
              </h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${theme.badge}`}>
                {intervenants.length} speakers
              </span>
            </div>
            
            {intervenants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-bold">Intervenant</th>
                      <th className="px-6 py-3 font-bold">Poste</th>
                      <th className="px-6 py-3 font-bold">Entreprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {intervenants.map((speaker, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center text-xs font-bold ${theme.text}`}>
                              {speaker.prenom?.[0]}{speaker.nom?.[0]}
                            </div>
                            {speaker.prenom} {speaker.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {speaker.poste || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {speaker.entreprise || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">Aucun intervenant</div>
            )}
          </div>

          {/* Participants Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FiUsers className={theme.icon} /> Participants
              </h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${theme.badge}`}>
                {participants.length} invités
              </span>
            </div>
            
            {participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-bold">Nom</th>
                      <th className="px-6 py-3 font-bold">Email</th>
                      <th className="px-6 py-3 font-bold">Société</th>
                      <th className="px-6 py-3 font-bold">Fonction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {participants.slice(0, 5).map((participant, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center text-xs font-bold ${theme.text}`}>
                              {participant.prenom?.[0]}{participant.nom?.[0]}
                            </div>
                            {participant.prenom} {participant.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {participant.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {participant.societe || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {participant.fonction || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {participants.length > 5 && (
                  <div className="p-3 text-center text-xs font-bold text-gray-500 bg-gray-50 border-t border-gray-100">
                    +{participants.length - 5} autres participants
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl grayscale opacity-50">
                  👥
                </div>
                <p className="text-gray-500 font-medium">Aucun participant ajouté</p>
                <p className="text-xs text-gray-400 mt-1">Vous pourrez en ajouter plus tard</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left pl-2">
            <h3 className="font-bold text-gray-900 text-lg">Tout est prêt ?</h3>
            <p className="text-sm text-gray-500 font-medium">Créez votre événement et envoyez les invitations</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={onBack}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Retour
            </button>
            
            <button 
              onClick={handleCreateEvent}
              disabled={isCreatingEvent}
              className={`flex-1 sm:flex-none px-8 py-3.5 ${theme.button} text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none min-w-[200px]`}
            >
              {isCreatingEvent ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  Créer l'événement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
