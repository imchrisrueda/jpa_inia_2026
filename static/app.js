/*
   CropShield AI - Inicialización, Conectividad WebSocket y Renderizado en Canvas
*/

document.addEventListener('DOMContentLoaded', () => {
    // Canvas y Contexto
    const canvas = document.getElementById('canvas-stream');
    const ctx = canvas.getContext('2d');
    
    // Instanciar motores globales
    const particles = new window.ParticleSystem();
    const game = new window.CropShieldGame();
    
    // Variables de control de render
    let currentImage = new Image();
    let currentDetections = [];
    let ws = null;
    let isConnected = false;
    let reconnectInterval = 3000;
    
    // Control de FPS y rendimiento
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    
    // Variables para calibración
    let isCalibrating = false;
    let calibrationMessageTimer = 0;

    // --- Inicialización del Reloj ---
    function updateClock() {
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            const now = new Date();
            timeDisplay.innerText = now.toTimeString().split(' ')[0];
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- Pantalla de Bienvenida y Activación de Audio ---
    const startScreen = document.getElementById('start-screen');
    const btnStart = document.getElementById('btn-start');
    
    btnStart.addEventListener('click', () => {
        // Inicializar Audio Context (requiere interacción del usuario)
        game.initAudio();
        startScreen.classList.add('hidden');
        game.logToConsole("Sistema táctico de defensa de cultivos activado.", "success");
        connectWebSocket();
        fetchHardwareStatus();
        // Polling de hardware status cada 5 segundos
        setInterval(fetchHardwareStatus, 5000);
    });

    // --- Consulta de Estado de Hardware (Backend) ---
    async function fetchHardwareStatus() {
        try {
            const res = await fetch('/health');
            if (res.ok) {
                const data = await res.json();
                document.getElementById('hw-gpu').innerText = data.gpu ? "CUDA ACTIVO" : "CPU FALLBACK";
                document.getElementById('hw-gpu').style.color = data.gpu ? "#00ff88" : "#ff3b30";
                
                document.getElementById('hw-gpu-name').innerText = data.gpu_name ? data.gpu_name : "N/D";
                
                document.getElementById('hw-cam').innerText = data.camera_active 
                    ? (data.is_dummy ? "SIMULADA" : "ACTIVA (USB)") 
                    : "DESACTIVADA";
                document.getElementById('hw-cam').style.color = data.camera_active ? "#00ff88" : "#ff3b30";
            }
        } catch (e) {
            console.error("Error al consultar health endpoint:", e);
        }
    }

    // --- Conexión WebSocket ---
    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`Conectando al canal WebSocket en ${wsUrl}...`);
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            isConnected = true;
            console.log("WebSocket conectado con éxito.");
            game.logToConsole("Conexión de datos en tiempo real establecida.", "info");
            
            // Enviar la configuración inicial del slider
            sendConfig();
        };
        
        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                
                // Actualizar frame de vídeo
                if (payload.image) {
                    currentImage.src = payload.image;
                }
                
                // Actualizar detecciones de YOLOv8
                if (payload.detections) {
                    currentDetections = payload.detections;
                    
                    // Contar cultivos seguros en el frame actual para el HUD
                    const cropsCount = currentDetections.filter(d => d.class === 'manzana').length;
                    game.cropsSafe = Math.max(game.cropsSafe, cropsCount);
                    game.updateHUD();
                }
                
                // Calcular FPS
                const now = performance.now();
                frameCount++;
                if (now - lastFrameTime >= 1000) {
                    fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
                    document.getElementById('val-fps').innerText = String(fps).padStart(2, '0');
                    frameCount = 0;
                    lastFrameTime = now;
                }
                
            } catch (e) {
                console.error("Error al procesar mensaje WebSocket:", e);
            }
        };
        
        ws.onclose = () => {
            isConnected = false;
            console.warn("WebSocket cerrado. Reintentando en unos segundos...");
            game.logToConsole("Conexión perdida. Intentando reconexión...", "danger");
            setTimeout(connectWebSocket, reconnectInterval);
        };

        ws.onerror = (err) => {
            console.error("Error en WebSocket:", err);
        };
    }

    // Enviar configuración de slider y modo
    function sendConfig() {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        
        const confVal = parseFloat(document.getElementById('slider-conf').value) / 100.0;
        const isSimActive = document.getElementById('btn-feed-sim').classList.contains('active');
        
        ws.send(JSON.stringify({
            "conf_threshold": confVal,
            "simulate": isSimActive
        }));
    }

    // --- Manejo de Controles de la Interfaz ---
    
    // Toggle: Modo de Interacción (Ratón vs Auto-disparo)
    const btnModeMouse = document.getElementById('btn-mode-mouse');
    const btnModeAuto = document.getElementById('btn-mode-auto');
    const descMode = document.getElementById('desc-mode');

    btnModeMouse.addEventListener('click', () => {
        btnModeMouse.classList.add('active');
        btnModeAuto.classList.remove('active');
        game.interactionMode = 'mouse';
        descMode.innerText = "Haz clic directamente sobre los dientes de león en el visor para destruirlos.";
        game.logToConsole("Cambiado a Modo Manual (Ratón).", "info");
    });

    btnModeAuto.addEventListener('click', () => {
        btnModeAuto.classList.add('active');
        btnModeMouse.classList.remove('active');
        game.interactionMode = 'auto';
        descMode.innerText = "Centra un diente de león en la mira del visor durante 1 segundo para disparar automáticamente.";
        game.logToConsole("Cambiado a Modo Autónomo (Auto-disparo).", "info");
        game.lastUpdateTime = Date.now();
    });

    // Toggle: Fuente de vídeo (Cámara Real vs Simulación)
    const btnFeedCamera = document.getElementById('btn-feed-camera');
    const btnFeedSim = document.getElementById('btn-feed-sim');

    btnFeedCamera.addEventListener('click', () => {
        btnFeedCamera.classList.add('active');
        btnFeedSim.classList.remove('active');
        game.logToConsole("Cambiado a fuente de vídeo física.", "info");
        sendConfig();
    });

    btnFeedSim.addEventListener('click', () => {
        btnFeedSim.classList.add('active');
        btnFeedCamera.classList.remove('active');
        game.logToConsole("Cambiado a simulación de campo.", "info");
        sendConfig();
    });

    // Slider de umbral de confianza
    const sliderConf = document.getElementById('slider-conf');
    const valConf = document.getElementById('val-conf');

    sliderConf.addEventListener('input', () => {
        valConf.innerText = `${sliderConf.value}%`;
    });

    sliderConf.addEventListener('change', () => {
        sendConfig();
        game.logToConsole(`Umbral de confianza ajustado al ${sliderConf.value}%.`, "system");
    });

    // Botón de calibración
    const btnCalib = document.getElementById('btn-calibration');
    btnCalib.addEventListener('click', () => {
        isCalibrating = true;
        calibrationMessageTimer = 180; // 3 segundos a 60fps
        game.initAudio();
        game.playSuccessSound();
        game.logToConsole("Calibración del sensor de cámara completada.", "info");
    });

    // --- Interacción con el Visor (Clic con Ratón) ---
    canvas.addEventListener('click', (e) => {
        if (game.interactionMode !== 'mouse') return;
        
        // Obtener coordenadas de clic relativas al lienzo
        const rect = canvas.getBoundingClientRect();
        
        // Calcular la escala entre el tamaño CSS y el tamaño del lienzo interno
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        // El disparo láser sale desde el cañón superior central (320, 0)
        game.fireLaser(320, 0, mouseX, mouseY, currentDetections, particles);
    });

    // --- BUCLE DE RENDERIZADO (Game Loop) ---
    function render() {
        // 1. Limpiar Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 2. Pintar frame de la cámara
        if (currentImage.complete && currentImage.src) {
            ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        } else {
            // Fondo por defecto antes de conectar
            ctx.fillStyle = '#07080a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#A2AAAD';
            ctx.font = '16px Share Tech Mono';
            ctx.textAlign = 'center';
            ctx.fillText("ESPERANDO SEÑAL DE VÍDEO...", canvas.width / 2, canvas.height / 2);
        }
        
        // 3. Pintar rejilla HUD táctica suave sobre el vídeo
        ctx.strokeStyle = 'rgba(162, 170, 173, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 40; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 40; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // 4. Pintar Bounding Boxes de YOLOv8
        currentDetections.forEach(det => {
            const [x1, y1, x2, y2] = det.box;
            const w = x2 - x1;
            const h = y2 - y1;
            
            // Elegir estilo según clase
            let color = '#ff3b30'; // Rojo Diente de León
            let labelText = `MAL: DIENTE DE LEÓN`;
            
            if (det.class === 'manzana') {
                color = '#00ff88'; // Verde Manzana
                labelText = `CUL: MANZANA`;
            }
            
            // Dibujar caja táctica
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            // Esquinas iluminadas
            const edgeLen = Math.min(15, w * 0.25);
            
            // Esquina Superior Izquierda
            ctx.beginPath();
            ctx.moveTo(x1, y1 + edgeLen);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x1 + edgeLen, y1);
            ctx.stroke();
            
            // Esquina Superior Derecha
            ctx.beginPath();
            ctx.moveTo(x2, y1 + edgeLen);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2 - edgeLen, y1);
            ctx.stroke();
            
            // Esquina Inferior Izquierda
            ctx.beginPath();
            ctx.moveTo(x1, y2 - edgeLen);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x1 + edgeLen, y2);
            ctx.stroke();
            
            // Esquina Inferior Derecha
            ctx.beginPath();
            ctx.moveTo(x2, y2 - edgeLen);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2 - edgeLen, y2);
            ctx.stroke();
            
            // Dibujar caja de fondo muy suave para el área
            ctx.fillStyle = color === '#00ff88' ? 'rgba(0, 255, 136, 0.03)' : 'rgba(255, 59, 48, 0.03)';
            ctx.fillRect(x1, y1, w, h);
            
            // Etiqueta del modelo
            ctx.fillStyle = color;
            ctx.font = 'bold 9px Orbitron';
            ctx.textAlign = 'left';
            ctx.fillText(`${labelText} ${(det.confidence * 100).toFixed(0)}%`, x1 + 3, y1 - 4);
        });

        // 5. Actualizar lógica de auto-disparo
        game.updateAutoLock(currentDetections, canvas.width, canvas.height, particles);
        
        // 6. Actualizar y pintar partículas
        particles.update();
        particles.draw(ctx);
        
        // 7. Dibujar láser activo (línea de disparo)
        if (game.activeLaser) {
            const laser = game.activeLaser;
            ctx.save();
            ctx.strokeStyle = laser.color;
            ctx.lineWidth = 4 * (laser.timer / laser.maxTimer); // Se encoge con el tiempo
            ctx.shadowBlur = 15;
            ctx.shadowColor = laser.color;
            
            ctx.beginPath();
            ctx.moveTo(laser.sx, laser.sy);
            ctx.lineTo(laser.tx, laser.ty);
            ctx.stroke();
            ctx.restore();
            
            laser.timer--;
            if (laser.timer <= 0) {
                game.activeLaser = null;
            }
        }

        // 8. Mensaje de Calibración
        if (isCalibrating && calibrationMessageTimer > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(18, 22, 30, 0.8)';
            ctx.fillRect(120, 200, 400, 80);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 1;
            ctx.strokeRect(120, 200, 400, 80);
            
            ctx.fillStyle = '#00ff88';
            ctx.font = '14px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText("CALIBRACIÓN EN PROCESO...", canvas.width / 2, 238);
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px Share Tech Mono';
            ctx.fillText("ANALIZANDO UMBRALES DE LUZ Y RESOLUCIÓN...", canvas.width / 2, 260);
            ctx.restore();
            
            calibrationMessageTimer--;
            if (calibrationMessageTimer <= 0) {
                isCalibrating = false;
            }
        }
        
        // Siguiente frame
        requestAnimationFrame(render);
    }

    // Iniciar el game loop de renderizado
    render();
});
