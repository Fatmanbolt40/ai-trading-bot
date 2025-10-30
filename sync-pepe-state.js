#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const KrakenIntegration = require('./kraken-integration');

async function syncState() {
    console.log('🔄 SYNCING AI STATE WITH KRAKEN REALITY...\n');
    
    // Load current state
    const stateData = JSON.parse(fs.readFileSync('paper-trading-state.json', 'utf8'));
    
    // Get real Kraken balance
    const kraken = new KrakenIntegration(
        process.env.KRAKEN_API_KEY,
        process.env.KRAKEN_API_SECRET
    );
    
    const balance = await kraken.getBalance();
    
    // Real amounts from Kraken
    const realPEPE = parseFloat(balance.PEPE || 0);
    const realUSD = parseFloat(balance.ZUSD || 0);
    
    console.log('📊 KRAKEN REALITY:');
    console.log('   PEPE: ' + realPEPE.toFixed(0) + ' coins');
    console.log('   USD: $' + realUSD.toFixed(2));
    console.log('');
    
    // Get current PEPE price (approximate from market data)
    // If you paid $X for 1.41M PEPE, the price was X / 1,410,693
    // Since you have $1.68 now and 1.41M PEPE, let's calculate what you paid
    
    console.log('❓ NEED INFO: What did you originally pay for the PEPE?');
    console.log('   (How much USD did you spend to buy the 1.41M PEPE?)');
    console.log('');
    console.log('📝 Current state shows:');
    console.log('   Holdings: ' + stateData.state.portfolio['PEPE/USD']?.holdings.toFixed(0));
    console.log('   Cost Basis: $' + stateData.state.portfolio['PEPE/USD']?.costBasis.toFixed(2));
    console.log('   Buy Price: $' + stateData.state.portfolio['PEPE/USD']?.buyPrice.toFixed(8));
    console.log('');
    
    // Estimate current PEPE price
    // PEPE typically trades around $0.000001 - $0.0000015
    const estimatedPrice = 0.00000119; // Based on your $1.68 / 1.41M calculation
    const currentValue = realPEPE * estimatedPrice;
    
    console.log('💡 CALCULATED:');
    console.log('   If 1,410,693 PEPE = $1.68');
    console.log('   Then price = $' + estimatedPrice.toFixed(8));
    console.log('');
    
    console.log('🔧 TO FIX STATE, I NEED TO KNOW:');
    console.log('   1. How much USD did you spend to buy the PEPE? (cost basis)');
    console.log('   2. What price did you buy at?');
    console.log('');
    console.log('💡 OR I can assume you bought at current price ($1.68 cost)');
    console.log('   This would make your P/L = $0 (break-even start)');
}

syncState().catch(err => console.error('Error:', err.message));
