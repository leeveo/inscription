# Lancement de Claude Code avec GLM-4.6 - VERSION FINALE

Write-Host "=== CLAUDE CODE + GLM-4.6 ===" -ForegroundColor Green

# Configuration des variables (validees)
$env:ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="2df10961127b418fbc401144fda43e26.6Tb5OhR439ZFDawk"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.6"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="glm-4.6"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.5-air"

Write-Host "Configuration GLM terminee:" -ForegroundColor Yellow
Write-Host "- API Z.AI: CONNECTEE" -ForegroundColor Green
Write-Host "- GLM-4.6: CONFIGURE" -ForegroundColor Green
Write-Host "- GLM-4.5-Air: CONFIGURE" -ForegroundColor Green

Write-Host "`nLancement de Claude Code..." -ForegroundColor Cyan
Write-Host "Dans Claude, utilisez: /status pour verifier" -ForegroundColor White

# Lancement de Claude
& claude