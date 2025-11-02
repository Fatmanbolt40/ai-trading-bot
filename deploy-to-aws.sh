#!/bin/bash

# 🚀 AUTOMATED AWS DEPLOYMENT SCRIPT
# Deploy crypto bot to your AWS EC2 instance

echo "🚀 DEPLOYING CRYPTO BOT TO AWS EC2..."
echo ""
echo "📍 Instance: i-0755e6d0aabceba83 (OShea)"
echo "🌐 IP: 18.118.160.224"
echo "📍 Region: us-east-2 (Ohio)"
echo ""

# AWS Instance Details
AWS_IP="18.118.160.224"
AWS_USER="ec2-user"  # Amazon Linux 2023 uses ec2-user
AWS_HOST="ec2-18-118-160-224.us-east-2.compute.amazonaws.com"
KEY_FILE="$HOME/.ssh/OShea.pem"

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ SSH Key not found at: $KEY_FILE"
    echo ""
    echo "📥 Please download your key file (OShea.pem) and place it at:"
    echo "   $KEY_FILE"
    echo ""
    echo "Or specify the correct path:"
    read -p "Enter path to OShea.pem: " USER_KEY
    KEY_FILE="$USER_KEY"
    
    if [ ! -f "$KEY_FILE" ]; then
        echo "❌ Key file still not found. Exiting."
        exit 1
    fi
fi

# Set correct permissions on key
chmod 400 "$KEY_FILE"

echo "✅ SSH Key found and secured"
echo ""

# Test connection
echo "🔗 Testing connection to AWS..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$AWS_USER@$AWS_IP" "echo '✅ Connected successfully'" 2>/dev/null; then
    echo ""
else
    echo "❌ Cannot connect to AWS instance"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Security Group allows SSH from your IP"
    echo "2. Verify instance is running"
    echo "3. Check key file is correct"
    echo ""
    exit 1
fi

echo "📦 Deploying bot to AWS..."
echo ""

# Deploy script
ssh -i "$KEY_FILE" "$AWS_USER@$AWS_IP" 'bash -s' << 'ENDSSH'
#!/bin/bash

echo "🔧 SETTING UP CRYPTO BOT ON AWS..."
echo ""

# Update system
echo "📦 Updating system..."
sudo yum update -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Verify installation
echo ""
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"
echo ""

# Remove old bot if exists
if [ -d "ai-trading-bot" ]; then
    echo "🗑️  Removing old bot installation..."
    sudo systemctl stop crypto-bot 2>/dev/null || true
    rm -rf ai-trading-bot
fi

# Clone repository
echo "📥 Cloning bot repository..."
git clone https://github.com/Fatmanbolt40/ai-trading-bot.git
cd ai-trading-bot

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Bot code deployed!"
echo ""
echo "⚠️  NEXT STEP: Add your API keys"
echo ""

ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🔐 STEP 2: ADD YOUR API KEYS"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "You need to add your Kraken API keys to the server."
echo ""
echo "Option A: Manual (Recommended for security)"
echo "   1. SSH to your server:"
echo "      ssh -i $KEY_FILE $AWS_USER@$AWS_IP"
echo ""
echo "   2. Create .env file:"
echo "      cd ai-trading-bot"
echo "      nano .env"
echo ""
echo "   3. Add these lines:"
echo "      KRAKEN_API_KEY=your_actual_api_key"
echo "      KRAKEN_API_SECRET=your_actual_api_secret"
echo ""
echo "   4. Save: Ctrl+X, Y, Enter"
echo ""
echo "Option B: Automatic (if you have keys ready)"
read -p "Do you want to add API keys now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter KRAKEN_API_KEY: " API_KEY
    read -p "Enter KRAKEN_API_SECRET: " API_SECRET
    
    echo "📤 Uploading API keys to AWS..."
    ssh -i "$KEY_FILE" "$AWS_USER@$AWS_IP" "cd ai-trading-bot && echo 'KRAKEN_API_KEY=$API_KEY' > .env && echo 'KRAKEN_API_SECRET=$API_SECRET' >> .env"
    echo "✅ API keys configured!"
    echo ""
    
    KEYS_CONFIGURED=true
else
    echo ""
    echo "⚠️  Remember to add API keys before starting the bot!"
    KEYS_CONFIGURED=false
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🤖 STEP 3: INSTALL SYSTEMD SERVICE (24/7 AUTO-START)"
echo "═══════════════════════════════════════════════════════"
echo ""

# Create and deploy systemd service
ssh -i "$KEY_FILE" "$AWS_USER@$AWS_IP" 'bash -s' << 'ENDSSH'
#!/bin/bash

echo "Creating systemd service..."

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

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable crypto-bot

echo "✅ Systemd service installed and enabled!"

ENDSSH

if [ "$KEYS_CONFIGURED" = true ]; then
    echo ""
    echo "🚀 Starting bot..."
    ssh -i "$KEY_FILE" "$AWS_USER@$AWS_IP" "sudo systemctl start crypto-bot"
    sleep 3
    
    echo ""
    echo "📊 Checking bot status..."
    ssh -i "$KEY_FILE" "$AWS_USER@$AWS_IP" "sudo systemctl status crypto-bot --no-pager"
    
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Your bot is now running 24/7 on AWS! 🎉"
    echo ""
else
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "⚠️  ALMOST DONE!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "To start the bot, run these commands:"
    echo ""
    echo "ssh -i $KEY_FILE $AWS_USER@$AWS_IP"
    echo "cd ai-trading-bot"
    echo "nano .env  # Add your API keys"
    echo "sudo systemctl start crypto-bot"
    echo ""
fi

echo "📋 Useful Commands:"
echo ""
echo "# SSH to your server"
echo "ssh -i $KEY_FILE $AWS_USER@$AWS_IP"
echo ""
echo "# Check bot status"
echo "ssh -i $KEY_FILE $AWS_USER@$AWS_IP 'sudo systemctl status crypto-bot'"
echo ""
echo "# View live logs"
echo "ssh -i $KEY_FILE $AWS_USER@$AWS_IP 'tail -f ai-trading-bot/ai-log.txt'"
echo ""
echo "# Restart bot"
echo "ssh -i $KEY_FILE $AWS_USER@$AWS_IP 'sudo systemctl restart crypto-bot'"
echo ""
echo "# Update bot code"
echo "ssh -i $KEY_FILE $AWS_USER@$AWS_IP 'cd ai-trading-bot && git pull && sudo systemctl restart crypto-bot'"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

