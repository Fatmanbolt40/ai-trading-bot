#!/bin/bash
# Quick status check script

echo "🎯 SWING TRADER - CURRENT STATUS"
echo "================================="
echo "Time: $(date '+%H:%M:%S')"
echo ""

# Check if AI is running
if ps aux | grep -v grep | grep -q "paper-trading-ai.js"; then
    echo "✅ AI Status: RUNNING"
    AI_PID=$(ps aux | grep -v grep | grep "paper-trading-ai.js" | awk '{print $2}' | head -1)
    echo "   PID: $AI_PID"
else
    echo "❌ AI Status: NOT RUNNING"
fi

# Check if monitor is running
if ps aux | grep -v grep | grep -q "monitor-overnight.sh"; then
    echo "✅ Monitor Status: RUNNING"
    MON_PID=$(ps aux | grep -v grep | grep "monitor-overnight.sh" | awk '{print $2}' | head -1)
    echo "   PID: $MON_PID"
else
    echo "❌ Monitor Status: NOT RUNNING"
fi

echo ""
echo "📊 LATEST STATS:"

# Get latest stats from log
BALANCE=$(tail -100 /tmp/swing-live.log 2>/dev/null | grep -oP 'Balance: \$\K[0-9.]+' | tail -1)
TRADES=$(tail -100 /tmp/swing-live.log 2>/dev/null | grep -oP 'Total Trades: \K[0-9]+' | tail -1)
WINS=$(tail -100 /tmp/swing-live.log 2>/dev/null | grep -oP 'Wins: \K[0-9]+' | tail -1)
LOSSES=$(tail -100 /tmp/swing-live.log 2>/dev/null | grep -oP 'Losses: \K[0-9]+' | tail -1)
CYCLE=$(tail -100 /tmp/swing-live.log 2>/dev/null | grep -oP 'Cycle: \K[0-9]+' | tail -1)

echo "   Balance: \$${BALANCE:-19.00}"
echo "   Total Trades: ${TRADES:-0}"
echo "   Wins: ${WINS:-0} | Losses: ${LOSSES:-0}"
echo "   Cycle: ${CYCLE:-0}"

echo ""
echo "📝 Recent Activity (last 5 events):"
tail -200 /tmp/swing-live.log 2>/dev/null | grep -E "(BUY SIGNAL|SELL|CAPITAL|WHALE)" | tail -5

echo ""
echo "💾 Logs:"
echo "   Trading: /tmp/swing-live.log"
echo "   Monitor: /tmp/overnight-monitor.log"
echo "   Summary: ~/crypto-ai/overnight-summary.txt"
