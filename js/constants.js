// js/constants.js
// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const overlay = document.getElementById('startOverlay');
const achievementsModal = document.getElementById('achievementsModal');
const statsModal = document.getElementById('statsModal');
const btnShowStats = document.getElementById('btnShowStats');
const btnCloseStats = document.getElementById('btnCloseStats');
const achievementDescEl = document.getElementById('achievementDesc');
const achievementPopup = document.getElementById('achievementPopup');

const btnToggleSound = document.getElementById('btnToggleSound');
const btnToggleMusic = document.getElementById('btnToggleMusic');
const btnToggleShake = document.getElementById('btnToggleShake');
const btnToggleQuality = document.getElementById('btnToggleQuality');
const selectResolution = document.getElementById('selectResolution');
const settingsModal = document.getElementById('settingsModal');
const skinsModal = document.getElementById('skinsModal');
const achievementsListEl = document.getElementById('achievementsList');

const btnStartGame = document.getElementById('btnStartGame');
const btnStartTwoPlayer = document.getElementById('btnStartTwoPlayer');
const btnStartAdventure = document.getElementById('btnStartAdventure');
const btnStartSurvival = document.getElementById('btnStartSurvival');
const adventureModal = document.getElementById('adventureModal');
const adventureGrid = document.getElementById('adventureGrid');

// Economy & Store Elements
const coinCountEl = document.getElementById('coinCount');
const storeCoinCountEl = document.getElementById('storeCoinCount');
const btnShowStore = document.getElementById('btnShowStore');
const btnCloseStore = document.getElementById('btnCloseStore');
const storeModal = document.getElementById('storeModal');
const storeEffectsList = document.getElementById('storeEffectsList');

// Game object dimensions
const paddleWidth = 15;
const ballRadius = 8;
const netWidth = 2;

// Definitions
const ALL_ACHIEVEMENTS = {
    // Basic Milestones (Bronze)
    firstPoint: { title: "First Blood", desc: "Score your very first point.", icon: "🩸", rewardItem: 'blood' },
    firstWin: { title: "Champion", desc: "Win your first game.", icon: "🏅" },
    firstLoss: { title: "Learning Curve", desc: "Lose your first match.", icon: "📉" },
    play5: { title: "Warming Up", desc: "Play 5 games total.", icon: "🎮" },
    play20: { title: "Addict", desc: "Play 20 games total.", icon: "🕹️" },
    play50: { title: "Veteran", desc: "Play 50 games total.", icon: "👴" },

    // Performance (Silver)
    flawless: { title: "Flawless Victory", desc: "Win a game without the AI scoring a single point.", icon: "🛡️" },
    flawlessHard: { title: "God Gamer", desc: "Win a flawless game on Hard difficulty.", icon: "🔱", rewardItem: 'aura_void' },
    closeCall: { title: "Close Call", desc: "Win a game with only a 1 point difference.", icon: "😰" },
    comeback: { title: "The Comeback", desc: "Win a game after the AI reached match point first.", icon: "🔄" },
    speedDemon: { title: "Speed Demon", desc: "Survive a rally where ball speed exceeds 12.", icon: "🔥", rewardItem: 'aura_blood' },
    lightSpeed: { title: "Lightspeed", desc: "Survive a rally where ball speed exceeds 18.", icon: "⚡" },

    // Endurance (Gold)
    marathon15: { title: "Marathon", desc: "Keep a rally going for more than 15 hits.", icon: "🏓" },
    marathon30: { title: "Iron Wall", desc: "Keep a rally going for more than 30 hits.", icon: "🧱" },
    marathon50: { title: "Untouchable", desc: "Keep a rally going for more than 50 hits.", icon: "🧿", rewardItem: 'cosmic' },
    points100: { title: "Centurion", desc: "Score 100 total points across games.", icon: "💯" },
    points500: { title: "Point Hoarder", desc: "Score 500 total points across games.", icon: "📈" },
    hits1000: { title: "Thousand Strikes", desc: "Hit the ball 1,000 times total.", icon: "🦇" },

    // Game Modes (Epic)
    survival50: { title: "Survivor", desc: "Reach 50 hits in Endless Survival mode.", icon: "⏳" },
    survival100: { title: "Endless Master", desc: "Reach 100 hits in Endless Survival mode.", icon: "♾️" },
    adventure5: { title: "Journey Begins", desc: "Clear Level 5 in Adventure mode.", icon: "🗺️" },
    adventure10: { title: "Halfway There", desc: "Clear Level 10 in Adventure mode.", icon: "⛰️" },
    adventure20: { title: "Explorer", desc: "Clear Level 20 in Adventure mode.", icon: "🌋" },
    adventureBoss: { title: "The Grandmaster", desc: "Defeat Level 30 and beat Adventure mode.", icon: "👑", rewardItem: 'aura_master' },

    // Economy & Store (Platinum)
    firstBuy: { title: "Shopper", desc: "Buy your first item from the Store.", icon: "🛒" },
    rich: { title: "Moneybags", desc: "Accumulate 1000 Coins.", icon: "💰" }
};

const ADVENTURE_LEVELS = [
    // Dummy 0 index to make level numbering 1-indexed
    {},
    { score: 3, aiSpeed: 3, ballSpeed: 4, paddleSize: 80, name: "Level 1: The Basics (To 3)", desc: "First match! An easy start.", bgColor: "#1a1a2e" },
    { score: 5, aiSpeed: 4, ballSpeed: 5, paddleSize: 80, name: "Level 2: Warming Up (To 5)", desc: "The AI is a bit faster now.", bgColor: "#2e1a2e" },
    { score: 5, aiSpeed: 5, ballSpeed: 8, paddleSize: 80, name: "Level 3: Fast Ball (To 5)", desc: "Watch out, the ball starts much faster!", bgColor: "#3d1414" },
    { score: 5, aiSpeed: 4, ballSpeed: 4, paddleSize: 40, name: "Level 4: Mini Paddle (To 5)", desc: "Your paddle is cut in half!", bgColor: "#143d22" },
    { score: 7, aiSpeed: 7, ballSpeed: 5, paddleSize: 80, name: "Level 5: The Wall (To 7)", desc: "The AI misses very rarely. Play smart.", bgColor: "#3d3214" },
    { score: 5, aiSpeed: 6, ballSpeed: 10, paddleSize: 50, name: "Level 6: Turbo Mode (To 5)", desc: "Everything is faster and your paddle is smaller.", bgColor: "#0c011e" },
    { score: 5, aiSpeed: 5, ballSpeed: 5, paddleSize: 80, hasObstacles: true, name: "Level 7: First Contact (To 5)", desc: "Dynamic obstacles appear! Watch the bounces.", bgColor: "#450c3a" },
    { score: 7, aiSpeed: 8, ballSpeed: 6, paddleSize: 60, name: "Level 8: The Pro (To 7)", desc: "The opponent is tough. Beat them to 7 points.", bgColor: "#450c0c" },
    { score: 10, aiSpeed: 9, ballSpeed: 8, paddleSize: 80, name: "Level 9: Marathon (To 10)", desc: "First to 10 points. Focus!", bgColor: "#0a2638" },
    { score: 5, aiSpeed: 10, ballSpeed: 12, paddleSize: 50, name: "Level 10: Insanity (To 5)", desc: "Blink and you lose.", bgColor: "#380a0a" }
];

// Procedurally generate the next 20 levels (Level 11 to 30) for the ultimate challenge
for (let i = 11; i <= 30; i++) {
    let speedMult = 1 + (i / 30);
    let targetScore = i % 5 === 0 ? 10 : 5; // Boss levels every 5th are longer
    let hasObs = i % 3 === 0;

    let subTitle = `Phase ${Math.floor(i / 5)}`;
    if (i === 30) subTitle = "THE GRANDMASTER";
    else if (i % 5 === 0) subTitle = "Marathon Boss";
    else if (hasObs) subTitle = "Obstacle Course";
    else if (i > 25) subTitle = "Hyper Speed";
    else if (i > 20) subTitle = "Micro Paddle";

    ADVENTURE_LEVELS.push({
        score: targetScore,
        aiSpeed: Math.min(15, 6 + Math.floor(i / 3)),
        ballSpeed: Math.max(5, 4 + Math.floor(i / 2)),
        paddleSize: Math.max(30, 80 - (i * 1.5)),
        hasObstacles: hasObs, // Obstacles every 3rd level
        name: `Level ${i}: ${subTitle} (To ${targetScore})`,
        desc: i === 30 ? "Can you beat the final challenge?" : "It only gets harder from here.",
        bgColor: i === 30 ? "#000000" : `hsl(${i * 15}, 50%, 15%)`
    });
}

const PRESET_COLORS = [
    '#ffffff', '#00ffcc', '#ff00ff', '#ffff00',
    '#ff3300', '#0033ff', '#00ff00', '#ff9900',
    '#9900ff', '#ff00a6', '#00ffff', '#ccff00'
];

const STORE_ITEMS = [
    // Ball Effects (Trails)
    { id: 'default', category: 'ball', name: 'Standard Ball', desc: 'No special visual effect.', cost: 0, icon: '⚪', rarity: 'common' },
    { id: 'fire', category: 'ball', name: 'Fireball', desc: 'Leaves a blazing trail of fire.', cost: 50, icon: '🔥', rarity: 'rare' },
    { id: 'rainbow', category: 'ball', name: 'Rainbow', desc: 'A beautiful RGB shifting trail.', cost: 100, icon: '🌈', rarity: 'rare' },
    { id: 'ghost', category: 'ball', name: 'Ghost', desc: 'Semi-transparent with ethereal glow.', cost: 150, icon: '👻', rarity: 'epic' },
    { id: 'matrix', category: 'ball', name: 'Matrix Code', desc: 'Binary numbers fall behind.', cost: 300, icon: '💾', rarity: 'epic' },
    { id: 'electric', category: 'ball', name: 'Electric', desc: 'Sparks of pure energy.', cost: 500, icon: '⚡', rarity: 'legendary' },
    { id: 'glitch', category: 'ball', name: 'Glitch', desc: 'Reality-breaking digital distortion.', cost: 600, icon: '🖥️', rarity: 'legendary' },
    { id: 'plasma', category: 'ball', name: 'Plasma Art', desc: 'Flowing cosmic nebulas.', cost: 750, icon: '🌌', rarity: 'legendary' },
    { id: 'crystal', category: 'ball', name: 'Crystal Shards', desc: 'Shattered glass effect trailing behind.', cost: 850, icon: '💎', rarity: 'legendary' },
    { id: 'gold', category: 'ball', name: 'Gold Leaf', desc: 'Pure prestige. Leaves actual gold.', cost: 1000, icon: '💰', rarity: 'mythic' },

    // Reward Only Ball Trails
    { id: 'blood', category: 'ball', name: 'Blood Trail', desc: 'A grim crimson streak. (Reward)', cost: 'reward', icon: '🩸', rarity: 'epic' },
    { id: 'cosmic', category: 'ball', name: 'Cosmic Dust', desc: 'Stars that trail from the ball. (Reward)', cost: 'reward', icon: '✨', rarity: 'mythic' },

    // Paddle Auras
    { id: 'aura_none', category: 'paddle', name: 'No Aura', desc: 'Clean paddle look.', cost: 0, icon: '🛡️', rarity: 'common' },
    { id: 'aura_neon', category: 'paddle', name: 'Neon Glow', desc: 'Intense outer glow.', cost: 200, icon: '✨', rarity: 'rare' },
    { id: 'aura_fire', category: 'paddle', name: 'Heat Wave', desc: 'Paddle emits heat ripples.', cost: 400, icon: '♨️', rarity: 'epic' },
    { id: 'aura_lightning', category: 'paddle', name: 'Lightning', desc: 'High voltage electrical surges.', cost: 800, icon: '⚡', rarity: 'legendary' },
    { id: 'aura_godly', category: 'paddle', name: 'Godly Presence', desc: 'The ultimate paddle aura.', cost: 2000, icon: '👑', rarity: 'mythic' },

    // Reward Only Auras
    { id: 'aura_blood', category: 'paddle', name: 'Bloodlust', desc: 'Crimson aura resonating power. (Reward)', cost: 'reward', icon: '🧛', rarity: 'epic' },
    { id: 'aura_void', category: 'paddle', name: 'Void Energy', desc: 'Consumes the light around it. (Reward)', cost: 'reward', icon: '🌌', rarity: 'mythic' },
    { id: 'aura_master', category: 'paddle', name: 'Grandmaster', desc: 'The mark of a true champion. (Reward)', cost: 'reward', icon: '🔱', rarity: 'mythic' }
];

// XP & Level Progression Tracking
const PLAYER_TITLES = [
    { level: 1, title: "Rookie", color: "#ccc" },
    { level: 5, title: "Amateur", color: "#88ccff" },
    { level: 10, title: "Challenger", color: "#00ffcc" },
    { level: 15, title: "Competitor", color: "#4caf50" },
    { level: 20, title: "Veteran", color: "#ffaa00" },
    { level: 30, title: "Master", color: "#ff00ff" },
    { level: 40, title: "Grandmaster", color: "#ff0055" },
    { level: 50, title: "Pong God", color: "gold" }
];

function getXPRequiredForLevel(level) {
    // Basic scaling formula: (level^2) * 100
    // Lvl 2 = 400 XP | Lvl 3 = 900 XP | Lvl 10 = 10,000 XP
    return Math.pow(level, 2) * 100;
}
