# 🤖 Crypto Trading AI Bot

**Intelligent cryptocurrency trading bot with neural network-based decision making for Kraken exchange.**

## 🌟 Features

- **Multi-Coin Trading**: Monitors 614+ cryptocurrency pairs (memecoins, DeFi, L1s, bluechips)
- **Neural Network AI**: Learns from market patterns and adapts strategies
- **Real-time WebSocket**: Live price feeds from Kraken
- **Smart Position Management**: Portfolio-aware trading with duplicate prevention
- **Profit-Focused**: Configurable profit targets (default 1.4%)
- **Risk Management**: Stop losses, position sizing, and balance protection
- **24/7 Operation**: Designed for continuous operation with auto-recovery
- **Real Money Trading**: Direct integration with Kraken Spot & Futures APIs

## 📋 Prerequisites

- **Node.js** v18+ 
- **Kraken Account** with API keys
- **Linux/Unix** environment (recommended)
- **Active internet** connection

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/crypto-ai.git
cd crypto-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

Create a `.env` file:

```bash
# Kraken API Credentials
KRAKEN_API_KEY=your_api_key_here
KRAKEN_API_SECRET=your_api_secret_here

# Trading Settings
USE_REAL_MONEY=true
USE_FUTURES=true
INITIAL_BALANCE=10.00
```

**⚠️ Get API Keys:** See [HOW_TO_GET_API_KEYS.txt](./HOW_TO_GET_API_KEYS.txt)

### 4. Sync Balance (First Time)

```bash
node sync-true-balance.js
```

This fetches your real Kraken balance and syncs the AI state.

### 5. Start Trading

```bash
node paper-trading-ai.js
```

## 📊 Key Scripts

| Script | Purpose |
|--------|---------|
| `paper-trading-ai.js` | Main trading bot (run this!) |
| `sync-true-balance.js` | Sync AI with Kraken balance |
| `create-exit-plan.js` | Generate exit strategy for positions |
| `check-real-balance.js` | View current portfolio value |
| `force-sell-all.js` | Emergency liquidation (use with caution) |
| `dashboard-server.js` | Web dashboard (port 3000) |

## 🎯 Configuration

Edit profit targets in `paper-trading-ai.js`:

```javascript
this.settings.minProfit = 0.015;  // 1.5% minimum profit
this.settings.targetProfit = 0.015;  // 1.5% target profit
this.settings.stopLoss = 0.03;  // 3% stop loss
```

**Trade Settings:**
- **Trade Size:** $1.50 per position
- **Profit Target:** 1.5% (sells automatically)
- **Stop Loss:** -3% (cuts losses automatically)
- **Markets:** 400+ cryptocurrencies monitored
- **Exit Strategy:** Only exits at 1.5% profit OR -3% loss

## 🔐 Security

- **Never commit `.env`** - Contains API keys
- **Enable API restrictions** on Kraken (trading only, no withdrawals)
- **Use separate keys** for different bots
- **Monitor regularly** via dashboard or logs

## 🏃‍♂️ 24/7 Operation

### Option A: PM2 (Recommended)

```bash
npm install -g pm2
pm2 start paper-trading-ai.js --name crypto-ai
pm2 save
pm2 startup
```

### Option B: Screen Session

```bash
screen -S crypto-ai
node paper-trading-ai.js
# Press Ctrl+A then D to detach
```

### Option C: Systemd Service

See `crypto-ai.service` for systemd configuration.

## 📈 Monitoring

### Dashboard
```bash
node dashboard-server.js
# Open http://localhost:3000
```

### Logs
```bash
tail -f ai-log.txt
```

### Balance Check
```bash
node check-real-balance.js
```

## 🛑 Exit Plan

Generate systematic exit strategy:

```bash
node create-exit-plan.js
cat EXIT_PLAN.md
```

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Detailed setup guide
- [KRAKEN_SETUP_GUIDE.md](./KRAKEN_SETUP_GUIDE.md) - Kraken account setup
- [AI_INTELLIGENCE_SYSTEM.md](./AI_INTELLIGENCE_SYSTEM.md) - How the AI works
- [OVERNIGHT_GUIDE.md](./OVERNIGHT_GUIDE.md) - 24/7 operation tips

## ⚙️ System Requirements

- **RAM**: 512MB minimum (1GB recommended)
- **CPU**: 1 core minimum
- **Disk**: 100MB free space
- **Network**: Stable connection (WebSocket intensive)

## 🐛 Troubleshooting

### Connection Issues
```bash
# Check Kraken status
node check-kraken-status.js
```

### Balance Mismatch
```bash
# Re-sync with Kraken
node sync-true-balance.js
```

### Reset Everything
```bash
# WARNING: Clears state (positions persist on Kraken)
node quick-reset.js
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## ⚠️ Disclaimer

**This bot trades with REAL MONEY. Use at your own risk.**

- Cryptocurrency trading is highly risky
- Past performance does not guarantee future results
- Only trade with money you can afford to lose
- Always test with small amounts first
- Monitor the bot regularly
- No warranty or guarantee provided

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Kraken Exchange for robust API
- Node.js community for excellent libraries
- All contributors and testers

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: See docs folder

---

**Made with ❤️ by crypto enthusiasts**

*Happy Trading! 🚀*
