#!/bin/bash
# Overnight monitoring script for Swing Trading AI

LOG_FILE="/tmp/swing-live.log"
MONITOR_LOG="/tmp/overnight-monitor.log"
SUMMARY_FILE="/home/thalegegendgamer/crypto-ai/overnight-summary.txt"

echo "🌙 OVERNIGHT MONITORING STARTED: $(date)" > "$MONITOR_LOG"
echo "======================================" >> "$MONITOR_LOG"
echo "" >> "$MONITOR_LOG"

# Check every 2 minutes for 12 hours
for i in {1..360}; do
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Get current stats
    BALANCE=$(tail -100 "$LOG_FILE" | grep -oP 'Balance: \$\K[0-9.]+' | tail -1)
    TRADES=$(tail -100 "$LOG_FILE" | grep -oP 'Total Trades: \K[0-9]+' | tail -1)
    WINS=$(tail -100 "$LOG_FILE" | grep -oP 'Wins: \K[0-9]+' | tail -1)
    LOSSES=$(tail -100 "$LOG_FILE" | grep -oP 'Losses: \K[0-9]+' | tail -1)
    
    # Check for trade activity
    if tail -50 "$LOG_FILE" | grep -q "BUY SIGNAL"; then
        echo "" >> "$MONITOR_LOG"
        echo "🟢 [$TIMESTAMP] BUY SIGNAL DETECTED!" >> "$MONITOR_LOG"
        tail -80 "$LOG_FILE" | grep -B5 -A15 "BUY SIGNAL" | tail -25 >> "$MONITOR_LOG"
        echo "" >> "$MONITOR_LOG"
    fi
    
    if tail -50 "$LOG_FILE" | grep -q "SELL"; then
        echo "" >> "$MONITOR_LOG"
        echo "🔴 [$TIMESTAMP] SELL DETECTED!" >> "$MONITOR_LOG"
        tail -80 "$LOG_FILE" | grep -B5 -A15 "SELL" | tail -25 >> "$MONITOR_LOG"
        echo "" >> "$MONITOR_LOG"
    fi
    
    # Log status every 10 checks (20 minutes)
    if [ $((i % 10)) -eq 0 ]; then
        echo "[$TIMESTAMP] Status Check #$i" >> "$MONITOR_LOG"
        echo "  Balance: \$$BALANCE | Trades: $TRADES | Wins: $WINS | Losses: $LOSSES" >> "$MONITOR_LOG"
        
        # Check for capital preservation mode
        if tail -30 "$LOG_FILE" | grep -q "CAPITAL PRESERVATION"; then
            echo "  🛑 CAPITAL PRESERVATION MODE ACTIVE" >> "$MONITOR_LOG"
        fi
    fi
    
    sleep 120  # 2 minutes
done

# Generate final summary
echo "" >> "$MONITOR_LOG"
echo "🌅 OVERNIGHT MONITORING COMPLETE: $(date)" >> "$MONITOR_LOG"
echo "======================================" >> "$MONITOR_LOG"

# Create summary file
cat > "$SUMMARY_FILE" << EOF
🌙 OVERNIGHT SWING TRADING RESULTS
===================================
Duration: 12 hours
Started: $(head -1 "$MONITOR_LOG" | cut -d: -f2-)
Ended: $(date)

FINAL STATS:
Balance: \$$BALANCE
Total Trades: $TRADES
Wins: $WINS
Losses: $LOSSES
Win Rate: $(echo "scale=1; $WINS * 100 / ($TRADES + 0.0001)" | bc)%

Full log: $MONITOR_LOG
Trading log: $LOG_FILE
EOF

echo "✅ Monitoring complete. Summary saved to: $SUMMARY_FILE"
