#!/bin/bash
# 👀 Watch AI Trading Activity in Real-Time

echo "🤖 AI TRADING MONITOR - Press Ctrl+C to exit"
echo "=============================================="
echo ""

# Show current status
echo "📊 CURRENT STATUS:"
node -e "
const s = require('./paper-trading-state.json');
console.log('💰 Balance: $' + s.state.currentBalance.toFixed(2));
console.log('📈 Positions: ' + Object.keys(s.state.portfolio).length);
Object.keys(s.state.portfolio).forEach(m => {
    const p = s.state.portfolio[m];
    const current = s.state.currentPrice || p.buyPrice;
    const pl = ((current / p.buyPrice - 1) * 100);
    console.log('   ' + m + ': ' + p.holdings.toFixed(6) + ' @ $' + p.buyPrice.toFixed(2) + ' (P/L: ' + pl.toFixed(2) + '%)');
});
console.log('🧬 Generation: ' + s.state.generation);
console.log('📊 Win Rate: ' + ((s.state.profitableTrades / (s.state.totalTrades || 1)) * 100).toFixed(1) + '%');
"

echo ""
echo "📜 LIVE TRADING LOG:"
echo "=============================================="
tail -f ~/crypto-ai/ai-log.txt | grep --line-buffered -E "(BUY EXECUTED|SELL EXECUTED|HOLDING|Cycle|P/L:|TARGET:|Real.*failed|Trade NOT recorded)"
