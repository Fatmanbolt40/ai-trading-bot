#!/usr/bin/env node

/**
 * 🚀 ADVANCED CRYPTO TRADING AI - KRAKEN PRODUCTION VERSION
 * 
 * Features:
 * - Super advanced neural network AI that learns "buy low, sell high"
 * - REAL Kraken WebSocket market data (MULTI-COIN SCANNER)
 * - Auto-detects best trading opportunities across markets
 * - Whale tracking & trader pattern recognition
 * - Exact wallet structure: Main (60%), Banker + 4 Traders (40% split)
 * - Profit optimization with hold-until-profit strategy
 * - Genetic algorithm evolution for maximum learning
 * - Persistent state saving (never loses progress)
 * - Fast-paced training for rapid AI advancement
 * - Switches to most volatile/profitable markets automatically
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

class SmartSingleTraderWallet {
    constructor(totalBudget = 19) {
        // SINGLE TRADER IN FULL CONTROL
        this.totalFunds = totalBudget;          // Your entire budget
        this.availableCash = totalBudget;       // Cash ready to trade
// MODIFIED FOR SINGLE TRADER WITH 9 BUDGET
        return {
            id: this.id,
            balance: this.balance,
            holdings: this.holdings,
            trades: this.trades,
            wins: this.wins,
            losses: this.losses,
            winRate: winRate,
            fitness: this.fitness,
            avgProfit: avgProfit,
            isElite: this.isElite,
            dna: { ...this.dna }
        };
    }
}

// 🐋 WHALE & TRADER TRACKING SYSTEM
class WhaleTracker {
    constructor() {
        this.whales = new Map(); // Address -> whale data
        this.traders = new Map(); // Address -> trader pattern
        this.marketTrades = []; // Recent market trades
        this.maxHistory = 1000;
    }

    analyzeMarketTrade(trade) {
        const { price, volume, side, timestamp } = trade;
        const value = price * volume;
        
        // Track large trades (whales)
        if (value > 1000) { // $1000+ = whale
            const whaleKey = `whale_${timestamp}`;
            this.whales.set(whaleKey, {
                price,
                volume,
                value,
                side,
                timestamp,
                type: value > 5000 ? '🐋 MEGA WHALE' : '🐳 WHALE'
            });
            
            // Clean old whales
            if (this.whales.size > 100) {
                const oldest = Array.from(this.whales.keys())[0];
                this.whales.delete(oldest);
            }
        }
        
        // Track all trades for pattern analysis
        this.marketTrades.push({ price, volume, side, timestamp });
        if (this.marketTrades.length > this.maxHistory) {
            this.marketTrades.shift();
        }
    }

    getMarketSentiment() {
        if (this.marketTrades.length < 10) return 0.5; // Neutral
        
        const recent = this.marketTrades.slice(-50);
        const buyVolume = recent.filter(t => t.side === 'buy').reduce((sum, t) => sum + t.volume, 0);
        const sellVolume = recent.filter(t => t.side === 'sell').reduce((sum, t) => sum + t.volume, 0);
        const totalVolume = buyVolume + sellVolume;
        
        return totalVolume > 0 ? buyVolume / totalVolume : 0.5;
    }

    getWhaleSentiment() {
        if (this.whales.size === 0) return 0.5;
        
        const recentWhales = Array.from(this.whales.values()).slice(-20);
        const bullish = recentWhales.filter(w => w.side === 'buy').length;
        const bearish = recentWhales.filter(w => w.side === 'sell').length;
        
        return (bullish + 1) / (bullish + bearish + 2); // Smoothed
    }

    getStats() {
        return {
            totalWhales: this.whales.size,
            totalTrades: this.marketTrades.length,
            marketSentiment: this.getMarketSentiment(),
            whaleSentiment: this.getWhaleSentiment()
        };
    }
}

// 🌐 KRAKEN WEBSOCKET MARKET DATA WITH MULTI-COIN SCANNING
class KrakenMarketData {
    constructor(whaleTracker) {
        this.ws = null;
        this.whaleTracker = whaleTracker;
        this.connected = false;
        
        // Current active market
        this.activeMarket = 'SOL/USD';
        this.currentPrice = 200;
        this.currentBid = 200;
        this.currentAsk = 200;
        this.priceHistory = [];
        this.volumeHistory = [];
        
        // EXPANDED Multi-market tracking - AI can discover and add more!
        this.markets = {
            // Major Coins (High Volume)
            'BTC/USD': { price: 35000, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: true },
            'ETH/USD': { price: 2500, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: true },
            
            // Layer 1 Platforms
            'SOL/USD': { price: 200, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: true },
            'ADA/USD': { price: 0.30, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: true },
            'AVAX/USD': { price: 25, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'DOT/USD': { price: 5, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'ATOM/USD': { price: 8, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'NEAR/USD': { price: 4, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            
            // DeFi & Tokens
            'XRP/USD': { price: 0.50, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: true },
            'MATIC/USD': { price: 0.70, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'LINK/USD': { price: 10, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'UNI/USD': { price: 6, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'AAVE/USD': { price: 85, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            
            // Meme & High Volatility
            'DOGE/USD': { price: 0.08, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'SHIB/USD': { price: 0.000015, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'PEPE/USD': { price: 0.0000012, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            
            // Layer 2 & Scaling
            'ARB/USD': { price: 1.20, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'OP/USD': { price: 2.50, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            
            // Privacy & Specialized
            'XMR/USD': { price: 150, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'LTC/USD': { price: 70, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            
            // Emerging & High Potential
            'FET/USD': { price: 0.40, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'RENDER/USD': { price: 3.50, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'INJ/USD': { price: 25, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false },
            'TIA/USD': { price: 8, volatility: 0, trend: 0, volume: 0, score: 0, history: [], discovered: false }
        };
        
        this.lastMarketSwitch = Date.now();
        this.marketSwitchCooldown = 60000; // 1 minute cooldown between switches
        this.lastDiscoveryAttempt = Date.now();
        this.discoveryInterval = 300000; // Try to discover new markets every 5 minutes
    }
    
    // AI Auto-Discovery: Find and activate promising undiscovered markets
    async discoverNewMarkets() {
        const timeSinceDiscovery = Date.now() - this.lastDiscoveryAttempt;
        if (timeSinceDiscovery < this.discoveryInterval) return;
        
        this.lastDiscoveryAttempt = Date.now();
        
        // Find undiscovered markets with potential
        const undiscovered = Object.entries(this.markets)
            .filter(([pair, data]) => !data.discovered && data.history.length >= 20);
        
        if (undiscovered.length === 0) return;
        
        // Score undiscovered markets
        const scored = undiscovered.map(([pair, data]) => ({
            pair,
            data,
            potentialScore: this.calculateMarketScore(pair)
        })).sort((a, b) => b.potentialScore - a.potentialScore);
        
        // Discover top 3 promising markets
        const toDiscover = scored.slice(0, 3).filter(m => m.potentialScore > 0.1);
        
        if (toDiscover.length > 0) {
            console.log('\n🔍 AI MARKET DISCOVERY:');
            toDiscover.forEach(({ pair, potentialScore }) => {
                this.markets[pair].discovered = true;
                console.log(`   ✨ DISCOVERED: ${pair} | Potential Score: ${potentialScore.toFixed(2)}`);
            });
            
            // Subscribe to discovered markets for trading
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                const newPairs = toDiscover.map(m => m.pair);
                this.ws.send(JSON.stringify({
                    event: 'subscribe',
                    pair: newPairs,
                    subscription: { name: 'trade' }
                }));
            }
        }
    }
    
    // Calculate opportunity score for each market
    calculateMarketScore(market) {
        const data = this.markets[market];
        if (data.history.length < 20) return 0;
        
        // Score based on: volatility (40%), volume (30%), trend strength (30%)
        const volatilityScore = Math.min(data.volatility * 10, 1); // Higher volatility = better
        const volumeScore = Math.min(data.volume / 100000, 1); // Higher volume = safer
        const trendScore = Math.abs(data.trend) * 5; // Strong trends = opportunities
        
        return (volatilityScore * 0.4) + (volumeScore * 0.3) + (trendScore * 0.3);
    }
    
    // Find the best market to trade right now
    findBestMarket() {
        // Attempt market discovery
        this.discoverNewMarkets();
        
        let bestMarket = this.activeMarket;
        let bestScore = 0;
        
        // Only consider DISCOVERED markets for active trading
        for (const [market, data] of Object.entries(this.markets)) {
            if (!data.discovered) continue; // Skip undiscovered markets
            
            data.score = this.calculateMarketScore(market);
            if (data.score > bestScore) {
                bestScore = data.score;
                bestMarket = market;
            }
        }
        
        // Only switch if cooldown passed and new market significantly better
        const timeSinceSwitch = Date.now() - this.lastMarketSwitch;
        const currentScore = this.markets[this.activeMarket].score;
        
        if (timeSinceSwitch > this.marketSwitchCooldown && bestScore > currentScore * 1.5) {
            if (bestMarket !== this.activeMarket) {
                console.log(`\n🔄 SWITCHING MARKET: ${this.activeMarket} → ${bestMarket}`);
                console.log(`   Opportunity Score: ${currentScore.toFixed(2)} → ${bestScore.toFixed(2)}`);
                this.switchMarket(bestMarket);
                this.lastMarketSwitch = Date.now();
            }
        }
        
        return bestMarket;
    }
    
    // Switch to a different trading pair
    switchMarket(newMarket) {
        this.activeMarket = newMarket;
        const data = this.markets[newMarket];
        this.currentPrice = data.price;
        this.currentBid = data.price * 0.999;
        this.currentAsk = data.price * 1.001;
        this.priceHistory = [...data.history];
        
        // Resubscribe WebSocket to new pair
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                event: 'subscribe',
                pair: [newMarket],
                subscription: { name: 'ticker' }
            }));
            this.ws.send(JSON.stringify({
                event: 'subscribe',
                pair: [newMarket],
                subscription: { name: 'trade' }
            }));
        }
    }

    connect() {
        return new Promise((resolve) => {
            console.log('🌐 Connecting to Kraken Public WebSocket...');
            
            const totalMarkets = Object.keys(this.markets).length;
            const discoveredCount = Object.values(this.markets).filter(m => m.discovered).length;
            console.log(`📊 Market Inventory: ${totalMarkets} total | ${discoveredCount} active | ${totalMarkets - discoveredCount} monitoring`);
            
            this.ws = new WebSocket('wss://ws.kraken.com');
            
            this.ws.on('open', () => {
                console.log('✅ Connected to Kraken Public WebSocket');
                this.connected = true;
                
                // Subscribe to ALL markets for monitoring (AI will discover best ones)
                const pairs = Object.keys(this.markets);
                
                // Subscribe to tickers for ALL pairs (monitoring)
                this.ws.send(JSON.stringify({
                    event: 'subscribe',
                    pair: pairs,
                    subscription: { name: 'ticker' }
                }));
                
                // Subscribe to trades for whale tracking on active market
                this.ws.send(JSON.stringify({
                    event: 'subscribe',
                    pair: [this.activeMarket],
                    subscription: { name: 'trade' }
                }));
                
                resolve(true);
            });
            
            this.ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data);
                    
                    // Ticker updates (price, bid, ask) - UPDATE ALL MARKETS
                    if (Array.isArray(msg) && msg[2] === 'ticker') {
                        const ticker = msg[1];
                        const pair = msg[3]; // Market pair name
                        
                        const price = parseFloat(ticker.c[0]); // Last trade price
                        const bid = parseFloat(ticker.b[0]); // Best bid
                        const ask = parseFloat(ticker.a[0]); // Best ask
                        const volume = parseFloat(ticker.v[1]); // 24h volume
                        
                        // Update market data
                        if (this.markets[pair]) {
                            this.markets[pair].price = price;
                            this.markets[pair].volume = volume;
                            this.markets[pair].history.push({ price, timestamp: Date.now() });
                            
                            // Keep history manageable
                            if (this.markets[pair].history.length > 200) {
                                this.markets[pair].history.shift();
                            }
                            
                            // Calculate volatility and trend for this market
                            if (this.markets[pair].history.length >= 20) {
                                const recent = this.markets[pair].history.slice(-50);
                                const prices = recent.map(h => h.price);
                                
                                // Trend
                                const older = prices.slice(0, 20);
                                const newer = prices.slice(-20);
                                const oldAvg = older.reduce((a, b) => a + b) / older.length;
                                const newAvg = newer.reduce((a, b) => a + b) / newer.length;
                                this.markets[pair].trend = (newAvg - oldAvg) / oldAvg;
                                
                                // Volatility
                                const last30 = prices.slice(-30);
                                const avg = last30.reduce((a, b) => a + b) / last30.length;
                                const variance = last30.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / last30.length;
                                this.markets[pair].volatility = Math.sqrt(variance) / avg;
                            }
                        }
                        
                        // Update active market current values
                        if (pair === this.activeMarket) {
                            this.currentPrice = price;
                            this.currentBid = bid;
                            this.currentAsk = ask;
                            
                            this.priceHistory.push({
                                price: this.currentPrice,
                                timestamp: Date.now()
                            });
                            
                            // Keep MORE price history for better analysis
                            if (this.priceHistory.length > 200) {
                                this.priceHistory.shift();
                            }
                        }
                    }
                    
                    // Trade updates (for whale tracking on active market)
                    if (Array.isArray(msg) && msg[2] === 'trade') {
                        const pair = msg[3];
                        if (pair === this.activeMarket) {
                            const trades = msg[1];
                            trades.forEach(trade => {
                                const [price, volume, timestamp, side] = trade;
                                this.whaleTracker.analyzeMarketTrade({
                                    price: parseFloat(price),
                                    volume: parseFloat(volume),
                                    side: side === 'b' ? 'buy' : 'sell',
                                    timestamp: parseFloat(timestamp) * 1000
                                });
                            });
                        }
                    }
                } catch (err) {
                    // Ignore parse errors
                }
            });
            
            this.ws.on('error', (err) => {
                console.log('⚠️ WebSocket error:', err.message);
            });
            
            this.ws.on('close', () => {
                console.log('🔌 WebSocket closed. Reconnecting in 5s...');
                this.connected = false;
                setTimeout(() => this.connect(), 5000);
            });
        });
    }

    getMarketData() {
        // Check for better markets every cycle
        this.findBestMarket();
        
        // Use MORE data for better analysis (50 recent prices)
        const recent = this.priceHistory.slice(-50);
        const prices = recent.map(p => p.price);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : this.currentPrice;
        
        // Calculate trend from more data
        let trend = 0;
        if (prices.length >= 20) {
            const oldAvg = prices.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
            const newAvg = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
            trend = (newAvg - oldAvg) / oldAvg;
        }
        
        // Calculate volatility from more data
        let volatility = 0;
        if (prices.length >= 30) {
            const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
            volatility = Math.sqrt(variance) / avgPrice;
        }
        
        return {
            price: this.currentPrice,
            bid: this.currentBid,
            ask: this.currentAsk,
            volume: this.volumeHistory.length,
            trend: trend,
            volatility: volatility,
            timestamp: Date.now(),
            avgPrice: avgPrice,
            activeMarket: this.activeMarket,
            allMarkets: this.markets
        };
    }

    cleanup() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

class AdvancedCryptoAI {
    constructor(initialBudget = 19) {
        this.generation = 1;
        this.cycle = 0;
