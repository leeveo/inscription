# Script simple de test API Z.AI
Write-Host "=== TEST API Z.AI ===" -ForegroundColor Cyan

# Configuration de la cle API
$apiKey = "2df10961127b418fbc401144fda43e26.6Tb5OhR439ZFDawk"
$env:ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN = $apiKey

Write-Host "Cle API configuree: $($apiKey.Substring(0,20))..." -ForegroundColor Green
Write-Host "Base URL: $env:ANTHROPIC_BASE_URL" -ForegroundColor Green

# Test de l'API
Write-Host "`nTest de connexion..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://api.z.ai/api/anthropic/v1/models" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "SUCCESS: API accessible" -ForegroundColor Green
    Write-Host "Modeles disponibles:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERREUR API: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -match "401") {
        Write-Host "`nProbleme d'authentification detecte!" -ForegroundColor Yellow
        Write-Host "1. Verifiez votre cle sur https://z.ai/manage-apikey/apikey-list" -ForegroundColor White
        Write-Host "2. Assurez-vous que votre plan Z.AI est actif" -ForegroundColor White
        Write-Host "3. La cle peut etre expiree" -ForegroundColor White
    }
}

Write-Host "`n=== COMMANDES SUIVANTES ===" -ForegroundColor Cyan
Write-Host "Si le test reussit:"
Write-Host "  claude"
Write-Host "`nSi echec:"
Write-Host "  1. Allez sur https://z.ai/manage-apikey/apikey-list"
Write-Host "  2. Regenerez votre cle API"
Write-Host "  3. Modifiez ce script avec la nouvelle cle"