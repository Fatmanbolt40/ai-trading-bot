#!/usr/bin/env node

// Quick fix script to show AI state and force wallet display update

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking AI State...\n');

try {
    const statePath = path.join(__dirname, 'ai-state.json');
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    
    console.log('📊 CURRENT AI STATUS:');
    console.log('='.repeat(60));
    console.log(`Generation: ${state.generation}`);
    console.log(`Cycle: ${state.cycle}`);
    console.log(`\n💰 WALLET BALANCES:`);
    console.log(`Main Wallet:    $${state.wallets.main.toFixed(2)}`);
    console.log(`Banker:         $${state.wallets.banker.toFixed(2)}`);
    console.log(`Trader 1:       $${state.wallets.trader1.toFixed(2)}`);
    console.log(`Trader 2:       $${state.wallets.trader2.toFixed(2)}`);
    console.log(`Trader 3:       $${state.wallets.trader3.toFixed(2)}`);
    console.log(`Trader 4:       $${state.wallets.trader4.toFixed(2)}`);
    console.log(`TOTAL:          $${state.totalFunds.toFixed(2)}`);
    
    console.log(`\n📈 MARKET DATA:`);
    console.log(`Price: $${state.market.price.toFixed(2)}`);
    console.log(`Trend: ${(state.market.trend * 100).toFixed(2)}%`);
    
    console.log(`\n🤖 TRADERS:`);
    state.traders.forEach(trader => {
        const holdingsValue = trader.holdings * state.market.price;
        const totalValue = trader.balance + holdingsValue;
        console.log(`AI-${trader.id}: Balance $${trader.balance.toFixed(2)} + Holdings ${trader.holdings.toFixed(6)} SOL ($${holdingsValue.toFixed(2)}) = Total $${totalValue.toFixed(2)}`);
        console.log(`  Status: ${trader.status} | Hold Time: ${trader.holdTime} cycles | Fitness: ${trader.fitness.toFixed(3)}`);
    });
    
    console.log(`\n📝 RECENT ACTIVITY: ${state.recentActivity.length} items`);
    if (state.recentActivity.length > 0) {
        state.recentActivity.slice(-5).forEach(activity => {
            console.log(`  - ${activity}`);
        });
    } else {
        console.log('  (No recent trades - traders are HOLDing or analyzing)');
    }
    
    console.log(`\n⚡ PERFORMANCE:`);
    console.log(`Total Trades: ${state.performance.totalTrades}`);
    console.log(`Total Profits: $${state.performance.totalProfits.toFixed(2)}`);
    console.log(`Evolution Speed: ${state.performance.evolutionSpeed.toFixed(2)} gen/min`);
    
    console.log('\n' + '='.repeat(60));
    
    // Force add some activity for dashboard visibility
    if (state.recentActivity.length === 0) {
        console.log('\n⚠️  No recent activity detected.');
        console.log('💡 Traders are holding positions waiting for profitable sell opportunities.');
        console.log('   Dashboard will show current holdings and balances.');
        
        // Add status messages to recentActivity
        state.recentActivity = [
            `🤖 AI-1: HOLDING ${state.traders[0].holdings.toFixed(6)} SOL (Hold time: ${state.traders[0].holdTime} cycles)`,
            `🤖 AI-2: HOLDING ${state.traders[1].holdings.toFixed(6)} SOL (Hold time: ${state.traders[1].holdTime} cycles)`,
            `🤖 AI-3: HOLDING ${state.traders[2].holdings.toFixed(6)} SOL (Hold time: ${state.traders[2].holdTime} cycles)`,
            `🤖 AI-4: HOLDING ${state.traders[3].holdings.toFixed(6)} SOL (Hold time: ${state.traders[3].holdTime} cycles)`,
            `📊 Market Price: $${state.market.price.toFixed(2)} | Generation ${state.generation}`,
        ];
        
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        console.log('✅ Updated state file with current holding status for dashboard visibility');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
