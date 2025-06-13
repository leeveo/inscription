export interface Participant {
  id?: string;
  nom: string;  // Nous choisissons de rendre nom obligatoire
  prenom: string;
  email: string;
  telephone?: string;
  statut?: string;
  evenement_id?: string;
  // Ajoutez d'autres champs selon vos besoins
}
