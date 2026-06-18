# Guía de Uso y Calibración para el Expositor

Esta guía está dirigida a la persona encargada de operar y calibrar la demostración interactiva **CropShield AI** durante el showcase o feria tecnológica.

---

## 1. Configuración Física del Stand

Para lograr una demostración fluida y con excelente precisión de detección, sigue estas recomendaciones:

1. **Montaje de la Cámara**: Coloca la cámara web montada en un soporte vertical (tipo trípode de mesa o brazo articulado) apuntando directamente hacia abajo (plano cenital) sobre una superficie plana (mesa de demostración).
2. **Fondo de Contraste**: Coloca un tapete o cartulina de color neutro (preferiblemente oscuro, gris mate o marrón) sobre la mesa. Esto ayudará a que la manzana y las tarjetas impresas de diente de león resalten claramente.
3. **Iluminación**: Intenta que la mesa esté bien iluminada de forma homogénea. Evita sombras duras (por ejemplo, proyectadas por el soporte de la cámara o tu propia mano) y reflejos excesivos de focos directos sobre la manzana o el papel de las tarjetas.

---

## 2. Preparación de los Elementos de Demostración

* **El Cultivo (Seguro)**: Utiliza una o varias **manzanas rojas reales**. Es recomendable que sean manzanas limpias, de color rojo uniforme y sin brillos excesivos por cera.
* **La Amenaza (Objetivo Láser)**: Imprime las tarjetas ilustrativas de **diente de león** en papel blanco mate (evita papel fotográfico brillante que cause reflejos). Puedes dibujar o imprimir varias copias para distribuirlas en la mesa de demostración.

---

## 3. Calibración y Operación del HUD

1. **Paso Inicial**: Haz clic derecho en `run.ps1` y elige "Ejecutar con PowerShell" para arrancar el sistema. El navegador web se abrirá automáticamente en la pantalla de bienvenida.
2. **Acceso al HUD**: Pulsa en **"INICIAR SISTEMA DE DEFENSA"**.
3. **Ajuste del Umbral (IA Confidence)**:
   * En la barra lateral derecha, ajusta el deslizador de **"UMBRAL DE CONFIANZA IA"** (por defecto 35%).
   * Si ves falsas detecciones en la mesa (cuadros de detección que parpadean en el vacío), sube el umbral hacia 45%-50%.
   * Si colocas un diente de león impreso y no se dibuja la retícula roja, baja el umbral hacia 25%-30%.
4. **Calibrar Sensor**: Pulsa el botón **"CALIBRAR ENTORNO"** en el HUD para simular un ajuste de frecuencia de cámara y verificar la latencia.

---

## 4. Dinámica del Showcase para los Visitantes

### Modo Manual (Para interactuar en la pantalla)
1. Coloca el selector de modo en **RATÓN**.
2. Explica al visitante que en la pantalla se muestran las manzanas en verde (seguras) y los dientes de león en rojo (objetivos).
3. Invita al visitante a tomar el ratón y hacer clic directamente sobre los dientes de león en pantalla para disparar el láser.
4. Muestra cómo se actualiza la puntuación, el ahorro de pesticida y la precisión. Dispara a una manzana adrede para mostrar la advertencia y penalización.

### Modo Autónomo (Para interactuar físicamente)
1. Coloca el selector en **AUTO-DISPARO**.
2. Explica que este modo representa el funcionamiento de un dron de fumigación dirigida o un robot desherbador automático.
3. Invita al visitante a desplazar físicamente una tarjeta de diente de león por la mesa para colocarla justo en el centro de la mira circular de la pantalla.
4. Muestra cómo la mira cambia a estado activo, inicia la cuenta de carga del temporizador circular y realiza el disparo láser de precisión de forma 100% autónoma en 1 segundo.

---

## 5. Demostración de Entrenamiento en Directo (Live AI Training)

Una de las atracciones más espectaculares para un público interesado en la informática o la agricultura es mostrar cómo se entrena la IA en directo. Puedes hacerlo siguiendo estos pasos:

1. **Cerrar el servidor de juego**: En la ventana de consola donde se está ejecutando el backend, pulsa `CTRL+C` para detenerlo.
2. **Ejecutar el script de captura y entrenamiento**:
   En la consola de PowerShell, ejecuta:
   ```powershell
   .venv\Scripts\python.exe train.py
   ```
3. **Fase de Captura (Webcam)**:
   * Se abrirá una ventana de captura.
   * Coloca tu manzana roja real en el visor y pulsa la tecla `1` unas 10 veces, moviendo la manzana ligeramente para capturar diferentes ángulos.
   * Coloca tu tarjeta impresa de diente de león y pulsa la tecla `2` otras 10 veces en diferentes posiciones.
   * Pulsa la tecla `T` para arrancar el entrenamiento.
4. **Fase de Entrenamiento**:
   * Verás en consola cómo PyTorch ejecuta el ajuste fino de YOLOv8 en la GPU RTX 4070Ti. ¡Terminará en segundos!
   * El script creará y guardará el nuevo archivo `best.pt` automáticamente en la raíz.
5. **Reinicio**:
   * Vuelve a arrancar el juego con `.\run.ps1`.
   * El backend detectará el nuevo archivo `best.pt` y ejecutará la demostración utilizando tu modelo recién entrenado.
