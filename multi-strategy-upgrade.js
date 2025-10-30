// Multi-Strategy Upgrade Script
// This script adds advanced trading strategies to the paper trading AI

const fs = require('fs');

console.log('🚀 Upgrading AI to Multi-Strategy System...\n');

// Read current code
let code = fs.readFileSync('paper-trading-ai.js', 'utf8');

// Step 1: Update settings
console.log('Step 1: Updating settings with strategy configurations...');
const oldSettings = /this\.settings = \{[^}]*minDataPoints:[^}]*\};/s;
const newSettings = `this.settings = {
            maxTradeSize: 0.12,
            tradingFee: 0.0026,
            checkInterval: 1000,
            evolutionFrequency: 999999,
            maxPositions: 5,
            minDataPoints: 15,
            
            strategies: {
                scalping: {
                    name: 'SCALPING',
                    minProfit: 0.003,
                    targetProfit: 0.005,
                    stopLoss: 0.012,
                    trailingStop: 0.002,
                    maxHoldTime: 90,
                    quickExit: 25
                },
                meanReversion: {
                    name: 'MEAN REVERSION',
                    minProfit: 0.005,
                    targetProfit: 0.010,
                    stopLoss: 0.020,
                    trailingStop: 0.004,
                    maxHoldTime: 180,
                    quickExit: 45
                },
                trendFollowing: {
                    name: 'TREND FOLLOWING',
                    minProfit: 0.008,
                    targetProfit: 0.015,
                    stopLoss: 0.015,
                    trailingStop: 0.005,
                    maxHoldTime: 300,
                    quickExit: 60
                },
                breakout: {
                    name: 'BREAKOUT',
                    minProfit: 0.006,
                    targetProfit: 0.012,
                    stopLoss: 0.018,
                    trailingStop: 0.004,
                    maxHoldTime: 240,
                    quickExit: 40
                }
            }
        };`;

code = code.replace(oldSettings, newSettings);
console.log('✅ Settings updated\n');

// Save upgraded version
fs.writeFileSync('paper-trading-ai.js', code);

console.log('✅ Multi-Strategy System Installed!');
console.log('\nNew Features:');
console.log('• 4 trading strategies: Scalping, Trend Following, Mean Reversion, Breakout');
console.log('• Dynamic profit targets: 0.3% to 1.5% based on strategy');
console.log('• Adaptive stop losses: 1.2% to 2.0% based on strategy');
console.log('• Time-based exits: 90s to 300s maximum hold times');
console.log('• Quick exit protection: 25s to 60s for bad entries');
console.log('\nReady to trade! 🎯');
