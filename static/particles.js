/*
   CropShield AI - Motor de Partículas 2D para Efectos Láser
*/

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        // Velocidad aleatoria en todas direcciones
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.color = color;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.04 + 0.02; // Desvanecimiento rápido
        this.size = Math.random() * 4 + 1.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        // Resistencia al aire simple
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count = 25) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    clear() {
        this.particles = [];
    }
}

// Hacerlo disponible de manera global
window.ParticleSystem = ParticleSystem;
