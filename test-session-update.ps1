# Script PowerShell pour tester la mise à jour des sessions
Write-Host "🔄 Test de la mise à jour des sessions" -ForegroundColor Green

# Démarrer le serveur de développement en arrière-plan si pas déjà lancé
$port = 3001
$processRunning = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if (-not $processRunning) {
    Write-Host "🚀 Démarrage du serveur de développement..." -ForegroundColor Yellow
    Start-Process "cmd" -ArgumentList "/c", "cd /d `"$PSScriptRoot\event-admin`" && npm run dev" -WindowStyle Minimized
    Start-Sleep 10
}

Write-Host "✅ Modifications apportées:" -ForegroundColor Cyan
Write-Host "  1. API /api/sessions - Amélioration du logging et de la gestion d'erreurs" -ForegroundColor White
Write-Host "  2. SessionForm.tsx - Validation client renforcée" -ForegroundColor White
Write-Host "  3. Gestion d'erreurs plus détaillée" -ForegroundColor White

Write-Host ""
Write-Host "📋 Pour tester:" -ForegroundColor Yellow
Write-Host "  1. Allez sur http://localhost:3001/admin/evenements/533c4f88-f3ed-47b9-8e99-630e5e6bf5b4/edit" -ForegroundColor White
Write-Host "  2. Cliquez sur l'onglet 'Sessions'" -ForegroundColor White
Write-Host "  3. Essayez de modifier une session existante" -ForegroundColor White
Write-Host "  4. Vérifiez la console développeur (F12) pour les logs détaillés" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Logs à surveiller:" -ForegroundColor Magenta
Write-Host "  - Dans la console navigateur: logs avec émojis 🔄📝✅❌" -ForegroundColor White
Write-Host "  - Dans le terminal serveur: logs API détaillés" -ForegroundColor White

Write-Host ""
Write-Host "🛠️ Si le problème persiste, vérifiez:" -ForegroundColor Red
Write-Host "  1. La structure de la table inscription_sessions" -ForegroundColor White
Write-Host "  2. Les permissions Supabase RLS" -ForegroundColor White
Write-Host "  3. Les clés d'API Supabase" -ForegroundColor White

# Ouvrir automatiquement la page de test dans le navigateur
Start-Process "http://localhost:3001/admin/evenements/533c4f88-f3ed-47b9-8e99-630e5e6bf5b4/edit"

Write-Host ""
Write-Host "🎯 Page ouverte dans le navigateur pour test!" -ForegroundColor Green