import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import {
  CreateBadgeTemplateRequest,
  UpdateBadgeTemplateRequest,
  BadgeTemplateResponse,
  BadgeTemplate,
  BadgeSchema,
  BadgeStyles,
  BadgeSettings
} from '@/types/badge';

// GET - Récupérer tous les templates d'un événement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required'
      }, { status: 400 });
    }

    const supabase = supabaseApi();

    const { data: templates, error } = await supabase
      .from('badge_templates')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching badge templates:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch badge templates'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      templates: templates || []
    });

  } catch (error) {
    console.error('Badge templates GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Créer un nouveau template
export async function POST(request: NextRequest) {
  try {
    const body: CreateBadgeTemplateRequest = await request.json();
    const { eventId, name, type, orientation, preset_id } = body;

    if (!eventId || !name || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: eventId, name, type'
      }, { status: 400 });
    }

    const supabase = supabaseApi();

    // Si un preset est spécifié, récupérer ses données
    let schema: BadgeSchema;
    let styles: BadgeStyles;
    let settings: BadgeSettings;

    if (preset_id) {
      const { data: preset, error: presetError } = await supabase
        .from('badge_template_presets')
        .select('schema, styles, settings')
        .eq('id', preset_id)
        .single();

      if (presetError || !preset) {
        return NextResponse.json({
          success: false,
          error: 'Preset not found'
        }, { status: 404 });
      }

      schema = preset.schema;
      styles = preset.styles;
      settings = preset.settings;
    } else {
      // Template par défaut selon le type
      schema = getDefaultSchema(type);
      styles = getDefaultStyles();
      settings = getDefaultSettings(type);
    }

    // Vérifier si un template par défaut existe déjà
    if (body.is_default) {
      await supabase
        .from('badge_templates')
        .update({ is_default: false })
        .eq('event_id', eventId)
        .eq('is_default', true);
    }

    const { data: template, error } = await supabase
      .from('badge_templates')
      .insert([{
        event_id: eventId,
        name,
        type,
        orientation: orientation || 'portrait',
        schema,
        styles,
        settings,
        is_default: body.is_default || false,
        version: 1
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating badge template:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create badge template'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Badge templates POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour un template
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateBadgeTemplateRequest & { id: string } = await request.json();
    const { id, ...initialUpdateData } = body;
    let updateData = initialUpdateData;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required'
      }, { status: 400 });
    }

    const supabase = supabaseApi();

    // Si on met ce template comme par défaut, déforcer les autres
    if (updateData.is_default) {
      // Récupérer l'event_id du template
      const { data: template } = await supabase
        .from('badge_templates')
        .select('event_id')
        .eq('id', id)
        .single();

      if (template) {
        await supabase
          .from('badge_templates')
          .update({ is_default: false })
          .eq('event_id', template.event_id)
          .eq('is_default', true)
          .neq('id', id);
      }
    }

    // Incrémenter la version si modification du schéma/styles
    if (updateData.schema || updateData.styles) {
      const { data: current } = await supabase
        .from('badge_templates')
        .select('version')
        .eq('id', id)
        .single();

      if (current) {
        updateData = {
          ...updateData,
          version: current.version + 1
        };
      }
    }

    const { data: template, error } = await supabase
      .from('badge_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating badge template:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update badge template'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Badge templates PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Supprimer un template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required'
      }, { status: 400 });
    }

    const supabase = supabaseApi();

    const { error } = await supabase
      .from('badge_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting badge template:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete badge template'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Badge templates DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Fonctions utilitaires pour les valeurs par défaut
function getDefaultSchema(type: string): BadgeSchema {
  switch (type) {
    case 'standard':
      return {
        layout: {
          width: 85,
          height: 55,
          margins: { top: 5, right: 5, bottom: 5, left: 5 }
        },
        zones: [
          {
            id: 'event-logo',
            type: 'image',
            name: 'Logo Événement',
            position: { x: 5, y: 5, width: 20, height: 15 },
            content: { image_url: '{{event_logo}}' },
            style: { object_fit: 'contain' }
          },
          {
            id: 'participant-name',
            type: 'text',
            name: 'Nom Participant',
            position: { x: 30, y: 8, width: 50, height: 10 },
            content: { text: '{{participant_name}}', variable: 'participant_name' },
            style: {
              font_size: 12,
              font_weight: 'bold',
              text_align: 'left',
              color: '#000000'
            }
          },
          {
            id: 'participant-company',
            type: 'text',
            name: 'Entreprise',
            position: { x: 30, y: 20, width: 50, height: 8 },
            content: { text: '{{participant_company}}', variable: 'participant_company' },
            style: {
              font_size: 9,
              text_align: 'left',
              color: '#666666'
            }
          },
          {
            id: 'role-badge',
            type: 'shape',
            name: 'Badge Rôle',
            position: { x: 5, y: 35, width: 75, height: 15 },
            content: { text: '' },
            style: {
              background: '#3B82F6',
              border_radius: 3,
              borderWidth: 0
            }
          },
          {
            id: 'role-text',
            type: 'text',
            name: 'Texte Rôle',
            position: { x: 5, y: 38, width: 75, height: 8 },
            content: { text: '{{participant_role}}', variable: 'participant_role' },
            style: {
              color: '#FFFFFF',
              font_size: 8,
              font_weight: 'bold',
              text_align: 'center'
            }
          },
          {
            id: 'qr-code',
            type: 'qr',
            name: 'QR Code',
            position: { x: 60, y: 25, width: 20, height: 20 },
            content: { variable: 'qr_code' },
            style: {}
          }
        ],
        background: {
          color: '#ffffff'
        }
      };

    case 'vip':
      return {
        layout: {
          width: 90,
          height: 60,
          margins: { top: 5, right: 5, bottom: 5, left: 5 }
        },
        zones: [
          {
            id: 'vip-header',
            type: 'shape',
            name: 'En-tête VIP',
            position: { x: 0, y: 0, width: 90, height: 20 },
            content: { text: '' },
            style: {
              background: 'linear-gradient(135deg, #DC2626, #F59E0B)',
              border_radius: 8,
              borderWidth: 0
            }
          },
          {
            id: 'vip-label',
            type: 'text',
            name: 'Label VIP',
            position: { x: 0, y: 6, width: 90, height: 8 },
            content: { text: '⭐ VIP ACCESS ⭐' },
            style: {
              color: '#FFFFFF',
              font_size: 10,
              font_weight: 'bold',
              text_align: 'center'
            }
          },
          {
            id: 'participant-name',
            type: 'text',
            name: 'Nom Participant',
            position: { x: 5, y: 25, width: 80, height: 12 },
            content: { text: '{{participant_name}}', variable: 'participant_name' },
            style: {
              font_size: 14,
              font_weight: 'bold',
              text_align: 'center',
              color: '#000000'
            }
          },
          {
            id: 'participant-company',
            type: 'text',
            name: 'Entreprise',
            position: { x: 5, y: 38, width: 80, height: 8 },
            content: { text: '{{participant_company}}', variable: 'participant_company' },
            style: {
              font_size: 10,
              text_align: 'center',
              color: '#666666'
            }
          },
          {
            id: 'qr-code',
            type: 'qr',
            name: 'QR Code',
            position: { x: 65, y: 48, width: 20, height: 20 },
            content: { variable: 'qr_code' },
            style: {}
          },
          {
            id: 'badge-number',
            type: 'text',
            name: 'Numéro Badge',
            position: { x: 5, y: 52, width: 50, height: 6 },
            content: { text: '{{badge_number}}', variable: 'badge_number' },
            style: {
              font_size: 8,
              text_align: 'left',
              color: '#999999'
            }
          }
        ],
        background: {
          gradient: {
            start: '#FFF8DC',
            end: '#FFFAF0',
            direction: 'diagonal'
          }
        }
      };

    default:
      return getDefaultSchema('standard');
  }
}

function getDefaultStyles(): BadgeStyles {
  return {
    global: {
      font_family: 'Arial, sans-serif',
      primary_color: '#000000',
      secondary_color: '#666666',
      accent_color: '#3b82f6',
      background_color: '#ffffff',
      text_color: '#000000'
    },
    css: ''
  };
}

function getDefaultSettings(type: string): BadgeSettings {
  const baseSettings: BadgeSettings = {
    print: {
      dpi: 300,
      quality: 'medium',
      duplex: false,
      color: true
    },
    qr: {
      error_correction: 'M',
      size: 150,
      margin: 2,
      foreground: '#000000',
      background: '#ffffff'
    },
    security: {
      watermark: false,
      watermark_opacity: 0.1,
      serialize: true
    },
    badge: {
      material: 'plastic',
      lamination: true,
      holder: 'lanyard'
    }
  };

  if (type === 'vip') {
    baseSettings.print.quality = 'high';
    baseSettings.badge.material = 'plastic';
    baseSettings.badge.lamination = true;
    baseSettings.badge.holder = 'lanyard';
  }

  return baseSettings;
}