# Script de preparación del entorno para Windows 11
Write-Host "Iniciando preparación del entorno..." -ForegroundColor Cyan

# 1. Crear el entorno virtual si no existe
if (-not (Test-Path ".venv")) {
    Write-Host "Creando entorno virtual (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
} else {
    Write-Host "El entorno virtual (.venv) ya existe." -ForegroundColor Green
}

# 2. Instalar uv (gestor de paquetes rápido) si no está instalado
Write-Host "Instalando/Actualizando uv..." -ForegroundColor Yellow
python -m pip install uv

# 3. Instalar las dependencias usando uv
Write-Host "Instalando dependencias desde requirements.txt..." -ForegroundColor Yellow
.venv\Scripts\uv pip install -r requirements.txt

# 4. Mensaje de finalización
Write-Host "Entorno virtual preparado correctamente." -ForegroundColor Green
