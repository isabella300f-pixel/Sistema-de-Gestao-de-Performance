# Script para fazer add, commit e push
# Execute no PowerShell: .\fazer-push.ps1

$ErrorActionPreference = "Stop"
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
    Start-Sleep -Seconds 1
}
git add -A
git status
git commit -m "Dashboard Executivo: filtros (Vendedor, Dia da Semana, Periodo) e fallback de dados ao carregar"
git push origin main
Write-Host "Push concluido com sucesso." -ForegroundColor Green
