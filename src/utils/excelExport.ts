import * as XLSX from 'xlsx';

type Participant = {
  id: string | number
  nom: string
  prenom: string
  email: string
  telephone: string
  profession?: string
  entreprise?: string
  created_at: string
  checked_in?: boolean
  checked_in_at?: string
  evenement?: {
    nom: string
  }
}

// Fonction principale d'exportation Excel pour tous les participants
export function exportParticipantsToExcel(participants: Participant[], filename: string): void {
  if (participants.length === 0) {
    alert('Aucun participant à exporter');
    return;
  }

  // Préparation des données pour Excel
  const excelData = participants.map(participant => ({
    'Prénom': participant.prenom,
    'Nom': participant.nom,
    'Email': participant.email,
    'Téléphone': participant.telephone,
    'Profession': participant.profession || '',
    'Entreprise': participant.entreprise || '',
    'Date d\'inscription': new Date(participant.created_at).toLocaleDateString('fr-FR'),
    'Check-in effectué': participant.checked_in ? 'Oui' : 'Non',
    'Date de check-in': participant.checked_in_at 
      ? new Date(participant.checked_in_at).toLocaleString('fr-FR')
      : '',
    'Événement': participant.evenement?.nom || ''
  }));

  // Création du workbook et de la worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Configuration du style et de la largeur des colonnes
  const columnWidths = [
    { wch: 15 }, // Prénom
    { wch: 15 }, // Nom
    { wch: 25 }, // Email
    { wch: 15 }, // Téléphone
    { wch: 20 }, // Profession
    { wch: 20 }, // Entreprise
    { wch: 18 }, // Date d'inscription
    { wch: 15 }, // Check-in effectué
    { wch: 20 }, // Date de check-in
    { wch: 25 }  // Événement
  ];
  worksheet['!cols'] = columnWidths;

  // Ajout de la worksheet au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

  // Téléchargement du fichier
  XLSX.writeFile(workbook, filename);
}

// Fonction d'exportation Excel pour les participants sélectionnés
export function exportSelectedParticipantsToExcel(
  participants: Participant[], 
  selectedIds: string[], 
  filename: string
): void {
  const selectedParticipants = participants.filter(p => 
    selectedIds.includes(p.id.toString())
  );
  
  exportParticipantsToExcel(selectedParticipants, filename);
}