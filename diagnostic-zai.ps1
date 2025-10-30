# Script de diagnostic pour Z.AI + Claude Code
Write-Host "=== DIAGNOSTIC Z.AI + CLAUDE CODE ===" -ForegroundColor Cyan

# 1. Vérifier les variables d'environnement
Write-Host "`n1. Variables d'environnement:" -ForegroundColor Yellow
Write-Host "ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"
Write-Host "ANTHROPIC_AUTH_TOKEN: " -NoNewline
if ($env:ANTHROPIC_AUTH_TOKEN) {
    Write-Host "[CONFIGURÉ]" -ForegroundColor Green
} else {
    Write-Host "[NON CONFIGURÉ]" -ForegroundColor Red
}

# 2. Vérifier les variables permanentes
Write-Host "`n2. Variables permanentes (User):" -ForegroundColor Yellow
$baseUrl = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_BASE_URL", "User")
$authToken = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "User")
Write-Host "ANTHROPIC_BASE_URL: $baseUrl"
Write-Host "ANTHROPIC_AUTH_TOKEN: " -NoNewline
if ($authToken) {
    Write-Host "[CONFIGURÉ]" -ForegroundColor Green
} else {
    Write-Host "[NON CONFIGURÉ]" -ForegroundColor Red
}

# 3. Vérifier le fichier de configuration Claude
Write-Host "`n3. Configuration Claude:" -ForegroundColor Yellow
$claudeConfig = "$env:USERPROFILE\.claude\settings.json"
if (Test-Path $claudeConfig) {
    Write-Host "Fichier settings.json trouvé: $claudeConfig" -ForegroundColor Green
    $config = Get-Content $claudeConfig | ConvertFrom-Json
    Write-Host "Modèles configurés:"
    Write-Host "  - HAIKU: $($config.env.ANTHROPIC_DEFAULT_HAIKU_MODEL)"
    Write-Host "  - SONNET: $($config.env.ANTHROPIC_DEFAULT_SONNET_MODEL)"
    Write-Host "  - OPUS: $($config.env.ANTHROPIC_DEFAULT_OPUS_MODEL)"
} else {
    Write-Host "Fichier settings.json NOT FOUND: $claudeConfig" -ForegroundColor Red
}

# 4. Tester la connectivité à Z.AI
Write-Host "`n4. Test de connectivité Z.AI:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://api.z.ai/api/anthropic" -Method HEAD -TimeoutSec 10
    Write-Host "Connexion à Z.AI: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Connexion à Z.AI: ÉCHEC - $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Vérifier l'installation de Claude Code
Write-Host "`n5. Installation Claude Code:" -ForegroundColor Yellow
try {
    $claudeVersion = & claude --version 2>$null
    if ($claudeVersion) {
        Write-Host "Claude Code installé: $claudeVersion" -ForegroundColor Green
    } else {
        Write-Host "Claude Code: Version non détectée" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Claude Code: NON INSTALLÉ ou non accessible" -ForegroundColor Red
}

Write-Host "`n=== SOLUTIONS RECOMMANDÉES ===" -ForegroundColor Cyan

if (-not $env:ANTHROPIC_BASE_URL -or -not $env:ANTHROPIC_AUTH_TOKEN) {
    Write-Host "❌ Variables de session manquantes - Exécutez: .\setup-zai-env.ps1" -ForegroundColor Red
}

if (-not $baseUrl -or -not $authToken) {
    Write-Host "❌ Variables permanentes manquantes - Redémarrez le terminal après configuration" -ForegroundColor Red
}

if (-not (Test-Path $claudeConfig)) {
    Write-Host "❌ Configuration Claude manquante - Recréez le fichier settings.json" -ForegroundColor Red
}

Write-Host "`n=== COMMANDES À ESSAYER ===" -ForegroundColor Cyan
Write-Host "1. Reconfigurer les variables: .\setup-zai-env.ps1"
Write-Host "2. Redémarrer le terminal complètement"
Write-Host "3. Lancer Claude: claude"
Write-Host "4. Dans Claude, taper: /model ou /status"