/**
 * Kraken WebSocket API Integration
 * Real-time cryptocurrency trading with Kraken Exchange
 */

const WebSocket = require('ws');
const crypto = require('crypto');
const axios = require('axios');

class KrakenWebSocket {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.wsPublic = null;
        this.wsPrivate = null;
        this.publicUrl = 'wss://ws.kraken.com';
        this.privateUrl = 'wss://ws-auth.kraken.com';
        this.subscriptions = new Map();
        this.orderBook = { bids: [], asks: [] };
        this.lastPrice = 0;
        this.lastTrade = null;
    }

    /**
     * Connect to Kraken Public WebSocket (Market Data)
     */
    connectPublic() {
        return new Promise((resolve, reject) => {
            console.log('🌐 Connecting to Kraken Public WebSocket...');
            
            this.wsPublic = new WebSocket(this.publicUrl);
            
            this.wsPublic.on('open', () => {
                console.log('✅ Connected to Kraken Public WebSocket');
                this.subscribeToTicker('SOL/USD');
                this.subscribeToTrades('SOL/USD');
                resolve();
            });
            
            this.wsPublic.on('message', (data) => {
                this.handlePublicMessage(data);
            });
            
            this.wsPublic.on('error', (error) => {
                console.error('❌ Public WebSocket error:', error);
                reject(error);
            });
            
            this.wsPublic.on('close', () => {
                console.log('🔌 Public WebSocket disconnected');
                setTimeout(() => this.connectPublic(), 5000); // Auto-reconnect
            });
        });
    }

    /**
     * Connect to Kraken Private WebSocket (Trading & Account)
     */
    async connectPrivate() {
        try {
            console.log('🔐 Connecting to Kraken Private WebSocket...');
            
            // Get WebSocket token from REST API
            const token = await this.getWebSocketToken();
            
            this.wsPrivate = new WebSocket(this.privateUrl);
            
            this.wsPrivate.on('open', () => {
                console.log('✅ Connected to Kraken Private WebSocket');
                this.authenticatePrivate(token);
            });
            
            this.wsPrivate.on('message', (data) => {
                this.handlePrivateMessage(data);
            });
            
            this.wsPrivate.on('error', (error) => {
                console.error('❌ Private WebSocket error:', error);
            });
            
            this.wsPrivate.on('close', () => {
                console.log('🔌 Private WebSocket disconnected');
                setTimeout(() => this.connectPrivate(), 5000);
            });
        } catch (error) {
            console.error('❌ Failed to connect private WebSocket:', error);
        }
    }

    /**
     * Get WebSocket authentication token from Kraken REST API
     */
    async getWebSocketToken() {
        const path = '/0/private/GetWebSocketsToken';
        const nonce = Date.now() * 1000;
        const postData = `nonce=${nonce}`;
        
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.post(`https://api.kraken.com${path}`, postData, {
                headers: {
                    'API-Key': this.apiKey,
                    'API-Sign': signature,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (response.data.error && response.data.error.length > 0) {
                throw new Error(`Kraken API Error: ${response.data.error.join(', ')}`);
            }
            
            return response.data.result.token;
        } catch (error) {
            console.error('❌ Failed to get WebSocket token:', error.message);
            throw error;
        }
    }

    /**
     * Generate API signature for Kraken authentication
     */
    getSignature(path, postData, nonce) {
        const message = postData;
        const secret = Buffer.from(this.apiSecret, 'base64');
        const hash = crypto.createHash('sha256').update(nonce + message).digest();
        const hmac = crypto.createHmac('sha512', secret);
        const signature = hmac.update(path).update(hash).digest('base64');
        
        return signature;
    }

    /**
     * Authenticate private WebSocket connection
     */
    authenticatePrivate(token) {
        const authMessage = {
            event: 'subscribe',
            subscription: {
                name: 'ownTrades',
                token: token
            }
        };
        
        this.wsPrivate.send(JSON.stringify(authMessage));
        console.log('🔑 Authenticated private WebSocket');
    }

    /**
     * Subscribe to ticker updates (price, volume, etc.)
     */
    subscribeToTicker(pair) {
        const message = {
            event: 'subscribe',
            pair: [pair],
            subscription: {
                name: 'ticker'
            }
        };
        
        this.wsPublic.send(JSON.stringify(message));
        console.log(`📊 Subscribed to ticker: ${pair}`);
    }

    /**
     * Subscribe to trade updates
     */
    subscribeToTrades(pair) {
        const message = {
            event: 'subscribe',
            pair: [pair],
            subscription: {
                name: 'trade'
            }
        };
        
        this.wsPublic.send(JSON.stringify(message));
        console.log(`💹 Subscribed to trades: ${pair}`);
    }

    /**
     * Subscribe to order book updates (depth)
     */
    subscribeToOrderBook(pair, depth = 10) {
        const message = {
            event: 'subscribe',
            pair: [pair],
            subscription: {
                name: 'book',
                depth: depth
            }
        };
        
        this.wsPublic.send(JSON.stringify(message));
        console.log(`📖 Subscribed to order book: ${pair} (depth: ${depth})`);
    }

    /**
     * Handle incoming public WebSocket messages
     */
    handlePublicMessage(data) {
        try {
            const message = JSON.parse(data);
            
            // Handle system events
            if (message.event) {
                if (message.event === 'heartbeat') {
                    // Silent heartbeat
                    return;
                }
                console.log('📡 Event:', message);
                return;
            }
            
            // Handle channel data
            if (Array.isArray(message)) {
                const channelName = message[message.length - 2];
                const pair = message[message.length - 1];
                const data = message[1];
                
                if (channelName === 'ticker') {
                    this.handleTickerUpdate(data, pair);
                } else if (channelName === 'trade') {
                    this.handleTradeUpdate(data, pair);
                } else if (channelName === 'book-10') {
                    this.handleOrderBookUpdate(data, pair);
                }
            }
        } catch (error) {
            console.error('❌ Error parsing public message:', error);
        }
    }

    /**
     * Handle ticker updates
     */
    handleTickerUpdate(data, pair) {
        const ticker = {
            pair: pair,
            ask: parseFloat(data.a[0]),
            bid: parseFloat(data.b[0]),
            close: parseFloat(data.c[0]),
            volume: parseFloat(data.v[0]),
            low: parseFloat(data.l[0]),
            high: parseFloat(data.h[0]),
            open: parseFloat(data.o[0])
        };
        
        this.lastPrice = ticker.close;
        console.log(`💰 ${pair} - Price: $${ticker.close.toFixed(2)} | Bid: $${ticker.bid.toFixed(2)} | Ask: $${ticker.ask.toFixed(2)}`);
        
        // Emit event for AI trading system
        this.onTicker && this.onTicker(ticker);
    }

    /**
     * Handle trade updates
     */
    handleTradeUpdate(trades, pair) {
        if (!Array.isArray(trades)) return;
        
        trades.forEach(trade => {
            const tradeData = {
                pair: pair,
                price: parseFloat(trade[0]),
                volume: parseFloat(trade[1]),
                time: parseFloat(trade[2]),
                side: trade[3], // 'b' for buy, 's' for sell
                orderType: trade[4] // 'm' for market, 'l' for limit
            };
            
            this.lastTrade = tradeData;
            console.log(`📈 Trade: ${pair} ${tradeData.side === 'b' ? 'BUY' : 'SELL'} ${tradeData.volume} @ $${tradeData.price.toFixed(2)}`);
            
            // Emit event for AI trading system
            this.onTrade && this.onTrade(tradeData);
        });
    }

    /**
     * Handle order book updates
     */
    handleOrderBookUpdate(data, pair) {
        if (data.bs) {
            // Bids (buy orders)
            this.orderBook.bids = data.bs.map(bid => ({
                price: parseFloat(bid[0]),
                volume: parseFloat(bid[1])
            }));
        }
        
        if (data.as) {
            // Asks (sell orders)
            this.orderBook.asks = data.as.map(ask => ({
                price: parseFloat(ask[0]),
                volume: parseFloat(ask[1])
            }));
        }
        
        // Emit event for AI trading system
        this.onOrderBook && this.onOrderBook(this.orderBook);
    }

    /**
     * Handle private WebSocket messages (orders, balances, etc.)
     */
    handlePrivateMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('🔐 Private message:', message);
            
            // Handle different private channel types
            if (Array.isArray(message)) {
                const channelName = message[1];
                const data = message[0];
                
                if (channelName === 'ownTrades') {
                    console.log('✅ Your trade executed:', data);
                    this.onOwnTrade && this.onOwnTrade(data);
                }
            }
        } catch (error) {
            console.error('❌ Error parsing private message:', error);
        }
    }

    /**
     * Place a market order (BUY or SELL)
     */
    async placeMarketOrder(pair, side, volume) {
        const path = '/0/private/AddOrder';
        const nonce = Date.now() * 1000;
        const postData = `nonce=${nonce}&ordertype=market&type=${side}&volume=${volume}&pair=${pair}`;
        
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.post(`https://api.kraken.com${path}`, postData, {
                headers: {
                    'API-Key': this.apiKey,
                    'API-Sign': signature,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (response.data.error && response.data.error.length > 0) {
                throw new Error(`Order Error: ${response.data.error.join(', ')}`);
            }
            
            console.log(`✅ Order placed: ${side} ${volume} ${pair}`);
            return response.data.result;
        } catch (error) {
            console.error('❌ Failed to place order:', error.message);
            throw error;
        }
    }

    /**
     * Get account balance
     */
    async getBalance() {
        const path = '/0/private/Balance';
        const nonce = Date.now() * 1000;
        const postData = `nonce=${nonce}`;
        
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.post(`https://api.kraken.com${path}`, postData, {
                headers: {
                    'API-Key': this.apiKey,
                    'API-Sign': signature,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (response.data.error && response.data.error.length > 0) {
                throw new Error(`Balance Error: ${response.data.error.join(', ')}`);
            }
            
            return response.data.result;
        } catch (error) {
            console.error('❌ Failed to get balance:', error.message);
            throw error;
        }
    }
    
    /**
     * 📊 Get trade history from Kraken (last 50 trades)
     */
    async getTradesHistory() {
        const path = '/0/private/TradesHistory';
        const nonce = Date.now() * 1000;
        const postData = `nonce=${nonce}`;
        
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.post(`https://api.kraken.com${path}`, postData, {
                headers: {
                    'API-Key': this.apiKey,
                    'API-Sign': signature,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (response.data.error && response.data.error.length > 0) {
                throw new Error(`Trade History Error: ${response.data.error.join(', ')}`);
            }
            
            return response.data.result.trades || {};
        } catch (error) {
            console.error('❌ Failed to get trade history:', error.message);
            throw error;
        }
    }
    
    /**
     * 📊 Get closed orders from Kraken
     */
    async getClosedOrders() {
        const path = '/0/private/ClosedOrders';
        const nonce = Date.now() * 1000;
        const postData = `nonce=${nonce}`;
        
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.post(`https://api.kraken.com${path}`, postData, {
                headers: {
                    'API-Key': this.apiKey,
                    'API-Sign': signature,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            if (response.data.error && response.data.error.length > 0) {
                throw new Error(`Closed Orders Error: ${response.data.error.join(', ')}`);
            }
            
            return response.data.result.closed || {};
        } catch (error) {
            console.error('❌ Failed to get closed orders:', error.message);
            throw error;
        }
    }

    /**
     * Get current market price
     */
    getCurrentPrice() {
        return this.lastPrice;
    }

    /**
     * Get last trade
     */
    getLastTrade() {
        return this.lastTrade;
    }
    
    /**
     * Get ticker data from REST API (for any pair)
     */
    async getTicker(pair) {
        try {
            const response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
            if (response.data.error && response.data.error.length > 0) {
                throw new Error(`Ticker Error: ${response.data.error.join(', ')}`);
            }
            
            // Return first result (Kraken returns object with pair key)
            const result = response.data.result;
            const tickerKey = Object.keys(result)[0];
            return result[tickerKey];
        } catch (error) {
            return null; // Return null if pair not found
        }
    }

    /**
     * Disconnect all WebSocket connections
     */
    disconnect() {
        if (this.wsPublic) {
            this.wsPublic.close();
            console.log('🔌 Disconnected from public WebSocket');
        }
        
        if (this.wsPrivate) {
            this.wsPrivate.close();
            console.log('🔌 Disconnected from private WebSocket');
        }
    }
}

module.exports = KrakenWebSocket;
