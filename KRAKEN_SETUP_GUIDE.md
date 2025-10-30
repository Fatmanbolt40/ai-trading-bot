# 🚀 Kraken API Setup & Funding Guide

## 📋 Table of Contents
1. [Setting Up Your Kraken Account](#1-setting-up-your-kraken-account)
2. [Creating API Keys](#2-creating-api-keys)
3. [Funding Your Account](#3-funding-your-account)
4. [Testing the Integration](#4-testing-the-integration)
5. [Security Best Practices](#5-security-best-practices)
6. [Live Trading with Your AI](#6-live-trading-with-your-ai)

---

## 1. Setting Up Your Kraken Account

### Step 1: Create Account
1. Go to [https://www.kraken.com](https://www.kraken.com)
2. Click **"Sign Up"**
3. Provide email and create strong password
4. Verify your email address

### Step 2: Complete Verification (KYC)
For trading, you need to verify your identity:

1. Log in to Kraken
2. Go to **Settings → Account → Verification**
3. Choose verification level:
   - **Starter**: $100/day withdrawal limit
   - **Intermediate**: $1,000/day withdrawal limit  
   - **Pro**: $10,000/day withdrawal limit

4. Upload documents:
   - Government ID (driver's license, passport, etc.)
   - Proof of address (utility bill, bank statement)
   - Photo selfie (for higher tiers)

⏱️ **Verification Time**: Usually 1-3 business days

---

## 2. Creating API Keys

### Step 1: Generate API Credentials
1. Log in to Kraken
2. Go to **Settings → API**
3. Click **"Generate New Key"**

### Step 2: Configure Permissions
**For Paper Trading (Testing)**:
- ✅ Query Funds
- ✅ Query Open Orders & Trades
- ✅ Query Closed Orders & Trades

**For Live Trading (Real Money)**:
- ✅ Query Funds
- ✅ Query Open Orders & Trades
- ✅ Query Closed Orders & Trades
- ✅ Create & Modify Orders
- ✅ Cancel/Close Orders
- ❌ Withdraw Funds (KEEP THIS OFF for security!)

### Step 3: Save Your Credentials
You'll receive:
- **API Key**: `api-key-1629522534512` (example)
- **Private Key**: Long base64 string (KEEP SECRET!)

⚠️ **IMPORTANT**: 
- Save these immediately - you can't view the private key again!
- Never share your private key
- Never commit keys to GitHub

---

## 3. Funding Your Account

### Option 1: Bank Transfer (ACH/Wire) - LOWEST FEES
**Best for**: Large amounts, long-term trading

1. Go to **Funding → Deposit**
2. Select **USD** or your currency
3. Choose **Bank Transfer (ACH)** or **Wire Transfer**
4. Follow instructions to link your bank
5. Initiate transfer

**Fees**: 
- ACH: FREE (US only)
- Wire: $5-25 fee
- Processing: 1-5 business days

**Pros**: Lowest fees, no trading limits  
**Cons**: Slow (1-5 days)

---

### Option 2: Debit/Credit Card - FASTEST
**Best for**: Quick start, small amounts

1. Go to **Funding → Deposit**
2. Select **USD** 
3. Choose **Instant Buy (Card)**
4. Enter amount and card details
5. Confirm purchase

**Fees**: 
- 3.75% + $0.25 per transaction
- Example: $100 deposit = $3.75 fee

**Pros**: Instant (1-5 minutes)  
**Cons**: High fees, $5,000/week limit

---

### Option 3: Cryptocurrency Transfer - FOR ADVANCED USERS
**Best for**: If you already have crypto elsewhere

1. Go to **Funding → Deposit**
2. Select cryptocurrency (e.g., **Bitcoin**, **Ethereum**, **USDT**)
3. Copy your Kraken deposit address
4. Send crypto from external wallet/exchange
5. Wait for confirmations (10-60 minutes)

**Fees**: 
- Network fees only (varies by crypto)
- Bitcoin: ~$2-10
- Ethereum: ~$5-20
- USDT (TRC20): ~$1

**Pros**: Low fees, works internationally  
**Cons**: Requires existing crypto, network delays

---

### Option 4: PayPal - MODERATE SPEED
**Best for**: US users wanting balance between speed/fees

1. Link PayPal to Kraken (if available in your region)
2. Transfer funds
3. 1-2% fee typically

---

## 4. Testing the Integration

### Step 1: Set Up Environment Variables
Never hardcode your API keys! Use environment variables:

```bash
# Create a .env file
cd ~/crypto-ai
nano .env
```

Add your credentials:
```
KRAKEN_API_KEY=your-api-key-here
KRAKEN_API_SECRET=your-private-key-here
```

Save with `Ctrl+X`, `Y`, `Enter`

### Step 2: Install dotenv
```bash
npm install dotenv
```

### Step 3: Update kraken-demo.js
```javascript
require('dotenv').config();

const KRAKEN_API_KEY = process.env.KRAKEN_API_KEY;
const KRAKEN_API_SECRET = process.env.KRAKEN_API_SECRET;
```

### Step 4: Test Connection
```bash
# Test with public data (no API key needed)
node kraken-demo.js
```

You should see:
```
🚀 Starting Kraken WebSocket Demo...
🌐 Connecting to Kraken Public WebSocket...
✅ Connected to Kraken Public WebSocket
📊 Subscribed to ticker: SOL/USD
💹 Subscribed to trades: SOL/USD
✅ Connected! Receiving live market data...
💰 SOL/USD - Price: $135.42 | Bid: $135.41 | Ask: $135.43
```

### Step 5: Test Private API (Balance Check)
```bash
# Check your account balance
node -e "
const KrakenWebSocket = require('./kraken-integration');
require('dotenv').config();

const kraken = new KrakenWebSocket(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);

kraken.getBalance().then(balance => {
    console.log('💰 Your Kraken Balance:', balance);
    process.exit(0);
});
"
```

---

## 5. Security Best Practices

### ✅ DO:
- ✅ Use environment variables for API keys
- ✅ Enable 2FA (Two-Factor Authentication) on Kraken
- ✅ Set up Master Key (additional security layer)
- ✅ Create separate API keys for testing vs. production
- ✅ Use IP whitelisting (restrict API to your server IP)
- ✅ Start with small amounts ($10-50)
- ✅ Test thoroughly in paper trading mode first
- ✅ Set up email/SMS alerts for trades

### ❌ DON'T:
- ❌ Never commit API keys to GitHub
- ❌ Never enable "Withdraw Funds" permission on trading bots
- ❌ Never share your private key
- ❌ Don't start with large amounts
- ❌ Don't trade without stop-losses
- ❌ Don't leave bots running unmonitored

### Create a .gitignore file:
```bash
echo ".env
*.log
node_modules/
ai-state.json
nohup.out" > .gitignore
```

---

## 6. Live Trading with Your AI

### Step 1: Integrate Kraken with Your AI
Edit `advanced-crypto-ai.js` to use real Kraken data:

```javascript
const KrakenWebSocket = require('./kraken-integration');
require('dotenv').config();

class AdvancedCryptoAI {
    constructor() {
        // ... existing code ...
        
        // Initialize Kraken connection
        this.kraken = new KrakenWebSocket(
            process.env.KRAKEN_API_KEY,
            process.env.KRAKEN_API_SECRET
        );
        
        // Connect to real market data
        this.setupKrakenIntegration();
    }
    
    async setupKrakenIntegration() {
        await this.kraken.connectPublic();
        
        // Update market data from Kraken
        this.kraken.onTicker = (ticker) => {
            this.currentPrice = ticker.close;
            this.marketData.trend = ((ticker.close - ticker.open) / ticker.open) * 100;
            this.marketData.volume = ticker.volume;
        };
    }
    
    // When AI wants to trade
    async executeTrade(action, amount) {
        if (action === 'BUY') {
            return await this.kraken.placeMarketOrder('SOL/USD', 'buy', amount);
        } else if (action === 'SELL') {
            return await this.kraken.placeMarketOrder('SOL/USD', 'sell', amount);
        }
    }
}
```

### Step 2: Start with Paper Trading
Test your AI with simulated money first:
```bash
# Run in simulation mode (default)
node advanced-crypto-ai.js
```

### Step 3: Enable Live Trading (BE CAREFUL!)
```bash
# Set a flag for live trading
LIVE_TRADING=true node advanced-crypto-ai.js
```

### Step 4: Monitor Your Bot
```bash
# Watch real-time logs
tail -f nohup.out

# Check your browser dashboard
# http://localhost:3000
```

---

## 📊 Recommended Starting Amounts

| Experience Level | Amount | Purpose |
|-----------------|--------|---------|
| **Complete Beginner** | $10-25 | Learning, testing |
| **Some Experience** | $50-100 | Small-scale trading |
| **Experienced** | $200-500 | Active trading |
| **Advanced** | $1,000+ | Serious trading |

⚠️ **Never invest more than you can afford to lose!**

---

## 🆘 Troubleshooting

### Issue: "Invalid API Key"
**Solution**: 
- Verify you copied the full API key
- Check that API key is active in Kraken settings
- Ensure you're using the correct key/secret pair

### Issue: "Permission Denied"
**Solution**:
- Check API key permissions in Kraken
- Ensure "Create & Modify Orders" is enabled for trading
- Regenerate API key if needed

### Issue: "Insufficient Funds"
**Solution**:
- Check your Kraken balance
- Wait for deposits to clear (ACH takes 1-5 days)
- Reduce trading amount

### Issue: "Rate Limit Exceeded"
**Solution**:
- Slow down API calls
- Kraken has rate limits: 15-20 calls/minute
- Add delays between requests

---

## 📞 Support

**Kraken Support**: [support.kraken.com](https://support.kraken.com)  
**API Documentation**: [docs.kraken.com/rest](https://docs.kraken.com/rest/)  
**WebSocket Docs**: [docs.kraken.com/websockets](https://docs.kraken.com/websockets/)

---

## ⚖️ Legal Disclaimer

- Cryptocurrency trading involves substantial risk
- Past performance does not guarantee future results
- This is educational software only
- Always comply with local regulations
- Consult a financial advisor before trading
- The developers are not responsible for financial losses

---

## 🎯 Quick Start Checklist

- [ ] Create Kraken account
- [ ] Complete identity verification (1-3 days)
- [ ] Fund account with preferred method
- [ ] Generate API keys with appropriate permissions
- [ ] Create `.env` file with credentials
- [ ] Test public WebSocket connection
- [ ] Test private API (balance check)
- [ ] Run AI in simulation mode
- [ ] Monitor for 24-48 hours
- [ ] Start live trading with small amount ($10-25)
- [ ] Scale up gradually based on performance

---

**Good luck with your trading! Start small, learn continuously, and trade responsibly! 🚀**
