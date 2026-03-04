// js/main.js

function startSurvivalMode() {
    isSurvivalMode = true;
    isAdventureMode = false;
    isTwoPlayer = false;
    survivalHits = 0;

    // AI becomes an unkillable wall
    ai.height = canvas.height;
    ai.y = 0;
    ai.speed = 0;

    // Start Slow for farming coins
    launchGame(); // Ball speed set by launchServe() for survival (always 8)
}

// Game loop
function gameLoop() {
    if (isGameRunning && !isPaused) {
        update();
        render();
    }
    requestAnimationFrame(gameLoop);
}

// Control player paddle with mouse
canvas.addEventListener('mousemove', (e) => {
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;
    let mouseY = e.clientY - rect.top - root.scrollTop;

    // Move paddle and keep it within bounds
    if (isTwoPlayer && isGameRunning) return; // Disable mouse in 2P for balance

    let newY = mouseY - player.height / 2;
    if (newY < 0) {
        newY = 0;
    } else if (newY + player.height > canvas.height) {
        newY = canvas.height - player.height;
    }
    player.y = newY;
});

// Click to serve
canvas.addEventListener('mousedown', () => {
    if (isGameRunning && isServing && serveTurn === 'player') {
        launchServe();
    }
});

// Control player paddle with keyboard
document.addEventListener('keydown', (e) => {
    // Prevent default actions for known mapped keys
    if (Object.values(controls).includes(e.code) || Object.values(controls).includes(e.key)) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.code === 'Space') e.preventDefault();
    }

    // Player 1 Serve
    if (e.code === controls.p1Serve || e.key === controls.p1Serve) {
        if (isGameRunning && isServing && serveTurn === 'player') {
            launchServe();
        }
    }

    // Player 1 Controls
    if (e.code === controls.p1Up || e.key === controls.p1Up) p1UpPressed = true;
    if (e.code === controls.p1Down || e.key === controls.p1Down) p1DownPressed = true;

    // Player 2 Controls
    if (e.code === controls.p2Up || e.key === controls.p2Up) p2UpPressed = true;
    if (e.code === controls.p2Down || e.key === controls.p2Down) p2DownPressed = true;

    // Player 2 Serve
    if (e.code === controls.p2Serve || e.key === controls.p2Serve) {
        if (isGameRunning && isServing && serveTurn === 'ai' && isTwoPlayer) {
            launchServe();
        }
    }

    // Allow closing/opening settings with Escape key
    if (e.key === 'Escape') {
        if (settingsModal.classList.contains('hidden')) {
            openSettings();
        } else {
            closeSettings();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === controls.p1Up || e.key === controls.p1Up) p1UpPressed = false;
    if (e.code === controls.p1Down || e.key === controls.p1Down) p1DownPressed = false;
    if (e.code === controls.p2Up || e.key === controls.p2Up) p2UpPressed = false;
    if (e.code === controls.p2Down || e.key === controls.p2Down) p2DownPressed = false;
});

// Game Over logic
function endGame(playerWon) {
    isGameRunning = false;
    stopMusic();
    btnOpenSettings.classList.add('hidden');

    gamesPlayed++;
    localStorage.setItem('pongGamesPlayed', gamesPlayed);

    // Update Session Stats & Economy
    let xpGained = 0;
    if (playerWon) {
        sessionStats.wins++;
        coins += 20; // Buffed from 10
        xpGained += 50; // Win bonus
    } else {
        sessionStats.losses++;
        // Buffed survival/loss coins
        coins += isSurvivalMode ? Math.floor(survivalHits / 2) : 5;
        xpGained += isSurvivalMode ? survivalHits : 10; // Loss/Survival base XP
        if (!isSurvivalMode && sessionStats.losses === 1) unlockAchievement('firstLoss');
    }

    // Performance XP
    xpGained += (player.score * 5); // 5 XP per point
    xpGained += (sessionStats.highestRally * 2); // 2 XP per rally hit

    // Apply XP and Check Level Up
    sessionStats.playerXP += xpGained;
    let leveledUp = false;
    let requiredXP = getXPRequiredForLevel(sessionStats.playerLevel);

    while (sessionStats.playerLevel < 50 && sessionStats.playerXP >= requiredXP) {
        sessionStats.playerLevel++;
        sessionStats.playerXP -= requiredXP; // Carry over excess XP
        requiredXP = getXPRequiredForLevel(sessionStats.playerLevel);
        leveledUp = true;
    }

    localStorage.setItem('pongStats', JSON.stringify(sessionStats));
    localStorage.setItem('pongCoins', coins);
    if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
    if (typeof updatePlayerProfileUI === 'function') updatePlayerProfileUI();

    // Notify user of Level Up!
    if (leveledUp) {
        playSound('achievement');
        if (typeof showAchievementPopup === 'function') {
            showAchievementPopup(`🎖️ LEVEL UP! You are now Level ${sessionStats.playerLevel}!`);
        }
    }

    checkPersistentAchievements(); // handles veteran at >= 5 games

    if (playerWon) {
        unlockAchievement('firstWin');
        if (ai.score === 0) {
            sessionStats.perfectGames++;
            unlockAchievement('flawless');
            if (selectedDifficulty === 'hard' && !isAdventureMode && !isTwoPlayer) {
                unlockAchievement('flawlessHard');
            }
        }
        if (player.score - ai.score === 1) unlockAchievement('closeCall');

        // Comeback achievement: if AI was 1 point away from winning before player
        if (ai.score === maxScore - 1) {
            unlockAchievement('comeback');
        }

        if (isAdventureMode) {
            sessionStats.adventureLevelsCleared++;
            if (currentAdventureLevel === 5) unlockAchievement('adventure5');
            if (currentAdventureLevel === 10) unlockAchievement('adventure10');
            if (currentAdventureLevel === 20) unlockAchievement('adventure20');
            if (currentAdventureLevel >= 30) unlockAchievement('adventureBoss');

            if (currentAdventureLevel === adventureProgress) {
                adventureProgress++;
                if (adventureProgress >= ADVENTURE_LEVELS.length) {
                    adventureProgress = ADVENTURE_LEVELS.length - 1;
                }
                localStorage.setItem('pongAdventureMax', adventureProgress);
            }
        }
    }

    // Capture Session Time
    if (window._matchStartTime) {
        sessionStats.timePlayedSeconds += Math.floor((Date.now() - window._matchStartTime) / 1000);
    }

    // ----- Show standalone Game Over overlay -----
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const startOverlay = document.getElementById('startOverlay');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverStats = document.getElementById('gameOverStats');
    const btnRetry = document.getElementById('btnRetryGame');
    const btnBack = document.getElementById('btnBackToMenu');

    // Build title and stats.
    if (isSurvivalMode) {
        gameOverTitle.innerText = '💀 SURVIVAL OVER';
        gameOverTitle.style.color = '#ff4466';
        gameOverStats.innerHTML = `
            <div style="font-size:1.6rem; color:var(--primary-color);">HITS: <strong>${survivalHits}</strong></div>
            <div style="color:gold;">🏆 BEST: <strong>${survivalBestHits}</strong></div>
            <div style="margin-top:8px; color:gold; font-size:0.85rem;">+${Math.floor(survivalHits / 2)} COINS</div>
        `;
    } else if (isAdventureMode) {
        gameOverTitle.innerText = playerWon ? `✅ LEVEL ${currentAdventureLevel} CLEAR!` : '❌ LEVEL FAILED';
        gameOverTitle.style.color = playerWon ? 'var(--primary-color)' : '#ff4466';
        gameOverStats.innerHTML = `<div>${playerWon ? 'Excellent! Keep going!' : 'Try again!'}</div>`;
    } else {
        gameOverTitle.innerText = playerWon ? '🏆 YOU WIN!' : '💀 GAME OVER';
        gameOverTitle.style.color = playerWon ? 'gold' : '#ff4466';
        gameOverStats.innerHTML = `
            <div>You: <strong style="color:var(--primary-color)">${player.score}</strong> &nbsp;|&nbsp; AI: <strong>${ai.score}</strong></div>
            <div style="margin-top:8px; color:gold; font-size:0.85rem;">+${playerWon ? 20 : 5} COINS</div>
        `;
    }

    // Show the game-over overlay, keep start overlay hidden.
    if (startOverlay) startOverlay.classList.add('hidden');
    if (gameOverOverlay) gameOverOverlay.classList.remove('hidden');

    // Wire Retry button
    if (btnRetry) {
        btnRetry.onclick = () => {
            if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
            if (isSurvivalMode) startSurvivalMode();
            else if (isAdventureMode) startAdventureLevel(currentAdventureLevel);
            else startGame(isTwoPlayer);
        };
    }

    // Wire Back to Menu button
    if (btnBack) {
        btnBack.onclick = () => {
            if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
            isSurvivalMode = false;
            isAdventureMode = false;
            ai.height = paddleHeight;
            ai.y = canvas.height / 2 - ai.height / 2;
            if (startOverlay) startOverlay.classList.remove('hidden');
            if (typeof updateMenuPreview === 'function') updateMenuPreview();
        };
    }

    // Trigger Cloud Sync automatically after the match is recorded
    if (typeof CloudManager !== 'undefined') {
        CloudManager.sync();
    }
}

// Start a custom game with selected menu settings
function startGame(startAsTwoPlayer = false) {
    isAdventureMode = false;
    isTwoPlayer = startAsTwoPlayer;

    // 1. Set Difficulty (Will be ignored in 2P, but we keep it safe)
    if (selectedDifficulty === 'easy') {
        ai.speed = 3;
    } else if (selectedDifficulty === 'medium') {
        ai.speed = 5;
    } else if (selectedDifficulty === 'hard') {
        ai.speed = 9;
    }

    // 2. Set Paddle Size
    if (selectedPaddleSize === 'small') {
        paddleHeight = 50;
    } else if (selectedPaddleSize === 'normal') {
        paddleHeight = 80;
    } else if (selectedPaddleSize === 'large') {
        paddleHeight = 130;
    }
    player.height = paddleHeight;
    ai.height = paddleHeight;

    // 3. Set Player & Ball Skin
    player.color = selectedSkinColor;
    ball.color = selectedBallColor;

    // 4. Set Winning Score
    maxScore = parseInt(document.getElementById('winScore').value) || 5;
    if (maxScore < 1) maxScore = 1;

    launchGame(); // No speed override — ball starts at default 4
}

// Start a specific adventure level
function startAdventureLevel(levelIndex) {
    isAdventureMode = true;
    isTwoPlayer = false; // Adventure is strictly 1P
    currentAdventureLevel = levelIndex;

    const levelConfig = ADVENTURE_LEVELS[levelIndex];

    ai.speed = levelConfig.aiSpeed;
    player.height = levelConfig.paddleSize;
    ai.height = levelConfig.paddleSize;
    maxScore = levelConfig.score;

    // Skins remain custom for fun
    player.color = selectedSkinColor;
    ball.color = selectedBallColor;

    adventureModal.classList.add('hidden');

    launchGame();
}

// Common game launcher logic
function launchGame() {
    // Clear any lingering powerup timeouts
    if (typeof powerUpTimeouts !== 'undefined') {
        powerUpTimeouts.forEach(id => clearTimeout(id));
        powerUpTimeouts = [];
    }

    // Set Match Start Time for tracking
    window._matchStartTime = Date.now();
    sessionStats.gamesPlayed++;

    // Reset scores & positions
    player.score = 0;
    ai.score = 0;

    if (isSurvivalMode) {
        survivalHits = 0;
        playerScoreEl.innerText = "HITS: 0";
        aiScoreEl.innerText = "BEST: " + survivalBestHits;
        // Keep them visible but labeled
    } else {
        playerScoreEl.innerText = player.score;
        aiScoreEl.innerText = ai.score;
    }

    // Spawn Obstacles (Randomly placed in the middle 50% of the board)
    obstacles = [];
    powerUps = [];

    // Check if we should spawn obstacles based on mode
    let shouldSpawnObstacles = !isAdventureMode && !isSurvivalMode;
    if (isAdventureMode && ADVENTURE_LEVELS[currentAdventureLevel].hasObstacles) {
        shouldSpawnObstacles = true;
    }

    if (shouldSpawnObstacles) {
        let attempts = 0;
        while (obstacles.length < 4 && attempts < 50) {
            attempts++;
            let shapeType = Math.random() > 0.5 ? 'rect' : 'circle';
            // Start roughly in the middle column
            let ox = canvas.width / 2 + (Math.random() - 0.5) * 300;
            // Spread vertically
            let oy = canvas.height * 0.15 + (Math.random() * (canvas.height * 0.7));

            let radiusOrRadiusEquivalent = 40; // Approx max size for spacing checks

            // Check current obstacles to prevent overlaps
            let overlap = false;
            for (let j = 0; j < obstacles.length; j++) {
                let existing = obstacles[j];
                let ex = existing.shape === 'rect' ? existing.x + existing.w / 2 : existing.x;
                let ey = existing.shape === 'rect' ? existing.y + existing.h / 2 : existing.y;
                let nx = shapeType === 'rect' ? ox + 20 : ox; // rough center
                let ny = shapeType === 'rect' ? oy + 35 : oy; // rough center

                let dist = Math.sqrt(Math.pow(ex - nx, 2) + Math.pow(ey - ny, 2));
                if (dist < 100) { // Keep them at least 100px apart
                    overlap = true;
                    break;
                }
            }
            if (overlap) continue;

            // Movement: 50% static, otherwise horizontal or vertical
            let vx = 0; let vy = 0;
            if (Math.random() > 0.5) {
                if (Math.random() > 0.5) {
                    vy = (Math.random() > 0.5 ? 2.5 : -2.5); // Vertical mover
                } else {
                    vx = (Math.random() > 0.5 ? 2.5 : -2.5); // Horizontal mover
                }
            }

            if (shapeType === 'rect') {
                obstacles.push({
                    shape: 'rect',
                    x: ox, y: oy,
                    w: 30 + Math.random() * 20,
                    h: 50 + Math.random() * 50,
                    vx: vx, vy: vy,
                    bounds: {
                        minY: 20, maxY: canvas.height - 20,
                        minX: canvas.width * 0.2, maxX: canvas.width * 0.8
                    },
                    glow: false
                });
            } else {
                obstacles.push({
                    shape: 'circle',
                    x: ox, y: oy,
                    radius: 20 + Math.random() * 25,
                    vx: vx, vy: vy,
                    bounds: {
                        minY: 40, maxY: canvas.height - 40,
                        minX: canvas.width * 0.2, maxX: canvas.width * 0.8
                    },
                    glow: false
                });
            }
        }
    }

    // Special: Survival mode starts with 2 dynamic obstacles
    if (isSurvivalMode) {
        obstacles = [];
        if (typeof spawnRandomObstacle === 'function') {
            spawnRandomObstacle();
            spawnRandomObstacle();
        }
    }

    player.y = canvas.height / 2 - player.height / 2;
    if (!isSurvivalMode) {
        ai.y = canvas.height / 2 - ai.height / 2;
    }

    if (serveTimeoutId) clearTimeout(serveTimeoutId);

    // Reset ball explicitly logic
    resetBall('player');

    playSound('uiClick');
    isGameRunning = true;
    isPaused = false;
    startMusic();
    // Hide both overlays when game starts
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');
    btnOpenSettings.classList.remove('hidden');

    // Show score display
    document.querySelector('.score-display').classList.remove('hidden');
}

btnStartGame.addEventListener('mouseenter', () => playSound('uiHover'));
btnStartGame.addEventListener('click', () => {
    // If returning to the menu from a failed/won match, the "Restart" button
    // needs to start custom/adventure/survival based on context state.
    if (isAdventureMode) {
        startAdventureLevel(currentAdventureLevel);
    } else if (isSurvivalMode) {
        startSurvivalMode();
    } else {
        startGame(isTwoPlayer); // Restart with same 1P or 2P state (no speed override)
    }
});

btnStartTwoPlayer.addEventListener('mouseenter', () => playSound('uiHover'));
btnStartTwoPlayer.addEventListener('click', () => {
    startGame(true);
});

// Initial render calculation based on default paddle size
player.y = canvas.height / 2 - player.height / 2;
ai.y = canvas.height / 2 - ai.height / 2;

// Initial render
render();
requestAnimationFrame(gameLoop);
