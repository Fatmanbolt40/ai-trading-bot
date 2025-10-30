// Quick script: Sell all positions and start fresh with $3 trades
require('dotenv').config();
const KrakenWebSocket = require('./kraken-integration');
const fs = require('fs');

async function resetForTrading() {
    console.log('🔥 FORCE SELLING ALL POSITIONS...\n');
    
    const kraken = new KrakenWebSocket(
        process.env.KRAKEN_API_KEY,
        process.env.KRAKEN_API_SECRET
    );
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for rate limit
    
    try {
        const balances = await kraken.getBalance();
        
        // Sell everything
        for (const [asset, amount] of Object.entries(balances)) {
            const balance = parseFloat(amount);
            if (balance <= 0 || asset.includes('USD')) continue;
            
            let symbol = asset.replace('X', '').replace('Z', '');
            const sellAmt = (balance * 0.9999).toFixed(6);
            
            console.log(`💰 Selling ${sellAmt} ${symbol}...`);
            try {
                await kraken.placeMarketOrder(`${symbol}USD`, 'sell', sellAmt);
                console.log(`✅ Sold ${symbol}`);
            } catch (e) {
                console.log(`⚠️  ${symbol}: ${e.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('\n✅ ALL SOLD! Resetting AI state...\n');
        
        // Reset state for $3 trades
        const statePath = './paper-trading-state.json';
        let data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        data.state.portfolio = {};
        data.state.currentBalance = 15; // Your USD balance after selling
        
        fs.writeFileSync(statePath, JSON.stringify(data, null, 2));
        console.log('✅ State reset! Balance: $15\n');
        console.log('💡 Starting AI with $3 trades...\n');
        
    } catch (error) {
        if (error.message.includes('Rate limit')) {
            console.log('\n⏳ Rate limited - wait 2 mins and run again');
        } else {
            console.error('❌', error.message);
        }
    }
    
    process.exit(0);
}

resetForTrading();
