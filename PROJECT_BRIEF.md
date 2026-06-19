# CropShield AI: Defensor de Cultivos

## Resumen
Una aplicación interactiva de estilo arcade HUD (Heads-Up Display) de agricultura de precisión, diseñada para un showcase para todas las edades. Utiliza una cámara web para detectar cultivos y malezas (bananas) en tiempo real y permite "destruir" las malezas mediante un láser virtual, demostrando de forma visual y lúdica cómo la Inteligencia Artificial reduce el uso de pesticidas.

## Problema
En la agricultura tradicional, la fumigación de herbicidas se realiza de manera indiscriminada sobre todo el campo, lo que incrementa los costes, contamina el suelo y afecta a cultivos sanos. Aunque existen tecnologías de agricultura de precisión basadas en Deep Learning para fumigación dirigida, el público general no comprende de manera fácil e interactiva cómo funcionan estos modelos visuales de IA en tiempo real.

## Personas usuarias
* **Visitantes del showcase**: Público general de todas las edades (desde niños hasta adultos). Tienen poca o ninguna experiencia en IA. Buscan una experiencia visual y directa de tipo "tocar y probar".
* **Expositor**: Persona que configura el entorno, inicia la aplicación y guía a los visitantes.

## Proceso actual
Las explicaciones sobre IA en agricultura suelen ser teóricas o en formato vídeo, lo que resulta aburrido y poco memorable para ferias y showcases de divulgación general.

## Resultado esperado
Una aplicación web interactiva que:
1. Capture el flujo de vídeo de una cámara web en tiempo real.
2. Identifique mediante Deep Learning la diferencia entre "cultivos" (Manzana Roja Real) y "maleza" (Banana o imágenes de malezas).
3. Superponga un HUD interactivo de estilo tecnológico futurista con la paleta de colores del INIA-CSIC.
4. Permita a los usuarios apuntar y "eliminar" virtualmente las malezas con un rayo láser/pulverización al hacer clic (ratón) o mediante fijación automática (auto-disparo).

## Entregables
1. **Backend (Python)**: Detección rápida (YOLOv8 Nano) optimizada para GPU (CUDA) y transmisión por WebSockets.
2. **Frontend (Web - HTML/CSS/JS)**: Interfaz HUD futurista de alta fidelidad con efectos visuales, sonido y marcador.
3. **Script de Entrenamiento/Ajuste**: Script automatizado en Python para capturar imágenes con la webcam y entrenar/ajustar un modelo YOLOv8 propio para "Manzana" y "Maleza".
4. **Set de Tarjetas Imprimibles**: Plantilla digital con ilustraciones de malezas para demostraciones de respaldo.
5. **Documentación**: Guías de instalación (`INSTALL.md`) y uso rápido (`USER_GUIDE.md`).

## Evidencias de éxito
* La cámara web funciona a >30 FPS con el modelo de Deep Learning en ejecución gracias a la GPU RTX 4070Ti.
* Un usuario puede alternar entre el modo de selección (Ratón vs Auto-disparo).
* El láser elimina la maleza virtualmente actualizando el marcador e impacto ecológico.

## Métricas
* **Tasa de fotogramas**: Mínimo 30 FPS en el ordenador (RTX 4070Ti).
* **Precisión de detección**: >92% en condiciones normales de iluminación.
* **Tiempo de respuesta**: Latencia del láser <50ms tras el disparo.

## Alcance
* Detección en tiempo real de: `Cultivo` (Manzana Roja Real) y `Maleza/Plaga` (Banana o imágenes de malezas).
* Modos de interacción: Modo Ratón (apuntar y hacer clic) y Modo Auto-disparo (fijar blanco por 1 segundo).
* Estética de interfaz inspirada en la paleta corporativa del INIA-CSIC (Rojo CSIC #AF071F y Gris #A2AAAD).

## Fuera de alcance
* Control de hardware real.
* Leaderboard persistente en base de datos externa.

## Datos
* **Dataset de origen**: Modelo YOLOv8 pre-entrenado + dataset de ajuste para "manzana" y "maleza".
* **Entradas**: Flujo RGB desde la cámara web (USB o integrada).
* **Salidas**: Clases y coordenadas de bounding boxes mediante WebSockets.

## Restricciones
* Ejecución local en Windows 11.
* Aceleración CUDA para la GPU RTX 4070Ti.
* Preparación del entorno con `venv` e instalación usando `uv` y `uv pip install`.
* Uso de PowerShell para comandos.

## Riesgos
* **Condiciones de luz en el showcase**: Si el evento tiene mala iluminación, la precisión del modelo podría bajar.
  * *Mitigación*: Diseñar tarjetas imprimibles con alto contraste y colores distintivos, y permitir calibración rápida del umbral de detección en el HUD.

## Responsables de validación
* **Usuario/Expositor**: Valida que el flujo de uso sea entretenido, rápido de configurar y visualmente impactante.

## Decisiones tomadas
* **Objetos**: Se utilizará una **manzana roja real** como cultivo principal. Como maleza/plaga, se usará una **banana real** o imágenes impresas de malezas.
* **Interacción**: Doble modo (Ratón y Auto-disparo) seleccionable mediante un control en el HUD.
* **Estética**: Diseño tecnológico futurista con paleta del INIA-CSIC (Rojo #AF071F, Gris #A2AAAD y acentos cian/verde neon para contraste digital).
* **Entorno**: Python virtual environment (`venv`) gestionado con `uv`.
