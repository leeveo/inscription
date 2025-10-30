# Script de diagnostic et correction Z.AI API
Write-Host "=== DIAGNOSTIC API Z.AI ===" -ForegroundColor Cyan

# Vérification de la clé API actuelle
Write-Host "`n1. Vérification clé API actuelle:" -ForegroundColor Yellow
if ($env:ANTHROPIC_AUTH_TOKEN) {
    Write-Host "Clé actuelle: $($env:ANTHROPIC_AUTH_TOKEN)" -ForegroundColor Green
    Write-Host "Longueur: $($env:ANTHROPIC_AUTH_TOKEN.Length) caractères" -ForegroundColor Yellow
} else {
    Write-Host "Aucune clé API configurée!" -ForegroundColor Red
}

Write-Host "`n2. Configuration avec la nouvelle clé complète:" -ForegroundColor Yellow
# Utilisation de la clé complète corrigée
$newApiKey = "2df10961127b418fbc401144fda43e26.6Tb5OhR439ZFDawkY"
$env:ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN = $newApiKey

# Configuration permanente
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.z.ai/api/anthropic", "User")
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $newApiKey, "User")

Write-Host "✓ Nouvelle clé configurée: $($newApiKey.Substring(0,20))..." -ForegroundColor Green
Write-Host "✓ Longueur: $($newApiKey.Length) caractères" -ForegroundColor Green

Write-Host "`n3. Test de connectivité API:" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $newApiKey"
        "Content-Type" = "application/json"
    }
    
    # Test simple de l'API
    $testResponse = Invoke-WebRequest -Uri "https://api.z.ai/api/anthropic" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✓ Connexion API réussie (Status: $($testResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec connexion API: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -match "401") {
        Write-Host "`nSolutions possibles:" -ForegroundColor Yellow
        Write-Host "1. Vérifiez votre clé API sur https://z.ai/manage-apikey/apikey-list" -ForegroundColor White
        Write-Host "2. Assurez-vous que votre plan Z.AI est actif" -ForegroundColor White
        Write-Host "3. Vérifiez que la clé n'est pas expirée" -ForegroundColor White
        Write-Host "4. Régénérez une nouvelle clé si nécessaire" -ForegroundColor White
    }
}

Write-Host "`n=== PROCHAINES ÉTAPES ===" -ForegroundColor Cyan
Write-Host "1. Si le test API a échoué, allez sur https://z.ai/manage-apikey/apikey-list"
Write-Host "2. Vérifiez/régénérez votre clé API"
Write-Host "3. Modifiez ce script avec la nouvelle clé"
Write-Host "4. Relancez Claude Code avec: claude"