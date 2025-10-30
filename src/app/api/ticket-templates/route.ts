import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import {
  CreateTicketTemplateRequest,
  UpdateTicketTemplateRequest,
  TicketTemplateResponse,
  TicketTemplate,
  TicketSchema,
  TicketStyles,
  TicketSettings
} from '@/types/ticket';

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
      .from('ticket_templates')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ticket templates:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ticket templates'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      templates: templates || []
    });

  } catch (error) {
    console.error('Ticket templates GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Créer un nouveau template
export async function POST(request: NextRequest) {
  try {
    const body: CreateTicketTemplateRequest = await request.json();
    const { eventId, name, type, orientation, preset_id } = body;

    if (!eventId || !name || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: eventId, name, type'
      }, { status: 400 });
    }

    const supabase = supabaseApi();

    // Si un preset est spécifié, récupérer ses données
    let schema: TicketSchema;
    let styles: TicketStyles;
    let settings: TicketSettings;

    if (preset_id) {
      const { data: preset, error: presetError } = await supabase
        .from('ticket_template_presets')
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
        .from('ticket_templates')
        .update({ is_default: false })
        .eq('event_id', eventId)
        .eq('is_default', true);
    }

    const { data: template, error } = await supabase
      .from('ticket_templates')
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
      console.error('Error creating ticket template:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create ticket template'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Ticket templates POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour un template
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateTicketTemplateRequest & { id: string } = await request.json();
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
        .from('ticket_templates')
        .select('event_id')
        .eq('id', id)
        .single();

      if (template) {
        await supabase
          .from('ticket_templates')
          .update({ is_default: false })
          .eq('event_id', template.event_id)
          .eq('is_default', true)
          .neq('id', id);
      }
    }

    // Incrémenter la version si modification du schéma/styles
    if (updateData.schema || updateData.styles) {
      const { data: current } = await supabase
        .from('ticket_templates')
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
      .from('ticket_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket template:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update ticket template'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Ticket templates PUT error:', error);
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
      .from('ticket_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting ticket template:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete ticket template'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Ticket templates DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Fonctions utilitaires pour les valeurs par défaut
function getDefaultSchema(type: string): TicketSchema {
  switch (type) {
    case 'a4':
      return {
        layout: {
          width: 210,
          height: 297,
          margins: { top: 10, right: 10, bottom: 10, left: 10 }
        },
        zones: [
          {
            id: 'header',
            type: 'image',
            name: 'Logo',
            position: { x: 10, y: 10, width: 60, height: 30 },
            content: { image_url: '{{event_logo}}' },
            style: { object_fit: 'contain' }
          },
          {
            id: 'title',
            type: 'text',
            name: 'Titre',
            position: { x: 80, y: 15, width: 120, height: 20 },
            content: { text: '{{event_name}}', variable: 'event_name' },
            style: {
              font_size: 24,
              font_weight: 'bold',
              text_align: 'center',
              color: '#000000'
            }
          },
          {
            id: 'participant-info',
            type: 'text',
            name: 'Informations participant',
            position: { x: 20, y: 60, width: 170, height: 30 },
            content: {
              text: '{{participant_name}}\n{{participant_email}}\n{{registration_date}}',
              variable: 'participant_name'
            },
            style: {
              font_size: 14,
              line_height: 1.5,
              color: '#333333'
            }
          },
          {
            id: 'qr-code',
            type: 'qr',
            name: 'QR Code',
            position: { x: 150, y: 120, width: 50, height: 50 },
            content: { variable: 'qr_code' },
            style: {}
          }
        ],
        background: {
          color: '#ffffff'
        }
      };

    case 'thermal':
      return {
        layout: {
          width: 80,
          height: 200,
          margins: { top: 5, right: 5, bottom: 5, left: 5 }
        },
        zones: [
          {
            id: 'title',
            type: 'text',
            name: 'Titre',
            position: { x: 0, y: 5, width: 70, height: 15 },
            content: { text: '{{event_name}}', variable: 'event_name' },
            style: {
              font_size: 16,
              font_weight: 'bold',
              text_align: 'center'
            }
          },
          {
            id: 'participant-info',
            type: 'text',
            name: 'Participant',
            position: { x: 0, y: 25, width: 70, height: 20 },
            content: {
              text: '{{participant_name}}',
              variable: 'participant_name'
            },
            style: {
              font_size: 12,
              text_align: 'center'
            }
          },
          {
            id: 'qr-code',
            type: 'qr',
            name: 'QR Code',
            position: { x: 15, y: 50, width: 40, height: 40 },
            content: { variable: 'qr_code' },
            style: {}
          },
          {
            id: 'ticket-number',
            type: 'text',
            name: 'Numéro',
            position: { x: 0, y: 95, width: 70, height: 10 },
            content: {
              text: '{{ticket_number}}',
              variable: 'ticket_number'
            },
            style: {
              font_size: 10,
              text_align: 'center'
            }
          }
        ],
        background: {
          color: '#ffffff'
        }
      };

    default:
      return getDefaultSchema('a4');
  }
}

function getDefaultStyles(): TicketStyles {
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

function getDefaultSettings(type: string): TicketSettings {
  const baseSettings: TicketSettings = {
    print: {
      dpi: 300,
      quality: 'medium',
      duplex: false,
      color: true
    },
    qr: {
      error_correction: 'M',
      size: 200,
      margin: 2,
      foreground: '#000000',
      background: '#ffffff'
    },
    barcode: {
      format: 'CODE128',
      width: 2,
      height: 100,
      show_text: true
    },
    security: {
      watermark: false,
      watermark_opacity: 0.1,
      serialize: true
    }
  };

  if (type === 'thermal') {
    baseSettings.print.dpi = 203;
    baseSettings.print.color = false;
    baseSettings.qr.size = 120;
  }

  return baseSettings;
}