# Test de lancement Claude Code avec GLM-4.6
Write-Host "=== TEST CLAUDE CODE + GLM-4.6 ===" -ForegroundColor Cyan

Write-Host "`nÉtape 1: Vérification des variables d'environnement" -ForegroundColor Yellow
Write-Host "ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"
Write-Host "ANTHROPIC_AUTH_TOKEN: [$(if($env:ANTHROPIC_AUTH_TOKEN){'CONFIGURÉ'}else{'NON CONFIGURÉ'})]"

Write-Host "`nÉtape 2: Affichage de la configuration Claude" -ForegroundColor Yellow
$claudeConfig = "$env:USERPROFILE\.claude\settings.json"
if (Test-Path $claudeConfig) {
    Write-Host "Configuration trouvée:" -ForegroundColor Green
    Get-Content $claudeConfig | Write-Host -ForegroundColor Cyan
} else {
    Write-Host "Configuration NON trouvée!" -ForegroundColor Red
}

Write-Host "`nÉtape 3: Instructions pour tester" -ForegroundColor Yellow
Write-Host "1. Dans un NOUVEAU terminal PowerShell, tapez:" -ForegroundColor White
Write-Host "   claude" -ForegroundColor Cyan
Write-Host "`n2. Une fois dans Claude Code, testez ces commandes:" -ForegroundColor White
Write-Host "   /status" -ForegroundColor Cyan
Write-Host "   /model" -ForegroundColor Cyan
Write-Host "   /help" -ForegroundColor Cyan

Write-Host "`n3. Si vous voyez encore 'Sonnet' au lieu de 'glm-4.6':" -ForegroundColor White
Write-Host "   - Tapez 'exit' pour quitter Claude" -ForegroundColor Cyan
Write-Host "   - Fermez COMPLÈTEMENT ce terminal" -ForegroundColor Cyan
Write-Host "   - Ouvrez un NOUVEAU terminal PowerShell" -ForegroundColor Cyan
Write-Host "   - Relancez 'claude'" -ForegroundColor Cyan

Write-Host "`nProbable cause du problème:" -ForegroundColor Yellow
Write-Host "Claude Code cache parfois les modèles. Le redémarrage complet du terminal" 
Write-Host "force le rechargement de toutes les variables d'environnement et configuration."

Write-Host "`nSi le problème persiste:" -ForegroundColor Yellow
Write-Host "- Vérifiez que votre clé API Z.AI est valide"
Write-Host "- Essayez de supprimer le dossier cache: Remove-Item -Recurse -Force $env:USERPROFILE\.claude\cache -ErrorAction SilentlyContinue"