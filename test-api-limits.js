#!/usr/bin/env node
/**
 * Kraken API Rate Limit Testing Tool
 * Tests how fast you can sync without hitting rate limits
 */

require('dotenv').config();
const crypto = require('crypto');
const https = require('https');

// Kraken API Rate Limits:
// - Private API: 15-20 calls per second
// - Balance checks: Very low cost (1 point per call)
// - Trading: Higher cost (0-10 points depending on order)
// - Rate limit counter decreases by 1 every 3 seconds

const getKrakenSignature = (path, request, secret) => {
    const message = request.nonce + request;
    const secret_buffer = Buffer.from(secret, 'base64');
    const hash = crypto.createHash('sha256');
    const hmac = crypto.createHmac('sha512', secret_buffer);
    const hash_digest = hash.update(message).digest();
    const hmac_digest = hmac.update(path + hash_digest).digest('base64');
    return hmac_digest;
};

const krakenRequest = (endpoint) => {
    return new Promise((resolve, reject) => {
        const nonce = Date.now() * 1000;
        const request = 'nonce=' + nonce;
        const signature = getKrakenSignature(endpoint, request, process.env.KRAKEN_API_SECRET);
        
        const options = {
            hostname: 'api.kraken.com',
            port: 443,
            path: endpoint,
            method: 'POST',
            headers: {
                'API-Key': process.env.KRAKEN_API_KEY,
                'API-Sign': signature,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': request.length
            }
        };
        
        const startTime = Date.now();
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const result = JSON.parse(data);
                    resolve({ result, responseTime, statusCode: res.statusCode });
                } catch (err) {
                    reject(err);
                }
            });
        });
        
        req.on('error', reject);
        req.write(request);
        req.end();
    });
};

async function testRateLimits(interval, duration) {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     🧪 KRAKEN API RATE LIMIT TEST TOOL 🧪            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log(`⚙️  Test Configuration:`);
    console.log(`   Interval: ${interval}ms (${(1000/interval).toFixed(2)} requests/second)`);
    console.log(`   Duration: ${duration}ms (${(duration/1000).toFixed(1)} seconds)`);
    console.log(`   Endpoint: /0/private/Balance (lowest cost)\n`);
    
    console.log('📊 Kraken Rate Limits:');
    console.log('   • Private API: ~15-20 calls/second');
    console.log('   • Balance check: 1 point per call');
    console.log('   • Counter decreases: 1 point every 3 seconds');
    console.log('   • Max counter: ~15 points\n');
    
    console.log('🚀 Starting test...\n');
    
    let successCount = 0;
    let errorCount = 0;
    let totalResponseTime = 0;
    let errors = [];
    
    const startTime = Date.now();
    let testRunning = true;
    
    const testInterval = setInterval(async () => {
        if (!testRunning) return;
        
        try {
            const { result, responseTime } = await krakenRequest('/0/private/Balance');
            
            if (result.error && result.error.length > 0) {
                errorCount++;
                const errorMsg = result.error[0];
                errors.push(errorMsg);
                
                // Check if it's a rate limit error
                if (errorMsg.includes('EAPI:Rate limit exceeded')) {
                    console.log(`❌ Rate limit hit at ${successCount + errorCount} requests!`);
                    console.log(`   ${errorMsg}`);
                    testRunning = false;
                    clearInterval(testInterval);
                } else {
                    console.log(`⚠️  Error: ${errorMsg}`);
                }
            } else {
                successCount++;
                totalResponseTime += responseTime;
                
                // Show progress every 10 requests
                if (successCount % 10 === 0) {
                    const elapsed = Date.now() - startTime;
                    const avgResponseTime = totalResponseTime / successCount;
                    const requestsPerSecond = (successCount / elapsed) * 1000;
                    
                    console.log(`✅ ${successCount} successful | ` +
                              `Avg: ${avgResponseTime.toFixed(0)}ms | ` +
                              `Rate: ${requestsPerSecond.toFixed(2)}/s`);
                }
            }
        } catch (err) {
            errorCount++;
            console.log(`❌ Network error: ${err.message}`);
        }
    }, interval);
    
    // Stop after duration
    setTimeout(() => {
        testRunning = false;
        clearInterval(testInterval);
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📊 TEST RESULTS');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ Successful requests: ${successCount}`);
        console.log(`❌ Failed requests: ${errorCount}`);
        console.log(`⏱️  Average response time: ${(totalResponseTime / successCount).toFixed(0)}ms`);
        console.log(`📈 Actual rate: ${((successCount / duration) * 1000).toFixed(2)} requests/second`);
        console.log(`⏰ Total duration: ${((Date.now() - startTime) / 1000).toFixed(1)} seconds`);
        
        if (errors.length > 0) {
            console.log(`\n⚠️  Errors encountered:`);
            const uniqueErrors = [...new Set(errors)];
            uniqueErrors.forEach(err => console.log(`   • ${err}`));
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        if (errorCount === 0) {
            console.log(`   ✅ ${interval}ms interval is SAFE (no rate limits hit)`);
            console.log(`   💡 You can go faster! Try: ${Math.floor(interval * 0.7)}ms`);
        } else if (errors.some(e => e.includes('Rate limit'))) {
            console.log(`   ❌ ${interval}ms is TOO FAST (hit rate limits)`);
            console.log(`   💡 Try slower: ${Math.floor(interval * 1.5)}ms`);
            console.log(`   🔒 Safe minimum: ~100ms (10 requests/second)`);
        } else {
            console.log(`   ⚠️  Had errors but not rate limits`);
            console.log(`   💡 Check API credentials or network`);
        }
        
        console.log('\n═══════════════════════════════════════════════════════\n');
        process.exit(0);
    }, duration);
}

// Parse command line arguments
const args = process.argv.slice(2);
const interval = parseInt(args[0]) || 100;  // Default: 100ms (10 req/s)
const duration = parseInt(args[1]) || 10000; // Default: 10 seconds

// Validate
if (interval < 1) {
    console.error('❌ Error: Interval must be at least 1ms');
    process.exit(1);
}

if (duration < 1000) {
    console.error('❌ Error: Duration must be at least 1000ms (1 second)');
    process.exit(1);
}

console.log(`
╔════════════════════════════════════════════════════════╗
║           🧪 KRAKEN API LIMIT TESTER 🧪               ║
╚════════════════════════════════════════════════════════╝

Usage: node test-api-limits.js [interval_ms] [duration_ms]

Examples:
  node test-api-limits.js 100 10000   # Test 10 req/s for 10 seconds
  node test-api-limits.js 50 5000     # Test 20 req/s for 5 seconds  
  node test-api-limits.js 10 3000     # Test 100 req/s for 3 seconds (FAST!)
  node test-api-limits.js 1 1000      # Test 1000 req/s for 1 second (INSANE!)

⚠️  WARNING: Testing very fast rates may temporarily lock your API!
   Recommended starting point: 100ms (10 req/s)

Press Ctrl+C to cancel...
`);

// Wait 3 seconds before starting
setTimeout(() => {
    testRateLimits(interval, duration);
}, 3000);
