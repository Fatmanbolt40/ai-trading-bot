#!/usr/bin/env node
/**
 * Quick Kraken API Limit Test
 * Tests if 100ms interval works without hitting rate limits
 */

require('dotenv').config();
const krakenAPI = require('./kraken-integration.js');

async function testInterval(intervalMs, numRequests) {
    console.log(`\n🧪 Testing ${intervalMs}ms interval (${(1000/intervalMs).toFixed(1)} req/s)`);
    console.log(`   Making ${numRequests} balance check requests...\n`);
    
    const kraken = new krakenAPI(process.env.KRAKEN_API_KEY, process.env.KRAKEN_API_SECRET);
    
    let successCount = 0;
    let errorCount = 0;
    let rateLimitHit = false;
    const startTime = Date.now();
    
    for (let i = 0; i < numRequests; i++) {
        try {
            const balance = await kraken.getBalance();
            
            if (balance.error && balance.error.length > 0) {
                const errorMsg = balance.error.join(', ');
                
                if (errorMsg.includes('Rate limit') || errorMsg.includes('EAPI:Rate limit')) {
                    console.log(`❌ RATE LIMIT HIT at request #${i + 1}!`);
                    rateLimitHit = true;
                    errorCount++;
                    break;
                } else {
                    errorCount++;
                    if (i === 0) {
                        console.log(`⚠️  API Error: ${errorMsg}`);
                    }
                }
            } else {
                successCount++;
                if (successCount % 10 === 0) {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const actualRate = successCount / elapsed;
                    process.stdout.write(`✅ ${successCount} successful | Rate: ${actualRate.toFixed(2)}/s\r`);
                }
            }
            
            // Wait for the interval
            await new Promise(resolve => setTimeout(resolve, intervalMs));
            
        } catch (err) {
            console.log(`\n❌ Error: ${err.message}`);
            errorCount++;
        }
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    const actualRate = successCount / totalTime;
    
    console.log(`\n\n═══════════════════════════════════════════`);
    console.log(`📊 TEST RESULTS`);
    console.log(`═══════════════════════════════════════════`);
    console.log(`✅ Successful: ${successCount}/${numRequests}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`⏰ Duration: ${totalTime.toFixed(1)}s`);
    console.log(`📈 Actual rate: ${actualRate.toFixed(2)} req/s`);
    console.log(`🎯 Target rate: ${(1000/intervalMs).toFixed(2)} req/s`);
    
    if (rateLimitHit) {
        console.log(`\n❌ RESULT: ${intervalMs}ms is TOO FAST!`);
        console.log(`💡 Recommendation: Try ${intervalMs * 2}ms or slower`);
        return false;
    } else if (errorCount > 0) {
        console.log(`\n⚠️  RESULT: Had ${errorCount} errors (not rate limits)`);
        console.log(`💡 Check API configuration`);
        return false;
    } else {
        console.log(`\n✅ RESULT: ${intervalMs}ms works perfectly!`);
        console.log(`💡 Safe for autosync at this speed`);
        return true;
    }
}

async function runTests() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║        🧪 KRAKEN API SPEED TEST 🧪                    ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
    // Test 100ms (10 req/s)
    const test100ms = await testInterval(100, 50);  // 50 requests at 100ms = 5 seconds
    
    if (!test100ms) {
        console.log('\n\n🔍 Testing slower speed...');
        await testInterval(200, 30);  // Try 200ms if 100ms failed
    }
    
    console.log('\n═══════════════════════════════════════════\n');
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
