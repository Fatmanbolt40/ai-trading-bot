#!/usr/bin/env node
// Reset AI state to match ACTUAL Kraken balance

const fs = require('fs');
const path = require('path');

const stateFile = path.join(__dirname, 'paper-trading-state.json');

console.log('🔧 Resetting AI state to match REAL Kraken balance...\n');

// Read current state
const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

console.log('OLD STATE:');
console.log('  Balance: $' + state.state.currentBalance.toFixed(4));
console.log('  Portfolio positions:', Object.keys(state.state.portfolio).length);
Object.keys(state.state.portfolio).forEach(market => {
    const pos = state.state.portfolio[market];
    console.log('    ' + market + ': ' + pos.holdings + ' @ $' + pos.buyPrice);
});

// RESET TO ACTUAL KRAKEN BALANCE
state.state.currentBalance = 0.0035;  // Your real USD balance

// Keep only REAL positions that exist on Kraken
state.state.portfolio = {
    'SOL/USD': {
        holdings: 0.049749,
        buyPrice: 198.23,  // Unknown actual buy price, use recent price
        peak: 198.23,
        buyCycle: state.state.cycle || 0,
        synced: true
    },
    'XMR/USD': {
        holdings: 0.01874173,
        buyPrice: 335.31,  // Unknown actual buy price, use recent price
        peak: 335.31,
        buyCycle: state.state.cycle || 0,
        synced: true
    }
};

// Reset profit tracking since we don't know real P/L
state.state.totalProfit = 0;
state.state.totalTrades = 0;
state.state.profitableTrades = 0;
state.state.losingTrades = 0;

console.log('\nNEW STATE:');
console.log('  Balance: $' + state.state.currentBalance.toFixed(4));
console.log('  Portfolio positions:', Object.keys(state.state.portfolio).length);
Object.keys(state.state.portfolio).forEach(market => {
    const pos = state.state.portfolio[market];
    console.log('    ' + market + ': ' + pos.holdings + ' @ $' + pos.buyPrice);
});

// Save fixed state
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

console.log('\n✅ State reset to match Kraken reality!');
console.log('⚠️  Note: Buy prices set to recent prices since actual buy prices unknown');
console.log('💡 AI will require +2% profit to sell (safety margin)');
