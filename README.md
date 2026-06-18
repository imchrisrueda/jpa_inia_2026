# CropShield AI: Defensor de Cultivos (Showcase IA Agrícola)

Este proyecto es una demostración interactiva en tiempo real para todos los públicos diseñada para ferias tecnológicas y showcases de divulgación científica. Su objetivo es ilustrar el concepto de **agricultura de precisión** mediante el uso de Inteligencia Artificial (Deep Learning) en la detección y neutralización selectiva de malezas o plagas, reduciendo drásticamente el uso indiscriminado de pesticidas químicos.

---

## Características Principales

1. **Detección Visual en Tiempo Real**: Inferencia a alta velocidad (>30 FPS) utilizando **YOLOv8 Nano** acelerado por GPU (Nvidia CUDA).
2. **Cultivo y Maleza específicos**:
   * **Cultivo seguro**: Manzana roja real.
   * **Amenaza/Maleza**: Hojas impresas de Diente de León.
3. **HUD Tecnológico Futurista**: Interfaz premium de cabina de dron/robótica en HTML5 y CSS con la paleta de colores oficial de la institución (**INIA-CSIC**).
4. **Doble modo de interacción**:
   * **Modo Manual (Ratón)**: Apuntar y hacer clic directamente sobre los objetivos de malezas en el visor.
   * **Modo Autónomo (Auto-disparo)**: Alínea la mira central sobre la maleza durante 1 segundo para que el software dispare automáticamente.
5. **Simulación de Campo Incorporada**: Si no hay una cámara web física conectada, o si se activa el modo de prueba, el sistema genera un flujo gráfico interactivo simulado con un cultivo y maleza en movimiento para probar todas las mecánicas láser y el HUD sin periféricos externos.
6. **Efectos de Partículas y Sonido**: Renderizado dinámico de chispas láser y síntesis de audio retro-arcade en tiempo real mediante la **Web Audio API** (sin dependencias de archivos externos).
7. **Pipeline de Entrenamiento Local**: Permite a los visitantes o al expositor capturar fotos con la cámara web de sus propias manzanas y dientes de león y entrenar un modelo YOLOv8 propio en directo (tarda menos de 1 minuto en la GPU dedicada RTX 4070Ti).

---

## Estructura del Repositorio

```
JPA2026/
├── .venv/                  # Entorno virtual de Python
├── static/                 # Frontend Web
│   ├── index.html          # Estructura del HUD y pantalla de bienvenida
│   ├── style.css           # Estilos premium, glows y animaciones
│   ├── app.js              # Conectividad WebSocket y bucle de renderizado
│   ├── game.js             # Lógica de juego, colisiones y marcador
│   ├── particles.js        # Efectos visuales de partículas
│   └── assets/             # Estructura para assets adicionales
├── main.py                 # Servidor backend FastAPI y WebSockets
├── camera.py               # Captura asíncrona de webcam con fallback a simulador
├── model.py                # Inferencia YOLOv8 en GPU (CUDA)
├── train.py                # Script independiente para entrenamiento/ajuste local
├── requirements.txt        # Dependencias de Python
├── run.ps1                 # Script de inicio rápido de PowerShell
├── README.md               # Este archivo de documentación general
├── INSTALL.md              # Guía de instalación y configuración
├── USER_GUIDE.md           # Guía de uso y calibración para el expositor
└── AGENTS.md               # Convenciones y reglas de desarrollo
```

---

## Cómo Iniciar la Demostración

Una vez instalado (ver [INSTALL.md](file:///c:/Users/christian.rueda/Desktop/JPA2026/INSTALL.md)):

1. Abre una consola de **PowerShell** en la carpeta del proyecto.
2. Ejecuta el script de inicio rápido:
   ```powershell
   .\run.ps1
   ```
3. El script abrirá automáticamente el navegador web y arrancará el servidor backend.
4. Pulsa en **"INICIAR SISTEMA DE DEFENSA"** en la pantalla de bienvenida y comienza a jugar.

---

## Créditos e Identidad Visual

Este proyecto utiliza la paleta de colores corporativa e identidad visual combinada del **INIA** (Instituto Nacional de Investigación y Tecnología Agraria y Alimentaria) y el **CSIC** (Consejo Superior de Investigaciones Científicas) para divulgar el impacto positivo de la Inteligencia Artificial en el sector agroalimentario de forma ecológica y tecnológica.
