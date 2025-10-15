import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  template_type: string;
  html_content: string;
  variables: Record<string, string>;
  is_default: boolean;
}

interface EmailTemplateSelectorProps {
  eventId: string;
  eventData: {
    nom: string;
    description: string;
    lieu: string;
    dateDebut: string;
    prix?: number;
    emailContact: string;
    logoUrl?: string;
  };
  couleurHeaderEmail: string;
  objetEmailInscription: string;
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  previewMode?: 'default' | 'large';
}

export default function EmailTemplateSelector({
  eventId,
  eventData,
  couleurHeaderEmail,
  objetEmailInscription,
  selectedTemplateId,
  onTemplateSelect,
  previewMode = 'default'
}: EmailTemplateSelectorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  // Charger les templates disponibles
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();
        
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Table email_templates non disponible, utilisation des templates de fallback:', error);
          // Fallback avec les templates de base qui correspondent exactement à la base de données
          const fallbackTemplates: EmailTemplate[] = [
            {
              id: '1',
              name: 'Template Moderne',
              template_type: 'modern',
              html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation d'inscription</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{header_color}}; color: white; padding: 30px; text-align: center; border-radius: 20px 20px 0 0; }
    .content { padding: 30px; background: white; border-radius: 0 0 20px 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Confirmation d'inscription</h1>
      <p>Merci {{participant_firstname}} {{participant_lastname}} !</p>
    </div>
    <div class="content">
      <p>🎉 <strong>Félicitations !</strong> Votre inscription à {{event_name}} a bien été prise en compte.</p>
      <p><strong>Date:</strong> {{event_date}}</p>
      <p><strong>Lieu:</strong> {{event_location}}</p>
      {{sessions_html}}
    </div>
    <div class="footer">
      <p>Contact: {{contact_email}}</p>
    </div>
  </div>
</body>
</html>`,
              variables: {},
              is_default: true
            },
            {
              id: '2',
              name: 'Template Classique',
              template_type: 'classic',
              html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation d'inscription</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.7; color: #2c3e50; background-color: #ecf0f1; }
    .container { max-width: 600px; margin: 20px auto; background: white; border: 2px solid #34495e; }
    .header { background: {{header_color}}; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: white; }
    .footer { text-align: center; padding: 25px; color: #7f8c8d; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CONFIRMATION D'INSCRIPTION</h1>
      <p>{{participant_firstname}} {{participant_lastname}}</p>
    </div>
    <div class="content">
      <p><em>Nous avons le plaisir de confirmer votre inscription à {{event_name}}.</em></p>
      <p><strong>Date :</strong> {{event_date}}</p>
      <p><strong>Lieu :</strong> {{event_location}}</p>
      {{sessions_html}}
    </div>
    <div class="footer">
      <p>Contact: {{contact_email}}</p>
    </div>
  </div>
</body>
</html>`,
              variables: {},
              is_default: false
            },
            {
              id: '3',
              name: 'Template Minimaliste',
              template_type: 'minimal',
              html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Inscription confirmée</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a202c; }
    .container { max-width: 580px; margin: 40px auto; padding: 0 20px; }
    .header { text-align: center; padding: 40px 0; border-bottom: 1px solid #e2e8f0; }
    .header h1 { color: {{header_color}}; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 0; }
    .footer { text-align: center; padding: 40px 0; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Inscription confirmée</h1>
      <p>{{participant_firstname}} {{participant_lastname}}</p>
    </div>
    <div class="content">
      <p>Votre inscription à {{event_name}} a été enregistrée avec succès.</p>
      <p><strong>Date :</strong> {{event_date}}</p>
      <p><strong>Lieu :</strong> {{event_location}}</p>
      {{sessions_html}}
    </div>
    <div class="footer">
      <p>Questions ? {{contact_email}}</p>
    </div>
  </div>
</body>
</html>`,
              variables: {},
              is_default: false
            },
            {
              id: '4',
              name: 'Template Original',
              template_type: 'original',
              html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation d'inscription</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{header_color}}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f9f9f9; }
    .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirmation d'inscription</h1>
      <p>Merci {{participant_firstname}} {{participant_lastname}} !</p>
    </div>
    <div class="content">
      <p>Votre inscription a bien été prise en compte.</p>
      <div class="event-details">
        <h2>📅 Détails de l'événement</h2>
        <p><strong>Nom:</strong> {{event_name}}</p>
        <p><strong>Date:</strong> {{event_date}}</p>
        <p><strong>Lieu:</strong> {{event_location}}</p>
      </div>
      {{sessions_html}}
    </div>
    <div class="footer">
      <p>Pour toute question, contactez-nous : {{contact_email}}</p>
    </div>
  </div>
</body>
</html>`,
              variables: {},
              is_default: false
            }
          ];
          setTemplates(fallbackTemplates);
          // Sélectionner le premier template (Moderne) par défaut
          setSelectedTemplate(fallbackTemplates[0]);
          return;
        }

        setTemplates(data || []);

        // Sélectionner le template par défaut ou le template sélectionné
        let templateToSelect: EmailTemplate | undefined;
        
        if (selectedTemplateId) {
          templateToSelect = (data as EmailTemplate[])?.find(t => t.id === selectedTemplateId);
        }
        
        if (!templateToSelect) {
          templateToSelect = (data as EmailTemplate[])?.find(t => t.is_default) || (data as EmailTemplate[])?.[0];
        }

        if (templateToSelect) {
          setSelectedTemplate(templateToSelect);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des templates:', error);
        // Fallback complet avec template original
        const fallbackTemplate: EmailTemplate = {
          id: '4',
          name: 'Template Original',
          template_type: 'original',
          html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation d'inscription</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: {{header_color}}; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirmation d'inscription</h1>
      <p>{{participant_firstname}} {{participant_lastname}}</p>
    </div>
    <div class="content">
      <p>Votre inscription à {{event_name}} a bien été prise en compte.</p>
      <p>Date: {{event_date}} - Lieu: {{event_location}}</p>
      {{sessions_html}}
    </div>
    <div class="footer">
      <p>Contact: {{contact_email}}</p>
    </div>
  </div>
</body>
</html>`,
          variables: {},
          is_default: true
        };
        setTemplates([fallbackTemplate]);
        setSelectedTemplate(fallbackTemplate);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedTemplateId]);

  // Mettre à jour le template sélectionné quand selectedTemplateId change
  useEffect(() => {
    if (templates.length > 0 && selectedTemplateId) {
      const templateToSelect = templates.find(t => t.id === selectedTemplateId);
      if (templateToSelect && templateToSelect.id !== selectedTemplate?.id) {
        setSelectedTemplate(templateToSelect);
      }
    }
  }, [selectedTemplateId, templates, selectedTemplate?.id]);

  // Générer l'aperçu du template
  useEffect(() => {
    if (!selectedTemplate) return;

    const generatePreview = () => {
      let html = selectedTemplate.html_content;

      // Formatter la date avec majuscules
      const eventDate = eventData.dateDebut 
        ? new Date(eventData.dateDebut).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }).replace(/^(.)|\s+(.)/g, c => c.toUpperCase())
        : 'Date à définir';

      // Variables de remplacement
      const variables = {
        'header_color': couleurHeaderEmail,
        'subject': objetEmailInscription || `Confirmation d'inscription - ${eventData.nom}`,
        'event_name': eventData.nom || 'Nom de l\'événement',
        'event_date': eventDate,
        'event_location': eventData.lieu || 'Lieu à définir',
        'event_description': eventData.description || '',
        'event_price': eventData.prix?.toString() || '',
        'participant_firstname': 'Jean',
        'participant_lastname': 'Dupont',
        'participant_email': 'jean.dupont@exemple.com',
        'participant_phone': '06 12 34 56 78',
        'participant_profession': 'Développeur',
        'contact_email': eventData.emailContact || 'contact@exemple.com',
        'logo_url': eventData.logoUrl || ''
      };

      // Remplacer les variables simples
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
      });

      // Gérer les conditions Handlebars simples
      html = html.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
        const value = variables[variable as keyof typeof variables];
        return value && value.trim() ? content : '';
      });

      // Gérer les sessions (exemple statique pour la prévisualisation)
      const sessionsHtml = generateSessionsPreview(couleurHeaderEmail);
      html = html.replace(/{{sessions_html}}/g, sessionsHtml);

      // Nettoyer le HTML restant
      html = html.replace(/{{{([^}]+)}}}/g, (match, content) => {
        const variable = content.trim();
        return variables[variable as keyof typeof variables] || '';
      });

      setPreviewHtml(html);
    };

    generatePreview();
  }, [selectedTemplate, eventData, couleurHeaderEmail, objetEmailInscription]);

  const generateSessionsPreview = (headerColor: string) => {
    const sessionStyle = selectedTemplate?.template_type === 'modern' 
      ? `<div style="background: white; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 4px solid ${headerColor};">
           <h2 style="font-size: 20px; font-weight: 600; color: #2d3748; margin: 0 0 15px 0; display: flex; align-items: center;">
             <span style="font-size: 24px; margin-right: 10px;">🎯</span>
             Vos sessions sélectionnées
           </h2>`
      : selectedTemplate?.template_type === 'classic'
      ? `<div style="background: #f8f9fa; padding: 25px; border: 1px solid #dee2e6; margin: 25px 0;">
           <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid ${headerColor}; padding-bottom: 10px;">
             VOS SESSIONS
           </h2>`
      : `<div style="margin: 30px 0;">
           <h2 style="font-size: 18px; font-weight: 600; color: #2d3748; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
             Sessions
           </h2>`;

    const sessionItemStyle = selectedTemplate?.template_type === 'modern'
      ? `background: white; padding: 20px; margin: 15px 0; border-radius: 12px; border-left: 4px solid ${headerColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.05);`
      : selectedTemplate?.template_type === 'classic'
      ? `background: #ffffff; padding: 20px; margin: 15px 0; border: 1px solid #dee2e6; border-left: 4px solid ${headerColor};`
      : `padding: 20px 0; border-bottom: 1px solid #f7fafc;`;

    return `${sessionStyle}
      <div style="${sessionItemStyle}">
        <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px; font-size: 16px;">
          Conférence d'ouverture
        </div>
        <div style="color: #718096; font-size: 14px; margin-bottom: 5px;">
          📅 ${eventData.dateDebut ? new Date(eventData.dateDebut).toLocaleDateString('fr-FR') : 'Date'} - 09h00 à 10h30
        </div>
        <div style="color: #718096; font-size: 14px; margin-bottom: 5px;">
          📍 ${eventData.lieu || 'Salle principale'}
        </div>
        <div style="color: #718096; font-size: 14px;">
          Présentation des enjeux et objectifs de l'événement
        </div>
      </div>
      <div style="${sessionItemStyle}">
        <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px; font-size: 16px;">
          Atelier pratique
        </div>
        <div style="color: #718096; font-size: 14px; margin-bottom: 5px;">
          📅 ${eventData.dateDebut ? new Date(eventData.dateDebut).toLocaleDateString('fr-FR') : 'Date'} - 11h00 à 12h30
        </div>
        <div style="color: #718096; font-size: 14px; margin-bottom: 5px;">
          📍 ${eventData.lieu || 'Salle d\'atelier'}
        </div>
        <div style="color: #718096; font-size: 14px;">
          Session interactive avec mise en pratique
        </div>
      </div>
    </div>`;
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template.id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mode large : affiche seulement l'aperçu en grand
  if (previewMode === 'large') {
    return (
      <div>
        {selectedTemplate && previewHtml && (
          <div className="email-preview-container bg-white rounded-lg overflow-hidden shadow-lg">
            <iframe 
              srcDoc={previewHtml}
              className="w-full border-0"
              sandbox="allow-same-origin"
              style={{
                height: '600px', // Taille fixe plus grande
                transform: 'scale(0.95)',
                transformOrigin: 'top left',
                width: '105.3%', // Compenser la réduction de 5%
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Mode par défaut : affichage complet avec sélecteur
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🎨 Templates d'emails disponibles
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Choisissez un template pour personnaliser l'apparence de vos emails de confirmation d'inscription.
        </p>
      </div>

      {/* Sélecteur de templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              {/* Aperçu miniature du template */}
              <div className={`w-full h-32 rounded-lg mb-3 flex items-center justify-center text-white font-bold ${
                template.template_type === 'modern' 
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                  : template.template_type === 'classic'
                  ? 'bg-gradient-to-br from-gray-600 to-gray-800'
                  : template.template_type === 'minimal'
                  ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                  : template.template_type === 'original'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                  : 'bg-gradient-to-br from-gray-500 to-gray-700'
              }`}>
                {template.template_type === 'modern' && (
                  <div className="text-center">
                    <div className="text-lg">✨</div>
                    <div className="text-xs">Moderne</div>
                  </div>
                )}
                {template.template_type === 'classic' && (
                  <div className="text-center">
                    <div className="text-lg">📜</div>
                    <div className="text-xs">Classique</div>
                  </div>
                )}
                {template.template_type === 'minimal' && (
                  <div className="text-center">
                    <div className="text-lg">▫️</div>
                    <div className="text-xs">Minimal</div>
                  </div>
                )}
                {template.template_type === 'original' && (
                  <div className="text-center">
                    <div className="text-lg">📧</div>
                    <div className="text-xs">Original</div>
                  </div>
                )}
                {!['modern', 'classic', 'minimal', 'original'].includes(template.template_type) && (
                  <div className="text-center">
                    <div className="text-lg">📄</div>
                    <div className="text-xs">Défaut</div>
                  </div>
                )}
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-1">
                {template.name}
              </h4>
              
              {template.is_default && (
                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Par défaut
                </span>
              )}
            </div>

            {selectedTemplate?.id === template.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Aperçu du template sélectionné */}
      {selectedTemplate && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Aperçu du template : {selectedTemplate.name}
          </h4>

          {/* Objet de l'email */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">📧 Objet de l'email :</p>
            <p className="text-base font-semibold text-blue-900">
              {objetEmailInscription || `Confirmation d'inscription - ${eventData.nom}`}
            </p>
          </div>

          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 max-h-96 overflow-y-auto">
            {/* Conteneur isolé pour le preview avec reset des styles */}
            <div className="email-preview-container bg-white rounded-lg overflow-hidden shadow-inner">
              <iframe 
                srcDoc={previewHtml}
                className="w-full h-96 border-0"
                sandbox="allow-same-origin"
                style={{
                  minHeight: '400px',
                  transform: 'scale(0.85)',
                  transformOrigin: 'top left',
                  width: '117.6%', // Compenser la réduction de 15%
                  height: '117.6%'
                }}
              />
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium mb-2">ℹ️ À propos de ce template :</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Les données participant sont simulées (Jean Dupont)</li>
              <li>• La couleur du header et l'objet personnalisé sont appliqués</li>
              <li>• Les sessions affichées sont des exemples</li>
              <li>• Le template s'adapte automatiquement aux informations de votre événement</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}