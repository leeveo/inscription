'use client';

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define proper interfaces for our data types
interface Participant {
  id: string;
  evenement_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  site_web?: string;
  profession?: string;
  date_naissance?: string;
  url_linkedin?: string;
  url_facebook?: string;
  url_twitter?: string;
  url_instagram?: string;
  created_at: string;
}

interface Event {
  id: string;
  nom: string;
  description?: string;
  lieu?: string;
  date_debut?: string;
  date_fin?: string;
}

type ParticipantDetailsProps = {
  participantId: string;
};

export default function ParticipantDetailsClient({ participantId }: ParticipantDetailsProps) {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();
        
        // Fetch participant
        const { data, error } = await supabase
          .from('inscription_participants')
          .select('*')
          .eq('id', participantId)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Participant not found');
        
        // Use a two-step type assertion to fix the type error
        setParticipant(data as unknown as Participant);
        
        // Fetch associated event
        if (data.evenement_id) {
          const { data: eventData, error: eventError } = await supabase
            .from('inscription_evenements')
            .select('*')
            .eq('id', data.evenement_id)
            .single();
          
          if (!eventError && eventData) {
            // Use a two-step type assertion to fix the type error
            setEvent(eventData as unknown as Event);
          }
        }
      } catch (err: Error | unknown) {
        console.error('Error fetching participant:', err);
        setError(err instanceof Error ? err.message : 'Failed to load participant data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (participantId) {
      fetchParticipant();
    }
  }, [participantId]);

  // Use React.createElement to avoid JSX parsing issues
  return React.createElement('div', { className: "max-w-3xl mx-auto py-8 px-4" },
    React.createElement('div', { className: "mb-6" },
      React.createElement(Link, {
        href: "/admin/participants",
        className: "text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
      },
      React.createElement('svg', {
        className: "w-4 h-4 mr-1",
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24"
      },
      React.createElement('path', {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M15 19l-7-7 7-7"
      })),
      "Retour à la liste des participants"
      )
    ),
    
    isLoading ? 
      React.createElement('div', { className: "flex justify-center items-center py-12" },
        React.createElement('div', { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" })
      ) : 
      error ? 
        React.createElement('div', { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" },
          React.createElement('p', null, error)
        ) : 
        participant && React.createElement('div', { className: "bg-white shadow-lg rounded-lg overflow-hidden" },
          // Header
          React.createElement('div', { className: "bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white" },
            React.createElement('h1', { className: "text-2xl font-bold" },
              `${participant.prenom} ${participant.nom}`
            ),
            event && React.createElement('p', { className: "mt-1 text-blue-100" },
              `Inscrit à : ${event.nom}`
            )
          ),
          
          // Content
          React.createElement('div', { className: "p-6" },
            // Participant details
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
              // Basic information
              React.createElement('div', null,
                React.createElement('h2', { className: "text-lg font-medium text-gray-900 mb-3" }, "Informations de contact"),
                React.createElement('ul', { className: "space-y-3" },
                  React.createElement('li', { className: "flex items-start" },
                    React.createElement('span', { className: "text-gray-500 font-medium w-24" }, "Email:"),
                    React.createElement('span', { className: "text-gray-900" }, participant.email || "-")
                  ),
                  React.createElement('li', { className: "flex items-start" },
                    React.createElement('span', { className: "text-gray-500 font-medium w-24" }, "Téléphone:"),
                    React.createElement('span', { className: "text-gray-900" }, participant.telephone || "-")
                  ),
                  participant.site_web && React.createElement('li', { className: "flex items-start" },
                    React.createElement('span', { className: "text-gray-500 font-medium w-24" }, "Site web:"),
                    React.createElement('a', { 
                      href: participant.site_web,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "text-blue-600 hover:underline"
                    }, participant.site_web)
                  )
                )
              ),
              
              // Additional information
              React.createElement('div', null,
                React.createElement('h2', { className: "text-lg font-medium text-gray-900 mb-3" }, "Informations additionnelles"),
                React.createElement('ul', { className: "space-y-3" },
                  React.createElement('li', { className: "flex items-start" },
                    React.createElement('span', { className: "text-gray-500 font-medium w-24" }, "Profession:"),
                    React.createElement('span', { className: "text-gray-900" }, participant.profession || "-")
                  ),
                  participant.date_naissance && React.createElement('li', { className: "flex items-start" },
                    React.createElement('span', { className: "text-gray-500 font-medium w-24" }, "Naissance:"),
                    React.createElement('span', { className: "text-gray-900" }, 
                      new Date(participant.date_naissance).toLocaleDateString('fr-FR')
                    )
                  ),
                  React.createElement('li', { className: "flex items-start" },
                    React.createElement('span', { className: "text-gray-500 font-medium w-24" }, "Inscrit le:"),
                    React.createElement('span', { className: "text-gray-900" }, 
                      new Date(participant.created_at).toLocaleDateString('fr-FR')
                    )
                  )
                )
              )
            ),
            
            // Social links if available
            (participant.url_linkedin || participant.url_facebook || participant.url_twitter || participant.url_instagram) && 
              React.createElement('div', { className: "mt-6 pt-6 border-t border-gray-200" },
                React.createElement('h2', { className: "text-lg font-medium text-gray-900 mb-3" }, "Réseaux sociaux"),
                React.createElement('div', { className: "flex space-x-4" },
                  participant.url_linkedin && React.createElement('a', {
                    href: participant.url_linkedin,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-700 hover:text-blue-900"
                  }, "LinkedIn"),
                  participant.url_facebook && React.createElement('a', {
                    href: participant.url_facebook,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-700 hover:text-blue-900"
                  }, "Facebook"),
                  participant.url_twitter && React.createElement('a', {
                    href: participant.url_twitter,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-700 hover:text-blue-900"
                  }, "Twitter"),
                  participant.url_instagram && React.createElement('a', {
                    href: participant.url_instagram,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-700 hover:text-blue-900"
                  }, "Instagram")
                )
              ),
            
            // Actions
            React.createElement('div', { className: "mt-8 flex justify-end space-x-3" },
              React.createElement('button', {
                onClick: () => router.push(`/admin/participants/edit/${participant.id}`),
                className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              }, "Modifier"),
              React.createElement('button', {
                onClick: () => {
                  if (confirm("Êtes-vous sûr de vouloir supprimer ce participant ?")) {
                    // Handle delete functionality
                    console.log("Delete participant:", participant.id);
                  }
                },
                className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              }, "Supprimer")
            )
          )
        )
  );
}
