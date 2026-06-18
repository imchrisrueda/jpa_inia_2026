# Propuesta Funcional: CropShield AI

## Contexto
Este proyecto forma parte de un showcase interactivo de Inteligencia Artificial orientada a la agricultura. Está pensado para captar la atención de visitantes de todas las edades en ferias, museos de ciencias o exposiciones tecnológicas, demostrando de manera lúdica el concepto de agricultura de precisión (localización y tratamiento selectivo de malezas/plagas en lugar de fumigación masiva).

## Necesidad
Disponer de una demostración visual y participativa que explique de manera práctica cómo los modelos de Deep Learning en tiempo real pueden ayudar a resolver problemas ecológicos y económicos en el campo. Se requiere una interfaz atractiva y con alta interactividad (estilo HUD futurista) que funcione con una cámara web y un PC potente.

## Casos de uso

### Caso de Uso 1: Escaneo y Detección en Tiempo Real
* **Persona usuaria**: Visitante del showcase / Expositor.
* **Objetivo**: Detectar y diferenciar la manzana roja real (cultivo) y las imágenes impresas de diente de león (maleza) frente a la cámara web.
* **Flujo principal**:
  1. El expositor coloca la cámara apuntando a una base de demostración.
  2. El usuario coloca una manzana roja real (o una imagen impresa de diente de león) bajo la cámara.
  3. El sistema identifica automáticamente el objeto en tiempo real, rodeándolo con una retícula de escaneo animada (verde para la manzana/cultivo, roja para el diente de león/maleza) y mostrando el nombre de la clase e indicador de porcentaje de confianza del modelo.
* **Errores posibles**: Objeto no reconocido debido a baja iluminación u oclusión parcial. El sistema mostrará una retícula gris con la etiqueta "Buscando objetivo...".

### Caso de Uso 2: Destrucción de Diente de León (Acción Láser) - Modo Ratón
* **Persona usuaria**: Visitante del showcase.
* **Objetivo**: Eliminar virtualmente los dientes de león detectados mediante el "láser de precisión" para proteger el cultivo.
* **Condiciones iniciales**: El selector de modo del HUD está en "MODO RATÓN" (Mouse Mode).
* **Flujo principal**:
  1. El usuario visualiza un diente de león identificado con retícula roja en el HUD de la pantalla.
  2. El usuario hace clic sobre el diente de león en la pantalla con el ratón.
  3. Se reproduce un efecto de sonido de disparo y una animación de rayo láser que impacta el objetivo, eliminándolo virtualmente con una animación de partículas.
  4. La puntuación aumenta, las estadísticas de impacto ambiental y litros de pesticida ahorrados se actualizan.
* **Casos alternativos**: Si el usuario dispara a la manzana roja (retícula verde), se emite una alerta sonora de error y se penaliza la puntuación, indicando "¡Daño al cultivo!".

### Caso de Uso 3: Destrucción de Diente de León (Acción Láser) - Modo Auto-disparo
* **Persona usuaria**: Visitante del showcase.
* **Objetivo**: Eliminar virtualmente los dientes de león mediante fijación y disparo automático.
* **Condiciones iniciales**: El selector de modo del HUD está en "MODO AUTO-DISPARO" (Auto-Spray Mode).
* **Flujo principal**:
  1. El usuario mueve físicamente el objeto o la imagen impresa de diente de león para colocarlo en el centro de la retícula central (mira) del HUD.
  2. Al detectar que el diente de león está centrado, la retícula inicia una animación de carga y bloqueo de objetivo (*Target Locking*).
  3. Al mantenerse centrada durante 1 segundo, el sistema dispara automáticamente el láser virtual con efectos de sonido y partículas.
  4. Se actualizan las estadísticas en pantalla.

## Comportamiento esperado
* **Selector de Modo**: Un interruptor digital en el HUD que permite cambiar instantáneamente entre "Modo Manual (Ratón)" y "Modo Autónomo (Auto-disparo)".
* **HUD Interactivo**: Pantalla con estética de cabina táctica de dron agrícola de ciencia ficción. Paleta de colores basada en el INIA-CSIC (Fondo oscuro, marcos en Gris corporativo #A2AAAD, indicadores en Rojo CSIC #AF071F y verde neón para elementos de seguridad).
* **Panel de Estadísticas**:
  * *Eficiencia de Fumigación* (%).
  * *Litros de Pesticida Ahorrados* (basado en tratamientos dirigidos vs tradicionales).
  * *Marcador de Puntos* (para incentivar el juego entre visitantes).

## Criterios de aceptación
* Al mostrar una manzana roja real, se debe dibujar un cuadro o círculo verde con animación de "objetivo seguro" (*Secure Crop*) en menos de 50 ms.
* Al mostrar una imagen impresa de diente de león, se debe dibujar un cuadro o círculo rojo con animación de "maleza detectada" (*Weed Target*) en menos de 50 ms.
* El selector de modo debe cambiar instantáneamente la lógica de disparo entre clics de ratón y centrado temporal.
* Al hacer clic en un objetivo válido o tras 1 segundo de fijación, debe ejecutarse inmediatamente una animación gráfica de disparo de láser y emitirse un sonido.
* La interfaz debe aplicar consistentemente la paleta del INIA-CSIC (#AF071F y #A2AAAD).

## Supuestos
* Se asume que el PC cuenta con soporte CUDA habilitado y que la GPU RTX 4070Ti permitirá tasas de refresco de vídeo excelentes (>30 FPS) a resolución 1080p.
* Se asume que el usuario instalará las librerías utilizando `uv` dentro de un `venv` gestionado con PowerShell bajo Windows 11.

## Riesgos
* **Inestabilidad del entorno de luz**: La precisión del modelo de IA puede verse afectada por la iluminación del showcase.
  * *Mitigación*: Permitir la calibración en tiempo real del umbral de confianza directamente desde el panel HUD.

## Exclusiones
* No se incluye ninguna integración física con pulverizadores reales.
* No se incluye almacenamiento persistente de puntuaciones históricas.
