#!/bin/bash

# 🚀 AWS EC2 FREE TIER - TRULY 24/7 CRYPTO BOT SETUP
# This script helps you set up your bot on AWS EC2 (Free Tier eligible)
# Your bot will run continuously in the cloud, never stop!

echo "🚀 AWS EC2 SETUP GUIDE FOR 24/7 CRYPTO TRADING BOT"
echo "=================================================="
echo ""
echo "📋 WHAT YOU'LL GET:"
echo "   ✅ Bot runs 24/7 in the cloud (never stops)"
echo "   ✅ Free for 12 months (AWS Free Tier)"
echo "   ✅ Auto-restarts if crash"
echo "   ✅ Survives reboots"
echo "   ✅ Remote access anytime"
echo "   ✅ Professional cloud infrastructure"
echo ""
echo "💰 COST:"
echo "   • First 12 months: FREE (750 hours/month)"
echo "   • After 12 months: ~$3-5/month (t2.micro)"
echo ""
echo "⚡ SETUP TIME: 10-15 minutes"
echo ""
read -p "Ready to start? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

echo ""
echo "📝 STEP-BY-STEP INSTRUCTIONS:"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 1: CREATE AWS ACCOUNT (if you don't have one)"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://aws.amazon.com/free/"
echo "2. Click 'Create a Free Account'"
echo "3. Fill in your details"
echo "4. Add credit card (won't be charged for Free Tier)"
echo "5. Verify your phone number"
echo "6. Select 'Free' support plan"
echo ""
read -p "Press Enter when you have an AWS account..."
echo ""

echo "═══════════════════════════════════════════════════════"
echo "STEP 2: LAUNCH EC2 INSTANCE"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. Go to AWS Console: https://console.aws.amazon.com/ec2/"
echo "2. Click 'Launch Instance' (orange button)"
echo ""
echo "Configuration:"
echo "   • Name: crypto-trading-bot"
echo "   • AMI: Ubuntu Server 22.04 LTS (Free tier eligible)"
echo "   • Instance type: t2.micro (Free tier eligible)"
echo "   • Key pair: Create new → Name: crypto-bot-key → Download .pem file"
echo "   • Network: Allow SSH, HTTP, HTTPS"
echo "   • Storage: 8 GB (default, free tier)"
echo ""
echo "3. Click 'Launch Instance'"
echo "4. Wait 2-3 minutes for instance to start"
echo ""
read -p "Press Enter when instance is running (Status: Running)..."
echo ""

echo "═══════════════════════════════════════════════════════"
echo "STEP 3: CONNECT TO YOUR EC2 INSTANCE"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "1. In EC2 Console, select your instance"
echo "2. Click 'Connect' button"
echo "3. Copy the SSH command (looks like):"
echo "   ssh -i 'crypto-bot-key.pem' ubuntu@ec2-XX-XX-XX-XX.compute-1.amazonaws.com"
echo ""
echo "4. On your local machine:"
echo "   chmod 400 ~/Downloads/crypto-bot-key.pem"
echo "   ssh -i ~/Downloads/crypto-bot-key.pem ubuntu@YOUR-EC2-IP"
echo ""
read -p "Press Enter when connected to EC2..."
echo ""

echo "═══════════════════════════════════════════════════════"
echo "STEP 4: RUN THIS SCRIPT ON EC2"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Copy and paste these commands into your EC2 terminal:"
echo ""
cat << 'COMMANDS'
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Clone your bot repository
git clone https://github.com/Fatmanbolt40/ai-trading-bot.git
cd ai-trading-bot

# Install dependencies
npm install

# Create .env file with your API keys
nano .env

# Add these lines (replace with YOUR actual keys):
# KRAKEN_API_KEY=your_actual_api_key_here
# KRAKEN_API_SECRET=your_actual_api_secret_here

# Press Ctrl+X, then Y, then Enter to save

# Create systemd service for auto-start
sudo tee /etc/systemd/system/crypto-bot.service > /dev/null << 'EOF'
[Unit]
Description=24/7 Crypto Trading AI Bot
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ai-trading-bot
Environment="NODE_ENV=production"

# Run the bot continuously
ExecStart=/usr/bin/node /home/ubuntu/ai-trading-bot/paper-trading-ai.js

# Auto-restart on failure
Restart=always
RestartSec=10

# Restart if it runs for less than 10 seconds (crash loop protection)
StartLimitInterval=60
StartLimitBurst=5

# Logging
StandardOutput=append:/home/ubuntu/ai-trading-bot/ai-log.txt
StandardError=append:/home/ubuntu/ai-trading-bot/ai-log.txt

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start the bot
sudo systemctl daemon-reload
sudo systemctl enable crypto-bot
sudo systemctl start crypto-bot

# Check status
sudo systemctl status crypto-bot

# View live logs
tail -f ai-log.txt

COMMANDS

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 5: VERIFY BOT IS RUNNING"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "On EC2, run these commands:"
echo ""
echo "# Check bot status"
echo "sudo systemctl status crypto-bot"
echo ""
echo "# View live logs"
echo "tail -f ~/ai-trading-bot/ai-log.txt"
echo ""
echo "# Check AI brain growth"
echo "cat ~/ai-trading-bot/ai-historical-data.json"
echo ""
echo "You should see:"
echo "   ✅ Active: active (running)"
echo "   ✅ Market monitoring messages"
echo "   ✅ Trade execution logs"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "🎉 CONGRATULATIONS!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Your bot is now running 24/7 on AWS EC2!"
echo ""
echo "✅ What you have:"
echo "   • Bot runs continuously in the cloud"
echo "   • Auto-restarts if it crashes"
echo "   • Starts automatically on EC2 reboot"
echo "   • AI brain persists forever"
echo "   • Can close your laptop - bot keeps running"
echo "   • Free for 12 months"
echo ""
echo "📊 Useful Commands (run on EC2):"
echo ""
echo "# Stop bot"
echo "sudo systemctl stop crypto-bot"
echo ""
echo "# Start bot"
echo "sudo systemctl start crypto-bot"
echo ""
echo "# Restart bot"
echo "sudo systemctl restart crypto-bot"
echo ""
echo "# View logs"
echo "tail -f ~/ai-trading-bot/ai-log.txt"
echo ""
echo "# Update bot code"
echo "cd ~/ai-trading-bot && git pull && sudo systemctl restart crypto-bot"
echo ""
echo "# Check balance"
echo "cd ~/ai-trading-bot && node sync-true-balance.js"
echo ""
echo "🔐 SECURITY NOTES:"
echo "   • Your .env file is ONLY on EC2 (never in git)"
echo "   • SSH key required to access EC2"
echo "   • Keep your crypto-bot-key.pem file safe"
echo ""
echo "💡 PRO TIP:"
echo "   Set up CloudWatch alarms for bot monitoring"
echo "   Get notifications if bot stops"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
