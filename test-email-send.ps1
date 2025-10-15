# Test d'envoi d'email pour marcmenu707@gmail.com
# Événement: fb350c24-7de6-475b-902d-d24ccfb34287

Write-Host "🧪 Test d'envoi d'email de confirmation d'inscription" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$eventId = "fb350c24-7de6-475b-902d-d24ccfb34287"
$participantEmail = "marcmenu707@gmail.com"
$apiUrl = "http://localhost:3000/api/send-inscription-email"

Write-Host "📅 Événement ID: $eventId" -ForegroundColor Green
Write-Host "📧 Participant: $participantEmail" -ForegroundColor Green
Write-Host ""

# Vérifier que le serveur est démarré
try {
    Write-Host "🔍 Vérification que le serveur Next.js est démarré..." -ForegroundColor Yellow
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
    Write-Host "✅ Serveur accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ ERREUR: Le serveur Next.js n'est pas accessible sur localhost:3000" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que le serveur est démarré avec 'npm run dev'" -ForegroundColor Yellow
    exit 1
}

# Données du participant
$participantData = @{
    nom = "Menu"
    prenom = "Marc"
    email = $participantEmail
    telephone = "06 12 34 56 78"
    profession = "Testeur"
}

# Payload pour l'API
$emailPayload = @{
    eventId = $eventId
    participantData = $participantData
} | ConvertTo-Json -Depth 3

Write-Host "📤 Envoi de la requête vers l'API..." -ForegroundColor Yellow
Write-Host "URL: $apiUrl" -ForegroundColor Gray
Write-Host "Payload:" -ForegroundColor Gray
Write-Host $emailPayload -ForegroundColor Gray
Write-Host ""

try {
    # Appel à l'API
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $emailPayload -ContentType "application/json"
    
    Write-Host "📨 Réponse de l'API:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    Write-Host ""

    if ($response.success) {
        Write-Host "✅ EMAIL ENVOYÉ AVEC SUCCÈS !" -ForegroundColor Green
        Write-Host "📧 Message ID: $($response.messageId)" -ForegroundColor Green
        Write-Host "📝 Message: $($response.message)" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🎯 Vérifications à faire :" -ForegroundColor Cyan
        Write-Host "1. 📧 Vérifier la boîte email de $participantEmail" -ForegroundColor White
        Write-Host "2. 🎨 Vérifier que le template sélectionné est appliqué" -ForegroundColor White
        Write-Host "3. 🎨 Vérifier la couleur du header personnalisée" -ForegroundColor White
        Write-Host "4. 📝 Vérifier l'objet personnalisé de l'email" -ForegroundColor White
        Write-Host "5. 📅 Vérifier les informations de l'événement" -ForegroundColor White
        Write-Host "6. 🎯 Vérifier les sessions si présentes" -ForegroundColor White
    } else {
        Write-Host "❌ ÉCHEC DE L'ENVOI D'EMAIL" -ForegroundColor Red
        Write-Host "🚨 Erreur: $($response.error)" -ForegroundColor Red
        
        Write-Host ""
        Write-Host "🔧 Vérifications à faire :" -ForegroundColor Yellow
        Write-Host "1. 📅 L'événement existe-t-il dans la base de données ?" -ForegroundColor White
        Write-Host "2. 📧 La configuration Brevo est-elle correcte ?" -ForegroundColor White
        Write-Host "3. ✅ L'email d'envoi est-il configuré et autorisé ?" -ForegroundColor White
        Write-Host "4. 🎨 Les templates d'email sont-ils disponibles ?" -ForegroundColor White
        Write-Host "5. 🔐 Les variables d'environnement sont-elles définies ?" -ForegroundColor White
    }

} catch {
    Write-Host "💥 ERREUR LORS DU TEST" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "🔧 Vérifications techniques :" -ForegroundColor Yellow
    Write-Host "1. 🚀 Le serveur Next.js est-il démarré sur localhost:3000 ?" -ForegroundColor White
    Write-Host "2. 🛣️ L'API route est-elle accessible ?" -ForegroundColor White
    Write-Host "3. 🌐 La connexion réseau fonctionne-t-elle ?" -ForegroundColor White
    Write-Host "4. 🔥 Y a-t-il des erreurs dans les logs du serveur ?" -ForegroundColor White
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🏁 Fin du test d'envoi d'email" -ForegroundColor Cyan