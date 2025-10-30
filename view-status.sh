#!/bin/bash
while true; do
    clear
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║       💰 LIVE KRAKEN AI - REAL MONEY STATUS 💰       ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ -f ~/crypto-ai/paper-trading-state.json ]; then
        # Parse JSON with jq or basic grep
        GEN=$(grep -o '"generation":[0-9]*' ~/crypto-ai/paper-trading-state.json | cut -d: -f2)
        BALANCE=$(grep -o '"trading":[0-9.]*' ~/crypto-ai/paper-trading-state.json | cut -d: -f2)
        TRADES=$(grep -o '"totalTrades":[0-9]*' ~/crypto-ai/paper-trading-state.json | head -1 | cut -d: -f2)
        WINS=$(grep -o '"wins":[0-9]*' ~/crypto-ai/paper-trading-state.json | cut -d: -f2)
        CYCLE=$(grep -o '"cycle":[0-9]*' ~/crypto-ai/paper-trading-state.json | cut -d: -f2)
        
        echo "🧬 Generation: $GEN"
        echo "💵 Balance: \$$BALANCE"
        echo "📊 Total Trades: $TRADES"
        echo "🏆 Wins: $WINS"
        echo "⚡ Cycle: $CYCLE"
        echo ""
    fi
    
    echo "══════════════════════════════════════════════════════════"
    echo "📋 LIVE LOGS (Last 15 lines):"
    echo "══════════════════════════════════════════════════════════"
    tail -15 /tmp/live-ai.log 2>/dev/null || echo "No logs yet"
    echo ""
    echo "Press Ctrl+C to exit | Updates every 2 seconds"
    
    sleep 2
done
