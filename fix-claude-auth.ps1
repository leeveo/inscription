# Solution complete pour Claude Code + Z.AI
Write-Host "=== CONFIGURATION CLAUDE CODE Z.AI ===" -ForegroundColor Cyan

# 1. Configuration des variables d'environnement
Write-Host "`n1. Configuration des variables..." -ForegroundColor Yellow
$apiKey = "2df10961127b418fbc401144fda43e26.6Tb5OhR439ZFDawk"
$baseUrl = "https://api.z.ai/api/anthropic"

# Variables de session
$env:ANTHROPIC_BASE_URL = $baseUrl
$env:ANTHROPIC_AUTH_TOKEN = $apiKey
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = "glm-4.6"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = "glm-4.6"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = "glm-4.5-air"

# Variables permanentes
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $baseUrl, "User")
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $apiKey, "User")

Write-Host "Variables configurees:" -ForegroundColor Green
Write-Host "  ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"
Write-Host "  ANTHROPIC_AUTH_TOKEN: SET"

# 2. Test rapide de l'API
Write-Host "`n2. Test API..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/models" -Headers $headers -TimeoutSec 5
    Write-Host "API Test: SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "API Test: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Mise a jour du fichier de configuration Claude
Write-Host "`n3. Mise a jour configuration Claude..." -ForegroundColor Yellow
$claudeConfigDir = "$env:USERPROFILE\.claude"
$claudeConfig = "$claudeConfigDir\settings.json"

if (-not (Test-Path $claudeConfigDir)) {
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
}

$config = @{
    env = @{
        ANTHROPIC_BASE_URL = $baseUrl
        ANTHROPIC_AUTH_TOKEN = $apiKey
        ANTHROPIC_DEFAULT_HAIKU_MODEL = "glm-4.5-air"
        ANTHROPIC_DEFAULT_SONNET_MODEL = "glm-4.6"
        ANTHROPIC_DEFAULT_OPUS_MODEL = "glm-4.6"
    }
} | ConvertTo-Json -Depth 3

$config | Out-File -FilePath $claudeConfig -Encoding UTF8 -Force
Write-Host "Configuration Claude mise a jour: $claudeConfig" -ForegroundColor Green

# 4. Nettoyage du cache
Write-Host "`n4. Nettoyage du cache..." -ForegroundColor Yellow
$cacheDir = "$env:USERPROFILE\.claude\cache"
if (Test-Path $cacheDir) {
    Remove-Item -Recurse -Force $cacheDir -ErrorAction SilentlyContinue
    Write-Host "Cache nettoye" -ForegroundColor Green
} else {
    Write-Host "Pas de cache a nettoyer" -ForegroundColor Yellow
}

Write-Host "`n=== PRET! ===" -ForegroundColor Green
Write-Host "Maintenant lancez Claude Code avec les variables configurees:"
Write-Host "  claude" -ForegroundColor Cyan
Write-Host "`nDans Claude, tapez /status pour verifier GLM-4.6"