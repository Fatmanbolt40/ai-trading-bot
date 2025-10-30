# 🚀 24/7 OPERATION SETUP GUIDE

This guide shows you how to run your Crypto AI bot continuously 24/7.

## 🎯 Choose Your Method

### ⭐ Option A: PM2 (RECOMMENDED)

**Best for:** Easy management, auto-restart, monitoring

#### Install PM2
```bash
npm install -g pm2
```

#### Start Bot
```bash
cd ~/crypto-ai
pm2 start paper-trading-ai.js --name crypto-ai
```

#### Save Configuration
```bash
pm2 save
```

#### Enable Auto-Start on Boot
```bash
pm2 startup
# Follow the command it outputs
```

#### Common PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs crypto-ai

# Stop bot
pm2 stop crypto-ai

# Restart bot
pm2 restart crypto-ai

# Delete bot
pm2 delete crypto-ai
```

---

### 🖥️ Option B: Systemd Service

**Best for:** System-level integration, production servers

#### 1. Edit Service File
```bash
cd ~/crypto-ai
nano crypto-ai.service

# Replace %USER% with your username
# Update paths if needed
```

#### 2. Install Service
```bash
sudo cp crypto-ai.service /etc/systemd/system/
sudo systemctl daemon-reload
```

#### 3. Start Service
```bash
sudo systemctl start crypto-ai
```

#### 4. Enable Auto-Start
```bash
sudo systemctl enable crypto-ai
```

#### Common Systemd Commands
```bash
# Check status
sudo systemctl status crypto-ai

# View logs
sudo journalctl -u crypto-ai -f

# Stop service
sudo systemctl stop crypto-ai

# Restart service
sudo systemctl restart crypto-ai

# Disable auto-start
sudo systemctl disable crypto-ai
```

---

### 📺 Option C: Screen Session

**Best for:** Quick setup, SSH sessions

#### Start Screen
```bash
screen -S crypto-ai
```

#### Run Bot
```bash
cd ~/crypto-ai
node paper-trading-ai.js
```

#### Detach (Keep Running)
```
Press: Ctrl + A, then D
```

#### Reattach to Session
```bash
screen -r crypto-ai
```

#### List Sessions
```bash
screen -ls
```

#### Kill Session
```bash
screen -X -S crypto-ai quit
```

---

## 📊 Monitoring

### PM2 Dashboard
```bash
pm2 monit
```

### Real-time Logs
```bash
# PM2
pm2 logs crypto-ai --lines 100

# Systemd
sudo journalctl -u crypto-ai -f

# Screen
screen -r crypto-ai

# Direct file
tail -f ~/crypto-ai/ai-log.txt
```

### Check Balance
```bash
cd ~/crypto-ai
node check-real-balance.js
```

### Web Dashboard
```bash
# In separate terminal
node dashboard-server.js

# Open browser: http://your-server-ip:3000
```

---

## 🔧 Troubleshooting

### Bot Won't Start

**Check Node.js:**
```bash
node --version
# Should be v18+
```

**Check Dependencies:**
```bash
cd ~/crypto-ai
npm install
```

**Check .env File:**
```bash
cat .env
# Should have KRAKEN_API_KEY and KRAKEN_API_SECRET
```

### Bot Keeps Crashing

**View Error Logs:**
```bash
# PM2
pm2 logs crypto-ai --err

# Systemd
sudo journalctl -u crypto-ai -n 100
```

**Common Issues:**
- Invalid API keys → Check .env file
- Network issues → Check internet connection
- Insufficient balance → Add funds to Kraken
- Rate limits → Bot should auto-recover

### High Memory Usage

**Check Process:**
```bash
# PM2
pm2 monit

# System
top -p $(pgrep -f paper-trading-ai)
```

**Restart if Needed:**
```bash
# PM2
pm2 restart crypto-ai

# Systemd
sudo systemctl restart crypto-ai
```

---

## 🔐 Security Tips

1. **Secure .env File:**
   ```bash
   chmod 600 ~/crypto-ai/.env
   ```

2. **Limit API Permissions:**
   - Enable "Query Funds" and "Create & Modify Orders"
   - Disable "Withdraw Funds"

3. **Monitor Regularly:**
   - Check logs daily
   - Review trades weekly
   - Verify balance matches Kraken

4. **Backup State:**
   ```bash
   cp ~/crypto-ai/paper-trading-state.json ~/backups/
   ```

---

## 💡 Best Practices

### Daily Routine
1. Check bot status: `pm2 status` or `sudo systemctl status crypto-ai`
2. Review logs: `tail -50 ~/crypto-ai/ai-log.txt`
3. Verify balance: `node check-real-balance.js`

### Weekly Tasks
1. Review trade history
2. Analyze performance
3. Adjust profit targets if needed
4. Update bot if new version available

### Monthly Tasks
1. Backup state files
2. Review API key security
3. Check for updates
4. Optimize settings based on performance

---

## 🆘 Emergency Commands

### Stop Everything Immediately
```bash
# PM2
pm2 stop crypto-ai

# Systemd
sudo systemctl stop crypto-ai

# Screen
screen -X -S crypto-ai quit

# Force kill
pkill -9 -f paper-trading-ai
```

### Sell All Positions
```bash
cd ~/crypto-ai
node force-sell-all.js
```

### Reset State (Keeps Kraken Positions)
```bash
cd ~/crypto-ai
node quick-reset.js
```

---

## 📞 Getting Help

1. Check logs first
2. Review EXIT_PLAN.md
3. Read documentation in docs/
4. Create GitHub issue

---

**Your bot is now ready for 24/7 operation! 🎉**

*Monitor regularly and trade responsibly.*
