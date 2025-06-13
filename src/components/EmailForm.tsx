'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SimpleRichTextEditor from './SimpleRichTextEditor'
import { supabaseBrowser } from '@/lib/supabase/client'
import MailerSendTemplateSelector from './MailerSendTemplateSelector'

// Schema validation
const emailSchema = z.object({
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  copyToSender: z.boolean().optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailFormProps {
  eventId: string;
  recipientIds: string[];
  singleRecipient: string | null;
  onSent: () => void;
  onCancel: () => void;
}

export default function EmailForm({
  eventId,
  recipientIds,
  singleRecipient,
  onSent,
  onCancel,
}: EmailFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: '',
      content: '',
      copyToSender: false,
    },
  });

  // Get content value for preview
  const content = watch('content');
  const subject = watch('subject');

  // Handle template selection
  const handleTemplateSelect = (htmlContent: string) => {
    setValue('content', htmlContent);
    setShowTemplateSelector(false);
  };

  // Process variables in content
  const processContentWithVariables = (content: string) => {
    // Replace with actual variables if needed
    return content
      .replace(/{{event_name}}/g, 'Nom de l\'événement')
      .replace(/{{participant_firstname}}/g, 'Prénom')
      .replace(/{{participant_lastname}}/g, 'Nom')
      .replace(/{{event_date}}/g, 'Date de l\'événement')
      .replace(/{{event_location}}/g, 'Lieu de l\'événement')
      .replace(/{{ticket_url}}/g, 'https://example.com/ticket');
  };

  const onSubmit = async (data: EmailFormData) => {
    if (recipientIds.length === 0 && !singleRecipient) {
      setError('Aucun destinataire sélectionné');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          subject: data.subject,
          content: data.content,
          recipientIds: singleRecipient ? [] : recipientIds,
          singleRecipient,
          copyToSender: data.copyToSender,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      setSuccess('Email envoyé avec succès!');
      
      // Notify parent after a short delay
      setTimeout(() => {
        onSent();
      }, 2000);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'envoi';
      console.error('Error sending email:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show template selector if requested
  if (showTemplateSelector) {
    return (
      <MailerSendTemplateSelector
        onSelectTemplate={handleTemplateSelect}
        onClose={() => setShowTemplateSelector(false)}
      />
    );
  }

  // Show preview mode if active
  if (isPreviewMode) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 border rounded-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{subject || 'Aucun sujet'}</h3>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: processContentWithVariables(content) }}
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Retour à l'édition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Sujet <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Utiliser un modèle
            </button>
          </div>
          <input
            id="subject"
            type="text"
            {...register('subject')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Sujet de l'email"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Contenu <span className="text-red-500">*</span>
          </label>
          <SimpleRichTextEditor
            value={content}
            onChange={(value) => setValue('content', value, { shouldValidate: true })}
            height="300px"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="copyToSender"
            type="checkbox"
            {...register('copyToSender')}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="copyToSender" className="ml-2 block text-sm text-gray-700">
            M'envoyer une copie de cet email
          </label>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          <p>Variables disponibles: </p>
          <ul className="list-disc list-inside mt-1">
            <li>{'{{event_name}}'} - Nom de l'événement</li>
            <li>{'{{participant_firstname}}'} - Prénom du participant</li>
            <li>{'{{participant_lastname}}'} - Nom du participant</li>
            <li>{'{{event_date}}'} - Date de l'événement</li>
            <li>{'{{event_location}}'} - Lieu de l'événement</li>
            <li>{'{{ticket_url}}'} - Lien vers le billet</li>
          </ul>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMode(true)}
            className="px-4 py-2 border border-blue-300 bg-blue-50 rounded-md text-blue-700 hover:bg-blue-100"
          >
            Prévisualiser
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </>
            ) : (
              `Envoyer ${singleRecipient ? "" : `(${recipientIds.length} destinataires)`}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
