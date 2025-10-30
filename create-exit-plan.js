/**
 * EXIT PLAN - Safe Portfolio Liquidation Strategy
 * Analyzes all positions and creates systematic exit plan
 */

require('dotenv').config();
const fs = require('fs');
const KrakenWebSocket = require('./kraken-integration.js');

const STATE_FILE = './paper-trading-state.json';
const EXIT_PLAN_FILE = './EXIT_PLAN.md';

async function createExitPlan() {
    console.log('📊 CREATING EXIT PLAN FOR PORTFOLIO...\n');
    
    try {
        // 1️⃣ Connect to Kraken
        const kraken = new KrakenWebSocket(process.env.KRAKEN_API_KEY, process.env.KRAKEN_API_SECRET);
        
        // 2️⃣ Fetch current balance
        console.log('💰 Fetching account balance from Kraken...');
        const balance = await kraken.getBalance();
        
        // 3️⃣ Calculate USD balance
        let usdBalance = 0;
        if (balance.ZUSD) usdBalance += parseFloat(balance.ZUSD);
        if (balance.USD) usdBalance += parseFloat(balance.USD);
        
        console.log('💵 Available USD: $' + usdBalance.toFixed(2));
        
        // 4️⃣ Analyze all positions
        const positions = [];
        let totalValue = usdBalance;
        
        for (const [asset, amount] of Object.entries(balance)) {
            const qty = parseFloat(amount);
            if (qty > 0 && !asset.includes('USD') && !asset.includes('KFEE')) {
                // Clean asset name
                let cleanAsset = asset.replace(/^[XZ]/, '');
                
                try {
                    // Get current price
                    const pair = `${cleanAsset}USD`;
                    const ticker = await kraken.getTicker(pair);
                    
                    if (ticker && ticker.c && ticker.c[0]) {
                        const currentPrice = parseFloat(ticker.c[0]);
                        const value = qty * currentPrice;
                        const ask = parseFloat(ticker.a[0]);
                        const bid = parseFloat(ticker.b[0]);
                        
                        // Only track if value > $0.01
                        if (value >= 0.01) {
                            positions.push({
                                asset: cleanAsset,
                                pair: pair,
                                quantity: qty,
                                currentPrice: currentPrice,
                                value: value,
                                ask: ask,
                                bid: bid,
                                spread: ((ask - bid) / bid * 100).toFixed(2) + '%'
                            });
                            
                            totalValue += value;
                        }
                    }
                } catch (err) {
                    // Asset might not have USD pair
                }
            }
        }
        
        // 5️⃣ Sort positions by value (largest first)
        positions.sort((a, b) => b.value - a.value);
        
        console.log('\n📦 POSITIONS FOUND: ' + positions.length);
        console.log('💰 TOTAL PORTFOLIO VALUE: $' + totalValue.toFixed(2));
        
        // 6️⃣ Load AI state to get cost basis
        let state = {};
        if (fs.existsSync(STATE_FILE)) {
            state = JSON.parse(fs.readFileSync(STATE_FILE));
        }
        
        // 7️⃣ Generate exit plan document
        let exitPlan = `# 🚨 PORTFOLIO EXIT PLAN\n\n`;
        exitPlan += `**Generated:** ${new Date().toLocaleString()}\n\n`;
        exitPlan += `---\n\n`;
        
        // Portfolio Overview
        exitPlan += `## 📊 PORTFOLIO OVERVIEW\n\n`;
        exitPlan += `- **Available USD:** $${usdBalance.toFixed(2)}\n`;
        exitPlan += `- **Positions:** ${positions.length}\n`;
        exitPlan += `- **Total Value:** $${totalValue.toFixed(2)}\n`;
        exitPlan += `- **Profit Target:** 1.4%\n\n`;
        exitPlan += `---\n\n`;
        
        // Position Details
        exitPlan += `## 💎 POSITIONS\n\n`;
        
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            
            // Check if we have cost basis from AI state
            let costBasis = 0;
            let profit = 0;
            let profitPercent = 0;
            
            if (state.portfolio && state.portfolio[pos.pair]) {
                costBasis = state.portfolio[pos.pair].costBasis || 0;
                profit = pos.value - costBasis;
                profitPercent = costBasis > 0 ? (profit / costBasis * 100) : 0;
            }
            
            exitPlan += `### ${i+1}. ${pos.asset}/USD\n\n`;
            exitPlan += `**Current Status:**\n`;
            exitPlan += `- Quantity: ${pos.quantity.toFixed(8)}\n`;
            exitPlan += `- Current Price: $${pos.currentPrice.toFixed(6)}\n`;
            exitPlan += `- Current Value: $${pos.value.toFixed(2)}\n`;
            exitPlan += `- Bid/Ask Spread: ${pos.spread}\n`;
            
            if (costBasis > 0) {
                exitPlan += `- Cost Basis: $${costBasis.toFixed(2)}\n`;
                exitPlan += `- Profit/Loss: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)\n`;
            }
            
            exitPlan += `\n**Exit Strategy:**\n`;
            
            // Calculate target prices
            const targetPrice = pos.currentPrice * 1.014; // 1.4% profit
            const emergencyPrice = pos.currentPrice * 0.95; // 5% stop loss
            
            if (profitPercent >= 1.4) {
                exitPlan += `- ✅ **READY TO SELL** - Target profit reached!\n`;
                exitPlan += `- Sell at: Market price ($${pos.bid.toFixed(6)})\n`;
                exitPlan += `- Expected proceeds: $${(pos.quantity * pos.bid).toFixed(2)}\n`;
            } else {
                exitPlan += `- 🎯 Target Price: $${targetPrice.toFixed(6)} (+1.4%)\n`;
                exitPlan += `- ⚠️ Stop Loss: $${emergencyPrice.toFixed(6)} (-5%)\n`;
                exitPlan += `- 📊 Hold until target or stop loss triggered\n`;
            }
            
            exitPlan += `\n---\n\n`;
        }
        
        // Exit Options
        exitPlan += `## 🛠️ EXIT OPTIONS\n\n`;
        exitPlan += `### Option A: Let AI Trade (RECOMMENDED)\n`;
        exitPlan += `Let the AI bot continue monitoring and execute sells at 1.4% profit targets automatically.\n\n`;
        exitPlan += `**Command:**\n`;
        exitPlan += `\`\`\`bash\n`;
        exitPlan += `node paper-trading-ai.js\n`;
        exitPlan += `\`\`\`\n\n`;
        
        exitPlan += `### Option B: Manual Market Sell All\n`;
        exitPlan += `Immediately liquidate all positions at current market prices.\n\n`;
        exitPlan += `**Command:**\n`;
        exitPlan += `\`\`\`bash\n`;
        exitPlan += `node force-sell-all.js\n`;
        exitPlan += `\`\`\`\n\n`;
        exitPlan += `⚠️ **Warning:** This will sell at bid prices and may result in losses on underwater positions.\n\n`;
        
        exitPlan += `### Option C: Gradual Exit\n`;
        exitPlan += `Sell positions one at a time as they reach profit targets.\n\n`;
        exitPlan += `1. Monitor positions manually\n`;
        exitPlan += `2. Use limit orders at target prices\n`;
        exitPlan += `3. Adjust targets based on market conditions\n\n`;
        
        exitPlan += `---\n\n`;
        
        // Expected Results
        exitPlan += `## 💰 EXPECTED RESULTS\n\n`;
        
        let totalAtTarget = usdBalance;
        positions.forEach(pos => {
            totalAtTarget += pos.value * 1.014; // Add 1.4% profit
        });
        
        exitPlan += `**If all positions hit 1.4% profit:**\n`;
        exitPlan += `- Total Expected Value: $${totalAtTarget.toFixed(2)}\n`;
        exitPlan += `- Total Expected Profit: $${(totalAtTarget - totalValue).toFixed(2)}\n`;
        exitPlan += `- Return: ${((totalAtTarget / totalValue - 1) * 100).toFixed(2)}%\n\n`;
        
        exitPlan += `**Emergency Exit (sell all now):**\n`;
        exitPlan += `- Immediate Proceeds: $${totalValue.toFixed(2)}\n`;
        exitPlan += `- No additional profit/loss\n\n`;
        
        exitPlan += `---\n\n`;
        
        // Recommendations
        exitPlan += `## 💡 RECOMMENDATIONS\n\n`;
        exitPlan += `1. ✅ **Use Option A** - Let AI bot handle exits at 1.4% profit\n`;
        exitPlan += `2. ⏰ **Timeline** - Positions should exit within 24-48 hours at 1.4% targets\n`;
        exitPlan += `3. 📊 **Monitor** - Check dashboard periodically for completed sells\n`;
        exitPlan += `4. 🚨 **Emergency** - Use force-sell-all.js only if immediate exit needed\n`;
        exitPlan += `5. 💰 **New Trades** - Consider stopping new buys if full exit desired\n\n`;
        
        exitPlan += `---\n\n`;
        exitPlan += `*Exit plan generated by Crypto Trading AI*\n`;
        
        // 8️⃣ Save exit plan
        fs.writeFileSync(EXIT_PLAN_FILE, exitPlan);
        
        console.log('\n✅ EXIT PLAN CREATED: ' + EXIT_PLAN_FILE);
        console.log('\n📋 SUMMARY:');
        console.log('   Total Portfolio: $' + totalValue.toFixed(2));
        console.log('   Positions: ' + positions.length);
        console.log('   Largest: ' + (positions[0] ? positions[0].asset + ' ($' + positions[0].value.toFixed(2) + ')' : 'None'));
        console.log('\n👉 Read EXIT_PLAN.md for detailed strategy');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

// Run exit plan creation
createExitPlan();
