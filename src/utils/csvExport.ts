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

// Function to convert data to CSV format
function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || ''
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// Function to download CSV file
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Main export function for all participants
export function exportParticipantsToCSV(participants: Participant[], filename: string): void {
  if (participants.length === 0) {
    alert('Aucun participant à exporter')
    return
  }

  const headers = [
    'prenom',
    'nom', 
    'email',
    'telephone',
    'profession',
    'entreprise',
    'date_inscription',
    'checked_in',
    'date_checkin',
    'evenement'
  ]

  const csvData = participants.map(participant => ({
    prenom: participant.prenom,
    nom: participant.nom,
    email: participant.email,
    telephone: participant.telephone,
    profession: participant.profession || '',
    entreprise: participant.entreprise || '',
    date_inscription: new Date(participant.created_at).toLocaleDateString('fr-FR'),
    checked_in: participant.checked_in ? 'Oui' : 'Non',
    date_checkin: participant.checked_in_at 
      ? new Date(participant.checked_in_at).toLocaleString('fr-FR')
      : '',
    evenement: participant.evenement?.nom || ''
  }))

  const csvContent = convertToCSV(csvData, headers)
  downloadCSV(csvContent, filename)
}

// Export function for selected participants
export function exportSelectedParticipantsToCSV(
  participants: Participant[], 
  selectedIds: string[], 
  filename: string
): void {
  const selectedParticipants = participants.filter(p => 
    selectedIds.includes(p.id.toString())
  )
  
  exportParticipantsToCSV(selectedParticipants, filename)
}
