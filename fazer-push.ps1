# Script para fazer add, commit e push
# Execute no PowerShell: .\fazer-push.ps1

$ErrorActionPreference = "Stop"
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
    Start-Sleep -Seconds 1
}
git add -A
git status
git commit -m "Filtro padrao mes atual; Registros Diarios pesquisa ao abrir e todas as colunas na tabela/CSV"
git push origin main
Write-Host "Push concluido com sucesso." -ForegroundColor Green
