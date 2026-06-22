# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

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
