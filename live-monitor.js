#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Real-time trading monitor that shows live AI activity
class RealTimeTradeMonitor {
    constructor() {
        this.trades = [];
        this.lastState = null;
        this.startTime = Date.now();
    }

    async monitorAI() {
        console.clear();
        console.log('🚀 REAL-TIME AI TRADING MONITOR');
        console.log('===============================');
        console.log('📊 Monitoring live AI trading activity...\n');

        setInterval(async () => {
            try {
                const data = JSON.parse(await fs.promises.readFile('ai-state.json', 'utf8'));
                this.updateDisplay(data);
            } catch (error) {
                console.log('⏳ Waiting for AI data...');
            }
        }, 100); // Update every 100ms for near real-time
    }

    updateDisplay(data) {
        // Clear and redraw
        process.stdout.write('\x1b[2J\x1b[H');
        
        console.log('🚀 LIVE AI CRYPTO TRADING MONITOR');
        console.log('==================================');
        console.log(`⏰ Runtime: ${this.formatTime(Date.now() - this.startTime)}`);
        console.log(`🧬 Generation: ${data.generation} | 🔄 Cycle: ${data.cycle}`);
        console.log(`💰 Total Portfolio: $${data.totalFunds.toFixed(2)} | 📈 Market: $${data.marketPrice.toFixed(2)}\n`);

        // Live Wallet Display
        console.log('💰 LIVE WALLET BALANCES:');
        console.log('========================');
        console.log(`👑 Main Wallet:    $${data.wallets.main.toFixed(2)} (60% - Protected)`);
        console.log(`🏦 Banker:         $${data.wallets.banker.toFixed(2)}`);
        console.log(`🤖 AI Trader 1:    $${data.wallets.trader1.toFixed(2)}`);
        console.log(`🤖 AI Trader 2:    $${data.wallets.trader2.toFixed(2)}`);
        console.log(`🤖 AI Trader 3:    $${data.wallets.trader3.toFixed(2)}`);
        console.log(`🤖 AI Trader 4:    $${data.wallets.trader4.toFixed(2)}\n`);

        // AI Traders Status
        console.log('🧠 AI NEURAL TRADERS STATUS:');
        console.log('=============================');
        data.traders.forEach(trader => {
            const statusIcon = trader.isElite ? '⭐' : trader.holdings > 0 ? '🟡' : '🟢';
            const status = trader.holdings > 0 ? `HOLDING ${trader.holdings.toFixed(4)} SOL` : 'READY TO TRADE';
            
            console.log(`${statusIcon} AI-${trader.id}: $${trader.balance.toFixed(2)} | ${status} | Fitness: ${trader.fitness.toFixed(1)} | Win: ${trader.winRate.toFixed(1)}%`);
        });
        console.log('');

        // Recent Trading Activity (from logs)
        console.log('📋 LIVE TRADING ACTIVITY:');
        console.log('==========================');
        if (data.logs && data.logs.length > 0) {
            data.logs.slice(-8).forEach(log => {
                const time = new Date(log.timestamp).toLocaleTimeString();
                let icon = '📊';
                if (log.message.includes('BUY')) icon = '🟢';
                else if (log.message.includes('SELL')) icon = '🔴';
                else if (log.message.includes('PROFIT')) icon = '💰';
                else if (log.message.includes('EVOLUTION')) icon = '🧬';
                
                console.log(`${icon} [${time}] ${log.message}`);
            });
        } else {
            console.log('⏳ Waiting for trading activity...');
        }
        console.log('');

        // Market Analysis
        console.log('📊 MARKET INTELLIGENCE:');
        console.log('========================');
        if (data.performance) {
            console.log(`📈 Total Trades: ${data.performance.totalTrades || 0}`);
            console.log(`💰 Total Profits: $${(data.performance.totalProfits || 0).toFixed(4)}`);
            console.log(`⚡ Evolution Speed: ${(data.performance.evolutionSpeed || 0).toFixed(2)}/min`);
        }
        console.log(`🎯 AI Activity: ${data.traders.filter(t => t.trades > 0).length}/4 traders active`);
        console.log('');
        
        console.log('💡 TIP: AI learns "buy low, sell high" - watch for price movements and AI reactions!');
        console.log('🔄 Updates every 100ms | Press Ctrl+C to exit');
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

// Start the monitor
const monitor = new RealTimeTradeMonitor();
monitor.monitorAI();

// Handle exit
process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitor stopped. AI continues running in background.');
    process.exit(0);
});