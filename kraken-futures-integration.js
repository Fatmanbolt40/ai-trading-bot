/**
 * Kraken Futures API Integration
 * Trade Kraken Futures (perpetual contracts)
 */

const crypto = require('crypto');
const axios = require('axios');

class KrakenFutures {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseUrl = 'https://futures.kraken.com';
    }

    /**
     * Generate authentication signature for Kraken Futures
     */
    getSignature(endpoint, postData, nonce) {
        const message = postData + nonce + endpoint;
        const hash = crypto.createHash('sha256').update(message).digest();
        const hmac = crypto.createHmac('sha512', Buffer.from(this.apiSecret, 'base64'));
        hmac.update(hash);
        return hmac.digest('base64');
    }

    /**
     * Get Futures account balance
     */
    async getBalance() {
        const path = '/derivatives/api/v3/accounts';
        const nonce = Date.now().toString();
        const postData = '';
        
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.get(`${this.baseUrl}${path}`, {
                headers: {
                    'APIKey': this.apiKey,
                    'Authent': signature,
                    'Nonce': nonce
                }
            });
            
            if (response.data.result === 'success') {
                return response.data.accounts;
            } else {
                throw new Error(`Balance Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('❌ Failed to get futures balance:', error.message);
            throw error;
        }
    }

    /**
     * Get open positions
     */
    async getPositions() {
        const path = '/derivatives/api/v3/openpositions';
        const nonce = Date.now().toString();
        const postData = '';
        
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.get(`${this.baseUrl}${path}`, {
                headers: {
                    'APIKey': this.apiKey,
                    'Authent': signature,
                    'Nonce': nonce
                }
            });
            
            if (response.data.result === 'success') {
                return response.data.openPositions || [];
            } else {
                throw new Error(`Positions Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('❌ Failed to get positions:', error.message);
            throw error;
        }
    }

    /**
     * Place a futures market order
     * @param {string} symbol - Trading pair (e.g., 'pf_solusd' for SOL perpetual)
     * @param {string} side - 'buy' or 'sell'
     * @param {number} size - Order size in contracts
     */
    async placeMarketOrder(symbol, side, size) {
        const path = '/derivatives/api/v3/sendorder';
        const nonce = Date.now().toString();
        
        const orderData = {
            orderType: 'mkt',
            symbol: symbol,
            side: side,
            size: size
        };
        
        const postData = JSON.stringify(orderData);
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.post(`${this.baseUrl}${path}`, orderData, {
                headers: {
                    'APIKey': this.apiKey,
                    'Authent': signature,
                    'Nonce': nonce,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.result === 'success') {
                console.log(`✅ Futures order placed: ${side} ${size} ${symbol}`);
                return response.data.sendStatus;
            } else {
                throw new Error(`Order Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('❌ Failed to place futures order:', error.message);
            throw error;
        }
    }

    /**
     * Close a position (convert to market order in opposite direction)
     * @param {string} symbol - Trading pair
     */
    async closePosition(symbol) {
        const path = '/derivatives/api/v3/sendorder';
        const nonce = Date.now().toString();
        
        const orderData = {
            orderType: 'mkt',
            symbol: symbol,
            side: 'sell',
            reduceOnly: true
        };
        
        const postData = JSON.stringify(orderData);
        const signature = this.getSignature(path, postData, nonce);
        
        try {
            const response = await axios.post(`${this.baseUrl}${path}`, orderData, {
                headers: {
                    'APIKey': this.apiKey,
                    'Authent': signature,
                    'Nonce': nonce,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.result === 'success') {
                console.log(`✅ Position closed: ${symbol}`);
                return response.data.sendStatus;
            } else {
                throw new Error(`Close Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('❌ Failed to close position:', error.message);
            throw error;
        }
    }

    /**
     * Get available futures markets
     */
    async getMarkets() {
        try {
            const response = await axios.get(`${this.baseUrl}/derivatives/api/v3/instruments`);
            
            if (response.data.result === 'success') {
                return response.data.instruments;
            } else {
                throw new Error(`Markets Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('❌ Failed to get markets:', error.message);
            throw error;
        }
    }

    /**
     * Get current price for a futures contract
     * @param {string} symbol - Trading pair (e.g., 'pf_solusd')
     */
    async getPrice(symbol) {
        try {
            const response = await axios.get(`${this.baseUrl}/derivatives/api/v3/tickers`);
            
            if (response.data.result === 'success') {
                const ticker = response.data.tickers.find(t => t.symbol === symbol);
                if (ticker) {
                    return {
                        last: ticker.last,
                        bid: ticker.bid,
                        ask: ticker.ask,
                        volume: ticker.vol24h
                    };
                }
            }
            throw new Error(`Price not found for ${symbol}`);
        } catch (error) {
            console.error('❌ Failed to get price:', error.message);
            throw error;
        }
    }
}

module.exports = KrakenFutures;
