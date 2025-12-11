# Script para limpar cache do Next.js e node_modules
Write-Host "Limpando cache do Next.js..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "Cache limpo!" -ForegroundColor Green

Write-Host "`nLimpando node_modules (opcional)..." -ForegroundColor Yellow
$response = Read-Host "Deseja remover node_modules também? (s/N)"
if ($response -eq "s" -or $response -eq "S") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "node_modules removido!" -ForegroundColor Green
    Write-Host "`nExecute 'npm install' para reinstalar as dependências" -ForegroundColor Yellow
}

Write-Host "`nPronto! Agora execute 'npm run dev' novamente." -ForegroundColor Green


