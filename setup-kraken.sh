#!/bin/bash

echo "🚀 Kraken Integration Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

echo "📝 Enter your Kraken API credentials:"
echo ""
read -p "API Key: " api_key
read -p "API Secret: " api_secret

# Create .env file
cat > .env << EOF
# Kraken API Credentials
KRAKEN_API_KEY=$api_key
KRAKEN_API_SECRET=$api_secret

# Trading Settings
LIVE_TRADING=false
INITIAL_BALANCE=100
TRADE_AMOUNT=10
EOF

echo ""
echo "✅ .env file created!"
echo ""

# Add to .gitignore
if ! grep -q ".env" .gitignore 2>/dev/null; then
    echo ".env" >> .gitignore
    echo "✅ Added .env to .gitignore"
fi

# Install dotenv if needed
if ! npm list dotenv &>/dev/null; then
    echo "📦 Installing dotenv..."
    npm install dotenv
fi

echo ""
echo "🧪 Testing Kraken connection..."
echo ""

# Test connection
node -e "
const KrakenWebSocket = require('./kraken-integration');
require('dotenv').config();

const kraken = new KrakenWebSocket(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);

console.log('🌐 Connecting to Kraken...');
kraken.connectPublic().then(() => {
    console.log('✅ Successfully connected to Kraken WebSocket!');
    setTimeout(() => {
        console.log('💰 Current SOL price: \$' + kraken.getCurrentPrice().toFixed(2));
        console.log('');
        console.log('🎉 Setup complete! You can now:');
        console.log('   1. node kraken-demo.js         - Test live market data');
        console.log('   2. node advanced-crypto-ai.js  - Run AI with simulated trading');
        console.log('');
        console.log('📖 Read KRAKEN_SETUP_GUIDE.md for funding instructions');
        process.exit(0);
    }, 3000);
}).catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
});
"

