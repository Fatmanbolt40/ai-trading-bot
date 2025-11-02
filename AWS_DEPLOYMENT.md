# 🚀 AWS EC2 DEPLOYMENT - TRULY 24/7 CLOUD BOT

**Platform:** Amazon Web Services EC2  
**Cost:** FREE for 12 months, then ~$3-5/month  
**Status:** 🟢 READY TO DEPLOY  
**Setup Time:** 10-15 minutes

---

## 🎯 WHY AWS EC2?

### Advantages Over GitHub Actions
✅ **Truly Continuous:** Runs non-stop, not every 5 minutes  
✅ **No Time Limits:** GitHub Actions has 6-hour max, AWS has none  
✅ **Faster Execution:** Direct trading, no cold starts  
✅ **More Control:** Full server access  
✅ **Professional:** Real cloud infrastructure  

### Advantages Over Local PC
✅ **Always On:** Cloud server never sleeps  
✅ **Reliable:** AWS uptime > 99.9%  
✅ **Remote Access:** Manage from anywhere  
✅ **No Electricity Costs:** AWS pays the power bill  
✅ **Auto-Recovery:** AWS handles hardware failures  

---

## 💰 COST BREAKDOWN

### AWS Free Tier (First 12 Months)
- **EC2 t2.micro:** 750 hours/month FREE (enough for 24/7!)
- **Storage:** 30 GB EBS FREE
- **Data Transfer:** 15 GB/month FREE
- **Total:** $0.00/month ✅

### After 12 Months
- **EC2 t2.micro:** ~$8/month
- **Storage:** ~$1/month (8 GB)
- **Data Transfer:** FREE (under 15 GB)
- **Total:** ~$3-5/month (less than a coffee!)

### How to Stay Free Forever
💡 Create new AWS account after 12 months (different email)  
💡 Or upgrade to t3.micro for better performance (~$7/month)

---

## 🚀 QUICK START (AUTOMATED)

### Option A: Use Setup Script
```bash
cd ~/crypto-ai
chmod +x aws-setup-guide.sh
./aws-setup-guide.sh
```
Follow the interactive prompts.

### Option B: Manual Setup (see below)

---

## 📋 MANUAL SETUP STEPS

### STEP 1: Create AWS Account
1. Go to: https://aws.amazon.com/free/
2. Click "Create a Free Account"
3. Fill in details (email, password, payment method)
4. Choose "Free" support plan
5. Wait for account activation (2-24 hours)

### STEP 2: Launch EC2 Instance

#### 2.1 Go to EC2 Console
https://console.aws.amazon.com/ec2/

#### 2.2 Launch Instance
Click **"Launch Instance"** (orange button)

#### 2.3 Configure Instance

**Name:** `crypto-trading-bot`

**Application and OS Images (AMI):**
- Select: **Ubuntu Server 22.04 LTS**
- Architecture: **64-bit (x86)**
- ✅ **Free tier eligible** badge

**Instance Type:**
- Select: **t2.micro**
- 1 vCPU, 1 GB RAM
- ✅ **Free tier eligible**

**Key Pair:**
- Click "Create new key pair"
- Name: `crypto-bot-key`
- Type: RSA
- Format: .pem (for Mac/Linux) or .ppk (for Windows/PuTTY)
- Download and save (YOU NEED THIS TO CONNECT!)

**Network Settings:**
- ✅ Allow SSH traffic from: My IP
- ✅ Allow HTTPS traffic from the internet
- ✅ Allow HTTP traffic from the internet

**Configure Storage:**
- 8 GB gp3 (default, free tier eligible)

#### 2.4 Launch
Click **"Launch Instance"**

Wait 2-3 minutes for status to show **"Running"**

---

### STEP 3: Connect to EC2

#### 3.1 Get Connection Command
1. In EC2 Console, select your instance
2. Click **"Connect"** button
3. Go to **"SSH client"** tab
4. Copy the example command

#### 3.2 Connect via SSH

**On Mac/Linux:**
```bash
# Move key to safe location
mv ~/Downloads/crypto-bot-key.pem ~/.ssh/
chmod 400 ~/.ssh/crypto-bot-key.pem

# Connect
ssh -i ~/.ssh/crypto-bot-key.pem ubuntu@YOUR-EC2-PUBLIC-IP
```

**On Windows (PowerShell):**
```powershell
# Move key to safe location
Move-Item ~/Downloads/crypto-bot-key.pem ~/.ssh/

# Connect
ssh -i ~/.ssh/crypto-bot-key.pem ubuntu@YOUR-EC2-PUBLIC-IP
```

Replace `YOUR-EC2-PUBLIC-IP` with your actual EC2 public IP from AWS console.

---

### STEP 4: Install Bot on EC2

Once connected to EC2, run these commands:

#### 4.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### 4.2 Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git
```

#### 4.3 Verify Installation
```bash
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or 10.x.x
```

#### 4.4 Clone Your Repository
```bash
git clone https://github.com/Fatmanbolt40/ai-trading-bot.git
cd ai-trading-bot
```

#### 4.5 Install Dependencies
```bash
npm install
```

#### 4.6 Create .env File
```bash
nano .env
```

Add your API keys:
```env
KRAKEN_API_KEY=your_actual_api_key_here
KRAKEN_API_SECRET=your_actual_api_secret_here
```

**Press:** `Ctrl+X`, then `Y`, then `Enter` to save

#### 4.7 Test Bot Manually (Optional)
```bash
node paper-trading-ai.js
```

Press `Ctrl+C` to stop after verifying it works.

---

### STEP 5: Create Systemd Service (Auto-Start)

#### 5.1 Create Service File
```bash
sudo nano /etc/systemd/system/crypto-bot.service
```

#### 5.2 Paste This Configuration
```ini
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
```

**Press:** `Ctrl+X`, then `Y`, then `Enter` to save

#### 5.3 Enable and Start Service
```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable bot to start on boot
sudo systemctl enable crypto-bot

# Start the bot now
sudo systemctl start crypto-bot

# Check status
sudo systemctl status crypto-bot
```

You should see:
```
● crypto-bot.service - 24/7 Crypto Trading AI Bot
     Loaded: loaded
     Active: active (running)
```

---

### STEP 6: Verify Bot is Running

#### 6.1 Check Service Status
```bash
sudo systemctl status crypto-bot
```

Should show `Active: active (running)`

#### 6.2 View Live Logs
```bash
tail -f ~/ai-trading-bot/ai-log.txt
```

Press `Ctrl+C` to stop viewing logs.

#### 6.3 Check AI Brain
```bash
cat ~/ai-trading-bot/ai-historical-data.json
```

---

## 🎮 MANAGING YOUR BOT

### Essential Commands (Run on EC2)

#### Check Bot Status
```bash
sudo systemctl status crypto-bot
```

#### View Live Logs
```bash
tail -f ~/ai-trading-bot/ai-log.txt
```

#### Stop Bot
```bash
sudo systemctl stop crypto-bot
```

#### Start Bot
```bash
sudo systemctl start crypto-bot
```

#### Restart Bot
```bash
sudo systemctl restart crypto-bot
```

#### View AI Stats
```bash
cd ~/ai-trading-bot
cat ai-historical-data.json | jq '.totalTrades, .generation, .aiAge'
```

#### Check Balance
```bash
cd ~/ai-trading-bot
node sync-true-balance.js
```

#### Update Bot Code
```bash
cd ~/ai-trading-bot
git pull
sudo systemctl restart crypto-bot
```

---

## 🔐 SECURITY BEST PRACTICES

### ✅ DO
- Keep your SSH key file (.pem) safe and private
- Use AWS Security Groups to limit SSH access to your IP
- Regularly update Ubuntu: `sudo apt update && sudo apt upgrade`
- Never commit .env file to git
- Use AWS IAM for additional security

### ❌ DON'T
- Share your SSH key with anyone
- Leave .pem file in Downloads folder
- Allow SSH from anywhere (0.0.0.0/0)
- Commit API keys to GitHub
- Run bot as root user

---

## 📊 MONITORING & ALERTS

### Set Up CloudWatch Alarms (Optional)

#### 1. Go to CloudWatch Console
https://console.aws.amazon.com/cloudwatch/

#### 2. Create Alarm
- **Metric:** EC2 > Per-Instance Metrics > CPUUtilization
- **Condition:** Greater than 90% for 5 minutes
- **Action:** Send email notification

#### 3. Create Status Check Alarm
- **Metric:** EC2 > Instance Status Check Failed
- **Action:** Automatically recover instance

---

## 💾 BACKUP YOUR AI BRAIN

### Download AI Brain to Local Machine

**From your local terminal (not EC2):**
```bash
# Download AI brain
scp -i ~/.ssh/crypto-bot-key.pem \
  ubuntu@YOUR-EC2-IP:~/ai-trading-bot/ai-historical-data.json \
  ~/ai-brain-backup.json

# Download trading state
scp -i ~/.ssh/crypto-bot-key.pem \
  ubuntu@YOUR-EC2-IP:~/ai-trading-bot/paper-trading-state.json \
  ~/trading-state-backup.json
```

### Restore AI Brain to EC2

**From your local terminal:**
```bash
# Upload AI brain
scp -i ~/.ssh/crypto-bot-key.pem \
  ~/ai-brain-backup.json \
  ubuntu@YOUR-EC2-IP:~/ai-trading-bot/ai-historical-data.json

# Restart bot
ssh -i ~/.ssh/crypto-bot-key.pem ubuntu@YOUR-EC2-IP \
  "sudo systemctl restart crypto-bot"
```

---

## 🆚 COMPARISON: AWS vs GitHub Actions vs Local

| Feature | AWS EC2 | GitHub Actions | Local PC |
|---------|---------|----------------|----------|
| **Truly Continuous** | ✅ Yes | ⚠️ Every 5 min | ✅ Yes |
| **Always On** | ✅ 24/7 | ✅ 24/7 | ❌ Only when PC on |
| **Free** | ✅ 12 months | ✅ Forever | ✅ Yes (electricity) |
| **Setup Difficulty** | 🟡 Medium | 🟢 Easy | 🟡 Medium |
| **Speed** | ✅ Fast | 🟡 Cold starts | ✅ Fast |
| **Control** | ✅ Full | ⚠️ Limited | ✅ Full |
| **Reliability** | ✅ 99.9% | ✅ 99.9% | ⚠️ Depends |
| **Remote Access** | ✅ Anywhere | ✅ Anywhere | ❌ No |

---

## 🏆 RECOMMENDED SETUP

### Best Configuration: **HYBRID APPROACH**

1. **Primary:** AWS EC2 (truly continuous, always on)
2. **Backup:** GitHub Actions (redundancy, already configured)

Both systems:
- Share same AI brain files via git
- Trade independently but complement each other
- Provide ultimate redundancy

**How to sync:**
- AWS bot commits AI brain to GitHub periodically
- GitHub Actions downloads latest AI brain
- Both learn and compound knowledge

---

## 🐛 TROUBLESHOOTING

### Bot Won't Start
```bash
# Check logs for errors
sudo journalctl -u crypto-bot -n 50

# Check file permissions
ls -la ~/ai-trading-bot/

# Verify .env file exists
cat ~/ai-trading-bot/.env
```

### Can't Connect via SSH
- Check Security Group allows SSH from your IP
- Verify key file permissions: `chmod 400 ~/.ssh/crypto-bot-key.pem`
- Check instance is running in EC2 console
- Try adding `-v` flag: `ssh -v -i ~/.ssh/crypto-bot-key.pem ubuntu@YOUR-IP`

### Out of Memory
- Upgrade to t2.small ($15/month but more RAM)
- Or add swap space:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Bot Crashes Constantly
```bash
# Check error logs
tail -100 ~/ai-trading-bot/ai-log.txt

# Check system resources
htop

# Restart with verbose logging
sudo systemctl stop crypto-bot
cd ~/ai-trading-bot
NODE_ENV=development node paper-trading-ai.js
```

---

## 💡 PRO TIPS

### 1. Set Up Elastic IP (Optional)
Prevents IP from changing when you stop/start instance.
- **Cost:** FREE if instance is running
- **Benefit:** Consistent SSH address

### 2. Enable Automatic Backups
Use AWS Snapshots to backup your entire instance:
- Go to EC2 > Snapshots
- Create snapshot of your instance
- Schedule weekly snapshots

### 3. Use tmux for Multiple Sessions
```bash
# Install tmux
sudo apt install tmux

# Start new session
tmux new -s bot

# Detach: Ctrl+B, then D
# Reattach: tmux attach -t bot
```

### 4. Set Up Automatic Updates
```bash
# Create update script
nano ~/update-bot.sh
```

Add:
```bash
#!/bin/bash
cd /home/ubuntu/ai-trading-bot
git pull
npm install
sudo systemctl restart crypto-bot
```

Make executable:
```bash
chmod +x ~/update-bot.sh
```

### 5. Monitor Data Transfer
Keep under 15 GB/month to stay free:
```bash
# Check network usage
sudo apt install vnstat
vnstat -d
```

---

## 🎉 SUCCESS CHECKLIST

- [ ] AWS account created
- [ ] EC2 instance launched (t2.micro)
- [ ] SSH key downloaded and secured
- [ ] Connected to EC2 via SSH
- [ ] Node.js 18 installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env file created with API keys
- [ ] Systemd service created
- [ ] Bot enabled and started
- [ ] Status shows "active (running)"
- [ ] Logs show trading activity
- [ ] AI brain file exists and growing
- [ ] Can disconnect SSH and bot keeps running

---

## 🚀 YOU'RE LIVE ON AWS!

Your bot is now:
✅ Running 24/7 in the cloud  
✅ Auto-restarting on failure  
✅ Starting on boot  
✅ Learning permanently  
✅ Trading automatically  
✅ Accessible from anywhere  

**Your AI will trade and learn forever on AWS!** 🎯💎

---

## 📞 NEXT STEPS

1. **Monitor First Hour:** Watch logs to ensure trades execute
2. **Set Up CloudWatch:** Get alerts if something goes wrong
3. **Schedule Backups:** Download AI brain weekly
4. **Optimize Settings:** Adjust trade size, profit targets based on performance

---

## 🔗 USEFUL LINKS

- **AWS Free Tier:** https://aws.amazon.com/free/
- **EC2 Console:** https://console.aws.amazon.com/ec2/
- **CloudWatch:** https://console.aws.amazon.com/cloudwatch/
- **Your Repository:** https://github.com/Fatmanbolt40/ai-trading-bot
- **Kraken API:** https://www.kraken.com/features/api

---

*Last Updated: November 2, 2025 - AWS Deployment Guide*
