# SOLUTION FINALE: Lancement de Claude Code avec GLM-4.6

Write-Host "=== LANCEMENT CLAUDE CODE AVEC GLM-4.6 ===" -ForegroundColor Green

# Configuration finale des variables
$env:ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="2df10961127b418fbc401144fda43e26.6Tb5OhR439ZFDawkY"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.6"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="glm-4.6"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.5-air"
$env:ANTHROPIC_DEFAULT_MODEL="glm-4.6"

Write-Host "Variables configurees:" -ForegroundColor Yellow
Write-Host "ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"
Write-Host "ANTHROPIC_AUTH_TOKEN: [CONFIGURE]"
Write-Host "Modeles GLM configures"

Write-Host ""
Write-Host "Lancement de Claude Code..." -ForegroundColor Cyan
Write-Host "Une fois lance, tapez /status pour verifier les modeles" -ForegroundColor Yellow

# Lancer Claude dans ce terminal avec les bonnes variables
claude