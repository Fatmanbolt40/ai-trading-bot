#!/bin/bash
# 🚀 ADVANCED AI CONTROL SYSTEM - Real-time Trading Controls
# Usage: ./advanced-control.sh <command> [options]

AI_STATE_FILE="$HOME/crypto-ai/paper-trading-state.json"
AI_COMMAND_FILE="$HOME/crypto-ai/ai-realtime-commands.json"
AI_LOG_FILE="$HOME/crypto-ai/ai-log.txt"
AI_PID_FILE="$HOME/crypto-ai/.ai.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Initialize command file if doesn't exist
init_command_file() {
    if [ ! -f "$AI_COMMAND_FILE" ]; then
        echo '{}' > "$AI_COMMAND_FILE"
    fi
}

# Send real-time command to AI
send_command() {
    local cmd="$1"
    local value="$2"
    init_command_file
    
    # Create command JSON
    local timestamp=$(date +%s)
    if [ -z "$value" ]; then
        echo "{\"command\":\"$cmd\",\"timestamp\":$timestamp}" > "$AI_COMMAND_FILE"
    else
        echo "{\"command\":\"$cmd\",\"value\":\"$value\",\"timestamp\":$timestamp}" > "$AI_COMMAND_FILE"
    fi
}

case "$1" in
    # ═════════════════ MONITORING COMMANDS ═════════════════
    
    status)
        echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}💰 LIVE KRAKEN AI STATUS${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
        
        # Check if AI is running
        if pgrep -f paper-trading-ai.js > /dev/null; then
            echo -e "${GREEN}✅ AI Status: RUNNING${NC}"
            echo -e "${GREEN}   PID: $(pgrep -f paper-trading-ai.js)${NC}"
        else
            echo -e "${RED}❌ AI Status: STOPPED${NC}"
            exit 1
        fi
        
        # Parse state file
        if [ -f "$AI_STATE_FILE" ]; then
            echo ""
            echo -e "${YELLOW}📊 Current Session:${NC}"
            grep -o '"generation":[0-9]*' "$AI_STATE_FILE" | head -1 | sed 's/"generation":/   Generation: /'
            grep -o '"totalTrades":[0-9]*' "$AI_STATE_FILE" | head -1 | sed 's/"totalTrades":/   Total Trades: /'
            grep -o '"wins":[0-9]*' "$AI_STATE_FILE" | head -1 | sed 's/"wins":/   Wins: /'
            grep -o '"losses":[0-9]*' "$AI_STATE_FILE" | head -1 | sed 's/"losses":/   Losses: /'
            
            echo ""
            echo -e "${YELLOW}💰 Wallets:${NC}"
            grep -o '"trading":[0-9.]*' "$AI_STATE_FILE" | head -1 | sed 's/"trading":/   Trading Balance: $/'
            
            echo ""
            echo -e "${YELLOW}📈 Recent Activity:${NC}"
            tail -10 "$AI_LOG_FILE" | grep -E "(BUY|SELL|Position:|Capital:)" | tail -5
        fi
        ;;
    
    logs)
        echo -e "${CYAN}📋 Streaming live logs (Ctrl+C to exit)...${NC}"
        tail -f "$AI_LOG_FILE"
        ;;
    
    balance)
        echo -e "${CYAN}💰 BALANCE DETAILS${NC}"
        if [ -f "$AI_STATE_FILE" ]; then
            node -e "
            const state = require('$AI_STATE_FILE');
            console.log('Trading Balance: \$' + state.wallets.trading.toFixed(2));
            console.log('Main Balance: \$' + state.wallets.main.toFixed(2));
            console.log('Total Trades: ' + state.totalTrades);
            console.log('Win Rate: ' + ((state.wins / state.totalTrades) * 100).toFixed(1) + '%');
            console.log('Generation: ' + state.generation);
            "
        else
            echo -e "${RED}❌ State file not found${NC}"
        fi
        ;;
    
    performance)
        echo -e "${CYAN}📊 PERFORMANCE ANALYTICS${NC}"
        if [ -f "$AI_STATE_FILE" ]; then
            node -e "
            const state = require('$AI_STATE_FILE');
            const winRate = (state.wins / state.totalTrades) * 100;
            console.log('═════════════════════════════════════════');
            console.log('🎯 Trading Performance');
            console.log('═════════════════════════════════════════');
            console.log('Generation: ' + state.generation);
            console.log('Total Trades: ' + state.totalTrades);
            console.log('Wins: ' + state.wins + ' | Losses: ' + state.losses);
            console.log('Win Rate: ' + winRate.toFixed(1) + '%');
            console.log('Win Streak: ' + state.winStreak);
            console.log('');
            console.log('💰 Financial Summary');
            console.log('Balance: \$' + state.wallets.trading.toFixed(2));
            console.log('Peak Balance: \$' + (state.peakBalance || 0).toFixed(2));
            console.log('');
            console.log('📈 Portfolio');
            const positions = Object.keys(state.portfolio || {}).length;
            console.log('Open Positions: ' + positions + '/6');
            if (positions > 0) {
                for (const [market, pos] of Object.entries(state.portfolio)) {
                    const profit = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice * 100).toFixed(2);
                    console.log('  ' + market + ': ' + pos.amount.toFixed(4) + ' (' + profit + '%)');
                }
            }
            "
        fi
        ;;
    
    watch)
        watch -n 2 "bash $0 status"
        ;;
    
    # ═════════════════ TRADING CONTROLS ═════════════════
    
    sell)
        echo -e "${RED}🔴 FORCING EMERGENCY SELL ALL POSITIONS...${NC}"
        send_command "FORCE_SELL_ALL"
        echo -e "${GREEN}✅ Sell command sent to AI${NC}"
        sleep 2
        tail -20 "$AI_LOG_FILE" | grep -i "sell"
        ;;
    
    sellcoin)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 sellcoin <COIN>${NC}"
            echo "Example: $0 sellcoin HBAR"
        else
            echo -e "${RED}🔴 Forcing sell of $2...${NC}"
            send_command "FORCE_SELL" "$2/USD"
            echo -e "${GREEN}✅ Sell command sent for $2${NC}"
        fi
        ;;
    
    buy)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${YELLOW}Usage: $0 buy <COIN> <AMOUNT>${NC}"
            echo "Example: $0 buy HBAR 5.00"
        else
            echo -e "${GREEN}💰 Forcing buy $3 of $2...${NC}"
            send_command "FORCE_BUY" "{\"coin\":\"$2/USD\",\"amount\":$3}"
            echo -e "${GREEN}✅ Buy command sent${NC}"
        fi
        ;;
    
    switch)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 switch <COIN>${NC}"
            echo "Available: XRP, HBAR, SOL, BTC, ETH, ADA, DOT, LINK, DOGE, SHIB"
        else
            echo -e "${BLUE}🔄 Switching focus to $2...${NC}"
            send_command "FORCE_SWITCH" "$2/USD"
            echo -e "${GREEN}✅ Switch command sent${NC}"
        fi
        ;;
    
    pause)
        echo -e "${YELLOW}⏸️  PAUSING AI TRADING...${NC}"
        send_command "PAUSE_TRADING"
        echo -e "${GREEN}✅ AI will pause after current cycle${NC}"
        ;;
    
    resume)
        echo -e "${GREEN}▶️  RESUMING AI TRADING...${NC}"
        send_command "RESUME_TRADING"
        echo -e "${GREEN}✅ AI trading resumed${NC}"
        ;;
    
    # ═════════════════ CONFIGURATION CONTROLS ═════════════════
    
    setprofit)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 setprofit <PERCENT>${NC}"
            echo "Example: $0 setprofit 2.5  (for 2.5% profit target)"
        else
            echo -e "${BLUE}🎯 Setting profit target to $2%...${NC}"
            send_command "SET_PROFIT_TARGET" "$2"
            echo -e "${GREEN}✅ Profit target updated${NC}"
        fi
        ;;
    
    setstop)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 setstop <PERCENT>${NC}"
            echo "Example: $0 setstop 3.0  (for -3% stop loss)"
        else
            echo -e "${BLUE}🛑 Setting stop loss to -$2%...${NC}"
            send_command "SET_STOP_LOSS" "$2"
            echo -e "${GREEN}✅ Stop loss updated${NC}"
        fi
        ;;
    
    settradesize)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 settradesize <AMOUNT>${NC}"
            echo "Example: $0 settradesize 10  (for $10 max trade size)"
        else
            echo -e "${BLUE}💵 Setting max trade size to \$$2...${NC}"
            send_command "SET_MAX_TRADE" "$2"
            echo -e "${GREEN}✅ Max trade size updated${NC}"
        fi
        ;;
    
    setspeed)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 setspeed <MS>${NC}"
            echo "Examples:"
            echo "  $0 setspeed 250   - Ultra fast"
            echo "  $0 setspeed 500   - Very fast (default)"
            echo "  $0 setspeed 1000  - Fast"
            echo "  $0 setspeed 2000  - Normal"
        else
            echo -e "${BLUE}⚡ Setting check speed to $2ms...${NC}"
            send_command "SET_SPEED" "$2"
            echo -e "${GREEN}✅ Speed updated${NC}"
        fi
        ;;
    
    evolve)
        echo -e "${PURPLE}🧬 FORCING AI EVOLUTION...${NC}"
        send_command "FORCE_EVOLVE"
        echo -e "${GREEN}✅ Evolution triggered${NC}"
        sleep 2
        tail -15 "$AI_LOG_FILE" | grep -i "generation"
        ;;
    
    setgen)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 setgen <NUMBER>${NC}"
            echo "Example: $0 setgen 50  (jump to generation 50)"
        else
            echo -e "${PURPLE}🧬 Setting generation to $2...${NC}"
            send_command "SET_GENERATION" "$2"
            echo -e "${GREEN}✅ Generation updated${NC}"
        fi
        ;;
    
    # ═════════════════ SYNC & MAINTENANCE ═════════════════
    
    sync)
        echo -e "${CYAN}🔄 FORCING KRAKEN BALANCE SYNC...${NC}"
        send_command "FORCE_SYNC"
        echo -e "${GREEN}✅ Sync command sent${NC}"
        sleep 3
        tail -20 "$AI_LOG_FILE" | grep -i "sync"
        ;;
    
    autosync)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 autosync <on|off|MILLISECONDS>${NC}"
            echo "Examples:"
            echo "  $0 autosync on       - Enable auto-sync (60000ms default)"
            echo "  $0 autosync off      - Disable auto-sync"
            echo "  $0 autosync 30000    - Sync every 30 seconds"
            echo "  $0 autosync 5000     - Sync every 5 seconds (ultra-fast)"
            echo "  $0 autosync 120000   - Sync every 2 minutes"
        else
            if [ "$2" = "on" ]; then
                echo -e "${CYAN}🔄 Enabling auto-sync (60000ms / 60s interval)...${NC}"
                send_command "AUTO_SYNC" "60000"
            elif [ "$2" = "off" ]; then
                echo -e "${YELLOW}⏹️  Disabling auto-sync...${NC}"
                send_command "AUTO_SYNC" "0"
            else
                # Convert to seconds for display
                seconds=$(echo "scale=1; $2 / 1000" | bc 2>/dev/null || echo "?")
                echo -e "${CYAN}🔄 Setting auto-sync to ${2}ms (${seconds}s)...${NC}"
                send_command "AUTO_SYNC" "$2"
            fi
            echo -e "${GREEN}✅ Auto-sync updated${NC}"
        fi
        ;;
    
    reset)
        echo -e "${RED}⚠️  RESETTING AI TO FRESH STATE...${NC}"
        read -p "Are you sure? This will clear all trades and history (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            send_command "RESET_STATE"
            echo -e "${GREEN}✅ Reset command sent${NC}"
        else
            echo -e "${YELLOW}❌ Reset cancelled${NC}"
        fi
        ;;
    
    backup)
        BACKUP_DIR="$HOME/crypto-ai/backups"
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$AI_STATE_FILE" "$BACKUP_DIR/state_$TIMESTAMP.json"
        cp "$AI_LOG_FILE" "$BACKUP_DIR/log_$TIMESTAMP.txt"
        echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/state_$TIMESTAMP.json${NC}"
        ;;
    
    # ═════════════════ PROCESS MANAGEMENT ═════════════════
    
    start)
        if pgrep -f paper-trading-ai.js > /dev/null; then
            echo -e "${YELLOW}⚠️  AI is already running${NC}"
        else
            echo -e "${GREEN}🚀 STARTING AI...${NC}"
            cd "$HOME/crypto-ai" && node paper-trading-ai.js > "$AI_LOG_FILE" 2>&1 &
            echo $! > "$AI_PID_FILE"
            echo -e "${GREEN}✅ AI started (PID: $!)${NC}"
            sleep 3
            tail -20 "$AI_LOG_FILE"
        fi
        ;;
    
    stop)
        echo -e "${RED}🛑 STOPPING AI...${NC}"
        pkill -f paper-trading-ai.js
        rm -f "$AI_PID_FILE"
        echo -e "${GREEN}✅ AI stopped${NC}"
        ;;
    
    restart)
        echo -e "${YELLOW}🔄 RESTARTING AI...${NC}"
        $0 stop
        sleep 2
        $0 start
        ;;
    
    kill)
        echo -e "${RED}☠️  FORCE KILLING AI...${NC}"
        pkill -9 -f paper-trading-ai.js
        rm -f "$AI_PID_FILE"
        echo -e "${GREEN}✅ AI force killed${NC}"
        ;;
    
    # ═════════════════ ADVANCED FEATURES ═════════════════
    
    mememode)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 mememode <on|off>${NC}"
            echo "Meme mode prioritizes volatile meme coins (DOGE, SHIB, PEPE, etc.)"
        else
            if [ "$2" = "on" ]; then
                echo -e "${PURPLE}🚀 Enabling MEME COIN MODE...${NC}"
                send_command "MEME_MODE" "true"
            else
                echo -e "${BLUE}📊 Disabling meme mode...${NC}"
                send_command "MEME_MODE" "false"
            fi
            echo -e "${GREEN}✅ Meme mode updated${NC}"
        fi
        ;;
    
    scalingmode)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 scalingmode <conservative|balanced|aggressive>${NC}"
            echo "  conservative - Small trades, slow growth"
            echo "  balanced     - Medium trades (default)"
            echo "  aggressive   - Large trades, fast growth"
        else
            echo -e "${BLUE}💰 Setting scaling mode to $2...${NC}"
            send_command "SCALING_MODE" "$2"
            echo -e "${GREEN}✅ Scaling mode updated${NC}"
        fi
        ;;
    
    markets)
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Usage: $0 markets <list|enable|disable> [COIN]${NC}"
            echo "Examples:"
            echo "  $0 markets list            - Show all markets"
            echo "  $0 markets enable PEPE     - Enable PEPE trading"
            echo "  $0 markets disable BTC     - Disable BTC trading"
        else
            case "$2" in
                list)
                    echo -e "${CYAN}📊 Active Markets:${NC}"
                    tail -100 "$AI_LOG_FILE" | grep "Monitoring" | tail -1
                    ;;
                enable)
                    echo -e "${GREEN}✅ Enabling $3 market...${NC}"
                    send_command "ENABLE_MARKET" "$3/USD"
                    ;;
                disable)
                    echo -e "${RED}❌ Disabling $3 market...${NC}"
                    send_command "DISABLE_MARKET" "$3/USD"
                    ;;
            esac
        fi
        ;;
    
    stats)
        echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}📊 COMPREHENSIVE AI STATISTICS${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
        
        if [ -f "$AI_STATE_FILE" ]; then
            node -e "
            const state = require('$AI_STATE_FILE');
            const winRate = state.totalTrades > 0 ? (state.wins / state.totalTrades) * 100 : 0;
            const avgProfit = state.totalTrades > 0 ? (state.totalProfit / state.totalTrades) : 0;
            
            console.log('');
            console.log('🤖 AI Status');
            console.log('  Generation: ' + state.generation);
            console.log('  Strategy: ' + (state.strategy || 'Adaptive'));
            console.log('  Check Interval: ' + (state.settings?.checkInterval || 250) + 'ms');
            console.log('');
            console.log('💰 Financial Performance');
            console.log('  Current Balance: \$' + state.wallets.trading.toFixed(2));
            console.log('  Peak Balance: \$' + (state.peakBalance || 0).toFixed(2));
            console.log('  Total P/L: \$' + ((state.wallets.trading + state.wallets.main) - 19).toFixed(2));
            console.log('');
            console.log('📈 Trading Statistics');
            console.log('  Total Trades: ' + state.totalTrades);
            console.log('  Wins: ' + state.wins + ' | Losses: ' + state.losses);
            console.log('  Win Rate: ' + winRate.toFixed(1) + '%');
            console.log('  Current Streak: ' + state.winStreak);
            console.log('  Best Streak: ' + (state.bestStreak || 0));
            console.log('');
            console.log('🎯 Configuration');
            console.log('  Profit Target: ' + ((state.settings?.targetProfit || 0.02) * 100).toFixed(1) + '%');
            console.log('  Stop Loss: -' + ((state.settings?.stopLoss || 0.05) * 100).toFixed(1) + '%');
            console.log('  Max Trade Size: \$' + (state.settings?.maxTradeSize || 10));
            "
        fi
        ;;
    
    # ═════════════════ HELP & INFO ═════════════════
    
    help|--help|-h)
        echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║     🚀 ADVANCED AI CONTROL SYSTEM - FULL SUITE 🚀     ║${NC}"
        echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}📊 MONITORING COMMANDS:${NC}"
        echo "  status              - Show current AI status"
        echo "  logs                - Stream live logs"
        echo "  balance             - Show balance details"
        echo "  performance         - Show performance analytics"
        echo "  stats               - Comprehensive statistics"
        echo "  watch               - Auto-refresh status every 2s"
        echo ""
        echo -e "${YELLOW}🎮 TRADING CONTROLS:${NC}"
        echo "  sell                - Emergency sell ALL positions"
        echo "  sellcoin <COIN>     - Sell specific coin"
        echo "  buy <COIN> <AMT>    - Force buy (e.g., buy HBAR 5.00)"
        echo "  switch <COIN>       - Switch trading focus"
        echo "  pause               - Pause trading"
        echo "  resume              - Resume trading"
        echo ""
        echo -e "${YELLOW}⚙️  CONFIGURATION:${NC}"
        echo "  setprofit <PCT>     - Set profit target (e.g., 2.5)"
        echo "  setstop <PCT>       - Set stop loss (e.g., 3.0)"
        echo "  settradesize <AMT>  - Set max trade size"
        echo "  setspeed <MS>       - Set check speed (250-5000ms)"
        echo "  evolve              - Force AI evolution"
        echo "  setgen <NUM>        - Jump to generation"
        echo ""
        echo -e "${YELLOW}🔄 SYNC & MAINTENANCE:${NC}"
        echo "  sync                - Force Kraken sync now"
        echo "  autosync <on|off|MS> - Auto-sync control (milliseconds)"
        echo "  reset               - Reset AI to fresh state"
        echo "  backup              - Create backup"
        echo ""
        echo -e "${YELLOW}🔧 PROCESS MANAGEMENT:${NC}"
        echo "  start               - Start AI"
        echo "  stop                - Stop AI gracefully"
        echo "  restart             - Restart AI"
        echo "  kill                - Force kill AI"
        echo ""
        echo -e "${YELLOW}🚀 ADVANCED FEATURES:${NC}"
        echo "  mememode <on|off>   - Toggle meme coin priority"
        echo "  scalingmode <TYPE>  - Set scaling (conservative|balanced|aggressive)"
        echo "  markets <list|enable|disable> [COIN] - Manage markets"
        echo ""
        echo -e "${CYAN}Examples:${NC}"
        echo "  $0 setprofit 2.5"
        echo "  $0 buy HBAR 5.00"
        echo "  $0 autosync 30000    # Sync every 30 seconds"
        echo "  $0 autosync 5000     # Sync every 5 seconds"
        echo "  $0 mememode on"
        echo "  $0 settradesize 15"
        ;;
    
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${YELLOW}Use '$0 help' to see all available commands${NC}"
        exit 1
        ;;
esac
