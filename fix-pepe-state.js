#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');

console.log('🔧 FIXING PEPE STATE TO MATCH KRAKEN REALITY...\n');

// Load current state
const stateFile = 'paper-trading-state.json';
const backup = 'paper-trading-state.json.backup-pepe-fix-' + Date.now();

// Backup first
fs.copyFileSync(stateFile, backup);
console.log('✅ Backed up state to: ' + backup);

const stateData = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

// REALITY from Kraken
const realPEPE = 1410693;  // Your actual PEPE holdings
const realUSD = 1.68;      // Your actual USD balance
const pepePrice = realUSD / realPEPE;  // Current price: $0.00000119

console.log('\n📊 KRAKEN REALITY:');
console.log('   PEPE Holdings: ' + realPEPE.toFixed(0) + ' coins');
console.log('   USD Balance: $' + realUSD.toFixed(2));
console.log('   PEPE Price: $' + pepePrice.toFixed(8));
console.log('   PEPE Value: $' + realUSD.toFixed(2));
console.log('');

// FIX THE STATE
// Set cost basis = current value (so P/L starts at $0)
const costBasis = realUSD;  // You "paid" $1.68 for your PEPE (starting point)

console.log('🔧 FIXING STATE:');
console.log('   Old Holdings: ' + stateData.state.portfolio['PEPE/USD'].holdings.toFixed(0));
console.log('   New Holdings: ' + realPEPE.toFixed(0));
console.log('');
console.log('   Old Buy Price: $' + stateData.state.portfolio['PEPE/USD'].buyPrice.toFixed(8));
console.log('   New Buy Price: $' + pepePrice.toFixed(8));
console.log('');
console.log('   Old Cost Basis: $' + stateData.state.portfolio['PEPE/USD'].costBasis.toFixed(2));
console.log('   New Cost Basis: $' + costBasis.toFixed(2));
console.log('');

// Update PEPE position
stateData.state.portfolio['PEPE/USD'] = {
    holdings: realPEPE,
    buyPrice: pepePrice,
    costBasis: costBasis,
    peak: pepePrice,
    buyCycle: stateData.state.cycle
};

// Update wallets
const totalValue = realUSD + realUSD;  // $1.68 USD + $1.68 PEPE value = $3.36
stateData.wallets.main = 0;
stateData.wallets.trading = realUSD;  // $1.68 in trading wallet
stateData.state.currentBalance = totalValue;  // Total: $3.36

console.log('💰 UPDATED BALANCES:');
console.log('   Trading Wallet: $' + stateData.wallets.trading.toFixed(2));
console.log('   Main Wallet: $' + stateData.wallets.main.toFixed(2));
console.log('   Total Balance: $' + stateData.state.currentBalance.toFixed(2));
console.log('');

// Save fixed state
fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));

console.log('✅ STATE FIXED!\n');
console.log('📊 CURRENT STATUS:');
console.log('   Position: 1,410,693 PEPE @ $' + pepePrice.toFixed(8));
console.log('   Cost Basis: $' + costBasis.toFixed(2));
console.log('   Current Value: $' + realUSD.toFixed(2));
console.log('   P/L: $0.00 (0.00%) - BREAK-EVEN START');
console.log('');
console.log('🎯 EXIT PLAN:');
console.log('   Sell at 0.5% profit: When PEPE value = $' + (costBasis * 1.005).toFixed(2));
console.log('   Sell at 1.0% profit: When PEPE value = $' + (costBasis * 1.01).toFixed(2));
console.log('   That means PEPE price needs to reach:');
console.log('   → $' + (pepePrice * 1.005).toFixed(8) + ' for 0.5% profit');
console.log('   → $' + (pepePrice * 1.01).toFixed(8) + ' for 1.0% profit');
console.log('');
console.log('🚀 Ready to trade! Run: node paper-trading-ai.js');
