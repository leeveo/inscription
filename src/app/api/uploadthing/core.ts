import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Configurateur pour les images d'événements
  eventImageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Optionnel: Ajouter une vérification d'authentification ici
      // Par exemple, vérifier si l'utilisateur est connecté
      
      // Pour l'instant, on autorise tout le monde
      return { uploadedBy: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Ce code s'exécute sur le serveur après l'upload réussi
      console.log("Upload complet pour utilisateur:", metadata.uploadedBy);
      console.log("URL du fichier:", file.url);
      
      // Optionnel: Sauvegarder les infos du fichier en base de données
      
      // Retourner les données qui seront envoyées au client
      return { uploadedBy: metadata.uploadedBy, url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;