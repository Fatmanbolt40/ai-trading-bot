#!/bin/bash

# 🚀 MANUAL AWS DEPLOYMENT COMMANDS
# Copy and paste these commands ONE BY ONE into your AWS EC2 instance

echo "════════════════════════════════════════════════════════"
echo "🚀 AWS EC2 DEPLOYMENT - MANUAL COMMANDS"
echo "════════════════════════════════════════════════════════"
echo ""
echo "⚠️  SSH CONNECTION TIMING OUT?"
echo ""
echo "ISSUE: Your Security Group doesn't allow SSH from your current IP"
echo ""
echo "FIX IT:"
echo "1. Go to: https://console.aws.amazon.com/ec2/"
echo "2. Select instance: i-0755e6d0aabceba83 (OShea)"
echo "3. Click 'Security' tab"
echo "4. Click the Security Group link"
echo "5. Edit 'Inbound rules'"
echo "6. Add/Edit SSH rule:"
echo "   - Type: SSH"
echo "   - Protocol: TCP"
echo "   - Port: 22"
echo "   - Source: My IP (or 0.0.0.0/0 for any IP)"
echo "7. Save rules"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
read -p "Press Enter after fixing Security Group..."
echo ""

# Try connection again
ssh -i ~/.ssh/OShea.pem -o ConnectTimeout=10 ec2-user@18.118.160.224 "echo '✅ Connected!'"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Still cannot connect. Here are the manual steps:"
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "CONNECT MANUALLY:"
    echo "════════════════════════════════════════════════════════"
    echo ""
    echo "1. Open a new terminal and run:"
    echo ""
    echo "   ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224"
    echo ""
    echo "2. Once connected, copy and paste these commands:"
    echo ""
    cat << 'COMMANDS'

# ═══════════════════════════════════════════════════════════
# STEP 1: UPDATE SYSTEM
# ═══════════════════════════════════════════════════════════
sudo yum update -y

# ═══════════════════════════════════════════════════════════
# STEP 2: INSTALL NODE.JS 18
# ═══════════════════════════════════════════════════════════
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Verify installation
node --version
npm --version

# ═══════════════════════════════════════════════════════════
# STEP 3: REMOVE OLD BOT (if exists)
# ═══════════════════════════════════════════════════════════
sudo systemctl stop crypto-bot 2>/dev/null || true
rm -rf ai-trading-bot

# ═══════════════════════════════════════════════════════════
# STEP 4: CLONE YOUR BOT
# ═══════════════════════════════════════════════════════════
git clone https://github.com/Fatmanbolt40/ai-trading-bot.git
cd ai-trading-bot

# ═══════════════════════════════════════════════════════════
# STEP 5: INSTALL DEPENDENCIES
# ═══════════════════════════════════════════════════════════
npm install

# ═══════════════════════════════════════════════════════════
# STEP 6: CREATE .ENV FILE WITH YOUR API KEYS
# ═══════════════════════════════════════════════════════════
nano .env

# 📝 ADD THESE LINES (with your actual keys):
# KRAKEN_API_KEY=your_key_here
# KRAKEN_API_SECRET=your_secret_here
#
# Then press: Ctrl+X, Y, Enter to save

# ═══════════════════════════════════════════════════════════
# STEP 7: CREATE SYSTEMD SERVICE
# ═══════════════════════════════════════════════════════════
sudo tee /etc/systemd/system/crypto-bot.service > /dev/null << 'EOF'
[Unit]
Description=24/7 Crypto Trading AI Bot
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/ai-trading-bot
Environment="NODE_ENV=production"

# Run the bot continuously
ExecStart=/usr/bin/node /home/ec2-user/ai-trading-bot/paper-trading-ai.js

# Auto-restart on failure
Restart=always
RestartSec=10

# Restart if it runs for less than 10 seconds
StartLimitInterval=60
StartLimitBurst=5

# Logging
StandardOutput=append:/home/ec2-user/ai-trading-bot/ai-log.txt
StandardError=append:/home/ec2-user/ai-trading-bot/ai-log.txt

[Install]
WantedBy=multi-user.target
EOF

# ═══════════════════════════════════════════════════════════
# STEP 8: START THE BOT
# ═══════════════════════════════════════════════════════════
sudo systemctl daemon-reload
sudo systemctl enable crypto-bot
sudo systemctl start crypto-bot

# ═══════════════════════════════════════════════════════════
# STEP 9: VERIFY IT'S RUNNING
# ═══════════════════════════════════════════════════════════
sudo systemctl status crypto-bot

# View logs
tail -f ai-log.txt

# ═══════════════════════════════════════════════════════════
# ✅ DONE! Your bot is now running 24/7 on AWS!
# ═══════════════════════════════════════════════════════════

COMMANDS
    echo ""
    echo "════════════════════════════════════════════════════════"
    exit 1
fi

echo ""
echo "✅ Connected successfully! Deploying bot..."
echo ""

# Deploy automatically
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224 'bash -s' << 'ENDSSH'
#!/bin/bash

echo "🔧 Installing Node.js and dependencies..."
sudo yum update -y
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

echo ""
echo "📥 Cloning bot repository..."
sudo systemctl stop crypto-bot 2>/dev/null || true
rm -rf ai-trading-bot
git clone https://github.com/Fatmanbolt40/ai-trading-bot.git
cd ai-trading-bot
npm install

echo ""
echo "✅ Bot code deployed!"
echo ""
ENDSSH

echo ""
echo "════════════════════════════════════════════════════════"
echo "🔐 NOW ADD YOUR API KEYS:"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Run this command:"
echo ""
echo "ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224"
echo ""
echo "Then run:"
echo "cd ai-trading-bot"
echo "nano .env"
echo ""
echo "Add:"
echo "KRAKEN_API_KEY=your_key_here"
echo "KRAKEN_API_SECRET=your_secret_here"
echo ""
echo "Save: Ctrl+X, Y, Enter"
echo ""
