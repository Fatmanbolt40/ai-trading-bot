#!/bin/bash
# Quick AI Status Check

echo "🤖 AI TRADING STATUS"
echo "===================="
echo ""

# Check if AI is running
if pgrep -f "node paper-trading-ai.js" > /dev/null; then
    PID=$(pgrep -f "node paper-trading-ai.js")
    echo "✅ AI is RUNNING (PID: $PID)"
else
    echo "❌ AI is NOT running"
    echo "   Start with: cd ~/crypto-ai && node paper-trading-ai.js >> ai-log.txt 2>&1 &"
    exit 1
fi

echo ""

# Show AI state
cd ~/crypto-ai
node -e "
const s = require('./paper-trading-state.json');
console.log('💰 Balance: \$' + s.state.currentBalance.toFixed(4));
console.log('📊 Positions: ' + Object.keys(s.state.portfolio).length);
Object.keys(s.state.portfolio).forEach(m => {
    const p = s.state.portfolio[m];
    console.log('   ' + m + ': ' + p.holdings.toFixed(6) + ' @ \$' + p.buyPrice.toFixed(2));
});
console.log('🧬 Generation: ' + s.state.generation);
console.log('📈 Cycle: ' + s.state.cycle);
"

echo ""
echo "📜 Recent Activity (last 10 lines):"
echo "-----------------------------------"
tail -10 ai-log.txt | grep -v "JUMPING ON HOT"

echo ""
echo "💡 Commands:"
echo "   Watch live: tail -f ~/crypto-ai/ai-log.txt"
echo "   Monitor:    ./watch-ai.sh"
echo "   Stop AI:    pkill -f 'node paper-trading-ai.js'"
