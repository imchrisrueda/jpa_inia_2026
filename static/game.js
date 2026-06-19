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
            
            if (hitClass === 'maleza') {
                // Éxito: maleza eliminada
                this.score += 100;
                this.weedsDestroyed++;
                this.playSuccessSound();
                laserColor = '#00ff88'; // Rayo cambia a verde al hacer impacto positivo
                
                // Emitir partículas verdes
                particles.emit(cx, cy, '#00ff88', 30);
                
                this.logToConsole(`[HIT] Maleza (Banana) neutralizada (+100 PTS) en (${cx.toFixed(0)}, ${cy.toFixed(0)})`, 'success');
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
        // Los contadores del visor (stats-crops y stats-weeds) se actualizan en tiempo real desde app.js para reflejar el frame actual.
        
        // Ahorro ecológico estimado
        // Cada maleza destruida ahorra aprox 0.25 litros de herbicida tradicional
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

        const crosshairEl = document.getElementById('auto-crosshair');
        const lockTimerEl = document.getElementById('lock-timer');

        if (this.interactionMode !== 'auto') {
            if (crosshairEl) {
                crosshairEl.classList.remove('active');
                crosshairEl.style.left = '50%';
                crosshairEl.style.top = '50%';
            }
            if (lockTimerEl) {
                lockTimerEl.style.clipPath = 'polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%)';
            }
            this.lockTarget = null;
            this.lockDuration = 0;
            return;
        }

        // Buscar malezas en las detecciones
        const weeds = detections.filter(det => det.class === 'maleza');
        let targetFound = null;

        if (weeds.length > 0) {
            // Si ya tenemos un lockTarget, intentamos buscar el mismo en las nuevas detecciones por cercanía
            if (this.lockTarget) {
                const prevCx = (this.lockTarget.box[0] + this.lockTarget.box[2]) / 2;
                const prevCy = (this.lockTarget.box[1] + this.lockTarget.box[3]) / 2;

                let minDistance = Infinity;
                let closestWeed = null;

                for (const weed of weeds) {
                    const weedCx = (weed.box[0] + weed.box[2]) / 2;
                    const weedCy = (weed.box[1] + weed.box[3]) / 2;
                    const distance = Math.hypot(weedCx - prevCx, weedCy - prevCy);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestWeed = weed;
                    }
                }

                // Si está a menos de 100px (umbral razonable de tracking), mantenemos la fijación
                if (minDistance < 100) {
                    targetFound = closestWeed;
                }
            }

            // Si no hay target fijado o se perdió el anterior, fijamos la primera maleza disponible
            if (!targetFound) {
                targetFound = weeds[0];
                this.lockTarget = targetFound;
                this.lockDuration = 0;
            } else {
                // Si es el mismo objetivo de tracking, acumulamos tiempo y actualizamos sus datos
                this.lockTarget = targetFound;
                this.lockDuration += dt;
            }
        } else {
            // No hay malezas en pantalla
            this.lockTarget = null;
            this.lockDuration = 0;
        }

        // Renderizado del HUD de auto-disparo
        if (this.lockTarget) {
            const tCx = (this.lockTarget.box[0] + this.lockTarget.box[2]) / 2;
            const tCy = (this.lockTarget.box[1] + this.lockTarget.box[3]) / 2;

            if (crosshairEl) {
                crosshairEl.classList.add('active');
                // Posicionar la mira en coordenadas porcentuales respecto a la resolución lógica (640x480)
                crosshairEl.style.left = `${(tCx / 640) * 100}%`;
                crosshairEl.style.top = `${(tCy / 480) * 100}%`;
            }

            // Actualizar la animación del anillo del temporizador
            const progress = Math.min(1.0, this.lockDuration / this.lockRequiredTime);
            const angle = progress * 360;

            let clipPathVal = 'polygon(50% 50%, 50% 0%';
            if (angle >= 45) clipPathVal += ', 100% 0%';
            if (angle >= 135) clipPathVal += ', 100% 100%';
            if (angle >= 225) clipPathVal += ', 0% 100%';
            if (angle >= 315) clipPathVal += ', 0% 0%';

            const rad = (angle - 90) * (Math.PI / 180);
            const rx = 50 + 50 * Math.cos(rad);
            const ry = 50 + 50 * Math.sin(rad);
            clipPathVal += `, ${rx}% ${ry}%)`;

            if (lockTimerEl) {
                lockTimerEl.style.clipPath = clipPathVal;
            }

            // Ejecutar disparo al cumplir el tiempo
            if (this.lockDuration >= this.lockRequiredTime) {
                // El disparo sale del centro superior (320, 0) y va hacia (tCx, tCy)
                this.fireLaser(320, 0, tCx, tCy, detections, particles);
                
                // Reiniciar el lock para el siguiente ciclo
                this.lockTarget = null;
                this.lockDuration = 0;
            }
        } else {
            // Sin objetivo fijado, restablecer mira al centro y desactivar indicador
            if (crosshairEl) {
                crosshairEl.classList.remove('active');
                crosshairEl.style.left = '50%';
                crosshairEl.style.top = '50%';
            }
            if (lockTimerEl) {
                lockTimerEl.style.clipPath = 'polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%)';
            }
        }
    }
}

// Hacerlo disponible de manera global
window.CropShieldGame = CropShieldGame;
