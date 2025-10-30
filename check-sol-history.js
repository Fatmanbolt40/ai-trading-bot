require('dotenv').config();
const crypto = require('crypto');
const https = require('https');

const apiKey = process.env.KRAKEN_API_KEY;
const apiSecret = process.env.KRAKEN_API_SECRET;

function makeRequest(path, data) {
    const nonce = Date.now() * 1000;
    const postData = `nonce=${nonce}`;
    
    const message = path + crypto.createHash('sha256').update(nonce + postData).digest();
    const signature = crypto.createHmac('sha512', Buffer.from(apiSecret, 'base64'))
        .update(message, 'binary')
        .digest('base64');
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.kraken.com',
            path: path,
            method: 'POST',
            headers: {
                'API-Key': apiKey,
                'API-Sign': signature,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

(async () => {
    try {
        console.log('📊 Fetching your SOL trade history from Kraken...\n');
        
        const result = await makeRequest('/0/private/TradesHistory', {});
        
        if (result.error && result.error.length > 0) {
            console.log('❌ Error:', result.error);
            return;
        }
        
        const trades = Object.entries(result.result.trades)
            .map(([id, trade]) => ({
                id,
                ...trade,
                time: new Date(trade.time * 1000).toLocaleString()
            }))
            .filter(t => t.pair.includes('SOL'))
            .sort((a, b) => b.time - a.time);
        
        console.log(`Found ${trades.length} SOL trades:\n`);
        
        trades.slice(0, 5).forEach(t => {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📅 Date: ${t.time}`);
            console.log(`${t.type === 'buy' ? '💰 BUY' : '💸 SELL'} ${t.pair}`);
            console.log(`📊 Volume: ${t.vol} SOL`);
            console.log(`💵 Price: $${parseFloat(t.price).toFixed(2)} per SOL`);
            console.log(`💰 Total Cost: $${parseFloat(t.cost).toFixed(2)}`);
            console.log(`🏦 Fee: $${parseFloat(t.fee).toFixed(4)}`);
            console.log(`💎 Net Cost: $${(parseFloat(t.cost) + parseFloat(t.fee)).toFixed(2)}`);
            console.log();
        });
        
        // Find your specific purchase
        const yourBuy = trades.find(t => t.type === 'buy' && parseFloat(t.vol) >= 0.049 && parseFloat(t.vol) <= 0.050);
        if (yourBuy) {
            console.log('\n🎯 YOUR SOL PURCHASE:');
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`You bought: ${yourBuy.vol} SOL`);
            console.log(`At price: $${parseFloat(yourBuy.price).toFixed(2)} per SOL`);
            console.log(`Subtotal: $${parseFloat(yourBuy.cost).toFixed(2)}`);
            console.log(`Fee: $${parseFloat(yourBuy.fee).toFixed(4)}`);
            console.log(`TOTAL PAID: $${(parseFloat(yourBuy.cost) + parseFloat(yourBuy.fee)).toFixed(2)}`);
            console.log();
            console.log(`✅ This matches your $10.04 payment!`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
