# 🚀 AWS DEPLOYMENT - YOUR INSTANCE IS READY!

**Instance:** i-0755e6d0aabceba83 (OShea)  
**IP:** 18.118.160.224  
**Region:** us-east-2 (Ohio)  
**Status:** ✅ RUNNING

---

## ⚡ QUICK DEPLOY (ONE COMMAND)

```bash
cd ~/crypto-ai
./deploy-to-aws.sh
```

This will:
1. ✅ Connect to your AWS instance
2. ✅ Install Node.js and dependencies
3. ✅ Clone your bot repository
4. ✅ Set up 24/7 systemd service
5. ✅ Start the bot automatically

---

## 📋 WHAT YOU NEED

### 1. SSH Key File (OShea.pem)
You need the `OShea.pem` file to connect.

**Download it from AWS:**
1. Go to: https://console.aws.amazon.com/ec2/
2. If you already have it, skip to step 2
3. If not, you'll need to create a new key pair:
   - Actions → Security → Create key pair
   - Name: OShea (or download the existing one)

**Save it to:**
```bash
~/.ssh/OShea.pem
```

Or the script will ask you where it is!

### 2. Your Kraken API Keys
Have these ready:
- KRAKEN_API_KEY
- KRAKEN_API_SECRET

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Run Deployment Script
```bash
cd ~/crypto-ai
./deploy-to-aws.sh
```

The script will:
- Find your SSH key (or ask where it is)
- Connect to AWS
- Install everything automatically
- Ask for your API keys
- Start the bot

### Step 2: Verify Bot is Running
```bash
# Connect to AWS
./connect-aws.sh

# Check status
sudo systemctl status crypto-bot

# View logs
tail -f ~/ai-trading-bot/ai-log.txt
```

---

## 🎮 MANAGING YOUR BOT

### Connect to AWS
```bash
./connect-aws.sh
```

### Check Bot Status
```bash
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224 'sudo systemctl status crypto-bot'
```

### View Live Logs
```bash
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224 'tail -f ai-trading-bot/ai-log.txt'
```

### Restart Bot
```bash
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224 'sudo systemctl restart crypto-bot'
```

### Stop Bot
```bash
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224 'sudo systemctl stop crypto-bot'
```

### Start Bot
```bash
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224 'sudo systemctl start crypto-bot'
```

### Update Bot Code
```bash
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224 'cd ai-trading-bot && git pull && sudo systemctl restart crypto-bot'
```

---

## 🔐 SECURITY SETUP

### Allow SSH Access from Your IP

1. Go to EC2 Console: https://console.aws.amazon.com/ec2/
2. Select your instance (OShea)
3. Click "Security" tab
4. Click on the Security Group link
5. Edit Inbound Rules
6. Make sure SSH (port 22) is allowed from "My IP"

---

## 📊 INSTANCE DETAILS

```
Instance ID:    i-0755e6d0aabceba83
Name:           OShea
Instance Type:  t3.micro (2 vCPUs, 1 GB RAM)
OS:             Amazon Linux 2023
Public IP:      18.118.160.224
DNS:            ec2-18-118-160-224.us-east-2.compute.amazonaws.com
Region:         us-east-2 (Ohio)
Launch Time:    Oct 22, 2025
```

### Your Instance is FREE Tier Eligible! ✅
- t3.micro qualifies for free tier
- 750 hours/month free (more than 24/7!)
- First 12 months free

---

## 🆚 MANUAL DEPLOYMENT (if script doesn't work)

### 1. Connect via SSH
```bash
chmod 400 ~/.ssh/OShea.pem
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224
```

### 2. Install Node.js
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Verify
node --version
npm --version
```

### 3. Clone Repository
```bash
# Remove old installation if exists
rm -rf ai-trading-bot

# Clone fresh
git clone https://github.com/Fatmanbolt40/ai-trading-bot.git
cd ai-trading-bot

# Install dependencies
npm install
```

### 4. Add API Keys
```bash
nano .env
```

Add:
```
KRAKEN_API_KEY=your_actual_key
KRAKEN_API_SECRET=your_actual_secret
```

Save: Ctrl+X, Y, Enter

### 5. Create Systemd Service
```bash
sudo nano /etc/systemd/system/crypto-bot.service
```

Paste:
```ini
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
```

Save: Ctrl+X, Y, Enter

### 6. Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable crypto-bot
sudo systemctl start crypto-bot

# Check status
sudo systemctl status crypto-bot

# View logs
tail -f ~/ai-trading-bot/ai-log.txt
```

---

## ✅ VERIFICATION

Your bot is working if you see:

```
● crypto-bot.service - 24/7 Crypto Trading AI Bot
     Loaded: loaded
     Active: active (running)
```

And logs show:
```
🚀 LIVE TRADING MODE - REAL MONEY ON KRAKEN
💰 Monitoring 400+ cryptocurrencies
🧠 AI BRAIN LOADED - PERMANENT LEARNING ACTIVE
```

---

## 🐛 TROUBLESHOOTING

### Can't SSH?
```bash
# Check key permissions
chmod 400 ~/.ssh/OShea.pem

# Try verbose mode
ssh -v -i ~/.ssh/OShea.pem ec2-user@18.118.160.224

# Check Security Group allows SSH from your IP
```

### Bot Won't Start?
```bash
# Check logs
sudo journalctl -u crypto-bot -n 50

# Verify .env file exists
cat ~/ai-trading-bot/.env

# Test manually
cd ~/ai-trading-bot
node paper-trading-ai.js
```

### Wrong User?
Amazon Linux 2023 uses `ec2-user`, not `ubuntu`!

---

## 🎉 SUCCESS!

Once deployed, your bot will:
✅ Run 24/7 continuously  
✅ Auto-restart if it crashes  
✅ Start automatically on reboot  
✅ Save AI learning permanently  
✅ Trade automatically  
✅ Never stop (unless you tell it to)  

---

## 📞 QUICK COMMANDS CHEAT SHEET

```bash
# Deploy bot (first time)
./deploy-to-aws.sh

# Connect to AWS
./connect-aws.sh

# Or manually
ssh -i ~/.ssh/OShea.pem ec2-user@18.118.160.224

# Check status
sudo systemctl status crypto-bot

# View logs
tail -f ~/ai-trading-bot/ai-log.txt

# Restart
sudo systemctl restart crypto-bot

# Update code
cd ai-trading-bot && git pull && sudo systemctl restart crypto-bot

# Check balance
cd ai-trading-bot && node sync-true-balance.js
```

---

**YOUR AWS BOT IS READY TO DEPLOY! 🚀**

**Run:** `./deploy-to-aws.sh` to get started!

---

*Instance: i-0755e6d0aabceba83 (OShea)*  
*Region: us-east-2 (Ohio)*  
*Last Updated: November 2, 2025*
