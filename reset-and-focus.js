#!/usr/bin/env node
// 🔥 RESET & FOCUS MODE - Start fresh with high-volatility coin focus

const fs = require('fs');
const path = require('path');

const stateFile = path.join(__dirname, 'paper-trading-state.json');

console.log('🔥 RESET & FOCUS MODE\n');
console.log('This will:');
console.log('  1. Clear all positions from AI state');
console.log('  2. Set balance to match Kraken');
console.log('  3. Configure AI to focus on fastest-moving coins');
console.log('  4. Raise profit targets to 5-7%\n');

// Read current state
let state;
try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
} catch (err) {
    console.log('⚠️  No existing state file, creating fresh...');
    state = {
        state: {},
        brain: {},
        wallets: {},
        traderPatterns: {},
        marketIntelligence: {}
    };
}

// Backup current state
const backupFile = `${stateFile}.backup-focus-${Date.now()}`;
if (fs.existsSync(stateFile)) {
    fs.copyFileSync(stateFile, backupFile);
    console.log(`💾 Backed up to: ${path.basename(backupFile)}`);
}

// RESET STATE
console.log('\n🔄 Resetting state...');

// Set balance to match Kraken (you have $0.0021 + SOL worth ~$10)
const currentUSD = 0.0021;
const budget = 19; // Your total budget

state.state = state.state || {};
state.state.currentBalance = currentUSD;
state.state.initialBalance = budget;
state.state.portfolio = {}; // Clear all positions
state.state.totalTrades = 0;
state.state.wins = 0;
state.state.losses = 0;
state.state.totalProfit = 0;
state.state.totalFeesPaid = 0;
state.state.generation = 1;
state.state.cycle = 0;

// Configure wallets
state.wallets = {
    main: currentUSD * 0.3,
    trading: currentUSD * 0.7
};

// 🔥 FOCUS MODE - Prioritize high-volatility coins
console.log('🔥 Configuring FOCUS MODE...');

state.brain = state.brain || {};
state.brain.buyThreshold = 0.050;  // 5% minimum profit
state.brain.sellThreshold = 0.050; // 5% minimum to sell
state.brain.riskTolerance = 0.7;   // Higher risk for volatility
state.brain.marketSentiment = 0.6; // Bullish bias

// Scanner weights for FIRE COINS (high volatility priority)
state.scannerWeights = {
    volatility: 0.5,   // 50% weight on volatility (FIRE!)
    momentum: 0.3,     // 30% on momentum
    volume: 0.1,       // 10% on volume
    price: 0.1         // 10% on price movement
};

// Meme mode enabled for high-volatility coins
state.memeMode = true;

// Market intelligence - fresh start
state.marketIntelligence = {
    whaleActivity: {},
    traderTiming: {},
    successPatterns: {},
    trendingCoins: []
};

console.log('✅ Reset complete!\n');
console.log('📊 NEW CONFIGURATION:');
console.log('   Balance: $' + currentUSD.toFixed(4));
console.log('   Positions: 0 (fresh start)');
console.log('   Min Profit: 5.0%');
console.log('   Target Profit: 7.0%');
console.log('   Focus: HIGH VOLATILITY coins');
console.log('   Meme Mode: ENABLED');
console.log('   Scanner: 50% volatility weight\n');

// Save
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
console.log('💾 State saved to: paper-trading-state.json');
console.log('\n🚀 Ready to start! Run: node paper-trading-ai.js >> ai-log.txt 2>&1 &\n');
