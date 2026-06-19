# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

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
