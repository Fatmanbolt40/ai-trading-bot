#!/bin/bash
# Monitor Paper Trading AI Status

echo "🤖 PAPER TRADING AI MONITOR"
echo "═══════════════════════════════════════════════════"
echo ""

# Check if process is running
if ps aux | grep -q "[n]ode paper-trading-ai.js"; then
    echo "✅ AI Status: RUNNING"
    PID=$(ps aux | grep "[n]ode paper-trading-ai.js" | awk '{print $2}')
    echo "   Process ID: $PID"
else
    echo "❌ AI Status: NOT RUNNING"
    echo "   Start with: node paper-trading-ai.js &"
    exit 1
fi

echo ""
echo "📊 Current State:"
if [ -f "paper-trading-state.json" ]; then
    GEN=$(grep -o '"generation":[0-9]*' paper-trading-state.json | cut -d: -f2)
    CYCLE=$(grep -o '"cycle":[0-9]*' paper-trading-state.json | cut -d: -f2)
    BALANCE=$(grep -o '"currentBalance":[0-9.]*' paper-trading-state.json | cut -d: -f2)
    TRADES=$(grep -o '"totalTrades":[0-9]*' paper-trading-state.json | cut -d: -f2)
    WINS=$(grep -o '"wins":[0-9]*' paper-trading-state.json | cut -d: -f2)
    LOSSES=$(grep -o '"losses":[0-9]*' paper-trading-state.json | cut -d: -f2)
    
    echo "   Generation: $GEN | Cycle: $CYCLE"
    echo "   Balance: \$$BALANCE"
    echo "   Trades: $TRADES (${WINS}W / ${LOSSES}L)"
    
    if [ "$TRADES" -gt 0 ]; then
        WINRATE=$(awk "BEGIN {printf \"%.1f\", ($WINS/$TRADES)*100}")
        echo "   Win Rate: ${WINRATE}%"
    fi
else
    echo "   No state file yet (AI warming up...)"
fi

echo ""
echo "📝 Recent Activity (last 20 lines):"
echo "───────────────────────────────────────────────────"
tail -20 ai-monitor.log 2>/dev/null || echo "No log file yet"
echo ""
echo "═══════════════════════════════════════════════════"
echo "💡 Tips:"
echo "   • Watch live: tail -f ai-monitor.log"
echo "   • Stop AI: pkill -f 'node paper-trading-ai.js'"
echo "   • Fresh start: rm paper-trading-state.json && node paper-trading-ai.js &"
