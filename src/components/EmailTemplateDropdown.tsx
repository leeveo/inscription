import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  template_type: string;
  is_default: boolean;
}

interface EmailTemplateDropdownProps {
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
}

export default function EmailTemplateDropdown({
  selectedTemplateId,
  onTemplateSelect
}: EmailTemplateDropdownProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();
        
        const { data, error } = await supabase
          .from('email_templates')
          .select('id, name, template_type, is_default')
          .order('is_default', { ascending: false })
          .order('name', { ascending: true });

        if (error) {
          console.warn('Table email_templates non disponible:', error);
          // Fallback avec templates de base
          const fallbackTemplates: EmailTemplate[] = [
            { id: 'original-fallback', name: 'Template Original', template_type: 'original', is_default: true },
            { id: 'modern-fallback', name: 'Template Moderne', template_type: 'modern', is_default: false },
            { id: 'classic-fallback', name: 'Template Classique', template_type: 'classic', is_default: false },
            { id: 'minimal-fallback', name: 'Template Minimaliste', template_type: 'minimal', is_default: false }
          ];
          setTemplates(fallbackTemplates);
          return;
        }

        setTemplates(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des templates:', error);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getTemplateIcon = (templateType: string) => {
    switch (templateType) {
      case 'modern': return '✨';
      case 'classic': return '📜';
      case 'minimal': return '▫️';
      case 'original': return '📧';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template d'email
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <span className="text-gray-500">Chargement des templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-700 mb-2">
        Template d'email
      </label>
      <select
        id="templateSelect"
        value={selectedTemplateId || ''}
        onChange={(e) => onTemplateSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Sélectionner un template</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {getTemplateIcon(template.template_type)} {template.name}
            {template.is_default ? ' (Par défaut)' : ''}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Choisissez l'apparence de vos emails de confirmation
      </p>
      {templates.length === 0 && (
        <p className="text-xs text-red-500 mt-1">
          Aucun template disponible. Exécutez la migration cleanup_template_duplicates.sql
        </p>
      )}
    </div>
  );
}