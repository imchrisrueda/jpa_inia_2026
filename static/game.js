/*
   CropShield AI - Motor de Videojuego, Web Audio y Colisiones
*/

class CropShieldGame {
    constructor() {
        this.score = 0;
        this.cropsSafe = 0;
        this.weedsDestroyed = 0;
        
        this.totalShots = 0;
        this.accurateShots = 0;
        
        this.interactionMode = 'mouse'; // 'mouse' o 'auto'
        this.audioCtx = null;
        
        // Efecto láser activo
        this.activeLaser = null; // { sx, sy, tx, ty, timer, maxTimer, color }
        
        // Temporizador de fijación (Modo Auto-disparo)
        this.lockTarget = null; // Bounding box de la plaga fijada
        this.lockDuration = 0;  // Tiempo acumulado fijado (ms)
        this.lockRequiredTime = 1000; // Tiempo requerido para disparo autónomo (1s)
        this.lastUpdateTime = Date.now();
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log("Audio Context inicializado con éxito.");
        }
    }

    // --- Síntesis de Sonido en Tiempo Real (Web Audio API) ---
    playLaserSound() {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
    }

    playSuccessSound() {
        if (!this.audioCtx) return;
        // Sonido sintético de impacto positivo / explosión
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, this.audioCtx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.22);
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.22);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.22);
    }

    playErrorSound() {
        if (!this.audioCtx) return;
        // Sonido áspero de penalización
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(110, this.audioCtx.currentTime + 0.07);
        osc.frequency.linearRampToValueAtTime(70, this.audioCtx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.3);
    }

    // --- Lógica de Disparo y Colisiones ---
    fireLaser(startX, startY, targetX, targetY, detections, particles) {
        this.initAudio();
        this.playLaserSound();
        this.totalShots++;
        
        let hitSomething = false;
        let hitClass = '';
        let hitBox = null;

        // Comprobar colisión con las cajas detectadas por YOLOv8
        for (const det of detections) {
            const [x1, y1, x2, y2] = det.box;
            // Verificar si el disparo (targetX, targetY) cae dentro del bounding box
            if (targetX >= x1 && targetX <= x2 && targetY >= y1 && targetY <= y2) {
                hitSomething = true;
                hitClass = det.class;
                hitBox = det;
                break;
            }
        }

        let laserColor = '#ff3b30'; // Láser rojo CSIC por defecto

        if (hitSomething) {
            this.accurateShots++;
            const cx = (hitBox.box[0] + hitBox.box[2]) / 2;
            const cy = (hitBox.box[1] + hitBox.box[3]) / 2;
            
            if (hitClass === 'diente_de_leon') {
                // Éxito: maleza eliminada
                this.score += 100;
                this.weedsDestroyed++;
                this.playSuccessSound();
                laserColor = '#00ff88'; // Rayo cambia a verde al hacer impacto positivo
                
                // Emitir partículas verdes
                particles.emit(cx, cy, '#00ff88', 30);
                
                this.logToConsole(`[HIT] Diente de león neutralizado (+100 PTS) en (${cx.toFixed(0)}, ${cy.toFixed(0)})`, 'success');
            } else if (hitClass === 'manzana') {
                // Error: daño colateral
                this.score = Math.max(0, this.score - 150);
                this.playErrorSound();
                
                // Emitir partículas rojas
                particles.emit(cx, cy, '#ff3b30', 25);
                
                this.logToConsole(`[WARNING] ¡Daño colateral al cultivo! Manzana impactada (-150 PTS)`, 'danger');
            }
        } else {
            // Disparo al vacío
            this.logToConsole(`[MISS] Disparo de precisión disipado en (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`, 'system');
            particles.emit(targetX, targetY, '#A2AAAD', 10);
        }

        // Registrar efecto visual
        this.activeLaser = {
            sx: startX,
            sy: startY,
            tx: targetX,
            ty: targetY,
            timer: 8, // Duración en frames
            maxTimer: 8,
            color: laserColor
        };
        
        this.updateHUD();
    }

    // Actualiza la interfaz del usuario
    updateHUD() {
        document.getElementById('score-val').innerText = String(this.score).padStart(4, '0');
        document.getElementById('stats-crops').innerText = this.cropsSafe;
        document.getElementById('stats-weeds').innerText = this.weedsDestroyed;
        
        // Ahorro ecológico estimado
        // Cada diente de león destruido ahorra aprox 0.25 litros de herbicida tradicional
        const litersSaved = this.weedsDestroyed * 0.25;
        document.getElementById('eco-liters').innerText = `${litersSaved.toFixed(2)} L`;
        
        // Porcentaje ecológico
        const progressPct = Math.min(100, (this.weedsDestroyed / 10) * 100);
        document.getElementById('eco-saved-pct').innerText = `${progressPct.toFixed(0)}%`;
        document.getElementById('eco-fill').style.width = `${progressPct}%`;
        
        // Precisión
        const efficiency = this.totalShots > 0 ? (this.accurateShots / this.totalShots) * 100 : 0.0;
        document.getElementById('eco-efficiency').innerText = `${efficiency.toFixed(1)}%`;
    }

    logToConsole(message, type = 'system') {
        const consoleEl = document.getElementById('log-console');
        if (!consoleEl) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        
        entry.innerText = `[${timeStr}] ${message}`;
        consoleEl.appendChild(entry);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    // Lógica del modo autónomo (Auto-disparo)
    updateAutoLock(detections, canvasWidth, canvasHeight, particles) {
        const now = Date.now();
        const dt = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        if (this.interactionMode !== 'auto') {
            document.getElementById('auto-crosshair').classList.remove('active');
            document.getElementById('lock-timer').style.clipPath = 'polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%)';
            return;
        }

        const centerRadius = 60; // Área de la mira central (120px ancho/2)
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;

        let targetFound = null;

        // Buscar si hay algún diente de león dentro de la mira central
        for (const det of detections) {
            if (det.class !== 'diente_de_leon') continue;
            
            const [x1, y1, x2, y2] = det.box;
            const detCx = (x1 + x2) / 2;
            const detCy = (y1 + y2) / 2;
            
            // Distancia euclídea al centro
            const dist = Math.hypot(detCx - cx, detCy - cy);
            if (dist < centerRadius) {
                targetFound = det;
                break;
            }
        }

        if (targetFound) {
            document.getElementById('auto-crosshair').classList.add('active');
            
            // Si es la primera fijación o el objetivo cambió
            if (!this.lockTarget || this.lockTarget.box.join(',') !== targetFound.box.join(',')) {
                this.lockTarget = targetFound;
                this.lockDuration = 0;
            } else {
                this.lockDuration += dt;
                
                // Actualizar la animación del anillo del temporizador
                const progress = Math.min(1.0, this.lockDuration / this.lockRequiredTime);
                const angle = progress * 360;
                
                // Simulación visual de barra circular usando clip-path
                let clipPathVal = 'polygon(50% 50%, 50% 0%';
                if (angle >= 45) clipPathVal += ', 100% 0%';
                if (angle >= 135) clipPathVal += ', 100% 100%';
                if (angle >= 225) clipPathVal += ', 0% 100%';
                if (angle >= 315) clipPathVal += ', 0% 0%';
                
                // Coordenadas trigonométricas para el final del arco
                const rad = (angle - 90) * (Math.PI / 180);
                const rx = 50 + 50 * Math.cos(rad);
                const ry = 50 + 50 * Math.sin(rad);
                clipPathVal += `, ${rx}% ${ry}%)`;
                
                document.getElementById('lock-timer').style.clipPath = clipPathVal;

                if (this.lockDuration >= this.lockRequiredTime) {
                    // Disparar láser automáticamente
                    const tCx = (targetFound.box[0] + targetFound.box[2]) / 2;
                    const tCy = (targetFound.box[1] + targetFound.box[3]) / 2;
                    
                    // El láser sale desde la parte superior (simulando dron/pulverizador)
                    this.fireLaser(cx, 0, tCx, tCy, detections, particles);
                    
                    // Reiniciar fijación tras disparo para evitar bucles continuos
                    this.lockTarget = null;
                    this.lockDuration = 0;
                }
            }
        } else {
            // No hay objetivos en la mira
            this.lockTarget = null;
            this.lockDuration = 0;
            document.getElementById('auto-crosshair').classList.remove('active');
            document.getElementById('lock-timer').style.clipPath = 'polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%)';
        }
    }
}

// Hacerlo disponible de manera global
window.CropShieldGame = CropShieldGame;
