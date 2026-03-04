// js/audio.js
// AudioContext Setup (Synthesized Sounds)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let musicOscillator = null;
let musicGainNode = null;
let musicInterval = null;
let isMusicPlaying = false;
let isMusicEnabled = true;

// Predefined sound frequencies
function playTone(freq, type, duration, vol) {
    if (!isSoundEnabled) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

// Sound Helper
function playSound(type) {
    if (!isSoundEnabled) return;

    switch (type) {
        case 'paddleHit':
            playTone(440, 'square', 0.1, 0.1); // A4
            break;
        case 'wallHit':
            playTone(220, 'square', 0.1, 0.1); // A3
            break;
        case 'scoreAi':
            playTone(150, 'sawtooth', 0.5, 0.2);
            setTimeout(() => playTone(100, 'sawtooth', 0.5, 0.2), 150);
            break;
        case 'scorePlayer':
            playTone(600, 'sine', 0.2, 0.1);
            setTimeout(() => playTone(800, 'sine', 0.4, 0.1), 100);
            break;
        case 'uiHover':
            playTone(800, 'sine', 0.05, 0.02);
            break;
        case 'uiClick':
            playTone(1000, 'square', 0.1, 0.05);
            break;
        case 'achievement':
            playTone(523.25, 'sine', 0.2, 0.1); // C5
            setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 150); // E5
            setTimeout(() => playTone(783.99, 'sine', 0.4, 0.1), 300); // G5
            break;
    }
}

// --- Procedural Background Music ---

function startMusic() {
    if (!isMusicEnabled || isMusicPlaying || !audioCtx) return;

    // We need user gesture to start AudioContext if not already running
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    isMusicPlaying = true;

    // Create a continuous bassline arpeggiator
    const baseFreqs = [110, 110, 146.83, 130.81]; // A2, A2, D3, C3
    let noteIndex = 0;

    musicGainNode = audioCtx.createGain();
    musicGainNode.connect(audioCtx.destination);
    musicGainNode.gain.value = 0.05; // Keep it very quiet so it doesn't distract

    // Function that plays the next note
    function playNextNote() {
        if (!isMusicPlaying) return;

        const time = audioCtx.currentTime;
        const freq = baseFreqs[noteIndex % baseFreqs.length];

        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        // Attack & Release envelope for the plucking sound
        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0, time);
        oscGain.gain.linearRampToValueAtTime(1, time + 0.05); // Attack
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25); // Decay

        osc.connect(oscGain);
        oscGain.connect(musicGainNode);

        osc.start(time);
        osc.stop(time + 0.3);

        noteIndex++;
    }

    // Play a note every 250ms (Tempo ~ 240 BPM bassline)
    musicInterval = setInterval(playNextNote, 250);
}

function stopMusic() {
    isMusicPlaying = false;
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
    if (musicGainNode) {
        // Fade out
        musicGainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
            if (musicGainNode) musicGainNode.disconnect();
            musicGainNode = null;
        }, 500);
    }
}
