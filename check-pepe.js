#!/usr/bin/env node
const fs = require('fs');

const state = JSON.parse(fs.readFileSync('paper-trading-state.json', 'utf8'));

console.log('═══════════════════════════════════════════════════');
console.log('💼 PEPE POSITION CHECK');
console.log('═══════════════════════════════════════════════════\n');

console.log('💰 BALANCES:');
console.log('   Main Wallet: $' + state.wallets.main.toFixed(2));
console.log('   Trading Wallet: $' + state.wallets.trading.toFixed(2));
console.log('   Total Balance: $' + state.state.currentBalance.toFixed(2));
console.log('');

console.log('📊 POSITIONS:');
let totalPositionValue = 0;

for (const [market, pos] of Object.entries(state.state.portfolio)) {
    if (pos.holdings > 0) {
        console.log('\n   Market: ' + market);
        console.log('   Holdings: ' + pos.holdings.toFixed(0) + ' coins');
        console.log('   Buy Price: $' + pos.buyPrice.toFixed(6));
        console.log('   Cost Basis: $' + pos.costBasis.toFixed(2));
        console.log('   Peak: $' + pos.peak.toFixed(6));
        
        // Calculate current value (you said $1.68 for PEPE)
        if (market.includes('PEPE')) {
            const currentPrice = 0.00000119; // Approximate PEPE price
            const currentValue = pos.holdings * currentPrice;
            console.log('   Current Value (est): $' + currentValue.toFixed(2));
            totalPositionValue += currentValue;
        }
    }
}

console.log('\n💡 MATH VERIFICATION:');
console.log('   You said: 1,410,693 PEPE = $1.68');
console.log('   That means price: $' + (1.68 / 1410693).toFixed(8));
console.log('');
console.log('   Cost Basis stored: $' + (state.state.portfolio['PEPE/USD']?.costBasis || 0).toFixed(2));
console.log('   Current value: $1.68');
console.log('   P/L: $' + (1.68 - (state.state.portfolio['PEPE/USD']?.costBasis || 0)).toFixed(2));

console.log('\n🔍 BALANCE CHECK:');
const storedBalance = state.state.currentBalance;
const calculatedBalance = state.wallets.main + state.wallets.trading + totalPositionValue;
console.log('   Stored Balance: $' + storedBalance.toFixed(2));
console.log('   Calculated (wallets + positions): $' + calculatedBalance.toFixed(2));
console.log('   Difference: $' + Math.abs(storedBalance - calculatedBalance).toFixed(2));

console.log('\n═══════════════════════════════════════════════════');
