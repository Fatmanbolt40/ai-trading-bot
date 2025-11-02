# ⚠️ SSH CONNECTION TIMEOUT - SECURITY GROUP FIX

Your AWS instance is blocking SSH connections!

## 🔧 FIX THIS FIRST

### Go to AWS Console and Allow SSH:

1. **Go to EC2 Console:** https://console.aws.amazon.com/ec2/
2. **Select your instance:** i-0755e6d0aabceba83 (OShea)
3. **Click "Security" tab**
4. **Click the Security Group link** (looks like: sg-xxxxxxxxx)
5. **Click "Edit inbound rules"**
6. **Add or modify SSH rule:**
   - Type: **SSH**
   - Protocol: **TCP**
   - Port: **22**
   - Source: **My IP** (or 0.0.0.0/0 for any IP)
7. **Save rules**

---

## ✅ AFTER FIXING, TEST CONNECTION:

```bash
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224
```

If it connects, you'll see:
```
[ec2-user@ip-xxx-xxx-xxx-xxx ~]$
```

---

## 🚀 THEN DEPLOY BOT (Copy/Paste All Commands):

Once connected to AWS, run these commands:

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Verify
node --version
npm --version

# Remove old bot if exists
sudo systemctl stop crypto-bot 2>/dev/null || true
rm -rf ai-trading-bot

# Clone your bot
git clone https://github.com/Fatmanbolt40/ai-trading-bot.git
cd ai-trading-bot

# Install dependencies
npm install

# Create .env file
nano .env
```

**In nano, add your API keys:**
```
KRAKEN_API_KEY=your_actual_key_here
KRAKEN_API_SECRET=your_actual_secret_here
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# Create systemd service
sudo tee /etc/systemd/system/crypto-bot.service > /dev/null << 'EOF'
[Unit]
Description=24/7 Crypto Trading AI Bot
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/ai-trading-bot
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /home/ec2-user/ai-trading-bot/paper-trading-ai.js
Restart=always
RestartSec=10
StandardOutput=append:/home/ec2-user/ai-trading-bot/ai-log.txt
StandardError=append:/home/ec2-user/ai-trading-bot/ai-log.txt

[Install]
WantedBy=multi-user.target
EOF

# Start the bot
sudo systemctl daemon-reload
sudo systemctl enable crypto-bot
sudo systemctl start crypto-bot

# Check status
sudo systemctl status crypto-bot

# View logs
tail -f ai-log.txt
```

---

## ✅ VERIFY IT'S WORKING

You should see:
```
● crypto-bot.service - 24/7 Crypto Trading AI Bot
   Active: active (running)
```

And logs showing:
```
🚀 LIVE TRADING MODE - REAL MONEY ON KRAKEN
💰 Monitoring 400+ cryptocurrencies
🧠 AI BRAIN LOADED
```

---

## 📋 USEFUL COMMANDS (After Setup)

```bash
# Check status
sudo systemctl status crypto-bot

# View logs
tail -f ~/ai-trading-bot/ai-log.txt

# Restart bot
sudo systemctl restart crypto-bot

# Stop bot
sudo systemctl stop crypto-bot

# Update code
cd ai-trading-bot && git pull && sudo systemctl restart crypto-bot

# Check balance
cd ai-trading-bot && node sync-true-balance.js
```

---

## 🆘 STILL CAN'T CONNECT?

Try these:

### 1. Check Your Public IP Changed
Your IP might have changed. In Security Group, update to "My IP" again.

### 2. Try From Different Location
Connect from a different network (phone hotspot, etc.)

### 3. Use AWS Session Manager (No SSH Needed)
In EC2 Console:
- Select instance → Connect → Session Manager
- This works without SSH!

### 4. Allow All IPs Temporarily (FOR TESTING ONLY)
Security Group → SSH → Source: `0.0.0.0/0`
(⚠️ Less secure, but will work from anywhere)

---

**ONCE YOU FIX THE SECURITY GROUP, YOUR BOT WILL DEPLOY IN 5 MINUTES!**
