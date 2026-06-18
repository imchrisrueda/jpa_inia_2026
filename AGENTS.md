# Propósito del Proyecto
Demostrar en un showcase interactivo para todos los públicos cómo la Inteligencia Artificial y el Deep Learning en tiempo real permiten realizar agricultura de precisión, específicamente detectando malezas/plagas y tratándolas selectivamente (mediante un láser virtual) en lugar de fumigar campos completos de forma indiscriminada.

# Resultado esperado
Una aplicación local con backend en Python (FastAPI + YOLOv8 con soporte CUDA en RTX 4070Ti) y frontend web (HTML/CSS/JS con HUD futurista, colores INIA-CSIC y soporte para dos modos de interacción: manual con ratón y autónomo con auto-disparo). La tasa de FPS debe ser estable a >30 FPS.

# Personas usuarias
* **Visitantes del showcase**: Público general de todas las edades, sin conocimientos técnicos o en programación.
* **Expositor**: Persona encargada de la demostración, responsable de iniciar el sistema y realizar la calibración de la cámara.

# Arquitectura
* **Servidor (Backend)**: FastAPI + OpenCV (hilo de captura de cámara) + PyTorch YOLOv8 Nano (CUDA).
* **Cliente (Frontend)**: Interfaz de una sola página (SPA) en HTML/CSS/JS conectada vía WebSocket.
* **Comunicación**: Flujo de imágenes en Base64 y JSON de detecciones a través de WebSockets en `localhost` (puerto `8000`).

# Estructura del repositorio
```
JPA2026/
├── .venv/                  # Entorno virtual de Python
├── static/                 # Frontend Web
│   ├── index.html          # Estructura HUD
│   ├── style.css           # Estilos premium y futuristas
│   ├── app.js              # Lógica de conexión WebSocket y renderizado
│   ├── game.js             # Lógica de juego, colisiones y marcador
│   ├── particles.js        # Efectos visuales de partículas
│   └── assets/             # Efectos de sonido (laser, acierto, etc.)
├── main.py                 # Servidor backend FastAPI y WebSockets
├── camera.py               # Captura de vídeo asíncrona de la webcam
├── model.py                # Inferencia YOLOv8 en GPU (CUDA)
├── train.py                # Script independiente para entrenamiento/ajuste local
├── requirements.txt        # Dependencias de Python
├── run.ps1                 # Script de inicio rápido de PowerShell
├── README.md               # Documentación general
├── INSTALL.md              # Guía de instalación rápida
├── USER_GUIDE.md           # Guía de uso y calibración para el expositor
├── AGENTS.md               # Este archivo de convenciones
├── PROJECT_BRIEF.md        # Resumen y requerimientos
├── proposal.md             # Propuesta funcional
├── design.md               # Diseño técnico
└── tasks.md                # Plan de tareas y avance
```

# Comandos oficiales
* **Creación de Entorno Virtual**: `python -m venv .venv`
* **Instalación de uv y dependencias**:
  * `pip install uv`
  * `uv pip install -r requirements.txt`
* **Arranque de la aplicación**: `uvicorn main:app --host 127.0.0.1 --port 8000 --reload`
* **Script de arranque rápido**: `.\run.ps1`

# Convenciones
* **Variables CSS**: Definir colores corporativos al inicio de `style.css`:
  * `--color-rojo-csic: #AF071F;`
  * `--color-gris-csic: #A2AAAD;`
  * `--color-bg-dark: #0d0e12;`
  * `--color-verde-neon: #00ff88;`
  * `--color-rojo-neon: #ff3b30;`
* **Lógica JS**: Escribir Javascript con sintaxis moderna (ES6). Utilizar variables modulares.
* **Código Python**: Seguir PEP8. Todas las llamadas a YOLOv8 deben especificar `device=0` o `device='cuda'` si CUDA está disponible, con fallback dinámico a `device='cpu'`.

# Reglas de datos
* **Entradas**: Flujo RGB directo de la cámara web activa del sistema.
* **Privacidad**: No se guarda ninguna imagen ni vídeo capturado en disco local ni se transmite a internet.
* **Pesos del Modelo**: El archivo del modelo `.pt` se almacena localmente y se descarga automáticamente de forma segura al iniciar el sistema por primera vez.

# Pruebas obligatorias
* Comprobar que PyTorch carga el dispositivo `cuda` en consola antes de arrancar FastAPI.
* Comprobar que el WebSocket reconecta en caso de desconexión temporal del backend.
* Comprobar que el navegador renderiza el vídeo capturado de manera fluida (>30 FPS).
* Probar la lógica de colisión del láser con bounding boxes en coordenadas normalizadas.

# Protocolo de documentación
* Cualquier cambio funcional relevante debe registrarse en `CHANGELOG.md`.
* Los comandos en la documentación deben probarse en PowerShell de Windows 11 antes de publicarse.

# Reglas de seguridad
* No incluir claves API ni credenciales en el repositorio.
* Validar que la interfaz web sólo responda en local (`127.0.0.1`).

# Acciones que requieren aprobación
* Modificar la paleta de colores base.
* Cambiar la versión principal del framework YOLO.
* Añadir nuevas dependencias externas en el frontend (ej. librerías de Canvas grandes).

# Definición de terminado
* El código corre a >30 FPS en la GPU RTX 4070Ti con CUDA habilitado.
* Se puede alternar de forma funcional entre Modo Ratón y Modo Auto-disparo.
* El láser destruye malezas, reproduce efectos de sonido y actualiza el marcador sin bugs.
* Toda la documentación está actualizada y los comandos de PowerShell funcionan en la máquina del usuario.
