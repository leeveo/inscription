import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import {
  PrintTicketRequest,
  PrintJobResponse,
  PrintJob,
  PrintType
} from '@/types/ticket';

// POST - Imprimer un ticket (PDF ou thermique)
export async function POST(request: NextRequest) {
  try {
    const body: PrintTicketRequest = await request.json();
    const { ticket_instance_id, print_type, printer_name, print_options } = body;

    if (!ticket_instance_id || !print_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: ticket_instance_id, print_type'
      }, { status: 400 });
    }

    const supabase = supabaseApi();

    // Récupérer l'instance du ticket avec toutes les données nécessaires
    const { data: ticketInstance, error: ticketError } = await supabase
      .from('ticket_instances')
      .select(`
        *,
        ticket_templates (*),
        inscription_participants (*),
        inscription_evenements (*)
      `)
      .eq('id', ticket_instance_id)
      .single();

    if (ticketError || !ticketInstance) {
      return NextResponse.json({
        success: false,
        error: 'Ticket instance not found'
      }, { status: 404 });
    }

    // Créer le job d'impression
    const { data: printJob, error: jobError } = await supabase
      .from('print_jobs')
      .insert([{
        ticket_instance_id,
        print_type,
        printer_name,
        print_options: print_options || {},
        status: 'pending',
        created_by: 'system' // TODO: Récupérer l'utilisateur authentifié
      }])
      .select()
      .single();

    if (jobError) {
      console.error('Error creating print job:', jobError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create print job'
      }, { status: 500 });
    }

    // Traiter l'impression selon le type
    try {
      let result: any;

      if (print_type === 'pdf') {
        result = await generatePDF(ticketInstance, print_options);
      } else if (print_type === 'thermal') {
        result = await generateThermal(ticketInstance, print_options);
      } else if (print_type === 'local') {
        result = await prepareLocalPrint(ticketInstance, print_options);
      } else {
        throw new Error(`Unsupported print type: ${print_type}`);
      }

      // Mettre à jour le job avec les résultats
      const updateData: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        file_size: result.fileSize,
        print_duration: result.duration
      };

      if (result.downloadUrl) {
        updateData.download_url = result.downloadUrl;
      }

      await supabase
        .from('print_jobs')
        .update(updateData)
        .eq('id', printJob.id);

      // Mettre à jour le compteur d'impression du ticket
      await supabase
        .from('ticket_instances')
        .update({
          print_count: ticketInstance.print_count + 1,
          last_printed_at: new Date().toISOString()
        })
        .eq('id', ticket_instance_id);

      return NextResponse.json({
        success: true,
        data: {
          ...printJob,
          ...updateData
        },
        download_url: result.downloadUrl,
        message: `${print_type.toUpperCase()} generated successfully`
      });

    } catch (printError) {
      console.error('Print processing error:', printError);

      // Mettre à jour le job avec l'erreur
      await supabase
        .from('print_jobs')
        .update({
          status: 'failed',
          error_message: printError instanceof Error ? printError.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', printJob.id);

      return NextResponse.json({
        success: false,
        error: printError instanceof Error ? printError.message : 'Print processing failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Print tickets POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Fonction pour générer un PDF
async function generatePDF(ticketInstance: any, options?: any): Promise<{downloadUrl: string, fileSize: number, duration: number}> {
  const startTime = Date.now();

  // Générer le HTML du ticket
  const ticketHTML = generateTicketHTML(ticketInstance);

  // Utiliser Puppeteer pour générer le PDF
  // Note: Cette implémentation est simplifiée. En production,
  // vous pourriez vouloir utiliser un service dédié ou une configuration plus robuste.

  try {
    // Pour l'instant, simulons la génération PDF
    // En réalité, vous utiliseriez Puppeteer ici

    const pdfBuffer = Buffer.from(ticketHTML); // Simulation
    const fileSize = pdfBuffer.length;
    const duration = Date.now() - startTime;

    // Stocker le PDF (par exemple dans Supabase Storage)
    const filename = `ticket-${ticketInstance.ticket_number}-${Date.now()}.pdf`;

    return {
      downloadUrl: `/api/tickets/download/${filename}`, // URL de téléchargement
      fileSize,
      duration
    };

  } catch (error) {
    throw new Error(`PDF generation failed: ${error}`);
  }
}

// Fonction pour générer des données thermiques (ESC/POS)
async function generateThermal(ticketInstance: any, options?: any): Promise<{data: Uint8Array, fileSize: number, duration: number}> {
  const startTime = Date.now();

  try {
    // Générer les commandes ESC/POS pour l'imprimante thermique
    const escPosData = generateESCPOSData(ticketInstance);
    const fileSize = escPosData.length;
    const duration = Date.now() - startTime;

    return {
      data: escPosData,
      fileSize,
      duration
    };

  } catch (error) {
    throw new Error(`Thermal generation failed: ${error}`);
  }
}

// Fonction pour préparer l'impression locale (QZ Tray)
async function prepareLocalPrint(ticketInstance: any, options?: any): Promise<{data: any, fileSize: number, duration: number}> {
  const startTime = Date.now();

  try {
    // Préparer les données pour QZ Tray
    const printData = {
      type: options?.format === 'thermal' ? 'raw' : 'pixel',
      format: options?.format || 'pdf',
      content: options?.format === 'thermal'
        ? generateESCPOSData(ticketInstance)
        : generateTicketHTML(ticketInstance),
      options: {
        printer: options?.printerName,
        copies: options?.copies || 1,
        color: options?.color !== false,
        duplex: options?.duplex || false
      }
    };

    const fileSize = JSON.stringify(printData).length;
    const duration = Date.now() - startTime;

    return {
      data: printData,
      fileSize,
      duration
    };

  } catch (error) {
    throw new Error(`Local print preparation failed: ${error}`);
  }
}

// Fonction utilitaire pour générer le HTML du ticket
function generateTicketHTML(ticketInstance: any): string {
  const template = ticketInstance.ticket_templates;
  const payload = ticketInstance.payload;
  const schema = template.schema;

  // Générer le CSS inline
  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${template.styles.global?.font_family || 'Arial'}; }
    .ticket-container {
      width: ${schema.layout.width}mm;
      height: ${schema.layout.height}mm;
      background: ${schema.background?.color || '#ffffff'};
      position: relative;
      overflow: hidden;
    }
    .zone {
      position: absolute;
      overflow: hidden;
    }
  `;

  // Générer les zones
  let zonesHTML = '';
  for (const zone of schema.zones) {
    const style = generateZoneStyle(zone);
    const content = generateZoneContent(zone, payload, ticketInstance);

    zonesHTML += `
      <div class="zone" style="${style}">
        ${content}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket - ${ticketInstance.ticket_number}</title>
      <style>${css}</style>
    </head>
    <body>
      <div class="ticket-container">
        ${zonesHTML}
      </div>
    </body>
    </html>
  `;
}

// Générer le style CSS pour une zone
function generateZoneStyle(zone: any): string {
  const styles = [
    `left: ${zone.position.x}mm`,
    `top: ${zone.position.y}mm`,
    `width: ${zone.position.width}mm`,
    `height: ${zone.position.height}mm`
  ];

  const style = zone.style;
  if (style.background) styles.push(`background: ${style.background}`);
  if (style.border) styles.push(`border: ${style.border}`);
  if (style.border_radius) styles.push(`border-radius: ${style.border_radius}px`);
  if (style.padding) styles.push(`padding: ${style.padding}px`);
  if (style.font_family) styles.push(`font-family: ${style.font_family}`);
  if (style.font_size) styles.push(`font-size: ${style.font_size}px`);
  if (style.font_weight) styles.push(`font-weight: ${style.font_weight}`);
  if (style.color) styles.push(`color: ${style.color}`);
  if (style.text_align) styles.push(`text-align: ${style.text_align}`);
  if (style.line_height) styles.push(`line-height: ${style.line_height}`);
  if (style.object_fit) styles.push(`object-fit: ${style.object_fit}`);
  if (style.rotation) styles.push(`transform: rotate(${style.rotation}deg)`);

  return styles.join('; ');
}

// Générer le contenu pour une zone
function generateZoneContent(zone: any, payload: any, ticketInstance: any): string {
  switch (zone.type) {
    case 'text':
      let text = zone.content.text || '';

      // Remplacer les variables
      Object.keys(payload).forEach(key => {
        const placeholder = `{{${key}}}`;
        text = text.replace(new RegExp(placeholder, 'g'), payload[key]);
      });

      // Remplacer les variables spécifiques
      text = text.replace(/{{ticket_number}}/g, ticketInstance.ticket_number);
      text = text.replace(/{{qr_code}}/g, '<!-- QR_CODE_PLACEHOLDER -->');
      text = text.replace(/{{barcode}}/g, '<!-- BARCODE_PLACEHOLDER -->');

      return `<div>${text}</div>`;

    case 'image':
      const imageUrl = zone.content.image_url || '';
      return `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: ${zone.style.object_fit || 'cover'}" />`;

    case 'qr':
      // Pour le QR code, on utilise une image base64 ou un placeholder
      return `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <img src="${ticketInstance.qr_data || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=='}"
             style="width: 80%; height: 80%; object-fit: contain;" />
      </div>`;

    case 'barcode':
      return `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <img src="${ticketInstance.barcode_data || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=='}"
             style="width: 90%; height: 80%; object-fit: contain;" />
      </div>`;

    case 'shape':
      return `<div style="width: 100%; height: 100%; background: ${zone.style.background || '#ccc'}; border-radius: ${zone.style.border_radius || 0}px;"></div>`;

    default:
      return '';
  }
}

// Générer les données ESC/POS pour imprimante thermique
function generateESCPOSData(ticketInstance: any): Uint8Array {
  // Ceci est une implémentation simplifiée
  // En réalité, vous utiliseriez une librairie comme node-escpos ou react-thermal-printer

  const template = ticketInstance.ticket_templates;
  const payload = ticketInstance.payload;

  // Commandes ESC/POS de base
  const commands = [];

  // Initialisation de l'imprimante
  commands.push(0x1B, 0x40); // ESC @ - Initialize printer

  // Centrer le texte
  commands.push(0x1B, 0x61, 0x01); // ESC a 1 - Center align

  // Titre de l'événement
  const title = payload.event_name || '';
  commands.push(...title.split('').map(char => char.charCodeAt(0)));
  commands.push(0x0A); // Line feed

  // Saut de ligne
  commands.push(0x0A);

  // Nom du participant
  commands.push(0x1B, 0x61, 0x00); // ESC a 0 - Left align
  const participantName = payload.participant_name || '';
  commands.push(...participantName.split('').map(char => char.charCodeAt(0)));
  commands.push(0x0A);

  // Email
  if (payload.participant_email) {
    commands.push(...payload.participant_email.split('').map(char => char.charCodeAt(0)));
    commands.push(0x0A);
  }

  // Sauts de ligne
  commands.push(0x0A, 0x0A);

  // Centrer pour le QR code
  commands.push(0x1B, 0x61, 0x01);

  // Simuler un QR code (en réalité, vous utiliseriez une librairie QR)
  commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x45); // QR code header
  commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x32); // QR code size
  commands.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30); // QR code correction

  // Numéro de ticket
  commands.push(0x0A);
  const ticketNumber = ticketInstance.ticket_number || '';
  commands.push(...ticketNumber.split('').map(char => char.charCodeAt(0)));
  commands.push(0x0A);

  // Coupe de papier
  commands.push(0x1D, 0x56, 0x00); // GS V 0 - Paper cut

  return new Uint8Array(commands);
}