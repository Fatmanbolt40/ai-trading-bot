/**
 * TEST BUY/SELL MATH
 * Verify profit calculations are correct
 */

// Test scenarios
const testCases = [
    {
        name: "1.5% Profit - Should SELL",
        buyPrice: 1.00,
        sellPrice: 1.015,
        tradeAmount: 1.50,
        expectedProfit: 0.015,
        shouldSell: true
    },
    {
        name: "1.0% Profit - Should HOLD",
        buyPrice: 1.00,
        sellPrice: 1.01,
        tradeAmount: 1.50,
        expectedProfit: 0.01,
        shouldSell: false
    },
    {
        name: "-3% Loss - Should SELL (stop loss)",
        buyPrice: 1.00,
        sellPrice: 0.97,
        tradeAmount: 1.50,
        expectedProfit: -0.03,
        shouldSell: true
    },
    {
        name: "-2% Loss - Should HOLD",
        buyPrice: 1.00,
        sellPrice: 0.98,
        tradeAmount: 1.50,
        expectedProfit: -0.02,
        shouldSell: false
    },
    {
        name: "Real PEPE Example: Buy $0.000006, Sell $0.0000061",
        buyPrice: 0.000006,
        sellPrice: 0.0000061,
        tradeAmount: 1.50,
        expectedProfit: 0.0167, // 1.67%
        shouldSell: true
    },
    {
        name: "Real DOGE Example: Buy $0.18, Sell $0.183",
        buyPrice: 0.18,
        sellPrice: 0.183,
        tradeAmount: 1.50,
        expectedProfit: 0.0167, // 1.67%
        shouldSell: true
    }
];

console.log('🧪 TESTING BUY/SELL MATH\n');
console.log('='.repeat(80));

const tradingFee = 0.00; // 0% fee on Kraken Plus

testCases.forEach((test, i) => {
    console.log(`\n📊 TEST ${i+1}: ${test.name}`);
    console.log('-'.repeat(80));
    
    // Buy calculation
    const buyFee = test.tradeAmount * tradingFee;
    const netSpend = test.tradeAmount + buyFee;
    const coinAmount = test.tradeAmount / test.buyPrice;
    
    console.log(`💰 BUY:`);
    console.log(`   Trade Amount: $${test.tradeAmount.toFixed(2)}`);
    console.log(`   Buy Price: $${test.buyPrice.toFixed(8)}`);
    console.log(`   Buy Fee (${(tradingFee*100).toFixed(1)}%): $${buyFee.toFixed(2)}`);
    console.log(`   Net Spend (cost basis): $${netSpend.toFixed(2)}`);
    console.log(`   Coin Amount: ${coinAmount.toFixed(8)}`);
    
    // Sell calculation
    const currentValue = coinAmount * test.sellPrice;
    const sellFee = currentValue * tradingFee;
    const netValue = currentValue - sellFee;
    const profit = (netValue - netSpend) / netSpend;
    const profitPercent = profit * 100;
    
    console.log(`\n💸 SELL:`);
    console.log(`   Sell Price: $${test.sellPrice.toFixed(8)}`);
    console.log(`   Gross Value: $${currentValue.toFixed(2)}`);
    console.log(`   Sell Fee (${(tradingFee*100).toFixed(1)}%): $${sellFee.toFixed(2)}`);
    console.log(`   Net Value: $${netValue.toFixed(2)}`);
    console.log(`   Profit: $${(netValue - netSpend).toFixed(4)} (${profitPercent.toFixed(2)}%)`);
    
    // Decision logic
    const targetProfit = 0.015; // 1.5%
    const stopLoss = -0.03; // -3%
    
    let shouldSell = false;
    let reason = '';
    
    if (profit <= stopLoss) {
        shouldSell = true;
        reason = `🛑 STOP LOSS: ${profitPercent.toFixed(2)}% <= -3.0%`;
    } else if (profit >= targetProfit) {
        shouldSell = true;
        reason = `🎯 TARGET PROFIT: ${profitPercent.toFixed(2)}% >= 1.5%`;
    } else {
        shouldSell = false;
        reason = `💎 HOLD: ${profitPercent.toFixed(2)}% (waiting for 1.5% target or -3% stop)`;
    }
    
    console.log(`\n🤖 DECISION: ${shouldSell ? 'SELL' : 'HOLD'}`);
    console.log(`   ${reason}`);
    
    // Verify against expected
    const profitMatch = Math.abs(profit - test.expectedProfit) < 0.001;
    const sellMatch = shouldSell === test.shouldSell;
    
    if (profitMatch && sellMatch) {
        console.log(`   ✅ PASS: Math and logic correct!`);
    } else {
        console.log(`   ❌ FAIL:`);
        if (!profitMatch) console.log(`      Expected profit: ${(test.expectedProfit*100).toFixed(2)}%, Got: ${profitPercent.toFixed(2)}%`);
        if (!sellMatch) console.log(`      Expected ${test.shouldSell ? 'SELL' : 'HOLD'}, Got: ${shouldSell ? 'SELL' : 'HOLD'}`);
    }
});

console.log('\n' + '='.repeat(80));
console.log('✅ All tests completed!');
console.log('\n📋 SUMMARY:');
console.log('   - Trade Size: $1.50 per position');
console.log('   - Target Profit: 1.5%');
console.log('   - Stop Loss: -3%');
console.log('   - Trading Fee: 0% (Kraken Plus)');
console.log('   - Exit conditions: ONLY at 1.5% profit OR -3% loss');
