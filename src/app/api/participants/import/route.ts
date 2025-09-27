import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client directly without relying on realtime features
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    fetch: fetch
  }
});

interface CSVParticipant {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  profession?: string;
}

interface ValidationError {
  row: number;
  field: string;
  error: string;
}

// Handle both CSV file upload and JSON data import
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle CSV file upload
    if (contentType.includes('multipart/form-data')) {
      return await handleCSVUpload(req);
    } 
    
    // Handle JSON data (existing functionality)
    if (contentType.includes('application/json')) {
      return await handleJSONImport(req);
    }

    return NextResponse.json(
      { error: 'Content-Type non supporté. Utilisez multipart/form-data pour CSV ou application/json pour données JSON' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Import participants error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur lors de l\'import',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

async function handleCSVUpload(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const eventId = formData.get('eventId') as string;

  // Validation des paramètres
  if (!file) {
    return NextResponse.json(
      { error: 'Aucun fichier fourni' },
      { status: 400 }
    );
  }

  if (!eventId) {
    return NextResponse.json(
      { error: 'ID d\'événement requis' },
      { status: 400 }
    );
  }

  // Vérification du type de fichier
  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    return NextResponse.json(
      { error: 'Le fichier doit être au format CSV' },
      { status: 400 }
    );
  }

  // Lecture du contenu du fichier
  const fileContent = await file.text();

  // Parse CSV with better handling
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return NextResponse.json(
      { error: 'Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données' },
      { status: 400 }
    );
  }

  // Better CSV parsing function
  function parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
  console.log('CSV headers found:', headers);

  // Validation des données
  const validationErrors: ValidationError[] = [];
  const validParticipants: CSVParticipant[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowData = parseCSVLine(lines[i]).map(cell => cell.replace(/"/g, ''));
    const rowNumber = i + 1;

    console.log(`Parsing row ${rowNumber}:`, rowData);

    // Créer un objet participant depuis la ligne CSV
    const participant: CSVParticipant = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      profession: ''
    };

    // Mapping des colonnes - plus précis
    headers.forEach((header, index) => {
      const value = rowData[index] || '';
      
      // Matching exact pour éviter les erreurs
      if (header === 'nom' || header === 'lastname' || header === 'last name' || header === 'surname') {
        participant.nom = value;
      } else if (header === 'prenom' || header === 'firstname' || header === 'first name' || header === 'givenname') {
        participant.prenom = value;
      } else if (header === 'email' || header === 'mail' || header === 'e-mail') {
        participant.email = value;
      } else if (header === 'telephone' || header === 'phone' || header === 'tel') {
        participant.telephone = value;
      } else if (header === 'profession' || header === 'job' || header === 'metier' || header === 'occupation') {
        participant.profession = value;
      }
    });

    console.log(`Participant ${rowNumber}:`, participant);

    // Validation des champs requis
    if (!participant.nom) {
      validationErrors.push({
        row: rowNumber,
        field: 'nom',
        error: 'Le nom est requis'
      });
    }

    if (!participant.prenom) {
      validationErrors.push({
        row: rowNumber,
        field: 'prenom',
        error: 'Le prénom est requis'
      });
    }

    if (!participant.email) {
      validationErrors.push({
        row: rowNumber,
        field: 'email',
        error: 'L\'email est requis'
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(participant.email)) {
        validationErrors.push({
          row: rowNumber,
          field: 'email',
          error: 'Format d\'email invalide'
        });
      }
    }

    // IMPORTANT: telephone est obligatoire dans la base !
    if (!participant.telephone) {
      validationErrors.push({
        row: rowNumber,
        field: 'telephone',
        error: 'Le téléphone est requis'
      });
    }

    // Ajouter le participant aux valides si tous les champs obligatoires sont présents
    if (participant.nom && participant.prenom && participant.email && participant.telephone) {
      validParticipants.push(participant);
    }
  }

  // Vérification des erreurs de validation
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { 
        error: 'Erreurs de validation dans le fichier CSV',
        validationErrors,
        totalRows: lines.length - 1,
        validRows: validParticipants.length
      },
      { status: 400 }
    );
  }

  // Vérification des doublons
  const { data: existingParticipants, error: existingError } = await supabase
    .from('inscription_participants')
    .select('email')
    .eq('evenement_id', eventId);

  if (existingError) {
    console.error('Error fetching existing participants:', existingError);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des participants existants' },
      { status: 500 }
    );
  }

  const existingEmails = new Set(existingParticipants?.map(p => p.email.toLowerCase()) || []);
  const uniqueParticipants = validParticipants.filter(p => 
    !existingEmails.has(p.email.toLowerCase())
  );

  if (uniqueParticipants.length === 0) {
    return NextResponse.json(
      { error: 'Tous les participants sont déjà inscrits à cet événement' },
      { status: 400 }
    );
  }

  // Insertion des participants - Avec la structure exacte de la table
  const participantsToInsert = uniqueParticipants.map(participant => ({
    evenement_id: eventId,
    nom: participant.nom,
    prenom: participant.prenom,
    email: participant.email,
    telephone: participant.telephone, // Obligatoire !
    // Colonnes optionnelles
    ...(participant.profession && { profession: participant.profession })
  }));

  console.log('Attempting to insert participants:', participantsToInsert);

  const { data: insertedParticipants, error: insertError } = await supabase
    .from('inscription_participants')
    .insert(participantsToInsert)
    .select();

  if (insertError) {
    console.error('Error inserting participants:', insertError);
    return NextResponse.json(
      { error: 'Erreur lors de l\'insertion des participants', details: insertError },
      { status: 500 }
    );
  }

  console.log(`Successfully imported ${insertedParticipants?.length} participants`);

  return NextResponse.json({
    success: true,
    message: `${insertedParticipants?.length} participants importés avec succès`,
    importedCount: insertedParticipants?.length,
    totalProcessed: lines.length - 1,
    skippedDuplicates: validParticipants.length - uniqueParticipants.length,
    participants: insertedParticipants
  });
}

async function handleJSONImport(req: NextRequest) {
  const body = await req.json();
  const { eventId, participants } = body;
  
  if (!eventId || !participants || !Array.isArray(participants)) {
    return NextResponse.json(
      { message: 'Missing or invalid required parameters' },
      { status: 400 }
    );
  }
  
  // Validate event exists
  const { data: eventData, error: eventError } = await supabase
    .from('inscription_evenements')
    .select('id')
    .eq('id', eventId)
    .single();
  
  if (eventError || !eventData) {
    return NextResponse.json(
      { message: 'Event not found' },
      { status: 404 }
    );
  }
  
  // Process participants in batches to avoid timeouts
  const batchSize = 50;
  let importedCount = 0;
  let errorCount = 0;
  
  // Process in batches
  for (let i = 0; i < participants.length; i += batchSize) {
    const batch = participants.slice(i, i + batchSize);
    
    // Format participants data
    const formattedParticipants = batch.map(participant => ({
      evenement_id: eventId,
      nom: participant.nom,
      prenom: participant.prenom,
      email: participant.email,
      telephone: participant.telephone,
      site_web: participant.site_web || null,
    }));
    
    // Insert batch
    const { data, error } = await supabase
      .from('inscription_participants')
      .insert(formattedParticipants)
      .select();
    
    if (error) {
      console.error('Error inserting batch:', error);
      errorCount += batch.length;
    } else {
      importedCount += data.length;
    }
  }
  
  return NextResponse.json({
    message: 'Import completed',
    imported: importedCount,
    errors: errorCount,
    total: participants.length
  });
}
