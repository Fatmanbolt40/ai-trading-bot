#!/usr/bin/env node
require('dotenv').config();
const KrakenIntegration = require('./kraken-integration');

async function checkBalance() {
    console.log('🔍 Checking REAL Kraken Balance...\n');
    
    const kraken = new KrakenIntegration(
        process.env.KRAKEN_API_KEY,
        process.env.KRAKEN_API_SECRET
    );
    
    try {
        const balance = await kraken.getBalance();
        console.log('💰 KRAKEN BALANCES:');
        console.log('═══════════════════════════════════════════════════');
        
        for (const [asset, amount] of Object.entries(balance)) {
            if (parseFloat(amount) > 0) {
                console.log(`   ${asset}: ${parseFloat(amount).toFixed(8)}`);
                
                // Special handling for PEPE
                if (asset === 'PEPE') {
                    console.log(`   → That's ${parseFloat(amount).toFixed(0)} PEPE coins`);
                }
            }
        }
        
        console.log('═══════════════════════════════════════════════════\n');
        
        // Get current price for PEPE
        const ticker = await kraken.getTicker('PEPEUSD');
        console.log('📊 PEPE/USD CURRENT PRICE:');
        console.log('   Ask: $' + ticker.ask);
        console.log('   Bid: $' + ticker.bid);
        console.log('   Last: $' + ticker.last);
        
        // Calculate value
        const pepeAmount = parseFloat(balance.PEPE || 0);
        if (pepeAmount > 0) {
            const value = pepeAmount * parseFloat(ticker.last);
            console.log('\n💵 PEPE VALUE:');
            console.log('   Holdings: ' + pepeAmount.toFixed(0) + ' PEPE');
            console.log('   @ $' + ticker.last + ' = $' + value.toFixed(2));
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkBalance();
