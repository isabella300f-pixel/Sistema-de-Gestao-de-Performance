# Script para fazer add, commit e push
# Execute no PowerShell: .\fazer-push.ps1

$ErrorActionPreference = "Stop"
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
    Start-Sleep -Seconds 1
}
git add -A
git status
git commit -m "Remove telas RH (Painel/Registros Diarios), pesquisa filtrada em Registros Diarios"
git push origin main
Write-Host "Push concluido com sucesso." -ForegroundColor Green
