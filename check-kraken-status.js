require('dotenv').config();
const KrakenAPI = require('./kraken-integration.js');

(async () => {
    try {
        const kraken = new KrakenAPI(
            process.env.KRAKEN_API_KEY,
            process.env.KRAKEN_API_SECRET
        );
        
        console.log('🔍 Checking Kraken account status...\n');
        
        // Check balance
        console.log('💰 Getting balance...');
        const balance = await kraken.getBalance();
        
        console.log('\n📊 ALL BALANCES:');
        for (const [asset, amount] of Object.entries(balance)) {
            const bal = parseFloat(amount);
            if (bal > 0.00001) {  // Show even tiny amounts
                console.log(`   ${asset}: ${bal}`);
            }
        }
        
        const usdBalance = parseFloat(balance.ZUSD || 0);
        const solBalance = parseFloat(balance.SOL || balance.XXSOL || 0);
        
        console.log(`\n💵 USD: $${usdBalance.toFixed(4)}`);
        console.log(`🪙 SOL: ${solBalance.toFixed(8)}`);
        
        // Check open orders
        console.log('\n📋 Checking open orders...');
        try {
            const openOrders = await kraken.getOpenOrders();
            console.log('Open orders:', Object.keys(openOrders).length);
        } catch (e) {
            console.log('Could not get open orders:', e.message);
        }
        
        console.log('\n✅ Real Kraken Status Complete');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    }
})();
