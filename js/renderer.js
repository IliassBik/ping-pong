// js/renderer.js
// js/renderer.js
// Drawing functions with Glow Effects
function drawRect(x, y, w, h, color, glow = false) {
    if (isHighQuality && glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    if (isHighQuality && glow) ctx.shadowBlur = 0; // Reset shadow
}

function drawCircle(x, y, r, color, glow = false) {
    if (isHighQuality && glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    if (isHighQuality && glow) ctx.shadowBlur = 0;
}

function drawText(text, x, y, color, glow = false) {
    if (isHighQuality && glow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
    }
    ctx.fillStyle = color;
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText(text, x, y);
    if (isHighQuality && glow) ctx.shadowBlur = 0;
}

function drawRoundedRect(x, y, w, h, r, color, glow = false) {
    if (isHighQuality && glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    if (isHighQuality && glow) ctx.shadowBlur = 0;
}

function drawCrystalPaddle(p) {
    if (currentTheme === 'prism') {
        const r = 4; // Corner radius

        // 1. Exterior Glow Border (High Quality)
        if (isHighQuality) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = p.color;

            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(p.x, p.y, p.width, p.height, r);
            else ctx.rect(p.x, p.y, p.width, p.height);
            ctx.stroke();
        }

        // 2. Glassmorphism Body Gradient
        let bodyGrad = ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
        bodyGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        bodyGrad.addColorStop(0.5, 'rgba(60, 60, 60, 0.4)');
        bodyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(p.x, p.y, p.width, p.height, r);
        else ctx.rect(p.x, p.y, p.width, p.height);
        ctx.fill();

        // 3. Inner Energy Core (Blinking)
        let pulse = 0.4 + Math.sin(Date.now() / 150) * 0.2;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulse;
        ctx.fillRect(p.x + p.width / 2 - 1.5, p.y + 10, 3, p.height - 20);
        ctx.globalAlpha = 1.0;

        // 4. Sharp Highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x + 2, p.y + 5);
        ctx.lineTo(p.x + p.width - 2, p.y + 5);
        ctx.stroke();
    } else if (currentTheme === 'retro') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    } else if (currentTheme === 'jungle') {
        // Wood texture
        ctx.fillStyle = "#5d4037"; // Brown
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let i = 5; i < p.height; i += 15) {
            ctx.fillRect(p.x, p.y + i, p.width, 2);
        }
        // Leaf accent above paddle
        ctx.fillStyle = "#2e7d32";
        ctx.beginPath();
        ctx.ellipse(p.x + p.width / 2, p.y - 5, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    if (isHighQuality) ctx.shadowBlur = 0;
}

function drawNet() {
    if (currentTheme === 'prism') {
        if (isHighQuality) {
            ctx.shadowBlur = 40;
            ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
        }
        ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
        ctx.fillRect(canvas.width / 2 - 10, 0, 20, canvas.height);
        let beamGrad = ctx.createLinearGradient(canvas.width / 2 - 3, 0, canvas.width / 2 + 3, 0);
        beamGrad.addColorStop(0, "rgba(0, 229, 255, 0.3)");
        beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.9)");
        beamGrad.addColorStop(1, "rgba(0, 229, 255, 0.3)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        for (let i = 0; i <= canvas.height; i += 80) {
            let size = 4 + Math.sin(Date.now() / 300 + i) * 2;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, i + 40, size, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (currentTheme === 'retro') {
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    } else if (currentTheme === 'jungle') {
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height);
        // Draw alternating leaves (horizontal)
        ctx.fillStyle = "#81c784";
        for (let i = 0; i < canvas.height; i += 40) {
            const side = (Math.floor(i / 40) % 2 === 0) ? 1 : -1;
            ctx.beginPath();
            ctx.ellipse(canvas.width / 2 + side * 6, i + 20, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    if (isHighQuality) ctx.shadowBlur = 0;
}

// Render game state
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (isScreenShakeEnabled && screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
    }

    // Draw net
    drawNet();

    // Calculate score using HTML elements, no canvas drawing needed here

    // Draw paddles with Auras
    drawPaddleAura(player);
    drawPaddleAura(ai);

    drawCrystalPaddle(player);
    drawCrystalPaddle(ai);

    // Draw obstacles (handles both rect and circle shapes for all themes)
    obstacles.forEach(ob => {
        ctx.beginPath();
        if (currentTheme === 'prism') {
            const glow = (Math.sin(Date.now() / 200) * 5) + 10;
            if (isHighQuality) { ctx.shadowBlur = glow; ctx.shadowColor = '#ff007f'; }
            if (ob.shape === 'circle') {
                ctx.arc(ob.x, ob.y, ob.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 0, 127, 0.25)';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            } else {
                ctx.fillStyle = 'rgba(255, 0, 127, 0.2)';
                ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(ob.x + 2, ob.y + 2, ob.w - 4, ob.h - 4);
                ctx.strokeStyle = 'rgba(255, 0, 127, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
            }
        } else if (currentTheme === 'retro') {
            ctx.fillStyle = "#fff";
            if (ob.shape === 'circle') {
                ctx.arc(ob.x, ob.y, ob.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
            }
        } else if (currentTheme === 'jungle') {
            ctx.fillStyle = "#795548";
            if (ob.shape === 'circle') {
                ctx.arc(ob.x, ob.y, ob.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.arc(ob.x - 4, ob.y - 4, ob.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.moveTo(ob.x + 5, ob.y);
                ctx.lineTo(ob.x + ob.w - 5, ob.y);
                ctx.lineTo(ob.x + ob.w, ob.y + 10);
                ctx.lineTo(ob.x + ob.w, ob.y + ob.h - 5);
                ctx.lineTo(ob.x + 5, ob.y + ob.h);
                ctx.lineTo(ob.x, ob.y + ob.h - 5);
                ctx.closePath();
                ctx.fill();
            }
        }
        if (isHighQuality) ctx.shadowBlur = 0;
    });

    // Draw ball trail and apply Store Effects
    for (let i = 0; i < ballTrail.length; i++) {
        let pos = ballTrail[i];
        let alpha = (i + 1) / ballTrail.length;

        if (currentEffect === 'fire') {
            ctx.globalAlpha = alpha * 0.8;
            let fireH = Math.random() * 50; // 0 to 50 = Red to Yellow
            let fireSize = ball.radius * (1.2 - alpha * 0.5) + (Math.random() * 4);
            drawCircle(pos.x, pos.y, fireSize, `hsl(${fireH}, 100%, 50%)`);
        }
        else if (currentEffect === 'rainbow') {
            ctx.globalAlpha = alpha * 0.6;
            let timeH = (Date.now() / 5 + i * 20) % 360;
            drawCircle(pos.x, pos.y, ball.radius * (0.8 + alpha * 0.5), `hsl(${timeH}, 100%, 50%)`);
        }
        else if (currentEffect === 'ghost') {
            ctx.globalAlpha = alpha * 0.2;
            let ghostSize = ball.radius * (1.5 + alpha);
            drawCircle(pos.x, pos.y, ghostSize, 'rgba(150, 255, 255, 0.8)');
        }
        else if (currentEffect === 'matrix') {
            ctx.globalAlpha = alpha * 0.7;
            let binary = Math.random() > 0.5 ? '1' : '0';
            ctx.font = `${10 + alpha * 10}px 'Press Start 2P'`;
            ctx.fillStyle = '#00ff41'; // Matrix green
            ctx.fillText(binary, pos.x - 5, pos.y + 5);
        }
        else if (currentEffect === 'electric') {
            ctx.globalAlpha = alpha * 0.9;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + (Math.random() - 0.5) * 20, pos.y + (Math.random() - 0.5) * 20);
            ctx.stroke();
            drawCircle(pos.x, pos.y, 2, '#fff');
        }
        else if (currentEffect === 'plasma') {
            ctx.globalAlpha = alpha * 0.5;
            let hue = (Date.now() / 10 + i * 10) % 60 + 260; // Blue to Purple
            drawCircle(pos.x, pos.y, ball.radius * (1 + alpha), `hsl(${hue}, 100%, 50%)`);
            if (Math.random() > 0.8) drawCircle(pos.x, pos.y, 2, '#fff');
        }
        else if (currentEffect === 'gold') {
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(pos.x + (Math.random() - 0.5) * 10, pos.y + (Math.random() - 0.5) * 10, 4, 4);
            drawCircle(pos.x, pos.y, ball.radius * 0.6, '#ffaa00');
        }
        else {
            // Default trail
            ctx.globalAlpha = alpha * 0.5; // Max opacity 50%
            drawCircle(pos.x, pos.y, ball.radius * (0.5 + alpha * 0.5), ball.color);
        }
    }
    ctx.globalAlpha = 1.0; // Reset alpha

    // Draw power-ups (Premium Crystalline Sphere Style)
    for (let i = 0; i < powerUps.length; i++) {
        let pu = powerUps[i];
        let pulse = Math.sin(Date.now() / 200) * 3;
        let r = pu.radius + pulse;

        ctx.save();
        ctx.translate(pu.x, pu.y);

        // 1. External Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsl(${pu.hue}, 100%, 50%)`;

        // 2. Rotating Ring (Mathematical aura)
        ctx.strokeStyle = `hsla(${pu.hue}, 100%, 70%, 0.6)`;
        ctx.lineWidth = 2;
        ctx.rotate(Date.now() / 1000); // Continuous rotation
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
            ctx.moveTo(Math.cos(a) * (r + 8), Math.sin(a) * (r + 8));
            ctx.arc(0, 0, r + 8, a, a + Math.PI / 4);
        }
        ctx.stroke();

        // 3. Crystalline Sphere (Radial Gradient)
        let grad = ctx.createRadialGradient(-r / 3, -r / 3, r / 10, 0, 0, r);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.3, `hsl(${pu.hue}, 100%, 70%)`);
        grad.addColorStop(1, `hsl(${pu.hue}, 100%, 30%)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 4. Emoji Content (Centering)
        ctx.rotate(-Date.now() / 1000); // Counter-rotate to keep emoji upright
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px "Inter"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let pText = '✨';
        if (pu.type === 'BIG_PADDLE') pText = '📏';
        else if (pu.type === 'SHRINK_ENEMY') pText = '🔪';
        else if (pu.type === 'FAST_BALL') pText = '⚡';
        else if (pu.type === 'SLOW_BALL') pText = '🐌';
        ctx.fillText(pText, 0, 0);

        ctx.restore();
    }

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color, true);

    // Draw Serve Prompt
    if (isGameRunning && isServing && serveTurn === 'player') {
        if (isHighQuality) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
        }
        ctx.fillStyle = '#fff';
        ctx.font = "16px 'Press Start 2P'";
        ctx.textAlign = "center";

        // Blink effect using Date.now()
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillText("CLICK OR SPACE TO SERVE", canvas.width / 2, canvas.height - 40);
        }

        ctx.textAlign = "start"; // Reset alignment
        if (isHighQuality) ctx.shadowBlur = 0;
    }

    // Draw Floating Texts (Must be inside ctx.save block so it shakes too!)
    if (floatingTexts && floatingTexts.length > 0) {
        ctx.textAlign = "center";
        for (let ft of floatingTexts) {
            ctx.globalAlpha = Math.max(0, ft.alpha);

            // Draw text shadow for better readability
            ctx.font = "bold 20px 'Inter'";
            if (isHighQuality) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = ft.color;
            }
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);

            if (isHighQuality) ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1.0;
        ctx.textAlign = "start";
    }

    ctx.restore();
}

function drawPaddleAura(p) {
    if (currentPaddleAura === 'aura_none') return;

    ctx.save();
    if (currentPaddleAura === 'aura_neon') {
        ctx.shadowBlur = 30 + Math.sin(Date.now() / 200) * 10;
        ctx.shadowColor = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;

        // Draw rounded aura border
        const r = 8;
        const x = p.x - 5;
        const y = p.y - 5;
        const w = p.width + 10;
        const h = p.height + 10;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.stroke();
    }
    else if (currentPaddleAura === 'aura_fire') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff5500';
        for (let i = 0; i < 5; i++) {
            let offset = Math.sin(Date.now() / 150 + i) * 6;
            let alpha = 0.4 - (i * 0.06);
            ctx.fillStyle = `rgba(255, ${100 + i * 30}, 0, ${alpha})`;
            ctx.fillRect(p.x - 12 + i * 2.5, p.y - 6 + offset, p.width + 24 - i * 5, p.height + 12);
        }
    }
    else if (currentPaddleAura === 'aura_godly') {
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(p.x - 10, p.y - 10, p.width + 20, p.height + 20);

        // God rays
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 3;
        let time = Date.now() / 800;
        for (let i = 0; i < 8; i++) {
            let angle = time + (i * Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(p.x + p.width / 2, p.y + p.height / 2);
            ctx.lineTo(p.x + p.width / 2 + Math.cos(angle) * 120, p.y + p.height / 2 + Math.sin(angle) * 120);
            ctx.stroke();
        }
    }
    ctx.restore();
}
