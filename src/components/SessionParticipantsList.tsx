'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

// Define proper interfaces for session and participant data
interface SessionData {
  id: string;
  titre: string;
  date?: string;
  heure_debut?: string;
  heure_fin?: string;
  max_participants?: number;
}

interface ParticipantData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  profession?: string;
  checked_in?: boolean;
  checked_in_at?: string;
  created_at?: string;
}

interface SessionParticipantsListProps {
  sessionId: string;
  onClose: () => void;
}

export default function SessionParticipantsList({ sessionId, onClose }: SessionParticipantsListProps) {
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nom' | 'email' | 'inscription'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch session participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();

        console.log('🔍 [DEBUG] Fetching participants for session:', sessionId);

        // Get session details to display complete info
        const { data: sessionData, error: sessionError } = await supabase
          .from('inscription_sessions')
          .select('id, titre, date, heure_debut, heure_fin, max_participants')
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          console.error('❌ [DEBUG] Session error:', sessionError);
          throw sessionError;
        }
        if (sessionData) {
          console.log('✅ [DEBUG] Session data retrieved:', sessionData);
          setSessionInfo(sessionData as SessionData);
        }

        // Get participants for this session with more complete data
        console.log('🔍 [DEBUG] Fetching participants with query...');
        let participantsData: any[] = [];
        let participantsError: any = null;

        // Essayer d'abord la requête avec relation Supabase
        try {
          const { data, error } = await supabase
            .from('inscription_session_participants')
            .select(`
              participant_id,
              created_at,
              inscription_participants (
                nom, prenom, email, telephone, profession, checked_in, checked_in_at, created_at
              )
            `)
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false });

          if (error) {
            console.warn('⚠️ [DEBUG] Relation query failed, trying alternative approach:', error);
            throw error;
          }

          participantsData = data || [];
          console.log('✅ [DEBUG] Relation query succeeded');
        } catch (relationError) {
          console.log('🔄 [DEBUG] Using alternative separate queries approach...');
          
          // Approche alternative : requêtes séparées
          const { data: sessionParticipants, error: spError } = await supabase
            .from('inscription_session_participants')
            .select('participant_id, created_at')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false });

          if (spError) {
            participantsError = spError;
          } else if (sessionParticipants && sessionParticipants.length > 0) {
            const participantIds = sessionParticipants.map(sp => sp.participant_id);
            
            const { data: participantDetails, error: pdError } = await supabase
              .from('inscription_participants')
              .select('id, nom, prenom, email, telephone, profession, checked_in, checked_in_at, created_at')
              .in('id', participantIds);

            if (pdError) {
              participantsError = pdError;
            } else {
              // Reconstruire le format attendu
              participantsData = sessionParticipants.map(sp => ({
                participant_id: sp.participant_id,
                created_at: sp.created_at,
                inscription_participants: participantDetails?.find(pd => pd.id === sp.participant_id)
              }));
              console.log('✅ [DEBUG] Alternative approach succeeded');
            }
          }
        }

        if (participantsError) throw participantsError;

        console.log('📋 [DEBUG] Raw participants data:', participantsData);
        console.log('📋 [DEBUG] Participants data length:', participantsData?.length || 0);

        // Type the data properly and transform it
        const formattedParticipants: ParticipantData[] = [];
        
        if (Array.isArray(participantsData)) {
          console.log('🔄 [DEBUG] Processing participants data...');
          
          for (const item of participantsData) {
            console.log('🔍 [DEBUG] Processing item:', {
              participant_id: item?.participant_id,
              inscription_participants: item?.inscription_participants,
              created_at: item?.created_at
            });

            // Ensure the item has the expected structure before processing
            if (
              item && 
              (typeof item.participant_id === 'string' || typeof item.participant_id === 'number') && 
              item.inscription_participants && 
              item.inscription_participants !== null &&
              typeof item.inscription_participants === 'object'
            ) {
              const participant = item.inscription_participants as any;
              
              console.log('👤 [DEBUG] Participant object:', participant);
              
              // Verify required fields exist
              if (
                participant &&
                typeof participant.nom === 'string' &&
                typeof participant.prenom === 'string' &&
                typeof participant.email === 'string'
              ) {
                const formattedParticipant = {
                  id: String(item.participant_id), // Convert to string for consistency
                  nom: participant.nom,
                  prenom: participant.prenom,
                  email: participant.email,
                  telephone: participant.telephone,
                  profession: participant.profession,
                  checked_in: participant.checked_in,
                  checked_in_at: participant.checked_in_at,
                  created_at: typeof item.created_at === 'string' ? item.created_at : undefined
                };
                
                console.log('✅ [DEBUG] Adding formatted participant:', formattedParticipant);
                formattedParticipants.push(formattedParticipant);
              } else {
                console.warn('⚠️ [DEBUG] Participant missing required fields:', {
                  hasNom: typeof participant?.nom === 'string',
                  hasPrenom: typeof participant?.prenom === 'string', 
                  hasEmail: typeof participant?.email === 'string',
                  participant: participant
                });
              }
            } else {
              console.warn('⚠️ [DEBUG] Item structure invalid:', {
                hasParticipantId: (typeof item?.participant_id === 'string' || typeof item?.participant_id === 'number'),
                participantIdType: typeof item?.participant_id,
                participantIdValue: item?.participant_id,
                hasInscriptionParticipants: !!item?.inscription_participants,
                item: item
              });
            }
          }
        } else {
          console.warn('⚠️ [DEBUG] participantsData is not an array:', typeof participantsData);
        }

        console.log('📊 [DEBUG] Final formatted participants:', formattedParticipants);
        console.log('📊 [DEBUG] Final participants count:', formattedParticipants.length);

        setParticipants(formattedParticipants);
      } catch (err: unknown) {
        console.error('💥 [DEBUG] Error fetching session participants:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading participants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [sessionId]);

  // Filter and sort participants
  const filteredAndSortedParticipants = participants
    .filter(participant => {
      const searchLower = searchTerm.toLowerCase();
      return (
        participant.nom.toLowerCase().includes(searchLower) ||
        participant.prenom.toLowerCase().includes(searchLower) ||
        participant.email.toLowerCase().includes(searchLower) ||
        (participant.profession && participant.profession.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'nom':
          compareValue = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
          break;
        case 'email':
          compareValue = a.email.localeCompare(b.email);
          break;
        case 'inscription':
          compareValue = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  // Handle sort change
  const handleSort = (field: 'nom' | 'email' | 'inscription') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle sending invitation to participant
  const handleSendInvitation = async (participantId: string) => {
    try {
      const participant = participants.find(p => p.id === participantId);
      if (participant) {
        // Implémentation future pour envoyer une invitation
        alert(`Rappel envoyé à ${participant.prenom} ${participant.nom} (${participant.email})`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Erreur lors de l\'envoi du rappel');
    }
  }

  // Handle removing participant from session
  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const participant = participants.find(p => p.id === participantId);
      if (!participant) return;

      if (confirm(`Êtes-vous sûr de vouloir désinscrire ${participant.prenom} ${participant.nom} de cette session ?`)) {
        const supabase = supabaseBrowser();
        
        const { error } = await supabase
          .from('inscription_session_participants')
          .delete()
          .eq('session_id', sessionId)
          .eq('participant_id', participantId);

        if (error) throw error;

        // Update local state
        setParticipants(participants.filter(p => p.id !== participantId));
        alert('Participant désinscrit avec succès');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Erreur lors de la désinscription');
    }
  };

  // Export participants list
  const handleExportList = () => {
    const csvContent = [
      ['Nom', 'Prénom', 'Email', 'Téléphone', 'Profession', 'Date d\'inscription'].join(','),
      ...filteredAndSortedParticipants.map(p => [
        `"${p.nom}"`,
        `"${p.prenom}"`, 
        `"${p.email}"`,
        `"${p.telephone || ''}"`,
        `"${p.profession || ''}"`,
        `"${p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `participants_${sessionInfo?.titre?.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format session info for display
  const formatSessionTime = () => {
    if (!sessionInfo?.date || !sessionInfo?.heure_debut || !sessionInfo?.heure_fin) return '';
    
    const date = new Date(sessionInfo.date);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formatTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}h${minutes !== '00' ? minutes : ''}`;
    };
    
    return `${formattedDate} • ${formatTime(sessionInfo.heure_debut)} - ${formatTime(sessionInfo.heure_fin)}`;
  };
  
  return (
    <div>
      {/* Header with session info */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          📋 {sessionInfo?.titre || 'Session'}
        </h3>
        {sessionInfo && (
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatSessionTime()}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{participants.length} participants inscrits</span>
              {sessionInfo.max_participants && (
                <span className="ml-2 text-gray-500">
                  / {sessionInfo.max_participants} maximum
                  {participants.length >= sessionInfo.max_participants && (
                    <span className="ml-1 text-red-600 font-medium">• Session complète</span>
                  )}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          ❌ {error}
        </div>
      ) : participants.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center">
          <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium">Aucun participant inscrit</p>
          <p className="text-sm mt-1">Cette session n'a pas encore de participants inscrits.</p>
        </div>
      ) : (
        <div>
          {/* Search and controls bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            {/* Search input */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un participant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Sort selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as ['nom' | 'email' | 'inscription', 'asc' | 'desc'];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nom-asc">Nom (A-Z)</option>
                <option value="nom-desc">Nom (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
                <option value="inscription-desc">Plus récent</option>
                <option value="inscription-asc">Plus ancien</option>
              </select>
            </div>
            
            {/* Export button */}
            <button
              onClick={handleExportList}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter CSV
            </button>
          </div>

          {/* Results info */}
          {searchTerm && (
            <div className="mb-4 text-sm text-gray-600">
              <span className="font-medium">{filteredAndSortedParticipants.length}</span> participant(s) trouvé(s) 
              {filteredAndSortedParticipants.length !== participants.length && (
                <span> sur {participants.length}</span>
              )}
            </div>
          )}

          {/* Participants table */}
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('nom')}
                  >
                    <div className="flex items-center">
                      Participant
                      {sortBy === 'nom' && (
                        <svg className={`w-4 h-4 ml-1 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Contact
                      {sortBy === 'email' && (
                        <svg className={`w-4 h-4 ml-1 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profession
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('inscription')}
                  >
                    <div className="flex items-center">
                      Inscription
                      {sortBy === 'inscription' && (
                        <svg className={`w-4 h-4 ml-1 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedParticipants.map((participant, index) => (
                  <tr key={participant.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-800">
                              {participant.prenom[0]}{participant.nom[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.prenom} {participant.nom}
                          </div>
                          {participant.checked_in && (
                            <div className="text-xs text-green-600 font-medium flex items-center mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Présent
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.email}</div>
                      <div className="text-sm text-gray-500">{participant.telephone || "Non renseigné"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.profession || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {participant.created_at ? new Date(participant.created_at).toLocaleDateString('fr-FR') : '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {participant.created_at ? new Date(participant.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSendInvitation(participant.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                          title="Envoyer un rappel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Désinscrire de la session"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {participants.length > 0 && (
            <>
              {filteredAndSortedParticipants.length} / {participants.length} participants
              {sessionInfo?.max_participants && (
                <span className="ml-2">
                  • Capacité: {participants.length}/{sessionInfo.max_participants}
                </span>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
