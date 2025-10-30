// Sell ALL LRC on Kraken RIGHT NOW
require('dotenv').config();
const KrakenWebSocket = require('./kraken-integration');

async function sellAllLRC() {
    console.log('🔥 SELLING ALL LRC ON KRAKEN...\n');
    
    const kraken = new KrakenWebSocket(
        process.env.KRAKEN_API_KEY,
        process.env.KRAKEN_API_SECRET
    );
    
    try {
        // Get balance
        const balances = await kraken.getBalance();
        console.log('📊 Current balances:', balances);
        
        // Find LRC
        let lrcAmount = 0;
        for (const [asset, amount] of Object.entries(balances)) {
            if (asset.includes('LRC')) {
                lrcAmount = parseFloat(amount);
                console.log(`\n💰 Found ${lrcAmount} LRC`);
                break;
            }
        }
        
        if (lrcAmount <= 0) {
            console.log('✅ No LRC found - already sold!');
            process.exit(0);
        }
        
        // Sell 99.99% to avoid rounding errors
        const sellAmount = (lrcAmount * 0.9999).toFixed(4);
        console.log(`\n🔥 Selling ${sellAmount} LRC...`);
        
        const result = await kraken.placeMarketOrder('LRCUSD', 'sell', sellAmount);
        console.log('\n✅ SOLD!', result);
        console.log('\n💵 You now have only USD and SOL');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
    
    process.exit(0);
}

sellAllLRC();
