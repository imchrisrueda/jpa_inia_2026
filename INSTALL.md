# Guía de Instalación Rápida: CropShield AI

Esta guía explica paso a paso cómo configurar el entorno de ejecución local en **Windows 11** aprovechando la aceleración por GPU CUDA en la tarjeta **NVIDIA GeForce RTX 4070Ti**.

---

## Requisitos de Hardware y Software

1. **Sistema Operativo**: Windows 10/11 (64-bit).
2. **GPU dedicada**: NVIDIA GeForce RTX 4070Ti (u otra GPU Nvidia compatible con CUDA).
3. **Controladores CUDA**: Asegúrate de tener instalado el controlador de NVIDIA actualizado.
4. **Python**: Versión 3.10, 3.11 o 3.12 instalada y en el PATH del sistema (el script detectará automáticamente la versión de QGIS si no hay una global instalada).
5. **Cámara Web**: Una cámara web USB de resolución mínima 720p conectada al equipo.

---

## Instrucciones de Configuración Paso a Paso

### Paso 1: Configurar la política de ejecución de PowerShell
Para poder ejecutar scripts `.ps1` locales en tu máquina, abre una consola de **PowerShell** como administrador y ejecuta el siguiente comando:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

### Paso 2: Clonar o copiar los archivos del proyecto
Coloca todos los archivos del repositorio en una carpeta de tu disco duro, por ejemplo, en `c:\Users\christian.rueda\Desktop\JPA2026`.

### Paso 3: Instalación automática y arranque
El script `run.ps1` se encarga de crear el entorno virtual `.venv`, verificar que `uv` está instalado, instalar las dependencias con la versión correcta de PyTorch con soporte CUDA e iniciar la aplicación.

Ejecuta el siguiente comando en la consola de PowerShell en la carpeta del proyecto:
```powershell
.\run.ps1
```

*(El primer arranque puede tardar entre 1 y 2 minutos mientras se descarga el modelo base YOLOv8 Nano `yolov8n.pt` de internet de forma automática).*

---

## Verificación de Aceleración GPU (CUDA)

Puedes verificar si el backend de Deep Learning está utilizando la GPU RTX 4070Ti de dos formas:

1. **En la consola del backend al iniciar**: Deberás ver la línea:
   ```
   Cargando YOLOv8. Dispositivo de inferencia seleccionado: 0
   ```
   *(El índice `0` representa la primera GPU disponible de tu sistema)*.
   
2. **Desde el HUD en el navegador**: En el panel lateral derecho ("HARDWARE STATUS"), verás:
   * **Aceleración GPU**: `CUDA ACTIVO` (en verde brillante).
   * **Dispositivo**: `NVIDIA GeForce RTX 4070 Ti`.

---

## Resolución de Problemas Comunes

### Error: "No se encontró la cámara web física"
Si la cámara web no está conectada o está siendo utilizada por otra aplicación (ej: Teams, Zoom, navegador), el backend mostrará un mensaje de advertencia en consola y **activará automáticamente el Modo Simulación**.
* *Solución*: Cierra cualquier aplicación que use la cámara web y refresca la página en el navegador.

### Error de compilación de PyTorch / CPU fallback
Si el HUD muestra `CPU FALLBACK` en rojo:
* Significa que PyTorch no se pudo comunicar con los controladores de tu tarjeta NVIDIA.
* *Solución*: Actualiza tus controladores NVIDIA Game Ready a la última versión disponible en el sitio web oficial de NVIDIA y reinstala los requisitos ejecutando:
  ```powershell
  .venv\Scripts\uv pip install --force-reinstall -r requirements.txt
  ```
