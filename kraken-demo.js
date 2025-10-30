/**
 * Kraken Live Trading Demo
 * Connect your AI to real Kraken market data
 */

const KrakenWebSocket = require('./kraken-integration');

// IMPORTANT: Store your credentials securely!
// Never commit API keys to git - use environment variables
const KRAKEN_API_KEY = process.env.KRAKEN_API_KEY || 'your-api-key-here';
const KRAKEN_API_SECRET = process.env.KRAKEN_API_SECRET || 'your-api-secret-here';

// Initialize Kraken WebSocket connection
const kraken = new KrakenWebSocket(KRAKEN_API_KEY, KRAKEN_API_SECRET);

// Event handlers
kraken.onTicker = (ticker) => {
    console.log('📊 Ticker Update:', {
        pair: ticker.pair,
        price: `$${ticker.close.toFixed(2)}`,
        bid: `$${ticker.bid.toFixed(2)}`,
        ask: `$${ticker.ask.toFixed(2)}`,
        volume: ticker.volume.toFixed(2),
        spread: `$${(ticker.ask - ticker.bid).toFixed(2)}`
    });
    
    // TODO: Feed this data to your AI trading system
    // Example: advancedAI.updateMarketData(ticker);
};

kraken.onTrade = (trade) => {
    console.log('💹 New Trade:', {
        pair: trade.pair,
        side: trade.side === 'b' ? '🟢 BUY' : '🔴 SELL',
        price: `$${trade.price.toFixed(2)}`,
        volume: trade.volume.toFixed(4),
        type: trade.orderType === 'm' ? 'MARKET' : 'LIMIT'
    });
    
    // TODO: Your AI can analyze trade patterns here
};

kraken.onOrderBook = (orderBook) => {
    const bestBid = orderBook.bids[0];
    const bestAsk = orderBook.asks[0];
    
    if (bestBid && bestAsk) {
        console.log('📖 Order Book:', {
            bestBid: `$${bestBid.price.toFixed(2)} (${bestBid.volume.toFixed(2)})`,
            bestAsk: `$${bestAsk.price.toFixed(2)} (${bestAsk.volume.toFixed(2)})`,
            spread: `$${(bestAsk.price - bestBid.price).toFixed(2)}`
        });
    }
};

kraken.onOwnTrade = (trade) => {
    console.log('✅ YOUR TRADE EXECUTED:', trade);
};

// Connect and start receiving data
async function start() {
    try {
        console.log('🚀 Starting Kraken WebSocket Demo...\n');
        
        // Connect to public WebSocket for market data
        await kraken.connectPublic();
        
        // Subscribe to order book (optional)
        setTimeout(() => {
            kraken.subscribeToOrderBook('SOL/USD', 10);
        }, 2000);
        
        // Connect to private WebSocket (for trading)
        // Uncomment when you have real API keys:
        // await kraken.connectPrivate();
        
        // Example: Get your account balance
        // const balance = await kraken.getBalance();
        // console.log('💰 Your balance:', balance);
        
        console.log('\n✅ Connected! Receiving live market data...');
        console.log('💡 Press Ctrl+C to stop\n');
        
    } catch (error) {
        console.error('❌ Failed to start:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    kraken.disconnect();
    process.exit(0);
});

// Start the demo
start();
