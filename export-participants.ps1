# Script PowerShell pour lancer l'export des participants
# Usage: .\export-participants.ps1

Write-Host "🚀 Lancement de l'export des participants..." -ForegroundColor Green

# Vérification de l'existence de Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé. Veuillez installer Node.js pour continuer." -ForegroundColor Red
    exit 1
}

# Vérification du fichier package.json
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Fichier package.json non trouvé dans le répertoire courant." -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le bon répertoire du projet." -ForegroundColor Yellow
    exit 1
}

# Vérification de Prisma
try {
    Write-Host "🔍 Vérification de Prisma..." -ForegroundColor Blue
    npx prisma --version | Out-Null
    Write-Host "✅ Prisma disponible" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma non trouvé. Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Lancement du script d'export
Write-Host "`n📊 Démarrage de l'export des participants..." -ForegroundColor Blue
Write-Host "=" * 60 -ForegroundColor Blue

try {
    node get-all-participants.js
    
    Write-Host "`n" + "=" * 60 -ForegroundColor Green
    Write-Host "🎉 Export terminé avec succès!" -ForegroundColor Green
    
    # Affichage des fichiers générés
    $csvFiles = Get-ChildItem -Path "." -Filter "participants_export_*.csv" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $jsonFiles = Get-ChildItem -Path "." -Filter "participants_summary_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($csvFiles) {
        Write-Host "`n📄 Fichier CSV généré:" -ForegroundColor Cyan
        Write-Host "   $($csvFiles.FullName)" -ForegroundColor White
        Write-Host "   Taille: $([math]::Round($csvFiles.Length / 1KB, 2)) KB" -ForegroundColor Gray
    }
    
    if ($jsonFiles) {
        Write-Host "`n📋 Résumé JSON généré:" -ForegroundColor Cyan
        Write-Host "   $($jsonFiles.FullName)" -ForegroundColor White
    }
    
    Write-Host "`n💡 Conseil: Vous pouvez ouvrir le fichier CSV avec Excel ou LibreOffice Calc" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Erreur lors de l'export:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`nAppuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")