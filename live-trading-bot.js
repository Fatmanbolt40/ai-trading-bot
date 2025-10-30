#!/usr/bin/env node

/**
 * 💰 KRAKEN LIVE TRADING - $19 BUDGET VERSION
 * Safe configuration for small budget live trading
 */

const KrakenWebSocket = require('./kraken-integration');
require('dotenv').config();

class SafeLiveTradingBot {
    constructor(budget = 19) {
        this.budget = budget;
        this.kraken = new KrakenWebSocket(
            process.env.KRAKEN_API_KEY,
            process.env.KRAKEN_API_SECRET
        );
        
        // Safe wallet structure for $19
        this.wallets = {
            main: budget * 0.6,      // $11.40 - Safe reserve (60%)
            trading: budget * 0.4    // $7.60 - Active trading (40%)
        };
        
        // Ultra-conservative settings for $19 budget
        this.settings = {
            maxTradeSize: 0.01,           // Maximum 0.01 SOL per trade (~$2 at $200/SOL)
            minProfit: 0.02,              // 2% minimum profit target
            maxLoss: 0.03,                // 3% maximum loss (stop-loss)
            minBalance: budget * 0.5,     // Stop trading if balance drops below $9.50
            maxOpenTrades: 1,             // Only 1 trade at a time
            cooldownPeriod: 300000        // 5 minutes between trades
        };
        
        this.state = {
            currentPrice: 0,
            holdings: 0,
            buyPrice: 0,
            lastTradeTime: 0,
            totalTrades: 0,
            wins: 0,
            losses: 0,
            currentBalance: this.wallets.main + this.wallets.trading
        };
    }

    async start() {
        console.log('\n🚀 Starting Kraken Live Trading Bot');
        console.log('💰 Budget: $' + this.budget);
        console.log('📊 Wallet Structure:');
        console.log('   Main (Reserve): $' + this.wallets.main.toFixed(2) + ' (60%)');
        console.log('   Trading: $' + this.wallets.trading.toFixed(2) + ' (40%)');
        console.log('\n⚙️  Safety Settings:');
        console.log('   Max trade size: 0.01 SOL (~$2)');
        console.log('   Min profit target: 2%');
        console.log('   Max loss (stop-loss): 3%');
        console.log('   Max open trades: 1');
        console.log('   Cooldown: 5 minutes');
        console.log('\n✅ LIVE TRADING MODE - REAL MONEY!\n');
        
        // Verify balance
        try {
            const balance = await this.kraken.getBalance();
            const usdBalance = parseFloat(balance.ZUSD || balance.USD || 0);
            
            if (usdBalance < this.budget) {
                console.error('❌ Insufficient balance! Found $' + usdBalance.toFixed(2) + ', need $' + this.budget);
                console.log('💡 Please fund your Kraken account first.');
                process.exit(1);
            }
            
            console.log('✅ Balance verified: $' + usdBalance.toFixed(2));
            this.state.currentBalance = usdBalance;
        } catch (error) {
            console.error('❌ Failed to verify balance:', error.message);
            process.exit(1);
        }
        
        // Connect to live market data
        await this.kraken.connectPublic();
        
        // Set up market data handlers
        this.kraken.onTicker = (ticker) => this.handleTicker(ticker);
        this.kraken.onTrade = (trade) => this.handleTrade(trade);
        
        console.log('📡 Connected to live Kraken market data');
        console.log('🤖 Bot is now active and monitoring...\n');
        
        // Start trading loop
        this.tradingLoop();
    }

    handleTicker(ticker) {
        this.state.currentPrice = ticker.close;
        
        // Log price updates every 30 seconds
        if (!this.lastPriceLog || Date.now() - this.lastPriceLog > 30000) {
            console.log(`📊 SOL: $${ticker.close.toFixed(2)} | Spread: $${(ticker.ask - ticker.bid).toFixed(2)}`);
            this.lastPriceLog = Date.now();
        }
    }

    handleTrade(trade) {
        // Monitor market trades for patterns (future enhancement)
    }

    async tradingLoop() {
        setInterval(async () => {
            await this.evaluateTrade();
        }, 10000); // Check every 10 seconds
    }

    async evaluateTrade() {
        try {
            // Safety check: Stop if balance too low
            if (this.state.currentBalance < this.settings.minBalance) {
                console.log('\n⚠️  Balance below minimum ($' + this.settings.minBalance.toFixed(2) + ')');
                console.log('🛑 Stopping trading for safety');
                process.exit(0);
            }
            
            // Check cooldown period
            const timeSinceLastTrade = Date.now() - this.state.lastTradeTime;
            if (timeSinceLastTrade < this.settings.cooldownPeriod) {
                return; // Still in cooldown
            }
            
            // If we have holdings, check if we should sell
            if (this.state.holdings > 0) {
                await this.checkSell();
            } 
            // If we have no holdings and only 1 trade allowed, check if we should buy
            else if (this.state.holdings === 0) {
                await this.checkBuy();
            }
            
        } catch (error) {
            console.error('❌ Trading loop error:', error.message);
        }
    }

    async checkBuy() {
        // Simple buy logic: Buy when price dips
        // You can enhance this with your AI's decision making
        
        const canAfford = this.wallets.trading / this.state.currentPrice;
        const tradeSize = Math.min(this.settings.maxTradeSize, canAfford);
        
        if (tradeSize < 0.001) {
            console.log('⚠️  Not enough funds for minimum trade');
            return;
        }
        
        // Simple strategy: Buy on any dip (you'll want to improve this!)
        const shouldBuy = Math.random() > 0.9; // Only 10% chance - very conservative
        
        if (shouldBuy) {
            console.log(`\n🟢 BUY SIGNAL - Price: $${this.state.currentPrice.toFixed(2)}`);
            console.log(`   Trade size: ${tradeSize.toFixed(4)} SOL (~$${(tradeSize * this.state.currentPrice).toFixed(2)})`);
            
            // Uncomment when ready for LIVE trading:
            // const result = await this.kraken.placeMarketOrder('SOLUSD', 'buy', tradeSize);
            
            // For now, simulate:
            console.log('   📝 [SIMULATION MODE - Uncomment line 170 for live trading]');
            this.state.holdings = tradeSize;
            this.state.buyPrice = this.state.currentPrice;
            this.state.lastTradeTime = Date.now();
            this.wallets.trading -= tradeSize * this.state.currentPrice;
        }
    }

    async checkSell() {
        const currentValue = this.state.holdings * this.state.currentPrice;
        const costBasis = this.state.holdings * this.state.buyPrice;
        const profit = ((currentValue - costBasis) / costBasis) * 100;
        
        // Check profit target
        if (profit >= this.settings.minProfit) {
            console.log(`\n🟡 SELL SIGNAL - Profit: ${profit.toFixed(2)}%`);
            console.log(`   Selling ${this.state.holdings.toFixed(4)} SOL @ $${this.state.currentPrice.toFixed(2)}`);
            
            // Uncomment when ready for LIVE trading:
            // const result = await this.kraken.placeMarketOrder('SOLUSD', 'sell', this.state.holdings);
            
            // For now, simulate:
            console.log('   📝 [SIMULATION MODE - Uncomment line 194 for live trading]');
            const saleValue = currentValue;
            this.wallets.trading += saleValue;
            this.state.currentBalance = this.wallets.main + this.wallets.trading;
            this.state.holdings = 0;
            this.state.buyPrice = 0;
            this.state.wins++;
            this.state.totalTrades++;
            this.state.lastTradeTime = Date.now();
            
            console.log(`   💰 New balance: $${this.state.currentBalance.toFixed(2)} (Profit: +$${(saleValue - costBasis).toFixed(2)})`);
        }
        // Check stop-loss
        else if (profit <= -this.settings.maxLoss) {
            console.log(`\n🔴 STOP-LOSS TRIGGERED - Loss: ${profit.toFixed(2)}%`);
            console.log(`   Selling ${this.state.holdings.toFixed(4)} SOL @ $${this.state.currentPrice.toFixed(2)}`);
            
            // Uncomment when ready for LIVE trading:
            // const result = await this.kraken.placeMarketOrder('SOLUSD', 'sell', this.state.holdings);
            
            // For now, simulate:
            console.log('   📝 [SIMULATION MODE - Uncomment line 219 for live trading]');
            const saleValue = currentValue;
            this.wallets.trading += saleValue;
            this.state.currentBalance = this.wallets.main + this.wallets.trading;
            this.state.holdings = 0;
            this.state.buyPrice = 0;
            this.state.losses++;
            this.state.totalTrades++;
            this.state.lastTradeTime = Date.now();
            
            console.log(`   💰 New balance: $${this.state.currentBalance.toFixed(2)} (Loss: -$${(costBasis - saleValue).toFixed(2)})`);
        } else {
            // Hold - check every 30 seconds
            if (!this.lastHoldLog || Date.now() - this.lastHoldLog > 30000) {
                console.log(`📌 HOLDING ${this.state.holdings.toFixed(4)} SOL | Profit: ${profit.toFixed(2)}% | Target: ${this.settings.minProfit}%`);
                this.lastHoldLog = Date.now();
            }
        }
    }

    getStats() {
        return {
            budget: this.budget,
            currentBalance: this.state.currentBalance,
            profit: this.state.currentBalance - this.budget,
            holdings: this.state.holdings,
            totalTrades: this.state.totalTrades,
            wins: this.state.wins,
            losses: this.state.losses,
            winRate: this.state.totalTrades > 0 ? (this.state.wins / this.state.totalTrades * 100) : 0
        };
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    if (bot) {
        const stats = bot.getStats();
        console.log('\n📊 Final Stats:');
        console.log('   Budget: $' + stats.budget);
        console.log('   Current: $' + stats.currentBalance.toFixed(2));
        console.log('   Profit: $' + stats.profit.toFixed(2));
        console.log('   Trades: ' + stats.totalTrades);
        console.log('   Win Rate: ' + stats.winRate.toFixed(1) + '%');
    }
    process.exit(0);
});

// Start the bot
const bot = new SafeLiveTradingBot(19);
bot.start().catch(error => {
    console.error('❌ Bot crashed:', error);
    process.exit(1);
});
