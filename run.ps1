# Script de inicio rápido para CropShield AI
Write-Host "Iniciando CropShield AI..." -ForegroundColor Cyan

# 1. Verificar si el entorno virtual existe
if (-not (Test-Path ".venv")) {
    Write-Host "No se encontró el entorno virtual. Ejecutando preparación inicial..." -ForegroundColor Yellow
    powershell -ExecutionPolicy Bypass -File .\setup_env.ps1
}

# 2. Abrir el navegador en la URL local
Write-Host "Abriendo la interfaz táctil en el navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:8000"

# 3. Arrancar el servidor backend FastAPI
Write-Host "Arrancando el servidor local en http://127.0.0.1:8000..." -ForegroundColor Green
.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
