#!/usr/bin/env node

/**
 * 🔄 RESET BALANCE - Fresh start with clean state
 * Resets balance to $10, clears all positions, resets stats
 */

const fs = require('fs');
const path = require('path');

const stateFile = path.join(__dirname, 'paper-trading-state.json');
const backupFile = path.join(__dirname, `paper-trading-state.json.backup-reset-${Date.now()}`);

console.log('\n🔄 RESETTING TRADING STATE...\n');

try {
    // Load current state
    if (fs.existsSync(stateFile)) {
        const currentState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        
        // Backup current state
        fs.writeFileSync(backupFile, JSON.stringify(currentState, null, 2));
        console.log(`📦 Backed up current state to: ${path.basename(backupFile)}`);
        
        console.log(`\n📊 CURRENT STATE:`);
        console.log(`   Balance: $${currentState.state.currentBalance.toFixed(2)}`);
        console.log(`   Positions: ${Object.keys(currentState.state.portfolio).length}`);
        if (Object.keys(currentState.state.portfolio).length > 0) {
            for (const [market, pos] of Object.entries(currentState.state.portfolio)) {
                const value = pos.holdings * (pos.buyPrice || 0);
                console.log(`      ${market}: ${pos.holdings.toFixed(4)} coins ($${value.toFixed(2)})`);
            }
        }
        console.log(`   Total Trades: ${currentState.state.totalTrades}`);
        console.log(`   Win Rate: ${currentState.state.wins}/${currentState.state.totalTrades} (${((currentState.state.wins / currentState.state.totalTrades) * 100).toFixed(1)}%)`);
        
        // Reset to fresh state
        const resetState = {
            state: {
                portfolio: {},  // Clear all positions
                currentBalance: 10.00,  // Reset to $10
                initialBalance: 10.00,
                startingBalance: 10.00,
                peakBalance: 10.00,
                totalTrades: 0,  // Reset trade count
                wins: 0,
                losses: 0,
                totalFeesPaid: 0,
                generation: 1,  // Start fresh generation
                cycle: 0,
                lastEvolution: 0,
                priceHistory: []
            },
            brain: currentState.brain,  // Keep AI learning
            predictor: currentState.predictor,  // Keep predictions
            timestamp: Date.now()
        };
        
        // Save reset state
        fs.writeFileSync(stateFile, JSON.stringify(resetState, null, 2));
        
        console.log(`\n✅ RESET COMPLETE!`);
        console.log(`\n📊 NEW STATE:`);
        console.log(`   Balance: $${resetState.state.currentBalance.toFixed(2)}`);
        console.log(`   Positions: ${Object.keys(resetState.state.portfolio).length} (all cleared)`);
        console.log(`   Total Trades: ${resetState.state.totalTrades}`);
        console.log(`   Generation: ${resetState.state.generation}`);
        console.log(`\n🚀 Ready to start fresh trading!`);
        console.log(`   Target Profit: 3.0%`);
        console.log(`   Min Profit: 2.5%`);
        console.log(`   Emergency Stop: -50% (catastrophic loss)`);
        console.log(`\n💡 Start bot with: node paper-trading-ai.js`);
        
    } else {
        console.log('❌ No state file found. Run the bot once first.');
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error resetting state:', error.message);
    process.exit(1);
}
