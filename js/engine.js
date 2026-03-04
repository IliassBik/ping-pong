// js/engine.js
// Reset ball position for serving
function resetBall(scorer = 'player') {
    serveTurn = scorer;
    isServing = true;
    rallyHits = 0; // Reset hits when point is scored

    // Add visual juice (Screen shake based on speed)
    screenShake = Math.min(25, 3 + (Math.abs(ball.velocityX) * 0.8));

    // Position ball on the active server's paddle
    ball.velocityY = 0;
    ball.velocityX = 0;
    ballTrail = []; // Clear trail on reset

    if (serveTurn === 'player') {
        ball.x = player.x + player.width + ball.radius;
        ball.y = player.y + player.height / 2;
    } else {
        ball.x = ai.x - ball.radius;
        ball.y = ai.y + ai.height / 2;

        // AI auto-serves after 1 second
        if (serveTimeoutId) clearTimeout(serveTimeoutId);
        serveTimeoutId = setTimeout(() => {
            if (isGameRunning && isServing && serveTurn === 'ai') {
                launchServe();
            }
        }, 1000);
    }
}

function launchServe() {
    if (!isServing) return;
    isServing = false;
    isPaused = false;

    // Reset paddle sizes (powerup buffs should not persist between points)
    if (!isSurvivalMode) {
        // In adventure mode, restore to the level's defined paddleSize
        const basePaddleH = isAdventureMode ? ADVENTURE_LEVELS[currentAdventureLevel].paddleSize : paddleHeight;
        player.height = basePaddleH;
        ai.height = basePaddleH;
    }
    if (!isAdventureMode && !isSurvivalMode) {
        ai.speed = selectedDifficulty === 'easy' ? 3 : (selectedDifficulty === 'medium' ? 5 : 9);
    }

    // In Survival mode, ball always goes from player toward the wall (rightward)
    // In normal mode, direction depends on who is serving
    let direction;
    if (isSurvivalMode) {
        direction = 1; // always toward the wall (right)
    } else {
        direction = (serveTurn === 'player') ? 1 : -1;
    }

    let startSpeed = isAdventureMode ? ADVENTURE_LEVELS[currentAdventureLevel].ballSpeed : (isSurvivalMode ? 8 : 4);
    ball.speed = startSpeed;
    ball.velocityX = direction * ball.speed;
    ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * (ball.speed * 0.75);

    playSound('paddleHit');
}

// PowerUp Application
function applyPowerUp(type, hitter) {
    if (hitter === 'none') hitter = 'player'; // Default advantage

    let target = hitter === 'player' ? player : ai;
    let popupText = "";
    let popupColor = "#fff";

    switch (type) {
        case 'BIG_PADDLE':
            const originalHeight = target.height;
            const bigHeight = Math.min(target.height * 1.6, canvas.height * 0.6);
            target.height = bigHeight;
            if (target.y + target.height > canvas.height) target.y = canvas.height - target.height;
            popupText = hitter === 'player' ? "PADDLE ENLARGED!" : "ENEMY ENLARGED!";
            popupColor = "#00e5ff";

            let tid = setTimeout(() => {
                target.height = originalHeight;
                if (target.y + target.height > canvas.height) target.y = canvas.height - target.height;
            }, 10000);
            powerUpTimeouts.push(tid);
            break;

        case 'SHRINK_ENEMY':
            const enemyOriginal = enemy.height;
            const shrinkHeight = Math.max(enemy.height * 0.5, 40);
            enemy.height = shrinkHeight;
            popupText = hitter === 'player' ? "ENEMY SHRUNK!" : "PADDLE SHRUNK!";
            popupColor = "#ff007f";

            let sid = setTimeout(() => {
                enemy.height = enemyOriginal;
                if (enemy.y + enemy.height > canvas.height) enemy.y = canvas.height - enemy.height;
            }, 10000);
            powerUpTimeouts.push(sid);
            break;

        case 'FAST_BALL':
            ball.speed += 4;
            const angleFast = Math.atan2(ball.velocityY, ball.velocityX);
            ball.velocityX = ball.speed * Math.cos(angleFast);
            ball.velocityY = ball.speed * Math.sin(angleFast);
            popupText = "SPEED BOOST!";
            popupColor = "#ffaa00";
            break;

        case 'SLOW_BALL':
            ball.speed = Math.max(ball.speed * 0.5, 3); // Slow down, but don't stall
            const angleSlow = Math.atan2(ball.velocityY, ball.velocityX);
            ball.velocityX = ball.speed * Math.cos(angleSlow);
            ball.velocityY = ball.speed * Math.sin(angleSlow);
            popupText = "SNAIL PACE!";
            popupColor = "#aa00ff";
            break;
    }

    // Spawn floating notification near the paddle that hit it
    floatingTexts.push({
        text: popupText,
        x: target.x + (hitter === 'player' ? 20 : -20),
        y: target.y + target.height / 2,
        alpha: 1.0,
        color: popupColor
    });
}

// Collision detection
function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// Update game logic
function update() {
    if (isPaused) return;

    // Player 1 keyboard movement
    if (p1UpPressed && player.y > 0) {
        player.y -= player.speed;
    } else if (p1DownPressed && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }

    if (isServing) {
        // Keep ball glued to the serving paddle
        if (serveTurn === 'player') {
            ball.y = player.y + player.height / 2;
        } else {
            ball.y = ai.y + ai.height / 2;

            // Allow AI to slowly drift while holding ball to not look totally frozen
            let aiCenter = ai.y + ai.height / 2;
            if (aiCenter < canvas.height / 2 - 10) ai.y += ai.speed / 2;
            else if (aiCenter > canvas.height / 2 + 10) ai.y -= ai.speed / 2;
        }
        return; // Don't do physics or AI logic while serving
    }

    // Move the ball
    if (ballTrail.length >= 10) {
        let oldPos = ballTrail.shift();
        oldPos.x = ball.x;
        oldPos.y = ball.y;
        ballTrail.push(oldPos);
    } else {
        ballTrail.push({ x: ball.x, y: ball.y });
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Evaluate Obstacle Collisions & Movement
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];

        // Move Obstacle
        obs.x += obs.vx;
        obs.y += obs.vy;

        // Bounce Obstacle off bounds
        if (obs.shape === 'rect') {
            if (obs.x < obs.bounds.minX || obs.x + obs.w > obs.bounds.maxX) obs.vx *= -1;
            if (obs.y < obs.bounds.minY || obs.y + obs.h > obs.bounds.maxY) obs.vy *= -1;
        } else {
            if (obs.x - obs.radius < obs.bounds.minX || obs.x + obs.radius > obs.bounds.maxX) obs.vx *= -1;
            if (obs.y - obs.radius < obs.bounds.minY || obs.y + obs.radius > obs.bounds.maxY) obs.vy *= -1;
        }

        // Collision logic
        let isHit = false;
        if (obs.shape === 'rect') {
            // AABB vs Circle logic (treating circle as box for simplicity of retro feel)
            if (ball.x + ball.radius > obs.x && ball.x - ball.radius < obs.x + obs.w &&
                ball.y + ball.radius > obs.y && ball.y - ball.radius < obs.y + obs.h) {
                isHit = true;
            }
        } else if (obs.shape === 'circle') {
            // Circle vs Circle
            let dx = ball.x - obs.x;
            let dy = ball.y - obs.y;
            let radiiSq = (ball.radius + obs.radius) * (ball.radius + obs.radius);
            if (dx * dx + dy * dy < radiiSq) {
                isHit = true;
            }
        }

        if (isHit) {
            // Deflect ball
            ball.velocityX = (ball.velocityX > 0 ? -1 : 1) * Math.abs(ball.velocityX);
            ball.velocityY += (Math.random() - 0.5) * 2 + (obs.vy * 0.5);

            // Prevent Sticking: Nudge ball out of the obstacle
            const nudge = ball.velocityX > 0 ? 5 : -5;
            ball.x += nudge;

            // Add aesthetic bump effect to the obstacle
            obs.glow = true;
            setTimeout(() => { obs.glow = false; }, 100);

            playSound('wallHit');
            break;
        }
    }

    // Evaluate PowerUp Spawning and Collisions
    if (!isAdventureMode && !isSurvivalMode && powerUps.length === 0 && Math.random() < 0.005) {
        // Find a position that doesn't overlap any obstacle
        let attempts = 0;
        let px, py;
        let overlap = true;
        while (attempts < 20 && overlap) {
            px = canvas.width * 0.3 + Math.random() * (canvas.width * 0.4);
            py = 50 + Math.random() * (canvas.height - 100);
            attempts++;
            overlap = false;
            for (let j = 0; j < obstacles.length; j++) {
                let ob = obstacles[j];
                if (ob.shape === 'circle') {
                    const dx = px - ob.x, dy = py - ob.y;
                    if (dx * dx + dy * dy < (ob.radius + 30) * (ob.radius + 30)) {
                        overlap = true;
                        break;
                    }
                } else {
                    if (px > ob.x - 30 && px < ob.x + ob.w + 30 && py > ob.y - 30 && py < ob.y + ob.h + 30) {
                        overlap = true;
                        break;
                    }
                }
            }
        }
        if (!overlap) powerUps.push({ x: px, y: py, radius: 22, type: POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)], hue: Math.random() * 360 });
    }

    // In survival mode, powerups spawn every 5 hits for extra fun
    if (isSurvivalMode && survivalHits > 0 && survivalHits % 5 === 0 && powerUps.length === 0) {
        // Find a safe spot
        powerUps.push({
            x: canvas.width * 0.4 + Math.random() * (canvas.width * 0.2),
            y: 50 + Math.random() * (canvas.height - 100),
            radius: 22,
            type: POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)],
            hue: Math.random() * 360
        });
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        let pu = powerUps[i];
        pu.hue = (pu.hue + 2) % 360; // Animate color

        let dx = ball.x - pu.x;
        let dy = ball.y - pu.y;
        let radiiSq = (ball.radius + pu.radius) * (ball.radius + pu.radius);

        if (dx * dx + dy * dy < radiiSq) {
            // Apply PowerUp
            applyPowerUp(pu.type, ball.lastHitter);
            powerUps.splice(i, 1);
            playSound('uiHover'); // Reuse positive chime

            // Stats Tracking
            if (ball.lastHitter === 'player') {
                sessionStats.powerUpsCaught++;
            }
        }
    }

    if (isTwoPlayer) {
        // Player 2 keyboard movement
        if (p2UpPressed && ai.y > 0) {
            ai.y -= ai.speed;
        } else if (p2DownPressed && ai.y + ai.height < canvas.height) {
            ai.y += ai.speed;
        }
    } else {
        // ── SMART AI SYSTEM ──────────────────────────────────────────────
        // Determine AI "intelligence" tier based on mode and difficulty
        let aiTier; // 'easy' | 'medium' | 'hard'
        if (isAdventureMode) {
            const lvl = ADVENTURE_LEVELS[currentAdventureLevel];
            if (lvl.aiSpeed <= 4) aiTier = 'easy';
            else if (lvl.aiSpeed <= 7) aiTier = 'medium';
            else aiTier = 'hard';
        } else {
            aiTier = selectedDifficulty; // 'easy', 'medium', 'hard'
        }

        const aiCenter = ai.y + ai.height / 2;
        const ballComingTowardAI = ball.velocityX > 0;

        if (aiTier === 'hard') {
            // ── HARD: Ball trajectory PREDICTION with wall bounces ──────
            // Simulate where ball will be when it reaches AI's X
            let simX = ball.x, simY = ball.y;
            let simVx = ball.velocityX, simVy = ball.velocityY;
            let steps = 0;
            const maxSteps = 500;

            if (ballComingTowardAI) {
                // Trace ball path until it reaches the AI paddle's X
                while (simX < ai.x && steps < maxSteps) {
                    simX += simVx;
                    simY += simVy;
                    // Bounce off top/bottom walls
                    if (simY - ball.radius < 0) { simY = ball.radius; simVy = Math.abs(simVy); }
                    if (simY + ball.radius > canvas.height) { simY = canvas.height - ball.radius; simVy = -Math.abs(simVy); }
                    steps++;
                }
                const targetY = simY;
                // Move toward predicted position with minimal dead zone (5px)
                if (aiCenter < targetY - 5) ai.y += Math.min(ai.speed, targetY - aiCenter);
                else if (aiCenter > targetY + 5) ai.y -= Math.min(ai.speed, aiCenter - targetY);
            } else {
                // Ball moving away: drift toward center slowly
                const centerY = canvas.height / 2 - ai.height / 2;
                if (ai.y < centerY - 5) ai.y += Math.min(ai.speed * 0.5, centerY - ai.y);
                else if (ai.y > centerY + 5) ai.y -= Math.min(ai.speed * 0.5, ai.y - centerY);
            }

        } else if (aiTier === 'medium') {
            // ── MEDIUM: Reactive tracking, 20px dead zone, center drift ──
            if (ballComingTowardAI) {
                if (aiCenter < ball.y - 20) ai.y += ai.speed;
                else if (aiCenter > ball.y + 20) ai.y -= ai.speed;
            } else {
                // Drift back to center at 40% speed
                const centerY = canvas.height / 2 - ai.height / 2;
                if (ai.y < centerY - 8) ai.y += Math.min(ai.speed * 0.4, centerY - ai.y);
                else if (aiCenter > centerY + 8) ai.y -= Math.min(ai.speed * 0.4, ai.y - centerY);
            }

        } else {
            // ── EASY: Sluggish tracking with intentional errors ────────
            // Introduce a random offset error so AI misses sometimes
            if (!ai._easyOffset || Math.random() < 0.01) {
                // Update error offset every ~100 frames on average
                ai._easyOffset = (Math.random() - 0.5) * 80; // ±40px error
            }
            const targetY = ball.y + ai._easyOffset;

            if (ballComingTowardAI) {
                // Large dead zone (40px) for clumsy feel
                if (aiCenter < targetY - 40) ai.y += ai.speed * 0.7;
                else if (aiCenter > targetY + 40) ai.y -= ai.speed * 0.7;
            } else {
                // Very slow center drift
                const centerY = canvas.height / 2 - ai.height / 2;
                if (ai.y < centerY - 20) ai.y += ai.speed * 0.3;
                else if (ai.y > centerY + 20) ai.y -= ai.speed * 0.3;
            }
        }
        // ─────────────────────────────────────────────────────────────────
    }

    // Constrain AI to canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius; // Prevent sticking
        ball.velocityY = Math.abs(ball.velocityY);
        playSound('wallHit');
        screenShake = Math.max(screenShake, 5);
    } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius; // Prevent sticking
        ball.velocityY = -Math.abs(ball.velocityY);
        playSound('wallHit');
        screenShake = Math.max(screenShake, 5);
    }

    // Determine which paddle the ball is interacting with
    let currentPaddle = (ball.x < canvas.width / 2) ? player : ai;

    // Ball collision with paddles
    if (collision(ball, currentPaddle)) {
        // Calculate collision point (from -1 to 1)
        let collidePoint = (ball.y - (currentPaddle.y + currentPaddle.height / 2));
        collidePoint = collidePoint / (currentPaddle.height / 2);

        // Calculate angle (max 45 degrees)
        let angleRad = (Math.PI / 4) * collidePoint;

        // X direction changes depending on which paddle it hit
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;

        // Change velocity
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Track the last hitter (useful for powerups later or stats)
        ball.lastHitter = currentPaddle === player ? 'player' : 'ai';

        // Speed up the ball slightly after every hit
        if (isSurvivalMode) {
            // New formula starts at 4 and grows gently at first
            ball.speed = 4 + (survivalHits * 0.12) + Math.pow(survivalHits / 25, 1.4);
            // Cap survival speed to 25 to remain playable for pros
            if (ball.speed > 25) ball.speed = 25;
        } else {
            ball.speed += 0.5;
        }
        rallyHits++;

        // Add screen shake on paddle hit, scaled by ball speed
        screenShake = Math.min(15, 2 + (ball.speed * 0.7));

        // Economy: 1 coin for every 2 hits in a rally (Buffed from 3)
        if (rallyHits > 0 && rallyHits % 2 === 0) {
            coins++;
            localStorage.setItem('pongCoins', coins);
            if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
        }

        if (isSurvivalMode && currentPaddle === player) {
            survivalHits++;
            if (survivalHits > survivalBestHits) {
                survivalBestHits = survivalHits;
                localStorage.setItem('pongSurvivalBest', survivalBestHits);
            }
            playerScoreEl.innerText = "HITS: " + survivalHits;
            aiScoreEl.innerText = "BEST: " + survivalBestHits;

            // DYNAMIC OBSTACLES: Every 2 hits, refresh one
            if (survivalHits % 2 === 0) {
                refreshSurvivalObstacles();
            }
        }

        // Stats Tracking
        if (currentPaddle === player) {
            sessionStats.totalHits++;
            if (sessionStats.totalHits >= 1000) unlockAchievement('hits1000');
        }

        if (rallyHits > sessionStats.highestRally) {
            sessionStats.highestRally = rallyHits;
        }
        localStorage.setItem('pongStats', JSON.stringify(sessionStats));

        playSound('paddleHit');

        // Check for Rally Achievements
        if (ball.speed > 12) unlockAchievement('speedDemon');
        if (ball.speed > 18) unlockAchievement('lightSpeed');
        if (rallyHits >= 15) unlockAchievement('marathon15');
        if (rallyHits >= 30) unlockAchievement('marathon30');
        if (rallyHits >= 50) unlockAchievement('marathon50');
    }

    // Update Score
    if (ball.x - ball.radius < 0) {
        if (isSurvivalMode) {
            playSound('scoreAi'); // Lose sound
            endGame(false);
            return;
        }

        // AI scores
        ai.score++;
        sessionStats.totalPoints++;
        aiScoreEl.innerText = ai.score;
        playSound('scoreAi');
        screenShake = 15; // Heavy shake on goal
        resetBall('player'); // Player serves if they lost point
    } else if (ball.x + ball.radius > canvas.width) {
        if (isSurvivalMode) {
            // Should not happen as AI is a wall, but just in case, bounce it back
            ball.velocityX = -Math.abs(ball.velocityX);
            return;
        }

        // Player scores
        player.score++;
        sessionStats.totalPoints++;
        playerScoreEl.innerText = player.score;
        playSound('scorePlayer');
        screenShake = 15; // Heavy shake on goal

        // Check for Score Achievements
        if (player.score === 1) unlockAchievement('firstPoint');

        resetBall('ai'); // AI serves if Player scored
    }

    // Save points to stats
    localStorage.setItem('pongStats', JSON.stringify(sessionStats));

    // Check for Points Milestones
    if (sessionStats.totalPoints >= 100) unlockAchievement('points100');
    if (sessionStats.totalPoints >= 500) unlockAchievement('points500');

    // Check for game over (Skipped in Survival mode)
    if (!isSurvivalMode && (player.score >= maxScore || ai.score >= maxScore)) {
        endGame(player.score > ai.score); // true if player won
    }

    // Screen Shake Decay
    if (screenShake > 0) {
        screenShake *= 0.85;
        if (screenShake < 0.5) screenShake = 0;
    }

    // Floating Texts Decay
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y -= 1; // Float up
        ft.alpha -= 0.015; // Fade out
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }
}

function spawnRandomObstacle() {
    let shapeType = Math.random() > 0.5 ? 'rect' : 'circle';
    // Wider horizontal spread for more variety 
    let ox = canvas.width * 0.35 + (Math.random() * (canvas.width * 0.3));
    let oy = canvas.height * 0.1 + (Math.random() * (canvas.height * 0.8));

    // Faster movement for survival feel
    let vx = (Math.random() - 0.5) * 6;
    let vy = (Math.random() - 0.5) * 6;

    if (shapeType === 'rect') {
        const w = 35 + Math.random() * 30;
        const h = 55 + Math.random() * 65;
        obstacles.push({
            shape: 'rect',
            x: ox, y: oy, w: w, h: h,
            vx: vx, vy: vy,
            bounds: { minX: canvas.width * 0.25, maxX: canvas.width * 0.75, minY: 0, maxY: canvas.height },
            glow: false
        });
    } else {
        const r = 25 + Math.random() * 30;
        obstacles.push({
            shape: 'circle',
            x: ox, y: oy, radius: r,
            vx: vx, vy: vy,
            bounds: { minX: canvas.width * 0.25, maxX: canvas.width * 0.75, minY: 0, maxY: canvas.height },
            glow: false
        });
    }
}

function refreshSurvivalObstacles() {
    // SHUFFLE: Remove 2 random obstacles per call to make the terrain change obvious
    for (let i = 0; i < 2; i++) {
        if (obstacles.length > 0) {
            obstacles.splice(Math.floor(Math.random() * obstacles.length), 1);
        }
    }

    // Scale density: 2 at start, +1 per 10 hits, max 7
    let targetCount = Math.min(2 + Math.floor(survivalHits / 10), 7);

    while (obstacles.length < targetCount) {
        spawnRandomObstacle();
    }
}
