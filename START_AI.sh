#!/bin/bash
echo "🔥 SELLING ALL & RESETTING..."
sleep 5
node quick-reset.js
echo ""
echo "✅ Starting AI with $3 trades..."
sleep 2
nohup node paper-trading-ai.js > ai-log.txt 2>&1 &
echo "✅ AI RUNNING!"
echo "📊 Check: tail -f ai-log.txt"
