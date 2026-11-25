# CRIMEVERSE AI 2.0 - One-Click Launch Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CRIMEVERSE AI 2.0 - Launching Platform" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# Navigate to project root
Set-Location -Path $PSScriptRoot

# Clean up stale processes on 5000 and 5173 if needed
$ports = @(5000, 5173)
foreach ($p in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "Port $p is currently in use by process PID $($conn.OwningProcess)." -ForegroundColor Yellow
    }
}

Write-Host "`nStarting CRIMEVERSE AI Server and Client..." -ForegroundColor Green
Write-Host "Backend API:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Cyan

# Start concurrently
Start-Process "http://localhost:5173"
npm run dev
