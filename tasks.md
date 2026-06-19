# Plan de Tareas: CropShield AI

## Tarea 1: Preparación del Entorno de Desarrollo y Dependencias
* **Resultado parcial**: Entorno virtual de Python configurado en Windows 11 con aceleración CUDA funcional.
* **Archivos previstos**:
  * `requirements.txt`
  * `setup_env.ps1` (Script PowerShell para automatizar la creación del venv con uv)
* **Dependencias**: Ninguna.
* **Criterios de aceptación**:
  * Ejecutar un comando corto que verifique si PyTorch detecta CUDA en la RTX 4070Ti (`torch.cuda.is_available() == True`).
* **Pruebas**: Script temporal de comprobación de PyTorch.
* **Documentación**: `INSTALL.md` (borrador inicial).
* **Riesgos**: Incompatibilidad de versiones de CUDA y PyTorch en Windows.
  * *Mitigación*: Instalar explícitamente el índice de PyTorch con soporte para CUDA 11.8 o 12.1.
* **Estado**: COMPLETADO

---

## Tarea 2: Backend de Captura y Servidor WebSocket
* **Resultado parcial**: Servidor FastAPI local que lee la cámara web en tiempo real, ejecuta YOLOv8 Nano en GPU y envía los datos y la imagen a través de WebSockets.
* **Archivos previstos**:
  * `main.py` (Punto de entrada de FastAPI y middleware de prevención de caché)
  * `camera.py` (Lógica de captura de cámara web y cola de frames)
  * `model.py` (Gestión del modelo YOLOv8 y mapeo unificado de clases a `'manzana'` y `'maleza'`)
* **Dependencias**: Tarea 1.
* **Criterios de aceptación**:
  * El servidor corre en `http://127.0.0.1:8000` y expone un endpoint `/ws` que transmite frames y coordenadas estables a más de 30 FPS.
* **Pruebas**: Script cliente de WebSocket en Python (`test_ws_client.py`) para medir tasa de FPS y verificar la estructura del JSON recibido.
* **Documentación**: Comentarios en el código y especificación de la interfaz WebSocket en `design.md`.
* **Riesgos**: Bloqueo del hilo principal de FastAPI por la lectura síncrona de OpenCV o por la inferencia de YOLO.
  * *Mitigación*: Ejecutar la captura en un hilo en segundo plano (`threading.Thread`) y la inferencia en un pool asíncrono o de manera altamente optimizada.
* **Estado**: COMPLETADO

---

## Tarea 3: Frontend y HUD Estilo Tecnológico Futurista
* **Resultado parcial**: Página web estática que recibe las imágenes y cajas de detección por WebSocket y renderiza un HUD futurista con colores del INIA-CSIC.
* **Archivos previstos**:
  * `static/index.html` (Estructura del HUD, contenedor de canvas e importación con prevención de caché)
  * `static/style.css` (Estilos premium y animaciones)
  * `static/app.js` (Conectividad WebSocket y dibujo en canvas)
* **Dependencias**: Tarea 2.
* **Criterios de aceptación**:
  * El navegador se conecta automáticamente al WebSocket al cargar la página.
  * El frame de la cámara web se pinta en el fondo y se dibujan cajas animadas alrededor de manzanas rojas (verde neón) y malezas/bananas (rojo CSIC).
* **Pruebas**: Inspección visual de la UI en el navegador. Comprobación de que no hay caídas de fotogramas (FPS estables en consola).
* **Documentación**: Actualización del archivo de diseño visual.
* **Riesgos**: Lentitud al renderizar Base64 en Canvas a alta velocidad.
  * *Mitigación*: Optimizar el renderizado del canvas usando métodos de renderizado de imagen ligeros y evitar redibujados innecesarios.
* **Estado**: COMPLETADO

---

## Tarea 4: Lógica de Videojuego, Modos de Disparo y Efectos
* **Resultado parcial**: Implementación de las mecánicas de disparo (Modo Ratón y Modo Auto-disparo dinámico), marcador de estadísticas de impacto ecológico y efectos visuales de láser.
* **Archivos previstos**:
  * `static/game.js` (Módulo JS con la lógica del juego, colisiones, contadores de frame en tiempo real y auto-disparo con mira móvil)
  * `static/particles.js` (Efectos de chispas e impactos láser)
  * `static/assets/` (Estructura preparada para assets de audio, implementados mediante Web Audio API)
* **Dependencias**: Tarea 3.
* **Criterios de aceptación**:
  * Se puede cambiar de modo con el control HUD.
  * En modo manual, al hacer clic sobre un recuadro de maleza se activa la animación de disparo y se destruye el objetivo.
  * En modo automático, la mira se mueve dinámicamente siguiendo la maleza y, al mantener la fijación por 1 segundo, dispara de manera autónoma.
  * Si se daña una manzana (cultivo), el sistema emite un sonido de error y resta puntos.
* **Pruebas**: Pruebas de juego manuales y registro de puntuación en consola y HUD.
* **Documentación**: `USER_GUIDE.md` (borrador inicial).
* **Riesgos**: Incompatibilidad del navegador con reproducción automática de audio sin interacción previa del usuario.
  * *Mitigación*: Solicitar un clic inicial en una pantalla de bienvenida (*"INICIAR SISTEMA DE DEFENSA"*) para habilitar el contexto de la Web Audio API.
* **Estado**: COMPLETADO

---

## Tarea 5: Integración Final, Scripts de Inicio y Documentación
* **Resultado parcial**: Todo el sistema funcional, empaquetado con scripts de arranque simples y documentación completa.
* **Archivos previstos**:
  * `run.ps1` (Script de inicio rápido de PowerShell para arrancar backend y frontend con un solo clic)
  * `train.py` (Script de reentrenamiento/ajuste local del modelo)
  * `README.md`
  * `INSTALL.md`
  * `USER_GUIDE.md`
  * `AGENTS.md`
  * `CHANGELOG.md`
* **Dependencias**: Tarea 4.
* **Criterios de aceptación**:
  * Al hacer clic derecho y ejecutar con PowerShell `run.ps1`, el servidor backend inicia, detecta la GPU y abre el navegador automáticamente cargando la interfaz.
* **Pruebas**: Ejecución completa del flujo de instalación y despliegue desde cero en un directorio limpio para validar reproducibilidad.
* **Documentación**: Creación de todos los archivos MD finales.
* **Riesgos**: Fallo en los comandos de PowerShell por políticas de ejecución de scripts en Windows.
  * *Mitigación*: Detallar en `INSTALL.md` cómo omitir la política (`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`).
* **Estado**: COMPLETADO
