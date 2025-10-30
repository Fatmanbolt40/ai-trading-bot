#!/usr/bin/env node

/**
 * 🚀 ADVANCED CRYPTO TRADING AI - SINGLE TRADER - $19 BUDGET EDITION
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
        this.reservedCash = 0;                  // Money saved for future buy-ins
        this.inPosition = false;                // Currently holding crypto?
        this.positionValue = 0;                 // Current value of holdings
        
        // Smart money management
        this.minTradeSize = 10;                 // Kraken's $10 minimum
        this.maxPositionSize = 12;              // Max to spend per trade ($12)
        this.emergencyReserve = 5;              // Always keep $5 in reserve
        this.targetReserve = 0.3;               // Try to keep 30% in reserve
        
        // Performance tracking
        this.totalProfits = 0;
        this.totalTrades = 0;
        this.winningTrades = 0;
        this.losingTrades = 0;
    }

    // Calculate how much the trader can spend on next trade
    getAvailableTradeAmount() {
        // Don't trade if in position or below minimum
        if (this.inPosition || this.availableCash < this.minTradeSize) {
            return 0;
        }
        
        // Calculate safe trade amount
        const safeAmount = this.availableCash - this.emergencyReserve;
        
        // Use up to maxPositionSize, but never more than safe amount
        const tradeAmount = Math.min(this.maxPositionSize, safeAmount);
        
        // Must meet Kraken minimum or don't trade
        return tradeAmount >= this.minTradeSize ? tradeAmount : 0;
    }

    // Execute a buy
    executeBuy(amount, price) {
        if (amount < this.minTradeSize || amount > this.availableCash) {
            return { success: false, reason: 'Invalid trade amount' };
        }
        
        this.availableCash -= amount;
        this.inPosition = true;
        this.positionValue = amount;
        
        return {
            success: true,
            spent: amount,
            remainingCash: this.availableCash,
            positionSize: this.positionValue
        };
    }

    // Execute a sell
    executeSell(currentValue, profit) {
        if (!this.inPosition) {
            return { success: false, reason: 'No position to sell' };
        }
        
        // Realize the profit/loss
        this.availableCash += currentValue;
        this.totalProfits += profit;
        this.totalTrades++;
        
        if (profit > 0) {
            this.winningTrades++;
            // Save a portion of profit to reserve for compound growth
            const reserveAmount = profit * this.targetReserve;
            this.reservedCash += reserveAmount;
        } else {
            this.losingTrades++;
        }
        
        this.inPosition = false;
        this.positionValue = 0;
        
        // Calculate new total
        this.totalFunds = this.availableCash + this.reservedCash;
        
        return {
            success: true,
            profit: profit,
            newCash: this.availableCash,
            totalFunds: this.totalFunds,
            reserved: this.reservedCash
        };
    }

    // Get wallet status
    getStatus() {
        return {
            totalFunds: this.totalFunds,
            availableCash: this.availableCash,
            reservedCash: this.reservedCash,
            inPosition: this.inPosition,
            positionValue: this.positionValue,
            canTrade: this.getAvailableTradeAmount() > 0,
            nextTradeSize: this.getAvailableTradeAmount(),
            totalProfits: this.totalProfits,
            winRate: this.totalTrades > 0 ? (this.winningTrades / this.totalTrades * 100).toFixed(1) : 0
        };
    }
}

class SmartSingleTrader {
    constructor(wallet) {
        this.id = 1;
        this.wallet = wallet;
        this.holdings = 0;              // Amount of crypto held
        this.buyPrice = 0;              // Price we bought at
        this.currentPrice = 0;          // Latest market price
        this.trades = 0;
        this.wins = 0;
        this.losses = 0;
        this.fitness = 0;
        
        // Neural network DNA - the AI's brain parameters
        this.dna = {
            buyThreshold: Math.max(0, Math.random() * 0.1),      // How low price must drop to buy (0-10%)
            sellThreshold: Math.max(0, Math.random() * 0.15),    // How much profit needed to sell (0-15%)
            riskLevel: Math.max(0, Math.random()),               // Risk tolerance (0-1)
            patience: Math.max(50, Math.random() * 100 + 50),    // How long to hold (50-150 cycles)
            momentum: Math.max(0, Math.random()),                // How much to follow trends
            contrarian: Math.max(0, Math.random()),              // How much to go against trends
            volumeWeight: Math.max(0, Math.random()),            // How much volume matters
            timeDecay: Math.max(0, Math.random() * 0.01)         // How urgency increases over time
        };
        
        this.memory = {
            lastPrice: 0,
            buyPrice: 0,
            holdTime: 0,
            avgPrice: 0,
            priceHistory: [],
            profitHistory: []
        };
    }

    // Advanced AI decision making - learns to buy low, sell high
    makeDecision(marketData) {
        const { price, volume, trend, volatility, timestamp, marketSentiment, whaleSentiment } = marketData;
        this.currentPrice = price;
        
        // Store market sentiment in memory
        this.memory.marketSentiment = marketSentiment || 0.5;
        this.memory.whaleSentiment = whaleSentiment || 0.5;
        
        // Update price history
        this.memory.priceHistory.push(price);
        if (this.memory.priceHistory.length > 50) this.memory.priceHistory.shift();
        
        // Calculate market signals
        const priceChange = this.memory.lastPrice > 0 ? 
            (price - this.memory.lastPrice) / this.memory.lastPrice : 0;
        
        const avgPrice = this.memory.priceHistory.length > 10 ?
            this.memory.priceHistory.reduce((sum, p) => sum + p, 0) / this.memory.priceHistory.length : price;
        
        this.memory.avgPrice = avgPrice;
        this.memory.lastPrice = price;
        
        // === BUYING LOGIC ===
        if (this.holdings === 0 && !this.wallet.inPosition) {
            const tradeAmount = this.wallet.getAvailableTradeAmount();
            
            if (tradeAmount >= this.wallet.minTradeSize) {
                // Calculate buy signal
                const buySignal = this.calculateBuySignal(price, avgPrice, priceChange, trend, volatility);
                
                // Buy if signal is strong OR we're testing early
                if (buySignal > 0.4 || (Math.random() < 0.3 && this.trades < 5)) {
                    const cryptoAmount = tradeAmount / price;
                    
                    const result = this.wallet.executeBuy(tradeAmount, price);
                    if (result.success) {
                        this.holdings = cryptoAmount;
                        this.buyPrice = price;
                        this.memory.buyPrice = price;
                        this.memory.holdTime = 0;
                        
                        return {
                            action: 'BUY',
                            amount: cryptoAmount,
                            price: price,
                            spent: tradeAmount,
                            confidence: (buySignal * 100).toFixed(1),
                            reason: 'Smart opportunity detected'
                        };
                    }
                }
            }
        }
        
        // === SELLING LOGIC ===
        if (this.holdings > 0 && this.wallet.inPosition) {
            this.memory.holdTime++;
            
            const currentValue = this.holdings * price;
            const costBasis = this.holdings * this.buyPrice;
            const grossProfit = currentValue - costBasis;
            const grossProfitPercent = (grossProfit / costBasis) * 100;
            
            // Kraken fees: 0.26% per side = 0.52% total
            const fees = costBasis * 0.0052;
            const netProfit = grossProfit - fees;
            const netProfitPercent = (netProfit / costBasis) * 100;
            
            // Calculate sell signal
            const sellSignal = this.calculateSellSignal(price, this.buyPrice, priceChange, trend, volatility, netProfitPercent);
            
            // SELL CONDITIONS: Net profit after fees OR strong sell signal
            const shouldSell = (
                (netProfitPercent >= 0.3 && sellSignal > 0.5) ||  // Minimum 0.3% net profit
                (netProfitPercent >= 0.6 && sellSignal > 0.4) ||  // 0.6% profit easier to trigger
                (netProfitPercent >= 1.2) ||                       // 1.2% profit always sell
                (netProfitPercent < -2.0) ||                       // Stop loss at -2%
                (sellSignal > 0.8)                                 // Very strong sell signal
            );
            
            if (shouldSell) {
                const result = this.wallet.executeSell(currentValue, netProfit);
                if (result.success) {
                    if (netProfit > 0) this.wins++;
                    else this.losses++;
                    
                    this.trades++;
                    this.holdings = 0;
                    this.buyPrice = 0;
                    
                    // Update fitness based on performance
                    this.fitness = this.wins - this.losses * 0.5;
                    
                    return {
                        action: 'SELL',
                        profit: netProfit,
                        profitPercent: netProfitPercent.toFixed(2),
                        newBalance: result.newCash,
                        totalFunds: result.totalFunds,
                        confidence: (sellSignal * 100).toFixed(1),
                        reason: netProfit > 0 ? '✅ PROFIT SECURED' : '⚠️ STOP LOSS'
                    };
                }
            }
        }
        
        return { action: 'HOLD', holdings: this.holdings, currentValue: this.holdings * price };
    }
                this.trades++;
                
                return {
                    action: 'BUY',
                    amount: cryptoAmount,
                    price: price,
                    spent: amountToSpend,
                    signal: buySignal,
                    reason: `🟢 AI-${this.id} BUY: ${cryptoAmount.toFixed(4)} SOL @ $${price.toFixed(2)} (${(buySignal * 100).toFixed(1)}% confidence)`
                };
            }
        } else if (this.holdings > 0) {
            // SELLING DECISION - QUICK SAFE PROFITS
            this.memory.holdTime++;
            const currentValue = this.holdings * price;
            const costBasis = this.holdings * this.memory.buyPrice;
            
            // Calculate profit BEFORE fees
            const grossProfit = currentValue - costBasis;
            const grossProfitPercent = grossProfit / costBasis;
            
            // Kraken fees: 0.26% buy + 0.26% sell = 0.52% total
            const tradingFees = 0.0052;
            const netProfitPercent = grossProfitPercent - tradingFees;
            
            // SMART THRESHOLDS: Account for fees
            const minNetProfit = 0.003; // 0.3% NET profit after fees (0.82% gross needed)
            const goodNetProfit = 0.006; // 0.6% NET profit (1.12% gross)
            const targetNetProfit = 0.012; // 1.2% NET profit (1.72% gross)
            
            const sellSignal = this.calculateSellSignal(price, netProfitPercent, trend, this.memory.holdTime);
            
            // QUICK SAFE SELLS - Multiple exit strategies
            if (grossProfitPercent > tradingFees && (
                netProfitPercent >= targetNetProfit || // Hit 1.2% net target = SELL NOW
                (netProfitPercent >= goodNetProfit && sellSignal > 0.4) || // 0.6% net + medium signal
                (netProfitPercent >= minNetProfit && sellSignal > 0.6) || // 0.3% net + strong signal
                (netProfitPercent >= minNetProfit && this.memory.holdTime > 30) || // 0.3% net + held long enough
                (netProfitPercent >= goodNetProfit && trend < -0.005) // 0.6% net + price dropping = TAKE IT
            )) {
                // SELL and take profit - ALWAYS POSITIVE
                const soldAmount = this.holdings;
                this.balance += currentValue;
                const netProfit = currentValue - costBasis; // Actual profit
                
                this.wins++;
                this.fitness += netProfit * 20; // Heavy reward for profitable trades
                
                this.memory.profitHistory.push(netProfit);
                this.holdings = 0;
                this.memory.holdTime = 0;
                
                return {
                    action: 'SELL',
                    amount: soldAmount,
                    price: price,
                    profit: netProfit,
                    profitPercent: (netProfitPercent * 100), // NET profit %
                    signal: sellSignal,
                    reason: `🔴 AI-${this.id} SELL: ${soldAmount.toFixed(4)} SOL @ $${price.toFixed(2)} → PROFIT +$${totalProfit.toFixed(4)} (+${(Math.abs(profitPercent) * 100).toFixed(2)}%)`
                };
            }
        }
        
        this.memory.lastPrice = price;
        
        // Occasional analysis messages
        if (Math.random() < 0.05) {
            return { 
                action: 'ANALYZE', 
                reason: `🧠 AI-${this.id} analyzing: Price $${price.toFixed(2)}, Avg $${avgPrice.toFixed(2)}, ${this.holdings > 0 ? 'HOLDING' : 'SCANNING'}` 
            };
        }
        
        return { action: 'HOLD', reason: null };
    }

    calculateBuySignal(price, avgPrice, priceChange, trend, volatility) {
        let signal = 0;
        
        // Price is below average (good for buying low)
        if (price < avgPrice) signal += 0.3;
        
        // Recent price drop (buy the dip)
        if (priceChange < -0.02) signal += 0.2;
        
        // High volatility = opportunity
        if (volatility > 0.05) signal += 0.1;
        
        // Contrarian signal (buy when others are selling)
        if (trend < 0 && this.dna.contrarian > 0.6) signal += 0.2;
        
        // Momentum signal (buy when trending up slightly after drop)
        if (trend > 0 && trend < 0.02 && this.dna.momentum > 0.7) signal += 0.2;
        
        return Math.min(signal, 1.0);
    }

    calculateSellSignal(price, netProfitPercent, trend, holdTime) {
        let signal = 0;
        
        // Only process sell signals if we have NET profit after fees
        if (netProfitPercent <= 0) return 0; // Never sell at a loss
        
        // QUICK PROFIT TAKING - Lower thresholds for active trading
        if (netProfitPercent >= 0.012) signal += 0.8; // 1.2% net = strong sell
        else if (netProfitPercent >= 0.008) signal += 0.6; // 0.8% net = good sell
        else if (netProfitPercent >= 0.005) signal += 0.4; // 0.5% net = decent sell
        else if (netProfitPercent >= 0.003) signal += 0.2; // 0.3% net = minimum sell
        
        // Price momentum - sell if turning down while profitable
        if (netProfitPercent > 0.003 && trend < -0.003) signal += 0.4; // Dropping = sell quick
        if (netProfitPercent > 0.006 && trend < -0.001) signal += 0.3; // Slight drop = consider sell
        
        // Whale sentiment - if whales selling, exit faster
        const marketSentiment = this.memory.marketSentiment || 0.5;
        if (netProfitPercent > 0.003 && marketSentiment < 0.4) signal += 0.3; // Bearish = sell
        
        // Time urgency - don't hold forever, take profits
        if (holdTime > 40 && netProfitPercent > 0.003) signal += 0.3; // 20 seconds + profit = sell
        if (holdTime > 60 && netProfitPercent > 0.001) signal += 0.4; // 30 seconds + any profit = sell
        if (holdTime > 100 && netProfitPercent > 0) signal += 0.6; // 50 seconds + break even = SELL
        
        return Math.min(signal, 1.0);
    }

    // Genetic evolution - breed successful traders
    evolve(eliteTrader) {
        if (eliteTrader && eliteTrader.fitness > this.fitness) {
            // Learn from elite trader's DNA
            Object.keys(this.dna).forEach(key => {
                if (Math.random() < 0.3) { // 30% chance to inherit elite trait
                    this.dna[key] = eliteTrader.dna[key] + (Math.random() - 0.5) * 0.1;
                } else {
                    // Mutate existing DNA
                    this.dna[key] += (Math.random() - 0.5) * 0.05;
                }
                
                // Keep values in reasonable bounds
                this.dna[key] = Math.max(0, Math.min(1, this.dna[key]));
            });
        }
        
        // Reset for next generation but keep some memory
        const oldFitness = this.fitness;
        this.fitness = oldFitness * 0.1; // Retain 10% of old fitness
        this.trades = 0;
        this.wins = 0;
        this.losses = 0;
    }

    getStats() {
        const winRate = this.trades > 0 ? (this.wins / this.trades) * 100 : 0;
        const avgProfit = this.memory.profitHistory.length > 0 ?
            this.memory.profitHistory.reduce((sum, p) => sum + p, 0) / this.memory.profitHistory.length : 0;
        
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
        this.savedState = this.loadPersistedState(); // Load saved state on startup
        
        // SINGLE SMART TRADER SYSTEM
        this.wallet = new SmartSingleTraderWallet(initialBudget);
        
        // FIXED: Restore wallet from saved state
        if (this.savedState && this.savedState.wallet) {
            this.wallet.totalFunds = this.savedState.wallet.totalFunds || initialBudget;
            this.wallet.availableCash = this.savedState.wallet.availableCash || initialBudget;
            this.wallet.reservedCash = this.savedState.wallet.reservedCash || 0;
            this.wallet.inPosition = this.savedState.wallet.inPosition || false;
            this.wallet.positionValue = this.savedState.wallet.positionValue || 0;
            this.wallet.totalProfits = this.savedState.wallet.totalProfits || 0;
            this.wallet.totalTrades = this.savedState.wallet.totalTrades || 0;
            this.wallet.winningTrades = this.savedState.wallet.winningTrades || 0;
            this.wallet.losingTrades = this.savedState.wallet.losingTrades || 0;
            console.log(`✅ RESTORED WALLET: Total $${this.wallet.totalFunds.toFixed(2)}, Cash $${this.wallet.availableCash.toFixed(2)}, Reserved $${this.wallet.reservedCash.toFixed(2)}`);
        }
        
        // 🐋 Initialize whale tracker
        this.whaleTracker = new WhaleTracker();
        
        // 🌐 Initialize Kraken market data (REAL prices!)
        this.marketData = new KrakenMarketData(this.whaleTracker);
        
        // RESTORE: Active market and market data from saved state
        if (this.savedState && this.savedState.marketData) {
            this.marketData.activeMarket = this.savedState.marketData.activeMarket || 'SOL/USD';
            if (this.savedState.marketData.markets) {
                this.marketData.markets = this.savedState.marketData.markets;
            }
            console.log(`✅ RESTORED MARKET: Trading ${this.marketData.activeMarket}`);
        }
        
        // Create single smart trader
        this.trader = new SmartSingleTrader(this.wallet);
        
        // FIXED: Restore trader holdings and stats from saved state
        if (this.savedState && this.savedState.trader) {
            const savedTrader = this.savedState.trader;
            this.trader.holdings = savedTrader.holdings || 0;
            this.trader.buyPrice = savedTrader.buyPrice || 0;
            this.trader.trades = savedTrader.trades || 0;
            this.trader.wins = savedTrader.wins || 0;
            this.trader.losses = savedTrader.losses || 0;
            this.trader.fitness = savedTrader.fitness || 0;
            if (savedTrader.memory) {
                this.trader.memory = { ...this.trader.memory, ...savedTrader.memory };
            }
            if (savedTrader.dna) {
                this.trader.dna = { ...savedTrader.dna };
            }
                        this.eliteTrader = trader;
                        trader.isElite = true;
                    }
                }
            });
        }
        
        this.eliteTrader = null;
        this.logs = [];
        this.isRunning = false;
        
        // Performance tracking
        this.performance = {
            totalProfits: 0,
            totalTrades: 0,
            bestGeneration: 1,
            bestFitness: 0,
            evolutionSpeed: 0
        };
    }

    loadPersistedState() {
        try {
            if (fs.existsSync('ai-state.json')) {
                const savedState = JSON.parse(fs.readFileSync('ai-state.json', 'utf8'));
                if (savedState.generation) {
                    this.generation = savedState.generation;
                    this.cycle = savedState.cycle || 0;
                    console.log(`🔄 Loaded persisted state - Starting from Generation ${this.generation}, Cycle ${this.cycle}`);
                }
                if (savedState.performance) {
                    this.performance = { ...this.performance, ...savedState.performance };
                }
                // FIXED: Return full saved state for use in constructor
                return savedState;
            }
        } catch (error) {
            console.log('⚠️ Could not load persisted state, starting fresh');
        }
        return null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            type,
            generation: this.generation,
            cycle: this.cycle
        };
        
        this.logs.push(logEntry);
        console.log(`[${timestamp.substr(11, 8)}] Gen ${this.generation}.${this.cycle} - ${message}`);
        
        // Keep logs manageable
        if (this.logs.length > 200) this.logs.shift();
    }

    async runTradingCycle() {
        try {
            // Get fresh market data from Kraken
            const market = this.marketData.getMarketData();
            
            // Add whale tracking insights
            const whaleStats = this.whaleTracker.getStats();
            market.marketSentiment = whaleStats.marketSentiment;
            market.whaleSentiment = whaleStats.whaleSentiment;
            
            // Show current market + opportunity scanner every 10 cycles
            if (this.cycle % 10 === 0) {
                this.log(`\n📊 TRADING: ${market.activeMarket} @ $${market.price.toFixed(2)} | Trend: ${(market.trend * 100).toFixed(2)}% | Vol: ${(market.volatility * 100).toFixed(2)}%`);
                
                // Separate discovered (active) from monitoring (undiscovered)
                const discovered = Object.entries(market.allMarkets).filter(([_, data]) => data.discovered);
                const monitoring = Object.entries(market.allMarkets).filter(([_, data]) => !data.discovered);
                
                this.log(`🔍 ACTIVE MARKETS (${discovered.length}):`);
                discovered.forEach(([pair, data]) => {
                    const isActive = pair === market.activeMarket ? '✅' : '  ';
                    this.log(`   ${isActive} ${pair}: $${data.price.toFixed(2)} | Score: ${data.score.toFixed(2)} | Vol: ${(data.volatility * 100).toFixed(2)}%`);
                });
                
                // Show top 3 monitoring markets
                const topMonitoring = monitoring
                    .sort(([_, a], [__, b]) => b.score - a.score)
                    .slice(0, 3);
                
                if (topMonitoring.length > 0) {
                    this.log(`👁️  MONITORING (${monitoring.length} total, top 3):`);
                    topMonitoring.forEach(([pair, data]) => {
                        this.log(`      ${pair}: $${data.price.toFixed(2)} | Score: ${data.score.toFixed(2)} | Vol: ${(data.volatility * 100).toFixed(2)}%`);
                    });
                }
            } else {
                this.log(`📊 Market: $${market.price.toFixed(2)} | Trend: ${(market.trend * 100).toFixed(2)}% | Vol: ${(market.volatility * 100).toFixed(2)}%`);
            }
            
            let cycleActivity = [];
            
            // Each trader makes AI decisions
            for (let trader of this.traders) {
                const decision = trader.makeDecision(market);
                
                if (decision.action === 'BUY') {
                    this.log(decision.reason, 'trading');
                    cycleActivity.push(`${decision.reason}`);
                } else if (decision.action === 'SELL') {
                    this.log(decision.reason, 'trading');
                    cycleActivity.push(`${decision.reason}`);
                    
                    // Always process trade result through wallet system
                    const result = this.walletManager.processTraderProfit(trader.id, decision.profit || 0);
                    if (decision.profit > 0) {
                        this.performance.totalProfits += decision.profit;
                        this.log(`💰 AI-${trader.id} PROFIT PROCESSED: +$${decision.profit.toFixed(4)} → Main wallet now $${result.newMainBalance.toFixed(2)}`, 'profit');
                    } else if (decision.profit < 0) {
                        this.log(`� AI-${trader.id} LOSS PROCESSED: ${decision.profit.toFixed(4)} → Total funds now $${result.newTotalBalance.toFixed(2)}`, 'loss');
                    }
                    
                    // Sync trader balance with wallet manager
                    trader.balance = this.walletManager.wallets[`trader${trader.id}`];
                } else if (decision.action === 'ANALYZE' && decision.reason) {
                    this.log(decision.reason, 'info');
                }
                
                // FIXED: Removed duplicate balance sync
                trader.balance = this.walletManager.wallets[`trader${trader.id}`];
            }
            
            // Log significant activity
            if (cycleActivity.length > 0) {
                cycleActivity.forEach(activity => this.log(activity, 'trading'));
            }
            
            this.cycle++;
            this.performance.totalTrades += cycleActivity.filter(a => a.includes('BUY') || a.includes('SELL')).length;
            
            // SPEED MODE: Evolution every 25 cycles for faster learning
            if (this.cycle % 25 === 0) {
                await this.evolveGeneration();
            }
            
            // Save state with current market data and activity
            await this.saveState(market, cycleActivity);
            
        } catch (error) {
            this.log(`❌ Trading cycle error: ${error.message}`, 'error');
        }
    }

    async evolveGeneration() {
        // Find the elite trader
        const bestTrader = this.traders.reduce((best, trader) => 
            trader.fitness > best.fitness ? trader : best
        );
        
        if (bestTrader.fitness > this.performance.bestFitness) {
            this.performance.bestFitness = bestTrader.fitness;
            this.performance.bestGeneration = this.generation;
            this.eliteTrader = bestTrader;
            bestTrader.isElite = true;
        }
        
        // Evolve all traders
        this.traders.forEach(trader => {
            trader.isElite = false;
            trader.evolve(this.eliteTrader);
        });
        
        if (this.eliteTrader) this.eliteTrader.isElite = true;
        
        const avgFitness = this.traders.reduce((sum, t) => sum + t.fitness, 0) / this.traders.length;
        
        this.log(`🧬 EVOLUTION! Gen ${this.generation} → ${this.generation + 1} | Elite fitness: ${bestTrader.fitness.toFixed(2)} | Avg: ${avgFitness.toFixed(2)}`, 'evolution');
        
        this.generation++;
        this.cycle = 0;
        
        // Calculate evolution speed
        this.performance.evolutionSpeed = this.generation / ((Date.now() - this.startTime) / 60000); // Gen per minute
    }

    async saveState(market = null, recentActivity = null) {
        const state = {
            generation: this.generation,
            cycle: this.cycle,
            timestamp: new Date().toISOString(),
            wallets: this.walletManager.wallets,
            totalFunds: this.walletManager.totalFunds,
            market: {
                symbol: market ? market.activeMarket : this.marketData.activeMarket,
                price: market ? market.price : this.marketData.cache.price,
                trend: market ? market.trend : 0,
                volume: market ? market.volume : 0,
                timestamp: Date.now()
            },
            marketData: {
                activeMarket: this.marketData.activeMarket,
                markets: this.marketData.markets,
                lastMarketSwitch: this.marketData.lastMarketSwitch
            },
            traders: this.traders.map(trader => ({
                id: trader.id,
                balance: trader.balance,
                holdings: trader.holdings,
                trades: trader.trades,
                wins: trader.wins,
                losses: trader.losses,
                winRate: trader.wins > 0 ? (trader.wins / trader.trades) * 100 : 0,
                fitness: trader.fitness,
                avgProfit: trader.memory.profitHistory.length > 0 ?
                    trader.memory.profitHistory.reduce((sum, p) => sum + p, 0) / trader.memory.profitHistory.length : 0,
                isElite: trader.isElite,
                status: trader.holdings > 0 ? 'HOLDING' : (trader.balance > 0.5 ? 'READY' : 'LOW_FUNDS'),
                confidence: trader.fitness > 0 ? Math.min(100, trader.fitness * 5 + 50) : Math.max(0, 50 + trader.fitness * 5),
                lastAction: trader.memory.lastAction || 'READY',
                holdTime: trader.memory.holdTime || 0,
                dna: trader.dna
            })),
            whaleTracking: this.whaleTracker.getStats(),
            recentActivity: recentActivity ? recentActivity.slice(-10) : [],
            performance: this.performance,
            logs: this.logs.slice(-20), // Last 20 logs
            eliteTrader: this.eliteTrader ? {
                id: this.eliteTrader.id,
                fitness: this.eliteTrader.fitness,
                wins: this.eliteTrader.wins,
                trades: this.eliteTrader.trades
            } : null
        };
        
        try {
            // FIXED: Create backup every 100 cycles to prevent data loss
            if (this.cycle % 100 === 0 && this.cycle > 0) {
                const backupPath = path.join(__dirname, `ai-state-backup-gen${this.generation}.json`);
                await fs.promises.writeFile(backupPath, JSON.stringify(state, null, 2));
                console.log(`💾 Created backup: ${backupPath}`);
            }
            
            await fs.promises.writeFile(
                path.join(__dirname, 'ai-state.json'),
                JSON.stringify(state, null, 2)
            );
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        
        const totalMarkets = Object.keys(this.marketData.markets).length;
        const discovered = Object.values(this.marketData.markets).filter(m => m.discovered).length;
        
        this.log('🚀 Advanced Crypto AI Trading System STARTING!', 'info');
        this.log('🌐 Connecting to Kraken INTELLIGENT MARKET SCANNER...', 'info');
        this.log(`📊 Market Inventory: ${totalMarkets} coins | ${discovered} active | ${totalMarkets - discovered} monitoring`, 'info');
        this.log('🔍 AI will auto-discover and activate promising markets', 'info');
        this.log('🐋 Whale tracking & trader analysis ACTIVE', 'info');
        this.log('⚡ SPEED MODE: Ultra-fast training (500ms cycles)', 'info');
        this.log(`💰 Initial Portfolio: $${this.walletManager.totalFunds.toFixed(2)} | Main: $${this.walletManager.wallets.main.toFixed(2)} | Trading: $${this.walletManager.tradingFunds.toFixed(2)}`, 'info');
        
        // Connect to Kraken WebSocket
        await this.marketData.connect();
        
        this.log(`✅ Connected to live Kraken market! Starting on: ${this.marketData.activeMarket}`, 'info');
        
        // Wait for initial price data
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Main trading loop - SUPER FAST for rapid learning
        while (this.isRunning) {
            await this.runTradingCycle();
            
            // SPEED MODE: 500ms cycles = 7,200 learning cycles per hour!
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    stop() {
        this.isRunning = false;
        this.marketData.cleanup();
        this.log('🛑 AI Trading System stopped', 'info');
    }
}

// Export for use as module or run directly
if (require.main === module) {
    const ai = new AdvancedCryptoAI(19); // $19 BUDGET
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down AI trading system...');
        ai.stop();
        process.exit(0);
    });
    
    // Start the advanced AI
    ai.start().catch(console.error);
} else {
    module.exports = AdvancedCryptoAI;
}