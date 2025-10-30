# Lanceur Claude Code avec variables Z.AI forcees
$env:ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="2df10961127b418fbc401144fda43e26.6Tb5OhR439ZFDawk"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.6"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="glm-4.6"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.5-air"

Write-Host "Variables configurees pour cette session:" -ForegroundColor Green
Write-Host "  ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"
Write-Host "  ANTHROPIC_AUTH_TOKEN: CONFIGURE"
Write-Host "  Modeles GLM: CONFIGURES"

Write-Host "`nLancement de Claude Code..." -ForegroundColor Cyan

# Lancer Claude avec les variables explicitement definies
& claude