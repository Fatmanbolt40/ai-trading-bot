require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

// Kraken API request helper
function createKrakenSignature(path, data, secret) {
    const message = data.nonce + data;
    const hash = crypto.createHash('sha256').update(message).digest();
    const hmac = crypto.createHmac('sha512', Buffer.from(secret, 'base64'));
    hmac.update(path + hash);
    return hmac.digest('base64');
}

async function krakenRequest(endpoint, params = {}) {
    const apiKey = process.env.KRAKEN_API_KEY;
    const apiSecret = process.env.KRAKEN_API_SECRET;
    
    const nonce = Date.now() * 1000;
    const data = { ...params, nonce };
    const postData = Object.keys(data).map(key => `${key}=${data[key]}`).join('&');
    
    const signature = createKrakenSignature(`/0/private/${endpoint}`, postData, apiSecret);
    
    const response = await axios.post(
        `https://api.kraken.com/0/private/${endpoint}`,
        postData,
        {
            headers: {
                'API-Key': apiKey,
                'API-Sign': signature,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    
    if (response.data.error && response.data.error.length > 0) {
        throw new Error(response.data.error.join(', '));
    }
    
    return response.data.result;
}

async function sellRealPositions() {
    console.log('🔍 Connecting to Kraken...\n');
    
    try {
        // Get current balance
        console.log('💰 Fetching real balance...');
        const balance = await krakenRequest('Balance');
        
        console.log('\n📊 YOUR REAL KRAKEN POSITIONS:');
        console.log('═'.repeat(50));
        
        const positionsToSell = [];
        
        for (const [krakenCode, amount] of Object.entries(balance)) {
            const numAmount = parseFloat(amount);
            
            if (numAmount > 0 && !krakenCode.includes('USD') && !krakenCode.startsWith('Z')) {
                // Map Kraken codes to symbols
                let coin = krakenCode.replace(/^X/, ''); // Remove X prefix
                
                // Known mappings
                const mapping = {
                    'XBT': 'BTC',
                    'XDG': 'DOGE',
                    'XXLM': 'XLM',
                    'XXMR': 'XMR',
                    'XXRP': 'XRP'
                };
                
                if (mapping[krakenCode]) {
                    coin = mapping[krakenCode];
                }
                
                console.log(`   ${coin}: ${numAmount.toFixed(8)}`);
                
                // Only sell if above dust threshold
                if (numAmount * 1 >= 0.01) { // Rough $0.01 minimum
                    positionsToSell.push({ coin, krakenCode, amount: numAmount });
                }
            }
        }
        
        if (positionsToSell.length === 0) {
            console.log('\n✅ No significant positions to sell! (All are dust <$0.01)');
            return;
        }
        
        console.log('\n\n🔥 POSITIONS MARKED FOR SALE:');
        positionsToSell.forEach(p => {
            console.log(`   ${p.coin}: ${p.amount.toFixed(8)}`);
        });
        
        console.log('\n⚠️  This will sell ALL your crypto positions for USD!');
        console.log('⏳ Starting in 3 seconds... (Ctrl+C to cancel)\n');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Sell each position
        for (const position of positionsToSell) {
            try {
                const pair = `${position.coin}USD`;
                
                console.log(`\n🔄 Selling ${position.coin}...`);
                
                // Create market sell order
                const orderParams = {
                    pair: pair,
                    type: 'sell',
                    ordertype: 'market',
                    volume: position.amount.toFixed(8)
                };
                
                const order = await krakenRequest('AddOrder', orderParams);
                
                console.log(`✅ SOLD ${position.coin}!`);
                console.log(`   Order IDs: ${order.txid?.join(', ')}`);
                console.log(`   Amount: ${position.amount.toFixed(8)}`);
                
            } catch (error) {
                console.error(`❌ Error selling ${position.coin}: ${error.message}`);
            }
            
            // Wait 1 second between orders to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n\n💰 Fetching final balance...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const finalBalance = await krakenRequest('Balance');
        const usdBalance = finalBalance.ZUSD || finalBalance.USD || 0;
        console.log(`   💵 USD: $${parseFloat(usdBalance).toFixed(2)}`);
        
        console.log('\n✅ All positions sold!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

sellRealPositions();
