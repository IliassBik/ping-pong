// js/ui.js

// Achievement Logic
function checkPersistentAchievements() {
    // Basic persistent checks can go here
    if (gamesPlayed >= 5) unlockAchievement('veteran');
}

function unlockAchievement(id) {
    if (!unlockedAchievements[id]) {
        unlockedAchievements[id] = true;
        localStorage.setItem('pongAchievements', JSON.stringify(unlockedAchievements));

        playSound('achievement');

        const ach = ALL_ACHIEVEMENTS[id];
        let popupText = `${ach.icon} ${ach.title}!`;

        let rewardText = '';
        if (ach.rewardItem) {
            unlockedEffects[ach.rewardItem] = true;
            localStorage.setItem('pongEffects', JSON.stringify(unlockedEffects));

            const rewardObj = STORE_ITEMS.find(i => i.id === ach.rewardItem);
            if (rewardObj) rewardText = `<br><span style="color:var(--primary-color); font-size:0.7rem;">+🎁 Unlocked: ${rewardObj.name}</span>`;

            // Re-render store if open
            if (!storeModal.classList.contains('hidden')) renderStoreItems();
        }

        showAchievementPopup(popupText + rewardText);

        // Reward coins for achievement
        coins += 25;
        localStorage.setItem('pongCoins', coins);
        updateCoinDisplay();
        // Initial setup calls
        // updateStatsUI(); // Assuming this is called elsewhere or not in this snippet
        updatePlayerProfileUI();
        // Refresh UI if open
        renderAchievementsList();
    }
}

function showAchievementPopup(htmlText) {
    achievementDescEl.innerHTML = htmlText;
    achievementPopup.classList.remove('hidden');

    // Hide popup after 3 seconds
    setTimeout(() => {
        achievementPopup.classList.add('hidden');
    }, 3000);
}

// Achievements UI Menu
function renderAchievementsList() {
    achievementsListEl.innerHTML = '';

    for (const [id, ach] of Object.entries(ALL_ACHIEVEMENTS)) {
        const isUnlocked = unlockedAchievements[id] === true;
        const item = document.createElement('div');
        item.className = `ach-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
            <div class="ach-icon-large">${isUnlocked ? ach.icon : '🔒'}</div>
            <div class="ach-info">
                <h3>${ach.title}</h3>
                <p>${isUnlocked ? ach.desc : 'Secret achievement... keep playing!'}</p>
            </div>
        `;
        achievementsListEl.appendChild(item);
    }
}

// Skins UI Grid Setup
function updatePlayerProfileUI() {
    const badgeLevelNum = document.getElementById('badgeLevelNum');
    const badgeTitle = document.getElementById('badgeTitle');
    const badgeXpFill = document.getElementById('badgeXpFill');

    if (!badgeLevelNum) return;

    const currentLevel = sessionStats.playerLevel || 1;
    const currentXP = sessionStats.playerXP || 0;
    const requiredXP = getXPRequiredForLevel(currentLevel);

    // Find highest earned title
    let titleObj = PLAYER_TITLES[0];
    for (let i = PLAYER_TITLES.length - 1; i >= 0; i--) {
        if (currentLevel >= PLAYER_TITLES[i].level) {
            titleObj = PLAYER_TITLES[i];
            break;
        }
    }

    // Update UI Elements
    badgeLevelNum.innerText = currentLevel;
    badgeTitle.innerText = titleObj.title;
    badgeTitle.style.color = titleObj.color;

    // Calculate progress percentage
    const fillPercent = Math.min(100, Math.max(0, (currentXP / requiredXP) * 100));
    badgeXpFill.style.width = `${fillPercent}%`;
    badgeXpFill.style.background = titleObj.color;
    badgeXpFill.style.boxShadow = `0 0 8px ${titleObj.color}`;

    // Explicit text readout
    const badgeXpText = document.getElementById('badgeXpText');
    if (badgeXpText) {
        badgeXpText.innerText = `${currentXP} / ${requiredXP} XP`;
    }
}

function setupSkinsGrid(containerId, isPaddle) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    PRESET_COLORS.forEach(color => {
        const btn = document.createElement('div');
        btn.className = 'skin-cell';
        btn.style.backgroundColor = color;
        btn.style.boxShadow = `0 0 10px ${color}`;
        btn.dataset.color = color;

        // Default Selections
        if (isPaddle && color === selectedSkinColor) btn.classList.add('selected');
        if (!isPaddle && color === selectedBallColor) btn.classList.add('selected');

        btn.addEventListener('mouseenter', () => playSound('uiHover'));
        btn.addEventListener('click', (e) => {
            playSound('uiClick');

            // visually clear other selections in this specific grid
            Array.from(container.children).forEach(child => child.classList.remove('selected'));
            btn.classList.add('selected');

            if (isPaddle) {
                selectedSkinColor = color;
                player.color = color;
            } else {
                selectedBallColor = color;
                ball.color = color;
            }
        });

        container.appendChild(btn);
    });
}
setupSkinsGrid('paddleSkinsGrid', true);
setupSkinsGrid('ballSkinsGrid', false);

// Adventure UI
function openAdventureModal() {
    adventureGrid.innerHTML = '';

    for (let i = 1; i < ADVENTURE_LEVELS.length; i++) {
        const level = ADVENTURE_LEVELS[i];
        const isUnlocked = i <= adventureProgress;

        const btn = document.createElement('div');
        btn.className = `level-card ${isUnlocked ? '' : 'locked'}`;
        btn.innerHTML = `
            <div class="level-num">${i}</div>
            <div class="level-name">${level.name}</div>
        `;

        if (isUnlocked) {
            btn.addEventListener('mouseenter', () => playSound('uiHover'));
            btn.addEventListener('click', () => {
                playSound('uiClick');
                startAdventureLevel(i);
            });
        }

        adventureGrid.appendChild(btn);
    }

    // Show the modal
    adventureModal.classList.remove('hidden');
}

// Themes UI Logic
const btnShowThemes = document.getElementById('btnShowThemes');
const btnCloseThemes = document.getElementById('btnCloseThemes');
const themesModal = document.getElementById('themesModal');
const themeCards = document.querySelectorAll('.theme-card');

function applyTheme(themeId) {
    // Remove all theme classes first
    document.body.classList.remove('theme-prism', 'theme-retro', 'theme-jungle');
    // Add new theme class
    document.body.classList.add(`theme-${themeId}`);

    currentTheme = themeId;
    localStorage.setItem('pongTheme', themeId);

    // Update theme cards UI
    themeCards.forEach(card => {
        if (card.dataset.theme === themeId) {
            card.style.borderColor = 'var(--primary-color)';
            card.style.background = 'rgba(255,255,255,0.1)';
        } else {
            card.style.borderColor = '#555';
            card.style.background = 'rgba(255,255,255,0.05)';
        }
    });

    // Immediately redraw the canvas menu preview so background updates without needing to play
    if (typeof updateMenuPreview === 'function' && !isGameRunning) {
        updateMenuPreview();
    }
}

if (btnShowThemes) {
    btnShowThemes.addEventListener('click', () => {
        playSound('uiClick');
        themesModal.classList.remove('hidden');
    });
}

if (btnCloseThemes) {
    btnCloseThemes.addEventListener('click', () => {
        playSound('uiClick');
        themesModal.classList.add('hidden');
    });
}

themeCards.forEach(card => {
    card.addEventListener('mouseenter', () => playSound('uiHover'));
    card.addEventListener('click', () => {
        playSound('uiClick');
        applyTheme(card.dataset.theme);
    });
});


// Initial theme application
applyTheme(currentTheme);

function showLevelBriefing(levelIndex) {
    const config = ADVENTURE_LEVELS[levelIndex];


    document.getElementById('briefingTitle').innerText = `Level ${levelIndex}`;
    document.getElementById('briefingSubtitle').innerText = config.name.split(': ')[1] || config.name;
    document.getElementById('briefingObjective').innerText = `First to ${config.score} Points`;
    document.getElementById('briefingModifier').innerText = config.desc;

    // Store selected level on the start button
    const startBtn = document.getElementById('btnStartBriefingLevel');
    startBtn.onclick = () => {
        playSound('uiClick');
        document.getElementById('briefingModal').classList.add('hidden');
        adventureModal.classList.add('hidden');
        startAdventureLevel(levelIndex);
    };

    document.getElementById('briefingModal').classList.remove('hidden');
}

document.getElementById('btnCancelBriefing').addEventListener('click', () => {
    playSound('uiClick');
    document.getElementById('briefingModal').classList.add('hidden');
});

// Settings / Pause Logic
function openSettings() {
    if (isGameRunning) {
        isPaused = true;
        document.querySelector('#settingsModal h2').innerText = "Settings (Paused)";
        document.getElementById('btnResumeGame').innerText = "RESUME GAME";
        document.getElementById('btnExitGame').style.display = 'block';
    } else {
        document.querySelector('#settingsModal h2').innerText = "Settings";
        document.getElementById('btnResumeGame').innerText = "CLOSE";
        document.getElementById('btnExitGame').style.display = 'none';
    }
    settingsModal.classList.remove('hidden');

    // Refresh modal states
    updateQualityUI();
    updateControlsUI();
    selectResolution.value = `${canvas.width}x${canvas.height}`;

    stopMusic();
}

function closeSettings() {
    if (isGameRunning) {
        isPaused = false;
    }
    settingsModal.classList.add('hidden');
    if (isMusicEnabled && isGameRunning) {
        startMusic();
    }
}

function quitToMenu() {
    isGameRunning = false;
    isPaused = false;
    isSurvivalMode = false; // Bug fix: reset survival mode so menu renders correctly
    isAdventureMode = false;
    settingsModal.classList.add('hidden');
    btnOpenSettings.classList.add('hidden');

    // Clear lingering timeouts
    if (typeof powerUpTimeouts !== 'undefined') {
        powerUpTimeouts.forEach(id => clearTimeout(id));
        powerUpTimeouts = [];
    }

    // Reset both paddles back to user-selected menu height
    player.height = paddleHeight;
    player.y = canvas.height / 2 - player.height / 2;
    ai.height = paddleHeight;
    ai.y = canvas.height / 2 - ai.height / 2;

    // Reset score display text to 0 (fixes HITS/BEST lingering from survival mode)
    if (playerScoreEl) playerScoreEl.innerText = '0';
    if (aiScoreEl) aiScoreEl.innerText = '0';

    // Reset overlay to standard look
    document.querySelector('.overlay h1').innerText = "Prism Pong";
    document.getElementById('btnStartGame').innerText = "CUSTOM";
    document.getElementById('startOverlay').classList.remove('hidden');
    document.getElementById('gameOverOverlay').classList.add('hidden');

    // Hide score display
    document.querySelector('.score-display').classList.add('hidden');

    // Reset simple render hook so they see menu behind cleanly
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scoreDisp = document.querySelector('.score-display');
    if (scoreDisp) scoreDisp.classList.add('hidden');

    updateMenuPreview();
}

// Live canvas background preview (called when paddle size changes)
function updateMenuPreview() {
    if (isGameRunning) return; // Don't mess with live game

    // Determine preview paddle height from current selection
    let previewH = paddleHeight;
    if (selectedPaddleSize === 'small') previewH = 50;
    else if (selectedPaddleSize === 'normal') previewH = 80;
    else if (selectedPaddleSize === 'large') previewH = 130;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();

    let py = canvas.height / 2 - previewH / 2;
    // Use temp objects so we don't mutate real paddles
    const tempPlayer = { ...player, y: py, height: previewH };
    const tempAi = { ...ai, y: py, height: previewH };
    drawCrystalPaddle(tempPlayer);
    drawCrystalPaddle(tempAi);
}

// Wire paddle buttons to live-update the canvas preview
document.getElementById('paddleSmall').addEventListener('click', () => { selectedPaddleSize = 'small'; updateMenuPreview(); });
document.getElementById('paddleNormal').addEventListener('click', () => { selectedPaddleSize = 'normal'; updateMenuPreview(); });
document.getElementById('paddleLarge').addEventListener('click', () => { selectedPaddleSize = 'large'; updateMenuPreview(); });

// (Initialization runs at the bottom of this file)

// Event Listeners (UI bindings)
document.getElementById('btnShowAchievements').addEventListener('click', () => {
    playSound('uiClick');
    renderAchievementsList();
    achievementsModal.classList.remove('hidden');
});

document.getElementById('btnCloseAchievements').addEventListener('click', () => {
    playSound('uiClick');
    achievementsModal.classList.add('hidden');
});

// Legacy stats removed to favor the new dynamic generator below

btnCloseStats.addEventListener('click', () => {
    playSound('uiClick');
    statsModal.classList.add('hidden');
});

// Adventure Mode UI
document.getElementById('btnShowSkins').addEventListener('click', () => {
    playSound('uiClick');
    document.getElementById('skinsModal').classList.remove('hidden');
});

document.getElementById('btnCloseSkins').addEventListener('click', () => {
    playSound('uiClick');
    document.getElementById('skinsModal').classList.add('hidden');
});

// Economy / Store UI
function updateCoinDisplay() {
    if (coinCountEl) {
        // Simple scale effect on change
        if (coinCountEl.innerText !== String(coins)) {
            coinCountEl.style.transform = 'scale(1.2)';
            coinCountEl.style.color = 'gold';
            setTimeout(() => {
                coinCountEl.style.transform = 'scale(1)';
                coinCountEl.style.color = '';
            }, 200);
        }
        coinCountEl.innerText = coins;
    }
    if (storeCoinCountEl) storeCoinCountEl.innerText = coins;

    // IMPORTANT: Refresh store buttons if store is open
    if (storeModal && !storeModal.classList.contains('hidden')) {
        renderStoreItems();
    }
}

let currentShopTab = 'ball';

window.switchShopTab = function (tab) {
    currentShopTab = tab;
    // Update tab UI
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(t => {
        const onClickAttr = t.getAttribute('onclick') || "";
        if (onClickAttr.includes(`'${tab}'`)) t.classList.add('active');
        else t.classList.remove('active');
    });
    renderStoreItems();
};

function renderStoreItems() {
    const storeGrid = document.getElementById('storeGrid');
    if (!storeGrid) return;
    storeGrid.innerHTML = '';

    const filteredItems = STORE_ITEMS.filter(item => item.category === currentShopTab);

    filteredItems.forEach(item => {
        const isUnlocked = unlockedEffects[item.id] || item.cost === 0;
        const currentEquipped = (item.category === 'paddle') ? currentPaddleAura : currentEffect;
        const isEquipped = (currentEquipped === item.id);
        const canAfford = Number(coins) >= item.cost;

        const card = document.createElement('div');
        card.className = `shop-item ${item.rarity} ${isEquipped ? 'equipped' : ''}`;

        let buttonHTML = '';
        if (isEquipped) {
            buttonHTML = `<button class="shop-btn btn-equipped" disabled>EQUIPPED</button>`;
        } else if (isUnlocked) {
            buttonHTML = `<button class="shop-btn btn-equip" onclick="equipEffect('${item.id}', '${item.category}')">EQUIP</button>`;
        } else if (item.cost === 'reward') {
            buttonHTML = `<button class="shop-btn" disabled style="background: rgba(0,0,0,0.8); color: #888; border: 1px dashed #555; text-shadow: none;">LOCKED (ACHIEVEMENT)</button>`;
        } else {
            buttonHTML = `<button class="shop-btn btn-buy" ${!canAfford ? 'disabled' : ''} onclick="buyEffect('${item.id}', ${item.cost}, '${item.category}')">BUY ${item.cost}</button>`;
        }

        card.innerHTML = `
            <div class="item-rarity-tag tag-${item.rarity}">${item.rarity}</div>
            <div class="item-icon-wrapper">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.desc}</div>
            ${buttonHTML}
        `;

        storeGrid.appendChild(card);
    });
}

window.buyEffect = function (id, cost, category) {
    const currentCoins = Number(coins);
    const itemCost = Number(cost);

    if (currentCoins >= itemCost) {
        playSound('scorePlayer');
        coins -= itemCost;
        unlockedEffects[id] = true;

        localStorage.setItem('pongCoins', coins);
        localStorage.setItem('pongEffects', JSON.stringify(unlockedEffects));

        updateCoinDisplay();
        equipEffect(id, category);

        if (typeof CloudManager !== 'undefined') CloudManager.sync();
    } else {
        playSound('wallHit');
    }
};

window.equipEffect = function (id, category) {
    playSound('uiClick');
    if (category === 'paddle') {
        currentPaddleAura = id;
        localStorage.setItem('pongPaddleAura', id);
    } else {
        currentEffect = id;
        localStorage.setItem('pongCurrentEffect', id);
    }
    renderStoreItems();
};

if (btnShowStore) {
    btnShowStore.addEventListener('click', () => {
        playSound('uiClick');
        updateCoinDisplay();
        renderStoreItems();
        storeModal.classList.remove('hidden');
    });
}
if (btnCloseStore) {
    btnCloseStore.addEventListener('click', () => {
        playSound('uiClick');
        storeModal.classList.add('hidden');
        updateCoinDisplay(); // Reflect anywhere else
    });
}

if (btnStartAdventure) {
    btnStartAdventure.addEventListener('mouseenter', () => playSound('uiHover'));
    btnStartAdventure.addEventListener('click', () => {
        playSound('uiClick');
        openAdventureModal();
    });
}

if (btnStartSurvival) {
    btnStartSurvival.addEventListener('mouseenter', () => playSound('uiHover'));
    btnStartSurvival.addEventListener('click', () => {
        playSound('uiClick');
        startSurvivalMode();
    });
}

document.getElementById('btnCloseAdventure').addEventListener('click', () => {
    playSound('uiClick');
    adventureModal.classList.add('hidden');
});

btnOpenSettings.addEventListener('click', openSettings);
btnMenuSettings.addEventListener('click', openSettings);
document.getElementById('btnResumeGame').addEventListener('click', closeSettings);
document.getElementById('btnExitGame').addEventListener('click', quitToMenu);

// Setup difficulty buttons
const diffButtons = {
    'btnEasy': 'easy',
    'btnMedium': 'medium',
    'btnHard': 'hard'
};

for (const [btnId, level] of Object.entries(diffButtons)) {
    const btn = document.getElementById(btnId);
    btn.addEventListener('mouseenter', () => playSound('uiHover'));
    btn.addEventListener('click', (e) => {
        playSound('uiClick');
        Object.keys(diffButtons).forEach(id => document.getElementById(id).classList.remove('selected'));
        e.target.classList.add('selected');
        selectedDifficulty = level;
    });
}

// Setup paddle size buttons
const paddleButtons = {
    'paddleSmall': 'small',
    'paddleNormal': 'normal',
    'paddleLarge': 'large'
};

for (const [btnId, size] of Object.entries(paddleButtons)) {
    const btn = document.getElementById(btnId);
    btn.addEventListener('mouseenter', () => playSound('uiHover'));
    btn.addEventListener('click', (e) => {
        playSound('uiClick');
        Object.keys(paddleButtons).forEach(id => document.getElementById(id).classList.remove('selected'));
        e.target.classList.add('selected');
        selectedPaddleSize = size;
    });
}

// Sound Toggle
if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        btnToggleSound.innerText = isSoundEnabled ? "SOUND: ON" : "SOUND: OFF";
        if (isSoundEnabled) btnToggleSound.classList.add('selected');
        else btnToggleSound.classList.remove('selected');
        localStorage.setItem('pongSound', isSoundEnabled);
        playSound('uiClick');
    });
}

if (btnToggleMusic) {
    btnToggleMusic.addEventListener('click', () => {
        isMusicEnabled = !isMusicEnabled;
        btnToggleMusic.innerText = isMusicEnabled ? "MUSIC: ON" : "MUSIC: OFF";
        if (isMusicEnabled) {
            btnToggleMusic.classList.add('selected');
            if (isGameRunning) playMusic(currentTheme);
        } else {
            btnToggleMusic.classList.remove('selected');
            stopMusic();
        }
        localStorage.setItem('pongMusic', isMusicEnabled);
        playSound('uiClick');
    });
}

if (btnToggleShake) {
    // Initial State Setup
    btnToggleShake.innerText = isScreenShakeEnabled ? "SHAKE: ON" : "SHAKE: OFF";
    if (isScreenShakeEnabled) btnToggleShake.classList.add('selected');
    else btnToggleShake.classList.remove('selected');

    btnToggleShake.addEventListener('click', () => {
        isScreenShakeEnabled = !isScreenShakeEnabled;
        btnToggleShake.innerText = isScreenShakeEnabled ? "SHAKE: ON" : "SHAKE: OFF";
        if (isScreenShakeEnabled) btnToggleShake.classList.add('selected');
        else btnToggleShake.classList.remove('selected');
        localStorage.setItem('pongScreenShake', isScreenShakeEnabled);
        playSound('uiClick');
    });
}
// Quality Toggle
function updateQualityUI() {
    btnToggleQuality.innerText = isHighQuality ? "QUALITY: HIGH" : "QUALITY: LOW";
    if (isHighQuality) btnToggleQuality.classList.add('selected');
    else btnToggleQuality.classList.remove('selected');
}

btnToggleQuality.addEventListener('click', () => {
    isHighQuality = !isHighQuality;
    localStorage.setItem('pongQuality', isHighQuality);
    updateQualityUI();
    playSound('uiClick');
});

// Canvas Resize Logic
function resizeCanvas() {
    // Make canvas fill the window natively
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Calculate scale ratio relative to design baseline (1280x720)
    scaleX = canvas.width / 1280;
    scaleY = canvas.height / 720;

    // Scale paddle and ball base dimensions
    paddleWidth = Math.max(10, 15 * scaleX);
    ballRadius = Math.max(5, 8 * scaleX);
    netWidth = Math.max(1, 2 * scaleX);

    // Apply scaling to Paddle definitions safely
    player.width = paddleWidth;
    ai.width = paddleWidth;
    ball.radius = ballRadius;

    // Re-anchor AI x-coordinate
    ai.x = canvas.width - paddleWidth - (10 * scaleX);

    // Ensure paddles remain inside new vertical bounds
    if (player.y + player.height > canvas.height) player.y = Math.max(0, canvas.height - player.height);
    if (ai.y + ai.height > canvas.height) ai.y = Math.max(0, canvas.height - ai.height);

    // Auto-update preview rendering
    if (!isGameRunning && typeof updateMenuPreview === 'function') {
        updateMenuPreview();
    }

    // Handle Mobile Portrait Rotation Warning
    const rotateOverlay = document.getElementById('rotateOverlay');
    if (rotateOverlay) {
        // If device is portrait and on a mobile sized screen
        if (window.innerHeight > window.innerWidth && window.innerWidth <= 1024) {
            rotateOverlay.classList.remove('hidden');
            if (isGameRunning && !isPaused) {
                isPaused = true;
                if (settingsModal.classList.contains('hidden')) {
                    openSettings(); // force settings menu open so game doesn't resume blindly
                }
            }
        } else {
            rotateOverlay.classList.add('hidden');
        }
    }
}
window.addEventListener('resize', resizeCanvas);

// Keyboard Settings (Rebinds)
const bindingButtons = {
    'btnBindP1Up': { player: 'p1', action: 'Up' },
    'btnBindP1Down': { player: 'p1', action: 'Down' },
    'btnBindP1Serve': { player: 'p1', action: 'Serve' },
    'btnBindP2Up': { player: 'p2', action: 'Up' },
    'btnBindP2Down': { player: 'p2', action: 'Down' },
    'btnBindP2Serve': { player: 'p2', action: 'Serve' }
};

let activeRebindKey = null;

function updateControlsUI() {
    for (let btnId in bindingButtons) {
        let conf = bindingButtons[btnId];
        let key = controls[conf.player + conf.action];
        // Format display name
        let displayKey = key.replace('Key', '').replace('Arrow', '');
        if (key === 'Space') displayKey = 'Space';

        let actionName = conf.action.toUpperCase();
        document.getElementById(btnId).innerText = `${actionName}: ${displayKey}`;
    }
}

for (let btnId in bindingButtons) {
    let btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
        playSound('uiClick');
        if (activeRebindKey) return; // Prevent multiple rebinds at once

        activeRebindKey = bindingButtons[btnId];
        btn.innerText = "PRESS KEY...";
        btn.classList.add('selected');

        // One-time listener for the next key
        const rebindListener = (e) => {
            e.preventDefault();

            // Save new binding
            controls[activeRebindKey.player + activeRebindKey.action] = e.code;
            localStorage.setItem('pongControls', JSON.stringify(controls));

            // Clean up
            btn.classList.remove('selected');
            activeRebindKey = null;
            updateControlsUI();

            document.removeEventListener('keydown', rebindListener);
        };

        // Use a slight timeout so the immediate click doesn't trigger anything weird
        setTimeout(() => {
            document.addEventListener('keydown', rebindListener);
        }, 100);
    });
}

if (btnShowStats) {
    btnShowStats.addEventListener('click', () => {
        playSound('uiClick');

        // Calculate dynamic stats
        const totalMatches = sessionStats.wins + sessionStats.losses;
        const winRate = totalMatches > 0 ? Math.round((sessionStats.wins / totalMatches) * 100) : 0;

        // Format Play Time into Hours/Mins
        const seconds = sessionStats.timePlayedSeconds || 0;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const statsContent = document.getElementById('statsContent');
        statsContent.innerHTML = `
            <div style="width: 100%; text-align: left;">
                
                <h3 style="color: var(--primary-color); font-size: 0.8rem; font-family: 'Press Start 2P'; margin: 0 0 15px 0; text-align: left; border-bottom: 1px solid rgba(0,229,255,0.3); padding-bottom: 8px;">MATCH RECORD</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 25px;">
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">GAMES PLAYED</span>
                        <span style="font-size: 1.5rem; color: #fff; font-weight: bold; text-shadow: 0 0 10px rgba(255,255,255,0.3);">${gamesPlayed}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">WIN RATE</span>
                        <span style="font-size: 1.5rem; color: ${winRate >= 50 ? '#00ffcc' : '#ff4466'}; font-weight: bold; text-shadow: 0 0 10px ${winRate >= 50 ? 'rgba(0,255,204,0.3)' : 'rgba(255,68,102,0.3)'};">${winRate}%</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">WINS / LOSSES</span>
                        <span style="font-size: 1.5rem; color: #fff; font-weight: bold;"><span style="color:#00ffcc">${sessionStats.wins}</span><span style="color:#555; margin: 0 5px;">/</span><span style="color:#ff4466">${sessionStats.losses}</span></span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">FLAWLESS WINS</span>
                        <span style="font-size: 1.5rem; color: gold; font-weight: bold; text-shadow: 0 0 10px rgba(255,215,0,0.4);">${sessionStats.perfectGames || 0}</span>
                    </div>
                </div>

                <h3 style="color: var(--primary-color); font-size: 0.8rem; font-family: 'Press Start 2P'; margin: 0 0 15px 0; text-align: left; border-bottom: 1px solid rgba(0,229,255,0.3); padding-bottom: 8px;">PERFORMANCE</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 25px;">
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">TOTAL POINTS</span>
                        <span style="font-size: 1.5rem; color: #fff; font-weight: bold;">${sessionStats.totalPoints}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">HIGHEST RALLY</span>
                        <span style="font-size: 1.5rem; color: #ff00ff; font-weight: bold; text-shadow: 0 0 10px rgba(255,0,255,0.3);">${sessionStats.highestRally}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">BALL HITS</span>
                        <span style="font-size: 1.5rem; color: #fff; font-weight: bold;">${sessionStats.totalHits || 0}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.7rem; color: #aaa; margin-bottom: 8px; letter-spacing: 1px;">POWER-UPS</span>
                        <span style="font-size: 1.5rem; color: #00e5ff; font-weight: bold; text-shadow: 0 0 10px rgba(0,229,255,0.3);">${sessionStats.powerUpsCaught || 0}</span>
                    </div>
                </div>

                <h3 style="color: var(--primary-color); font-size: 0.8rem; font-family: 'Press Start 2P'; margin: 0 0 15px 0; text-align: left; border-bottom: 1px solid rgba(0,229,255,0.3); padding-bottom: 8px;">CAREER</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.6rem; color: #aaa; margin-bottom: 6px; text-align: center; letter-spacing: 1px;">TIME</span>
                        <span style="font-size: 1.2rem; color: #fff; font-weight: bold;">${timeString}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.6rem; color: #aaa; margin-bottom: 6px; text-align: center; letter-spacing: 1px;">SURVIVAL MAX</span>
                        <span style="font-size: 1.2rem; color: #ff4466; font-weight: bold;">${survivalBestHits || 0}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="font-size: 0.6rem; color: #aaa; margin-bottom: 6px; text-align: center; letter-spacing: 1px;">ADV LEVEL</span>
                        <span style="font-size: 1.2rem; color: #8e2de2; font-weight: bold;">${adventureProgress}</span>
                    </div>
                </div>
            </div>
        `;
        statsModal.classList.remove('hidden');
    });
}

// Help Modal Logic
const btnShowHelp = document.getElementById('btnShowHelp');
const btnCloseHelp = document.getElementById('btnCloseHelp');
const helpModal = document.getElementById('helpModal');

if (btnShowHelp) {
    btnShowHelp.addEventListener('click', () => {
        playSound('uiClick');
        helpModal.classList.remove('hidden');
    });
}
if (btnCloseHelp) {
    btnCloseHelp.addEventListener('click', () => {
        playSound('uiClick');
        helpModal.classList.add('hidden');
    });
}

// Attach hover and click sounds to main UI buttons generically
[
    // Note: btnOpenSettings excluded — it already has listeners attached above
    btnMenuSettings,
    document.getElementById('btnResumeGame'),
    document.getElementById('btnExitGame'),
    document.getElementById('btnCloseAchievements'),
    document.getElementById('btnShowAchievements'),
    document.getElementById('btnCloseSkins'),
    document.getElementById('btnShowSkins'),
    btnShowHelp, btnCloseHelp
].forEach(btn => {
    if (btn) {
        btn.addEventListener('mouseenter', () => playSound('uiHover'));
        btn.addEventListener('click', () => playSound('uiClick'));
    }
});

// Cloud Save UI Handlers
const syncIcon = document.getElementById('syncIcon');
window.showSyncIcon = function () {
    if (syncIcon) syncIcon.classList.remove('hidden');
};
window.hideSyncIcon = function () {
    if (syncIcon) syncIcon.classList.add('hidden');
};

const btnGenerateCode = document.getElementById('btnGenerateCode');
const btnRestoreCode = document.getElementById('btnRestoreCode');

if (btnGenerateCode) {
    btnGenerateCode.addEventListener('mouseenter', () => playSound('uiHover'));
    btnGenerateCode.addEventListener('click', () => {
        playSound('uiClick');
        const code = CloudManager.generateTransferCode();
        prompt("Copy this transfer code to backup your profile securely (Do not lose it!):", code);
    });
}

if (btnRestoreCode) {
    btnRestoreCode.addEventListener('mouseenter', () => playSound('uiHover'));
    btnRestoreCode.addEventListener('click', () => {
        playSound('uiClick');
        const code = prompt("Paste your profile transfer code here to restore your save:");
        if (code) {
            const result = CloudManager.restoreFromTransferCode(code);
            alert(result.message);
            if (result.success) {
                if (typeof updateMenuPreview === 'function') updateMenuPreview();
            }
        }
    });
}

// Draw the initial menu canvas preview
updateMenuPreview();
