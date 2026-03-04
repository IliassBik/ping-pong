// js/state.js
// Game State
let isGameRunning = false;
let isPaused = false;
let isSoundEnabled = true;
let isScreenShakeEnabled = localStorage.getItem('pongScreenShake') !== 'false';

// Persistence
let unlockedAchievements = JSON.parse(localStorage.getItem('pongAchievements')) || {};
let gamesPlayed = parseInt(localStorage.getItem('pongGamesPlayed')) || 0;
let adventureProgress = parseInt(localStorage.getItem('pongAdventureMax')) || 1;
let sessionStats = JSON.parse(localStorage.getItem('pongStats')) || {
    wins: 0,
    losses: 0,
    totalPoints: 0,
    totalHits: 0,
    highestRally: 0,
    gamesPlayed: 0,
    powerUpsCaught: 0,
    timePlayedSeconds: 0,
    perfectGames: 0, // Wins perfectly (opponent 0)
    survivalBestHits: 0,
    adventureLevelsCleared: 0,
    playerXP: 0,
    playerLevel: 1
};
let coins = parseInt(localStorage.getItem('pongCoins')) || 0;
let unlockedEffects = JSON.parse(localStorage.getItem('pongEffects')) || { 'default': true, 'aura_none': true };
let currentEffect = localStorage.getItem('pongCurrentEffect') || 'default';
let currentPaddleAura = localStorage.getItem('pongPaddleAura') || 'aura_none';
let currentTheme = localStorage.getItem('pongTheme') || 'prism';

// Match Stats
let rallyHits = 0;
let maxScore = 5;
let isAdventureMode = false;
let currentAdventureLevel = 1;
let screenShake = 0; // Visual juice magnitude

// Endless Survival Mode
let isSurvivalMode = false;
let survivalHits = 0;
let survivalBestHits = parseInt(localStorage.getItem('pongSurvivalBest')) || 0;

// Menu Selections
let selectedDifficulty = 'medium';
let selectedPaddleSize = 'normal';
let selectedSkinColor = '#00ffcc';
let selectedBallColor = '#ffffff';

// Serve System State
let isServing = false;
let serveTurn = 'player'; // 'player' or 'ai'
let serveTimeoutId = null;

// New Features State
let isTwoPlayer = false;
let ballTrail = []; // Stores {x, y} objects
let obstacles = []; // Array of {x, y, w, h}
let powerUps = []; // Array of {x, y, radius, type, hue}
const POWERUP_TYPES = ['BIG_PADDLE', 'SHRINK_ENEMY', 'FAST_BALL', 'SLOW_BALL'];
let powerUpTimeouts = []; // Track active effects to clear on goal
let floatingTexts = []; // Array of {text, x, y, alpha, color}

// Settings State
let isHighQuality = localStorage.getItem('pongQuality') !== 'false'; // Default TRUE

// Keyboard Configuration State
let controls = JSON.parse(localStorage.getItem('pongControls')) || {
    p1Up: 'KeyW',
    p1Down: 'KeyS',
    p1Serve: 'Space',
    p2Up: 'ArrowUp',
    p2Down: 'ArrowDown',
    p2Serve: 'Enter'
};

// Keyboard Action State (Expanded for 2P)
let p1UpPressed = false;
let p1DownPressed = false;
let p2UpPressed = false;
let p2DownPressed = false;
let paddleHeight = 80;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#00ffcc',
    score: 0,
    speed: 5 // Reduced from 8 for better keyboard maneuverability
};

const ai = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#ff0055',
    score: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 4,
    velocityX: 4,
    velocityY: 4,
    color: '#ffffff',
    lastHitter: 'none' // 'player' or 'ai'
};
