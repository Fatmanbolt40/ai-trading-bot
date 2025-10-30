#!/bin/bash

echo "🔮 PREDICTION ENGINE LIVE MONITOR"
echo "=================================="
echo ""
echo "📊 Current Status:"
ps aux | grep "paper-trading-ai.js" | grep -v grep | awk '{print "   ✅ AI Running - PID: " $2 " | CPU: " $3 "% | RAM: " $4 "%"}'
echo ""

# Show latest performance report
echo "📈 Latest Performance:"
tail -200 /tmp/prediction-ai.log | grep -A 30 "ADVANCED AI PERFORMANCE" | tail -31 | head -25

echo ""
echo "🔮 Recent Predictions:"
tail -200 /tmp/prediction-ai.log | grep -A 6 "AI PREDICTIONS:" | tail -7

echo ""
echo "💼 Active Positions:"
tail -100 /tmp/prediction-ai.log | grep "Positions:" | tail -1
tail -200 /tmp/prediction-ai.log | grep -E "HOLDING.*Cycle" | tail -5

echo ""
echo "📊 Recent Activity:"
echo "   Last 5 SCALP evaluations:"
grep "SCALP.*Cycle" /tmp/prediction-ai.log | tail -5 | awk '{print "   " $0}'

echo ""
echo "🎯 Waiting for next trade..."
echo "   (Predictions update every cycle, trades happen when signals align)"
