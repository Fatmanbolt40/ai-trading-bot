// Quick fix script to add the helper function
const fs = require('fs');

const filePath = './paper-trading-ai.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add helper function before fetchKrakenTradeHistory
const helperFunction = `
    // 🔧 Helper: Convert Kraken asset codes to symbols
    krakenAssetToSymbol(asset) {
        const assetMap = {
            'XXDG': 'DOGE', 'XXRP': 'XRP', 'XETH': 'ETH', 'XXBT': 'BTC',
            'XXLM': 'XLM', 'ZUSD': 'USD', 'XLTC': 'LTC', 'XXMR': 'XMR', 'XZEC': 'ZEC'
        };
        if (assetMap[asset]) return assetMap[asset];
        if (asset.startsWith('X') && asset.length > 3) return asset.substring(1);
        if (asset.startsWith('Z')) return asset.substring(1);
        return asset;
    }
`;

// Insert before fetchKrakenTradeHistory if not already present
if (!content.includes('krakenAssetToSymbol(asset)')) {
    content = content.replace(
        /async fetchKrakenTradeHistory\(\) \{/,
        helperFunction + '\n    async fetchKrakenTradeHistory() {'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Helper function added!');
} else {
    console.log('✅ Helper function already exists!');
}
