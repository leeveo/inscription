'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewBuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    const createNewForm = async () => {
      if (isCreating) return;
      
      setIsCreating(true);
      try {
        console.log('🔧 Creating new form page for event:', eventId);

        const insertData: any = {
          name: 'Nouveau Formulaire',
          slug: `formulaire-${Date.now()}`,
          tree: {
            rootNodeId: 'root',
            nodes: {
              root: {
                type: { resolvedName: 'Container' },
                isCanvas: true,
                props: { background: '#ffffff', padding: 20, margin: 0 },
                displayName: 'Container',
                custom: {},
                hidden: false,
                nodes: [],
                linkedNodes: {},
              },
            },
          },
          status: 'draft',
          version: 1,
        };

        // Ajouter l'event_id si fourni
        if (eventId) {
          insertData.event_id = eventId;
        }

        const response = await fetch('/api/builder/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(insertData),
        });

        if (!response.ok) {
          throw new Error('Failed to create new page');
        }

        const result = await response.json();
        const pageId = result.page?.id || result.id;

        if (!pageId) {
          throw new Error('No page ID returned');
        }

        console.log('✅ Form created successfully, redirecting to:', pageId);
        
        // Rediriger vers la page d'édition
        router.replace(`/admin/builder/${pageId}`);
      } catch (err) {
        console.error('Error creating new page:', err);
        setError(err instanceof Error ? err.message : 'Failed to create new page');
      }
    };

    createNewForm();
  }, [eventId, router, isCreating]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-800">Création du formulaire...</h1>
        <p className="text-gray-600 mt-2">Veuillez patienter</p>
      </div>
    </div>
  );
}