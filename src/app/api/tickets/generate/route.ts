import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { toPng } from 'html-to-image';
import puppeteer from 'puppeteer';
import {
  GenerateTicketRequest,
  TicketInstanceResponse,
  TicketInstance,
  TicketPayload,
  PrintJob
} from '@/types/ticket';

// POST - Générer des tickets pour des participants
export async function POST(request: NextRequest) {
  try {
    const body: GenerateTicketRequest = await request.json();
    const { participant_ids, template_id, options } = body;

    if (!participant_ids || participant_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Participant IDs are required'
      }, { status: 400 });
    }

    const supabase = supabaseApi();
    const results: TicketInstance[] = [];

    // Pour chaque participant, générer un ticket
    for (const participantId of participant_ids) {
      try {
        // Récupérer les informations du participant
        const { data: participant, error: participantError } = await supabase
          .from('inscription_participants')
          .select(`
            *,
            inscription_evenements (
              id,
              nom,
              description,
              lieu,
              date_debut,
              date_fin,
              logo_url
            )
          `)
          .eq('id', participantId)
          .single();

        if (participantError || !participant) {
          console.error(`Participant ${participantId} not found:`, participantError);
          continue;
        }

        // Vérifier si un ticket existe déjà (sauf si force_regenerate)
        if (!options?.force_regenerate) {
          const { data: existingTicket } = await supabase
            .from('ticket_instances')
            .select('*')
            .eq('participant_id', participantId)
            .eq('event_id', participant.inscription_evenements.id)
            .single();

          if (existingTicket) {
            results.push(existingTicket);
            continue;
          }
        }

        // Déterminer le template à utiliser
        let selectedTemplateId = template_id;
        if (!selectedTemplateId) {
          // Utiliser le template par défaut de l'événement
          const { data: defaultTemplate } = await supabase
            .from('ticket_templates')
            .select('id')
            .eq('event_id', participant.inscription_evenements.id)
            .eq('is_default', true)
            .eq('is_active', true)
            .single();

          selectedTemplateId = defaultTemplate?.id;
        }

        if (!selectedTemplateId) {
          console.error(`No template found for participant ${participantId}`);
          continue;
        }

        // Récupérer les sessions du participant
        const { data: sessions } = await supabase
          .from('inscription_session_participants')
          .select(`
            inscription_sessions (
              id,
              titre,
              date,
              heure_debut,
              heure_fin
            )
          `)
          .eq('participant_id', participantId);

        // Créer le payload du ticket
        const payload: TicketPayload = {
          participant_name: `${participant.prenom} ${participant.nom}`,
          participant_firstname: participant.prenom,
          participant_lastname: participant.nom,
          participant_email: participant.email,
          participant_phone: participant.telephone || undefined,
          participant_profession: participant.profession || undefined,
          participant_sessions: sessions?.map((s: any) => s.inscription_sessions.titre) || [],
          event_name: participant.inscription_evenements.nom,
          event_date: new Date(participant.inscription_evenements.date_debut).toLocaleDateString('fr-FR'),
          event_location: participant.inscription_evenements.lieu,
          event_description: participant.inscription_evenements.description,
          registration_date: new Date(participant.created_at).toLocaleDateString('fr-FR')
        };

        // Générer les données QR et barcode
        const qrData = `ticket:${participantId}:${participant.inscription_evenements.id}`;
        const barcodeData = `TKT-${Date.now()}-${participantId}`;

        // Générer le QR code en base64
        const qrCodeBase64 = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'M',
          width: 200,
          margin: 2
        });

        // Générer le code-barres en base64
        const barcodeCanvas = document.createElement('canvas');
        JsBarcode(barcodeCanvas, barcodeData, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true
        });
        const barcodeBase64 = barcodeCanvas.toDataURL();

        // Générer le numéro de ticket unique
        const ticketNumber = `TKT-${new Date().getFullYear()}-${String(participantId).padStart(6, '0')}`;

        // Créer l'instance du ticket
        const { data: ticketInstance, error: ticketError } = await supabase
          .from('ticket_instances')
          .insert([{
            event_id: participant.inscription_evenements.id,
            participant_id: participantId,
            template_id: selectedTemplateId,
            payload,
            qr_data: qrData,
            barcode_data: barcodeData,
            ticket_number: ticketNumber,
            status: 'active'
          }])
          .select()
          .single();

        if (ticketError) {
          console.error(`Error creating ticket for participant ${participantId}:`, ticketError);
          continue;
        }

        results.push(ticketInstance!);

      } catch (error) {
        console.error(`Error processing participant ${participantId}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      instances: results,
      message: `Generated ${results.length} tickets`
    });

  } catch (error) {
    console.error('Generate tickets POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}