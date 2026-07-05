const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
const button = document.getElementById('actionBtn'); 
const messageBox = document.getElementById('secretMessage'); 
const closeBtn = document.getElementById('closeBtn'); 

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const numParticles = 550; 
const particles = [];
let angleY = 0;
let time = 0;
let showMessageMode = false; 

function createParticles() {
    particles.length = 0; 
    time = 0;
    showMessageMode = false;
    button.className = "hidden"; 
    messageBox.className = "hidden-message";
    canvas.classList.remove("blur-effect"); 

    for (let i = 0; i < numParticles; i++) {
        const t = Math.PI * 2 * (i / numParticles);
        
        let targetX = 16 * Math.pow(Math.sin(t), 3);
        let targetY = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        
        const noiseX = Math.sin(t * 3) * 1.2 + (Math.random() - 0.5) * 1.5;
        const noiseY = Math.cos(t * 2) * 1.2 + (Math.random() - 0.5) * 1.5;
        
        // CORAZÓN MÁS DELGADO: Multiplicamos X por un factor menor (9.5) y mantenemos Y alto (11.5)
        targetX = (targetX + noiseX) * 9.5; 
        targetY = -(targetY + noiseY) * 11.5; 
        
        const targetZ = (Math.sin(t) * 5) + (Math.random() - 0.5) * 15;

        const pAngle = Math.random() * Math.PI * 2;
        
        // REMOLINO MÁS DELGADO: Partículas nacen mucho más juntas en el centro de la base
        const pRadius = Math.random() * 15 + 5; 
        
        particles.push({
            x: Math.cos(pAngle) * pRadius,
            y: 220, 
            z: Math.sin(pAngle) * pRadius,
            
            radius: pRadius,
            angle: pAngle,
            
            tx: targetX,
            ty: targetY,
            tz: targetZ,
            
            // Ajustes del remolino fino y sutil
            vUp: -(Math.random() * 2.5 + 2.5),    
            vRot: 0.06 + Math.random() * 0.04,  
            // REMOLINO MÁS DELGADO: Reducimos drásticamente la velocidad de expansión (de 0.7 a 0.2)
            vExpand: 0.2 + Math.random() * 0.15, 
            
            speed: 0.015 + Math.random() * 0.035
        });
    }
}

createParticles();

button.addEventListener('click', () => {
    showMessageMode = true;
    button.className = "hidden"; 
    messageBox.className = "visible-message"; 
    canvas.classList.add("blur-effect"); 
});

closeBtn.addEventListener('click', () => {
    createParticles(); 
});

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    if (!showMessageMode) {
        time += 1;
    }

    // ---- 1. DIBUJAR LA BASE DE ENERGÍA (Más estilizada) ----
    ctx.save();
    ctx.translate(cx, cy + 220); 
    ctx.scale(1, 0.25); 
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2); // Base ligeramente más chica a juego con el remolino
    ctx.strokeStyle = 'rgba(0, 162, 255, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00a2ff';
    ctx.stroke();
    ctx.restore();

    const projectedPoints = [];
    angleY += 0.008; 

    // ---- 2. FÍSICA ----
    particles.forEach(p => {
        if (time < 90) {
            p.angle += p.vRot;       
            p.radius += p.vExpand;   
            p.y += p.vUp;            
            p.x = Math.cos(p.angle) * p.radius;
            p.z = Math.sin(p.angle) * p.radius;
        } else {
            p.x += (p.tx - p.x) * p.speed;
            p.y += (p.ty - p.y) * p.speed;
            p.z += (p.tz - p.z) * p.speed;
        }

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const xRot = p.x * cosY - p.z * sinY;
        const zRot = p.x * sinY + p.z * cosY;

        const perspective = 400 / (400 + zRot);
        const screenX = cx + xRot * perspective;
        const screenY = cy + p.y * perspective;

        projectedPoints.push({ x: screenX, y: screenY, z: zRot });
    });

    // ---- 3. CONEXIONES SUAVES ----
    if (time > 130) {
        ctx.strokeStyle = 'rgba(0, 162, 255, 0.07)'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < projectedPoints.length; i += 2) {
            ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 132, 255, 0.04)';
        for (let i = 1; i < projectedPoints.length; i += 3) {
            ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y);
        }
        ctx.stroke();
    }

    if (time > 150 && !showMessageMode) {
        button.className = "visible"; 
    }

    // ---- 4. DIBUJAR PUNTOS ----
    projectedPoints.forEach(p => {
        const size = p.z > 0 ? (2.2 + Math.sin(time * 0.05) * 0.5) : 1.2;
        ctx.fillStyle = p.z > 0 ? '#d0f0ff' : '#0077c6';

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

animate();