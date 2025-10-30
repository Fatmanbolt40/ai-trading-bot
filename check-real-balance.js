require('dotenv').config();
const KrakenAPI = require('./kraken-integration.js');

(async () => {
    try {
        console.log('🔍 Checking REAL Kraken balance...\n');
        
        const kraken = new KrakenAPI();
        const balance = await kraken.getBalance();
        
        console.log('💰 RAW KRAKEN RESPONSE:');
        console.log(JSON.stringify(balance, null, 2));
        
        console.log('\n📊 PARSED BALANCES:');
        for (const [asset, amount] of Object.entries(balance)) {
            const bal = parseFloat(amount);
            if (bal > 0) {
                console.log(`   ${asset}: ${bal}`);
            }
        }
        
        const usdBalance = parseFloat(balance.ZUSD || 0);
        console.log(`\n💵 USD Balance: $${usdBalance.toFixed(2)}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
