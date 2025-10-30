#!/usr/bin/env node
// 🔴 FORCE SELL ALL - Sell all positions on Kraken immediately

require('dotenv').config();
const KrakenAPIWrapper = require('./kraken-integration');

const USE_REAL_MONEY = process.env.USE_REAL_MONEY === 'true';

async function forceSellAll() {
    console.log('🔴 FORCE SELL ALL POSITIONS\n');
    
    if (!USE_REAL_MONEY) {
        console.log('❌ Real money mode disabled - set USE_REAL_MONEY=true in .env');
        process.exit(1);
    }
    
    const kraken = new KrakenAPIWrapper(
        process.env.KRAKEN_API_KEY,
        process.env.KRAKEN_API_SECRET
    );
    
    try {
        // Get current balances
        console.log('📊 Fetching Kraken balances...\n');
        const balances = await kraken.getBalance();
        
        const tradablePairs = {
            'SOL': 'SOLUSD',
            'XXMR': 'XMRUSD',
            'XMR': 'XMRUSD',
            'HBAR': 'HBARUSD',
            'XXBT': 'XBTUSD',
            'XBT': 'XBTUSD',
            'BEAM': 'BEAMUSD',
            'DASH': 'DASHUSD',
            'SUSHI': 'SUSHIUSD',
            'XRP': 'XRPUSD',
            'XXRP': 'XRPUSD'
        };
        
        const minAmounts = {
            'SOL': 0.01,
            'XMR': 0.01,
            'HBAR': 1.0,
            'XBT': 0.0001,
            'BEAM': 1.0,
            'DASH': 0.01,
            'SUSHI': 1.0,
            'XRP': 1.0
        };
        
        let soldCount = 0;
        
        for (const [asset, balance] of Object.entries(balances)) {
            if (asset === 'ZUSD' || asset === 'USD') continue;
            
            const cleanAsset = asset.replace('X', '').replace('Z', '');
            const pair = tradablePairs[asset] || tradablePairs[cleanAsset];
            const minAmount = minAmounts[cleanAsset] || 0.01;
            
            if (!pair) {
                console.log(`⏭️  Skipping ${asset} (no trading pair mapped)`);
                continue;
            }
            
            if (parseFloat(balance) < minAmount) {
                console.log(`⏭️  Skipping ${asset}: ${balance} (below minimum ${minAmount})`);
                continue;
            }
            
            // Sell 99.99% to avoid rounding issues
            const sellAmount = (parseFloat(balance) * 0.9999).toFixed(6);
            
            console.log(`💰 Selling ${sellAmount} ${cleanAsset} (${pair})...`);
            
            try {
                const order = await kraken.placeMarketOrder(pair, 'sell', sellAmount);
                console.log(`✅ SOLD ${sellAmount} ${cleanAsset}`);
                console.log(`   Order ID: ${order.txid}`);
                soldCount++;
            } catch (err) {
                console.error(`❌ Failed to sell ${cleanAsset}: ${err.message}`);
            }
            
            console.log('');
        }
        
        console.log(`\n✅ Force sell complete: ${soldCount} positions sold`);
        console.log('💰 Check your USD balance with: node check-kraken-status.js\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

forceSellAll();
