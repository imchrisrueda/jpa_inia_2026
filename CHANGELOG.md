# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.4.1] - 2026-06-23

### Corregido
- **Prevención de congelamiento del visor**: Se agregaron comprobaciones de dimensiones (`naturalWidth > 0`) y bloques `try...catch` en todas las operaciones de dibujo de imágenes (`drawImage`) del explicador. Esto evita que cargas fallidas o corruptas de base64 detengan el bucle principal de renderizado (`requestAnimationFrame`).
- **Compatibilidad con protocolo local**: Implementación de fallback automático del WebSocket a la dirección `ws://127.0.0.1:8000/ws` si la página es abierta directamente desde el sistema de archivos local (`file://`), impidiendo un error de sintaxis al inicializar la conexión.
- **Robustez ante detecciones parciales**: Comprobación estricta de tipo `Array.isArray()` y de la existencia del vector `box` en el bucle de renderizado de bounding boxes, evitando excepciones `TypeError`.
- **Estabilidad de Canvas y Geometría**: Protección mediante `Math.abs` y validación de radio estrictamente mayor a 0 en las funciones `arc` y `ellipse`, evitando excepciones de tipo `IndexSizeError` en navegadores estrictos.
- **Control defensivo de audio**: Envoltura en bloques `try...catch` de las operaciones con `AudioContext` para omitir excepciones en navegadores con políticas de autoplay restrictivas.

## [1.4.0] - 2026-06-23

### Añadido
- Integración de **Cámara en Vivo** en el Explicador del Modelo (`simulation.html`) para permitir el análisis didáctico de la señal de vídeo real.
- **10 Filtros Convolucionales Interactivos** que simulan la jerarquía profunda de extracción de características en una CNN (como YOLOv8):
  1. *Bordes Verticales (Sobel-V)*: Capa Temprana.
  2. *Bordes Horizontales (Sobel-H)*: Capa Temprana.
  3. *Orientación Diagonal (45°)*: Capa Temprana.
  4. *Esquinas y Vértices (Laplaciano)*: Capa Temprana.
  5. *Espectro Rojo (Manzana/Cultivo)*: Capa Intermedia.
  6. *Espectro Amarillo/Verde (Banana/Maleza)*: Capa Intermedia.
  7. *Textura y Relieve del Follaje*: Capa Intermedia.
  8. *Patrón de Silueta Circular*: Capa Profunda.
  9. *Patrón de Silueta Alargada*: Capa Profunda.
  10. *Atención Final (Heatmap / Grad-CAM)*: Capa de Decisión.
- Conectividad WebSocket bidireccional directa desde el Explicador IA hacia `/ws` para sincronizar frames de vídeo y bounding boxes en tiempo real.
- Procesamiento en paralelo de convoluciones en el frontend utilizando un canvas temporal oculto de baja resolución (200x150) con renderizado final ampliado retro-pixelado, logrando tasas de fotogramas estables (>30 FPS / 60 FPS) sin sobrecargar el hardware.
- Activación reactiva del flujo de la red neuronal animada y propagación de sinapsis según las detecciones de la cámara en vivo.
- Cuadrícula (Grid cells) y predicciones antes/después de NMS aplicadas en tiempo real al feed de vídeo.

### Cambiado
- Barra de scroll vertical adaptada con estilos INIA/CSIC de color primary translúcido en el panel de tarjetas de características.

## [1.3.0] - 2026-06-22

### Añadido
- Nueva vista interactiva "Explicador del Modelo" (`static/simulation.html`) para ilustrar didácticamente cómo el modelo YOLOv8 detecta y diferencia cultivos de malezas en tres pestañas: Etapas de Visión YOLO (Grid, Bbox, NMS), Flujo de la Red Neuronal (con animación de sinapsis mediante partículas en Canvas 2D) y Mapas de Características (convoluciones simuladas).
- Botón interactivo en el panel de control del HUD principal que enlaza a la nueva página de simulación y botón de regreso al panel.
- Nuevo script en Python `visualize_manim.py` utilizando la biblioteca matemática `manim` para renderizar en vídeo de alta definición una animación explicativa de la red neuronal clasificando manzanas y bananas.
- Nueva sección didáctica en la guía de usuario (`USER_GUIDE.md`) explicando el uso del simulador web y los pasos detallados para instalar `manim` y compilar el vídeo animado.

### Cambiado
- Modificación del archivo `main.py` para incluir la ruta HTTP `/simulation` que sirve la página web de simulación interactiva sin caché.

## [1.2.0] - 2026-06-22
 
### Añadido
- Arquitectura multi-tema en la interfaz HUD. Ahora se soporta tanto el tema clásico **CSIC** (rojo y gris) como el nuevo tema de identidad **INIA** (verde, lima y gris pizarra).
- Selección de tema controlada mediante una sola clase en el elemento `<body>` de `static/index.html` (e.g. `<body class="theme-inia">` para INIA o `<body class="theme-csic">` para CSIC).
- Lectura dinámica en JavaScript (`app.js` y `game.js`) de las variables de color del tema activo (`--color-target`, `--color-target-bg`, `--color-laser`, `--color-secondary`) para renderizar los bounding boxes del canvas, el haz de disparo del láser y las partículas de impacto de acuerdo al tema seleccionado.
- Integración del logotipo obligatorio unificado (Ministerio de Ciencias, CSIC e INIA) en los pies de página de la pantalla de bienvenida (`#start-screen`) y del visor HUD principal (`.hud-footer`), centrando la imagen y eliminando los pies de página textuales previos.
- Integración del logotipo del grupo de investigación **DIG4AGRO** (`DIG4AGRO_logo.svg`) en la esquina superior izquierda de la cabecera del HUD, al lado izquierdo de la etiqueta `CROPSHIELD`. Su tamaño se ha incrementado un 20% (de `35px` a `42px` de altura).
- Implementación de un proceso dinámico de normalización visual del histograma (ajuste por hardware mediante filtros CSS en Canvas 2D) al presionar "CALIBRAR ENTORNO". Durante los 3 segundos de calibración, la señal de cámara simula un ajuste de exposición automática (oscilando en brillo/contraste/saturación) y posteriormente aplica de manera persistente un filtro optimizado que mejora la nitidez, contraste y viveza del color de la señal web.

### Cambiado
- Se migró el archivo `static/style.css` para agrupar todas las variables de color del tema bajo selectores `body.theme-inia` y `body.theme-csic`, reemplazando las variables de colores fijos.
- Se configuró el tema corporativo del **INIA** como el predeterminado para el demostrador.
- Se simplificó el título superior central del HUD, eliminando la palabra "DEMOSTRADOR DE" para quedar únicamente como "**AGRICULTURA DE PRECISIÓN**".
- Se redimensionó y optimizó el contenedor del visor táctil (`.tactical-frame`): ahora el tamaño de la cámara de visualización es considerablemente más grande (aumentando su ancho máximo de `640px` a `860px`) y cuenta con escalado responsivo mediante la propiedad CSS `aspect-ratio` y `max-height` para ajustarse fluidamente a pantallas de distintas resoluciones.
- Actualización de la simulación del visor (`camera.py` y `main.py`): se rediseñó el dibujo de la maleza reemplazando el diente de león por un arbusto espinoso tridimensional verde (mala hierba), manteniendo la manzana roja como cultivo principal. Ambos elementos ahora se mueven en dos dimensiones siguiendo un algoritmo de **caminata aleatoria (Random Walk)** suave con rebote físico en los bordes correspondientes del visor.

## [1.1.0] - 2026-06-19

### Añadido
- Modo de **Auto-disparo Dinámico** en el frontend (`static/game.js`). La mira táctica (`#auto-crosshair`) ahora realiza un seguimiento físico y móvil en pantalla sobre cualquier plaga detectada, en lugar de estar fija en el centro del visor.
- Algoritmo de tracking de objetivos por proximidad en el HUD para mantener la fijación de la maleza en movimiento entre frames con un umbral de tolerancia de 100px.

### Cambiado
- Homogeneización de la clase plaga: Se reemplazan todas las referencias del frontend a la clase `'diente_de_leon'` por la clase unificada `'maleza'`, corrigiendo la colisión del láser con bounding boxes reales al detectar bananas/otras plantas con el modelo YOLOv8.
- Corrección de contadores HUD: Se eliminó la sobrescritura de los contadores en tiempo real por valores acumulados en `game.updateHUD()`. Ahora, "Manzanas en Imagen" y "Bananas (Maleza)" muestran de forma precisa el conteo instantáneo de elementos detectados en el frame actual, volviendo a `0` si no hay ninguno.
- Actualización de textos explicativos del HUD en el selector de modo manual y autónomo.

### Corregido
- Solucionado el problema de almacenamiento en caché del navegador en el frontend mediante la implementación de middleware HTTP de prevención de caché (`no-cache, no-store, must-revalidate`) en `main.py` para todos los recursos estáticos y HTML.
