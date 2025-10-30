const fs = require('fs');
let code = fs.readFileSync('paper-trading-ai.js', 'utf8');

// New evaluateSell method
const newEvaluateSell = `    evaluateSell(market) {
        const position = this.state.portfolio[market];
        if (!position || position.holdings === 0) return;
        
        // Update peak price (for trailing stops)
        if (this.state.currentPrice > position.peak) {
            position.peak = this.state.currentPrice;
        }
        
        const currentValue = position.holdings * this.state.currentPrice;
        const costBasis = position.holdings * position.buyPrice;
        const grossProfit = ((currentValue - costBasis) / costBasis);
        const holdTime = this.state.cycle - position.buyCycle;
        const holdTimeSeconds = holdTime * (this.settings.checkInterval / 1000);
        
        // Get strategy-specific config
        const strategyConfig = position.strategyConfig || this.settings.strategies.scalping;
        const dropFromPeak = ((position.peak - this.state.currentPrice) / position.peak);
        
        let shouldSell = false;
        let exitReason = '';
        let exitScore = 0;
        
        // 🎯 PROFIT TARGET - Hit ideal profit!
        if (grossProfit >= strategyConfig.targetProfit) {
            shouldSell = true;
            exitReason = '🎯 TARGET HIT +' + (strategyConfig.targetProfit*100).toFixed(1) + '%';
            exitScore = 1.0;
        }
        // 💰 MINIMUM PROFIT - Take the win
        else if (grossProfit >= strategyConfig.minProfit) {
            shouldSell = true;
            exitReason = '💰 PROFIT +' + (strategyConfig.minProfit*100).toFixed(1) + '%';
            exitScore = 0.95;
        }
        
        // 🛑 STOP LOSS - Cut losses quickly
        if (grossProfit <= -strategyConfig.stopLoss) {
            shouldSell = true;
            exitReason = '🛑 STOP LOSS -' + (strategyConfig.stopLoss*100).toFixed(1) + '%';
            exitScore = 1.0;
        }
        
        // 📉 TRAILING STOP - Lock in gains
        if (grossProfit > 0.003 && dropFromPeak > strategyConfig.trailingStop) {
            shouldSell = true;
            exitReason = '📉 TRAILING STOP (locking +' + (grossProfit*100).toFixed(2) + '%)';
            exitScore = 0.90;
        }
        
        // ⏱️ MAX HOLD TIME - Don't hold losers forever
        if (holdTimeSeconds > strategyConfig.maxHoldTime && grossProfit < 0) {
            shouldSell = true;
            exitReason = '⏱️ MAX HOLD TIME (' + strategyConfig.maxHoldTime + 's)';
            exitScore = 0.85;
        }
        
        // 🚨 QUICK EXIT - Bad entry, get out fast
        if (holdTimeSeconds < strategyConfig.quickExit && grossProfit < -0.008) {
            shouldSell = true;
            exitReason = '🚨 QUICK EXIT (bad entry)';
            exitScore = 0.95;
        }
        
        // STRATEGY-SPECIFIC EXITS
        if (!shouldSell && position.strategy) {
            const allPrices = this.state.priceHistory.map(p => p.price);
            const marketCondition = this.analyzeMarketCondition(allPrices);
            
            // Scalping: Exit on momentum reversal
            if (position.strategy === 'scalping' && grossProfit > 0.002) {
                const last3 = allPrices.slice(-3);
                const momentumDown = last3[2] < last3[1] && last3[1] <= last3[0];
                if (momentumDown) {
                    shouldSell = true;
                    exitReason = '⚡ SCALP: Momentum reversal';
                    exitScore = 0.80;
                }
            }
            
            // Trend Following: Exit on trend break
            if (position.strategy === 'trendFollowing' && grossProfit > 0.005) {
                if (marketCondition.trend.direction !== 'up' || marketCondition.trend.strength < 0.003) {
                    shouldSell = true;
                    exitReason = '📈 TREND: Trend broken';
                    exitScore = 0.85;
                }
            }
            
            // Mean Reversion: Exit at overbought
            if (position.strategy === 'meanReversion' && grossProfit > 0.004) {
                if (marketCondition.rsi > 65) {
                    shouldSell = true;
                    exitReason = '🔄 REVERSION: Overbought';
                    exitScore = 0.83;
                }
            }
            
            // Breakout: Exit if breakout fails
            if (position.strategy === 'breakout') {
                const breakout = this.detectBreakout(allPrices);
                if (holdTimeSeconds > 60 && !breakout.isBreakout && grossProfit < 0.003) {
                    shouldSell = true;
                    exitReason = '🚀 BREAKOUT: Failed breakout';
                    exitScore = 0.88;
                }
            }
        }
        
        if (shouldSell) {
            const saleValue = currentValue;
            const sellFee = saleValue * this.settings.tradingFee;
            const netProceeds = saleValue - sellFee;
            const netProfit = netProceeds - costBasis;
            const netProfitPercent = (netProfit / costBasis) * 100;
            
            const profitEmoji = netProfit > 0 ? '💰🎉' : netProfit < 0 ? '📉💔' : '⚖️';
            const resultColor = netProfit > 0 ? '🟢' : '🔴';
            
            console.log('\\n' + resultColor + '═══════════════════════════════════════════════════');
            console.log('   SELL EXECUTED - ' + strategyConfig.name);
            console.log('═══════════════════════════════════════════════════' + resultColor);
            console.log('📊 Market: ' + market);
            console.log('🎯 Strategy: ' + position.entryReason);
            console.log('🚪 Exit: ' + exitReason);
            console.log('📊 Trade Analysis:');
            console.log('   Buy: $' + position.buyPrice.toFixed(4) + ' | Sell: $' + this.state.currentPrice.toFixed(4));
            console.log('   Peak: $' + position.peak.toFixed(4) + ' | Drop from Peak: ' + (dropFromPeak*100).toFixed(2) + '%');
            console.log('   Hold Time: ' + holdTimeSeconds.toFixed(1) + 's (' + holdTime + ' cycles)');
            console.log('💵 Financial Details:');
            console.log('   Asset: ' + position.holdings.toFixed(6) + ' ' + market.split('/')[0]);
            console.log('   Gross Value: $' + saleValue.toFixed(4));
            console.log('   Sell Fee: $' + sellFee.toFixed(4));
            console.log('   Net Proceeds: $' + netProceeds.toFixed(4));
            console.log('   Cost Basis: $' + costBasis.toFixed(4));
            console.log(profitEmoji + ' NET PROFIT: $' + netProfit.toFixed(4) + ' (' + netProfitPercent.toFixed(2) + '%)');
            
            this.wallets.trading += netProceeds;
            this.state.totalFeesPaid += sellFee;
            this.state.currentBalance = this.wallets.main + this.wallets.trading;
            
            console.log('💼 Balance: $' + this.state.currentBalance.toFixed(2) + ' | Fees: $' + this.state.totalFeesPaid.toFixed(2));
            
            const isWin = netProfit > 0;
            if (isWin) {
                this.state.wins++;
                this.brain.winStreak++;
                this.brain.lossStreak = 0;
                if (grossProfit > this.brain.bestProfit) this.brain.bestProfit = grossProfit;
                console.log('✅ WIN! Streak: ' + this.brain.winStreak);
            } else {
                this.state.losses++;
                this.brain.lossStreak++;
                this.brain.winStreak = 0;
                if (grossProfit < this.brain.worstLoss) this.brain.worstLoss = grossProfit;
                console.log('❌ LOSS! Streak: ' + this.brain.lossStreak);
            }
            
            this.state.totalTrades++;
            this.state.totalProfit += netProfit;
            
            if (this.state.currentBalance > this.state.peakBalance) {
                this.state.peakBalance = this.state.currentBalance;
            }
            this.state.drawdown = (this.state.peakBalance - this.state.currentBalance) / this.state.peakBalance;
            
            const tradeRecord = {
                tradeNumber: this.tradeHistory.length + 1,
                market: market,
                strategy: position.strategy || 'unknown',
                entryReason: position.entryReason || 'N/A',
                exitReason: exitReason,
                buyPrice: position.buyPrice,
                sellPrice: this.state.currentPrice,
                peakPrice: position.peak,
                grossProfit: grossProfit,
                grossProfitPercent: grossProfit * 100,
                netProfit: netProfit / costBasis,
                netProfitPercent: netProfitPercent,
                profitDollars: netProfit,
                feesPaid: sellFee + (costBasis * this.settings.tradingFee),
                holdTime: holdTime,
                holdTimeSeconds: holdTimeSeconds,
                volume: position.holdings,
                generation: this.state.generation,
                cycle: this.state.cycle,
                timestamp: new Date().toISOString(),
                timestampMs: Date.now()
            };
            
            this.tradeHistory.push(tradeRecord);
            delete this.state.portfolio[market];
            
            console.log('═══════════════════════════════════════════════════\\n');
        }
    }`;

// Find and replace evaluateSell method
const start = code.indexOf('    evaluateSell(market) {');
if (start === -1) {
    console.log('❌ Could not find evaluateSell method');
    process.exit(1);
}

// Find the end - look for the next method that starts with 4 spaces
const restOfCode = code.slice(start + 100);
const nextMethodMatch = restOfCode.match(/\n    [a-zA-Z]/);
if (!nextMethodMatch) {
    console.log('❌ Could not find next method');
    process.exit(1);
}

const end = start + 100 + nextMethodMatch.index;
code = code.slice(0, start) + newEvaluateSell + '\n\n' + code.slice(end);
fs.writeFileSync('paper-trading-ai.js', code);
console.log('✅ Replaced evaluateSell with strategy-aware exits');
