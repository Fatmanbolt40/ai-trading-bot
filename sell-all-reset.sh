#!/bin/bash
# Force sell ALL positions and restart with focus on high-volatility coins

echo "🔴 EMERGENCY SELL ALL & RESET"
echo "=============================="
echo ""

# Stop AI
echo "⏸️  Stopping AI..."
pkill -f "node paper-trading-ai.js"
sleep 2

# Write FORCE_SELL_ALL command
echo "FORCE_SELL_ALL" > ~/crypto-ai/ai-realtime-commands.json
echo "✅ Force sell command written"

# Reset state to cash only
cd ~/crypto-ai
node -e "
const fs = require('fs');
const state = JSON.parse(fs.readFileSync('paper-trading-state.json', 'utf8'));

console.log('\n📊 BEFORE RESET:');
console.log('   Balance: \$' + state.state.currentBalance.toFixed(2));
console.log('   Positions:', Object.keys(state.state.portfolio).length);

// Clear all positions
state.state.portfolio = {};

// Set balance to actual Kraken amount
state.state.currentBalance = 5.56;  // From last sync

console.log('\n📊 AFTER RESET:');
console.log('   Balance: \$' + state.state.currentBalance.toFixed(2));
console.log('   Positions:', Object.keys(state.state.portfolio).length);
console.log('   ✅ ALL POSITIONS CLEARED!');

fs.writeFileSync('paper-trading-state.json', JSON.stringify(state, null, 2));
"

echo ""
echo "🔥 RESTARTING AI - FOCUS ON FAST MOVERS!"
echo "=========================================="

# Restart AI
node ~/crypto-ai/paper-trading-ai.js >> ~/crypto-ai/ai-log.txt 2>&1 &
echo "🚀 AI restarted with PID: $!"
echo ""
echo "💡 AI will now:"
echo "   ✅ Only trade high-volatility 'fire' coins"
echo "   ✅ Require 5-7% profit minimum"
echo "   ✅ Never sell at break-even"
echo "   ✅ Focus on fastest moving markets"
echo ""
echo "📊 Monitor: tail -f ~/crypto-ai/ai-log.txt"
