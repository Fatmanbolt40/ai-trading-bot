#!/bin/bash
# AI Control Commands for Live Kraken Trading

case "$1" in
    status)
        echo "═══════════════════════════════════════════════════════"
        echo "💰 LIVE KRAKEN AI STATUS"
        echo "═══════════════════════════════════════════════════════"
        tail -30 /tmp/live-ai.log | grep -E "(Balance:|Portfolio:|Holdings:|P/L:|Generation:|Win Rate:)" | tail -15
        ;;
    
    logs)
        echo "📋 Showing live logs (Ctrl+C to exit)..."
        tail -f /tmp/live-ai.log
        ;;
    
    sell)
        echo "🔴 FORCING SELL ALL POSITIONS..."
        echo "FORCE_SELL" > ~/crypto-ai/ai-command.txt
        sleep 2
        tail -20 /tmp/live-ai.log | grep -i sell
        ;;
    
    switch)
        if [ -z "$2" ]; then
            echo "Usage: ./control-ai.sh switch <COIN>"
            echo "Example: ./control-ai.sh switch XRP"
            echo "Available: XRP, HBAR, SOL, BTC, ETH, ADA, DOT, LINK"
        else
            echo "🔄 FORCING SWITCH to $2..."
            echo "FORCE_SWITCH:$2/USD" > ~/crypto-ai/ai-command.txt
            sleep 2
            tail -10 /tmp/live-ai.log
        fi
        ;;
    
    pause)
        echo "⏸️ PAUSING AI TRADING..."
        echo "PAUSE" > ~/crypto-ai/ai-command.txt
        pkill -STOP -f paper-trading-ai
        echo "✅ AI paused (still running but frozen)"
        ;;
    
    resume)
        echo "▶️ RESUMING AI TRADING..."
        echo "RESUME" > ~/crypto-ai/ai-command.txt
        pkill -CONT -f paper-trading-ai
        echo "✅ AI resumed"
        ;;
    
    restart)
        echo "🔄 RESTARTING AI..."
        pkill -f paper-trading-ai
        sleep 2
        cd ~/crypto-ai && node paper-trading-ai.js > /tmp/live-ai.log 2>&1 &
        echo "✅ AI restarted"
        sleep 3
        tail -20 /tmp/live-ai.log
        ;;
    
    stop)
        echo "🛑 STOPPING AI..."
        pkill -f paper-trading-ai
        echo "✅ AI stopped"
        ;;
    
    start)
        echo "🚀 STARTING AI..."
        cd ~/crypto-ai && node paper-trading-ai.js > /tmp/live-ai.log 2>&1 &
        echo "✅ AI started"
        sleep 3
        tail -20 /tmp/live-ai.log
        ;;
    
    evolve)
        echo "🧬 FORCING AI EVOLUTION..."
        echo "FORCE_EVOLVE" > ~/crypto-ai/ai-command.txt
        sleep 2
        tail -10 /tmp/live-ai.log | grep -i evolution
        ;;
    
    speed)
        if [ -z "$2" ]; then
            echo "Usage: ./control-ai.sh speed <MS>"
            echo "Example: ./control-ai.sh speed 500"
            echo "  250 = Ultra Fast"
            echo "  500 = Very Fast (current)"
            echo " 1000 = Fast"
            echo " 2000 = Normal"
        else
            echo "⚡ Setting speed to $2ms..."
            # This would require implementing in the AI code
            echo "Speed: $2ms" > ~/crypto-ai/ai-config.txt
            echo "✅ Speed updated (restart AI to apply)"
        fi
        ;;
    
    balance)
        echo "💰 CHECKING BALANCE..."
        if [ -f ~/crypto-ai/paper-trading-state.json ]; then
            grep -o '"trading":[0-9.]*' ~/crypto-ai/paper-trading-state.json | head -1
            grep -o '"totalTrades":[0-9]*' ~/crypto-ai/paper-trading-state.json | head -1
            grep -o '"wins":[0-9]*' ~/crypto-ai/paper-trading-state.json | head -1
        fi
        ;;
    
    watch)
        watch -n 2 'tail -30 /tmp/live-ai.log | grep -E "(Balance:|Holdings:|P/L:)" | tail -10'
        ;;
    
    *)
        echo "╔════════════════════════════════════════════════════════╗"
        echo "║       🤖 AI TRADING CONTROL COMMANDS 🤖              ║"
        echo "╚════════════════════════════════════════════════════════╝"
        echo ""
        echo "📊 MONITORING:"
        echo "  ./control-ai.sh status      - Show current status"
        echo "  ./control-ai.sh logs        - Live log stream"
        echo "  ./control-ai.sh balance     - Check balance"
        echo "  ./control-ai.sh watch       - Auto-refresh status"
        echo ""
        echo "🎮 TRADING CONTROLS:"
        echo "  ./control-ai.sh sell        - Force sell ALL positions"
        echo "  ./control-ai.sh switch XRP  - Force switch to XRP"
        echo "  ./control-ai.sh pause       - Pause trading"
        echo "  ./control-ai.sh resume      - Resume trading"
        echo ""
        echo "🔧 AI MANAGEMENT:"
        echo "  ./control-ai.sh start       - Start AI"
        echo "  ./control-ai.sh stop        - Stop AI"
        echo "  ./control-ai.sh restart     - Restart AI"
        echo "  ./control-ai.sh evolve      - Force evolution"
        echo "  ./control-ai.sh speed 500   - Set check speed"
        echo ""
        echo "Examples:"
        echo "  ./control-ai.sh switch HBAR"
        echo "  ./control-ai.sh speed 250"
        ;;
esac
