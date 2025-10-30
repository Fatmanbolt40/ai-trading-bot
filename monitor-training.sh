#!/bin/bash

# Speed Training Monitor - Watch your AI learn in real-time

echo "🚀 CRYPTO AI SPEED TRAINING MONITOR"
echo "===================================="
echo ""
echo "⚡ Training Speed: 500ms per cycle"
echo "📊 Evolution: Every 25 cycles (~12.5 seconds)"
echo "🎯 Target: 3 hours = ~21,600 learning cycles"
echo ""
echo "Press Ctrl+C to stop monitoring (AI keeps running)"
echo ""
echo "===================================="
echo ""

# Monitor in a loop
while true; do
    clear
    echo "🚀 CRYPTO AI SPEED TRAINING - LIVE STATUS"
    echo "=============================================="
    echo ""
    
    # Get current state
    if [ -f "/home/thalegegendgamer/crypto-ai/ai-state.json" ]; then
        node -e "
        const fs = require('fs');
        try {
            const state = JSON.parse(fs.readFileSync('/home/thalegegendgamer/crypto-ai/ai-state.json', 'utf8'));
            const market = state.market || {};
            const wallets = state.wallets || {};
            const perf = state.performance || {};
            
            console.log('📊 GENERATION:', state.generation || 0, '| CYCLE:', state.cycle || 0);
            console.log('');
            console.log('💰 PORTFOLIO:');
            console.log('  Total Funds: \$' + (state.totalFunds || 0).toFixed(2));
            console.log('  Main Wallet: \$' + (wallets.main || 0).toFixed(2));
            const profit = (state.totalFunds || 0) - 100;
            const profitColor = profit >= 0 ? '🟢' : '🔴';
            console.log('  Profit/Loss: ' + profitColor + ' \$' + profit.toFixed(2) + ' (' + ((profit/100)*100).toFixed(2) + '%)');
            console.log('');
            console.log('📈 MARKET:');
            console.log('  Price: \$' + (market.price || 0).toFixed(2));
            console.log('  Trend: ' + ((market.trend || 0) * 100).toFixed(2) + '%');
            console.log('');
            console.log('🤖 TRADERS:');
            (state.traders || []).forEach(t => {
                const holdingsValue = (t.holdings || 0) * (market.price || 0);
                const total = (t.balance || 0) + holdingsValue;
                const status = t.status === 'HOLDING' ? '🔒' : t.status === 'READY' ? '✅' : '⚡';
                console.log('  ' + status + ' AI-' + t.id + ': \$' + total.toFixed(2) + ' | Trades: ' + (t.trades || 0) + ' | Wins: ' + (t.wins || 0) + ' | Fitness: ' + (t.fitness || 0).toFixed(2));
            });
            console.log('');
            console.log('⚡ PERFORMANCE:');
            console.log('  Total Trades: ' + (perf.totalTrades || 0));
            console.log('  Total Profits: \$' + (perf.totalProfits || 0).toFixed(2));
            console.log('  Evolution Speed: ' + (perf.evolutionSpeed || 0).toFixed(2) + ' gen/min');
            console.log('  Best Fitness: ' + (perf.bestFitness || 0).toFixed(2));
            console.log('');
            console.log('📝 RECENT ACTIVITY:');
            const recent = (state.recentActivity || []).slice(-3);
            if (recent.length > 0) {
                recent.forEach(a => console.log('  ' + a));
            } else {
                console.log('  (Analyzing market...)');
            }
        } catch (e) {
            console.log('⚠️  Waiting for AI data...');
        }
        "
    else
        echo "⚠️  Waiting for AI to start..."
    fi
    
    echo ""
    echo "=============================================="
    echo "Last updated: $(date '+%H:%M:%S')"
    echo ""
    echo "💡 Dashboard: http://localhost:3000"
    echo "📊 Training will run for 3 hours"
    
    # Update every 2 seconds
    sleep 2
done
