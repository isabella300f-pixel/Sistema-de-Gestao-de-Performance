# Script para reset completo do projeto
# Este script limpa tudo e prepara o ambiente para um novo inicio

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESET COMPLETO DO PROJETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos do Node.js
Write-Host "1. Parando processos do Node.js..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   Processos parados" -ForegroundColor Green

# Limpar cache do Next.js
Write-Host "2. Limpando cache do Next.js (.next)..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   Cache removido" -ForegroundColor Green
} else {
    Write-Host "   Cache nao existe" -ForegroundColor Gray
}

# Limpar node_modules
Write-Host "3. Limpando node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "   node_modules removido" -ForegroundColor Green
} else {
    Write-Host "   node_modules nao existe" -ForegroundColor Gray
}

# Limpar package-lock.json
Write-Host "4. Limpando package-lock.json..." -ForegroundColor Yellow
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    Write-Host "   package-lock.json removido" -ForegroundColor Green
} else {
    Write-Host "   package-lock.json nao existe" -ForegroundColor Gray
}

# Limpar cache do npm
Write-Host "5. Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   Cache do npm limpo" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PROXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Execute: npm install" -ForegroundColor Yellow
Write-Host "2. Execute: npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pronto! O projeto foi completamente resetado." -ForegroundColor Green
