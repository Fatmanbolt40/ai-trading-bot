/**
 * Sync AI State with True Kraken Balance
 * Fetches real account balance from Kraken and updates paper-trading-state.json
 */

require('dotenv').config();
const fs = require('fs');
const KrakenWebSocket = require('./kraken-integration.js');

const STATE_FILE = './paper-trading-state.json';

async function syncTrueBalance() {
    console.log('🔄 Syncing AI state with Kraken account balance...\n');
    
    try {
        // 1️⃣ Connect to Kraken
        const kraken = new KrakenWebSocket(process.env.KRAKEN_API_KEY, process.env.KRAKEN_API_SECRET);
        
        // 2️⃣ Fetch real balance
        console.log('📊 Fetching account balance from Kraken...');
        const balance = await kraken.getBalance();
        
        console.log('\n💰 RAW KRAKEN BALANCES:');
        console.log(JSON.stringify(balance, null, 2));
        
        // 3️⃣ Calculate USD balance
        let usdBalance = 0;
        
        // Check for USD variants
        if (balance.ZUSD) usdBalance += parseFloat(balance.ZUSD);
        if (balance.USD) usdBalance += parseFloat(balance.USD);
        if (balance['USD.M']) usdBalance += parseFloat(balance['USD.M']);
        
        console.log('\n💵 TOTAL USD BALANCE: $' + usdBalance.toFixed(2));
        
        // 4️⃣ Get positions value (need to fetch prices)
        let positionsValue = 0;
        const positions = {};
        
        for (const [asset, amount] of Object.entries(balance)) {
            const qty = parseFloat(amount);
            if (qty > 0 && !asset.includes('USD') && !asset.includes('KFEE')) {
                // Clean asset name (remove X/Z prefixes)
                let cleanAsset = asset.replace(/^[XZ]/, '');
                positions[cleanAsset] = qty;
            }
        }
        
        console.log('\n📦 POSITIONS FOUND: ' + Object.keys(positions).length);
        
        // 5️⃣ Get current prices for positions
        console.log('📊 Fetching position values...');
        const axios = require('axios');
        
        for (const [asset, qty] of Object.entries(positions)) {
            try {
                // Try to get ticker for this asset
                const pair = `${asset}USD`;
                const ticker = await kraken.getTicker(pair);
                if (ticker && ticker.c && ticker.c[0]) {
                    const price = parseFloat(ticker.c[0]);
                    const value = qty * price;
                    positionsValue += value;
                    console.log(`   ${asset}: ${qty} × $${price.toFixed(6)} = $${value.toFixed(2)}`);
                }
            } catch (err) {
                // Asset might not have USD pair or too small to matter
                console.log(`   ${asset}: ${qty} (no USD price)`);
            }
        }
        
        console.log('\n💎 TOTAL PORTFOLIO VALUE: $' + (usdBalance + positionsValue).toFixed(2));
        
        // 5️⃣ Load current state
        let state = {};
        if (fs.existsSync(STATE_FILE)) {
            state = JSON.parse(fs.readFileSync(STATE_FILE));
            console.log('\n📂 Current AI State:');
            console.log('   Balance: $' + (state.currentBalance || 0).toFixed(2));
            console.log('   Portfolio Count: ' + Object.keys(state.portfolio || {}).length);
        }
        
        // 6️⃣ Update balance in state
        state.currentBalance = usdBalance;
        state.startingBalance = state.startingBalance || usdBalance;
        
        // 7️⃣ Update portfolio positions to match Kraken
        if (!state.portfolio) state.portfolio = {};
        
        // Clear old positions that don't exist in Kraken
        for (const market in state.portfolio) {
            const symbol = market.split('/')[0];
            if (!positions[symbol]) {
                console.log(`🗑️  Removing phantom position: ${market}`);
                delete state.portfolio[market];
            }
        }
        
        // 8️⃣ Save updated state
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        
        console.log('\n✅ STATE UPDATED:');
        console.log('   Balance synced: $' + usdBalance.toFixed(2));
        console.log('   Portfolio synced: ' + Object.keys(state.portfolio).length + ' positions');
        console.log('   File saved: ' + STATE_FILE);
        
        console.log('\n🎯 SUMMARY:');
        console.log('   💵 Available USD: $' + usdBalance.toFixed(2));
        console.log('   📦 Positions: ' + Object.keys(positions).length);
        console.log('   💰 Total Value: $' + (usdBalance + positionsValue).toFixed(2));
        
        console.log('\n✨ AI will now see your TRUE Kraken balance!');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run sync
syncTrueBalance();
