#!/bin/bash

# 🚀 SETUP TRULY 24/7 LOCAL BOT
# This makes your bot run CONTINUOUSLY on YOUR machine
# It will auto-restart if it crashes, and start on boot

echo "🤖 SETTING UP TRULY 24/7 CRYPTO BOT..."
echo ""

# Get the current directory
BOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USER=$(whoami)

echo "📂 Bot Directory: $BOT_DIR"
echo "👤 User: $USER"
echo ""

# Create systemd service file
SERVICE_FILE="/tmp/crypto-trading-bot.service"

cat > $SERVICE_FILE << EOF
[Unit]
Description=24/7 Crypto Trading AI Bot (Truly Persistent)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BOT_DIR
Environment="NODE_ENV=production"
Environment="PATH=/usr/bin:/usr/local/bin"

# Run the bot continuously
ExecStart=/usr/bin/node $BOT_DIR/paper-trading-ai.js

# Auto-restart on failure
Restart=always
RestartSec=10

# Restart if it runs for less than 10 seconds (crash loop protection)
StartLimitInterval=60
StartLimitBurst=5

# Logging
StandardOutput=append:$BOT_DIR/ai-log.txt
StandardError=append:$BOT_DIR/ai-log.txt

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Service file created: $SERVICE_FILE"
echo ""
echo "📋 INSTALLATION INSTRUCTIONS:"
echo ""
echo "Run these commands to install the service:"
echo ""
echo "sudo cp $SERVICE_FILE /etc/systemd/system/"
echo "sudo systemctl daemon-reload"
echo "sudo systemctl enable crypto-trading-bot"
echo "sudo systemctl start crypto-trading-bot"
echo ""
echo "📊 To check status:"
echo "sudo systemctl status crypto-trading-bot"
echo ""
echo "📜 To view live logs:"
echo "tail -f $BOT_DIR/ai-log.txt"
echo ""
echo "🛑 To stop the bot:"
echo "sudo systemctl stop crypto-trading-bot"
echo ""
echo "♻️  To restart the bot:"
echo "sudo systemctl restart crypto-trading-bot"
echo ""
echo "🚀 Once installed, your bot will:"
echo "   ✓ Run continuously 24/7"
echo "   ✓ Auto-restart if it crashes"
echo "   ✓ Start automatically on boot"
echo "   ✓ Save AI learning permanently"
echo "   ✓ Never stop unless you tell it to"
echo ""
