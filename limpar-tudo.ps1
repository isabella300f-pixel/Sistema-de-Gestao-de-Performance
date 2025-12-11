# Script para limpar completamente o cache e node_modules
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA COMPLETA DO PROJETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos do Node.js que possam estar usando os arquivos
Write-Host "Parando processos do Node.js..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Limpar cache do Next.js
Write-Host "Limpando cache do Next.js (.next)..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "✓ Cache do Next.js removido!" -ForegroundColor Green
} else {
    Write-Host "✓ Cache do Next.js não existe" -ForegroundColor Gray
}

# Limpar node_modules
Write-Host "Limpando node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "✓ node_modules removido!" -ForegroundColor Green
} else {
    Write-Host "✓ node_modules não existe" -ForegroundColor Gray
}

# Limpar package-lock.json (opcional, mas recomendado)
Write-Host "Limpando package-lock.json..." -ForegroundColor Yellow
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    Write-Host "✓ package-lock.json removido!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute: npm install" -ForegroundColor White
Write-Host "2. Execute: npm run dev" -ForegroundColor White
Write-Host ""


