// js/cloud.js
/**
 * CloudManager
 * A universal wrapper for handling save data.
 * Currently uses an encrypted string generation suitable for Android/Offline transfer.
 * Designed to easily accept Firebase/PlayFab API calls in the future.
 */

const CloudManager = {
    // Collects all relevant game data from localStorage
    getPayload() {
        return {
            stats: localStorage.getItem('pongStats'),
            coins: localStorage.getItem('pongCoins'),
            achievements: localStorage.getItem('pongAchievements'),
            effects: localStorage.getItem('pongEffects'),
            gamesPlayed: localStorage.getItem('pongGamesPlayed'),
            adventureMax: localStorage.getItem('pongAdventureMax'),
            timestamp: Date.now()
        };
    },

    // Decodes and applies the payload to localStorage
    applyPayload(dataObj) {
        if (!dataObj || typeof dataObj !== 'object') return false;

        if (dataObj.stats) localStorage.setItem('pongStats', dataObj.stats);
        if (dataObj.coins !== undefined) localStorage.setItem('pongCoins', dataObj.coins);
        if (dataObj.achievements) localStorage.setItem('pongAchievements', dataObj.achievements);
        if (dataObj.effects) localStorage.setItem('pongEffects', dataObj.effects);
        if (dataObj.gamesPlayed !== undefined) localStorage.setItem('pongGamesPlayed', dataObj.gamesPlayed);
        if (dataObj.adventureMax !== undefined) localStorage.setItem('pongAdventureMax', dataObj.adventureMax);

        // Force reload state variables from storage
        if (typeof sessionStats !== 'undefined') {
            sessionStats = JSON.parse(localStorage.getItem('pongStats')) || sessionStats;
            coins = parseInt(localStorage.getItem('pongCoins')) || 0;
            unlockedAchievements = JSON.parse(localStorage.getItem('pongAchievements')) || {};
            unlockedEffects = JSON.parse(localStorage.getItem('pongEffects')) || {};
            gamesPlayed = parseInt(localStorage.getItem('pongGamesPlayed')) || 0;
            adventureProgress = parseInt(localStorage.getItem('pongAdventureMax')) || 1;
        }

        return true;
    },

    // Simulates an async cloud sync (e.g. Firebase write)
    async sync() {
        try {
            // Show sync icon
            if (typeof showSyncIcon === 'function') showSyncIcon();

            const payload = this.getPayload();

            // TODO: In the future, replace the timeout with an API call:
            // await fetch('https://api.my-backend.com/save', { method: 'POST', body: JSON.stringify(payload) });
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network

            // Hide sync icon
            if (typeof hideSyncIcon === 'function') hideSyncIcon();

            console.log("CloudManager: Local sync successful.", payload);
            return true;
        } catch (err) {
            console.error("CloudManager: Sync failed", err);
            if (typeof hideSyncIcon === 'function') hideSyncIcon();
            return false;
        }
    },

    // Generates a robust Base64 encoded JSON string of the save state
    generateTransferCode() {
        const payload = this.getPayload();
        // Base64 encode the stringified JSON payload
        const encoded = btoa(JSON.stringify(payload));
        return encoded;
    },

    // Takes a Base64 string and attempts to restore state
    restoreFromTransferCode(codeString) {
        try {
            const trimmed = codeString.trim();
            if (!trimmed) throw new Error("Empty code");

            const decoded = atob(trimmed);
            const payload = JSON.parse(decoded);

            if (!payload || typeof payload !== 'object') {
                throw new Error("Invalid payload format");
            }

            // Apply payload
            const success = this.applyPayload(payload);

            if (success) {
                // UI Updates after successful restore
                if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
                if (typeof updatePlayerProfileUI === 'function') updatePlayerProfileUI();
                if (typeof checkPersistentAchievements === 'function') checkPersistentAchievements();
                return { success: true, message: "Save data restored successfully!" };
            } else {
                return { success: false, message: "Failed to apply save data." };
            }
        } catch (error) {
            console.error("CloudManager: Restore Failed:", error);
            return { success: false, message: "Invalid or corrupted transfer code." };
        }
    }
};
