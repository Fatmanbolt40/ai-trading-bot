const fs = require('fs');

console.log('🔧 Fixing AI state to match real Kraken balance...\n');

const state = JSON.parse(fs.readFileSync('paper-trading-state.json'));

console.log('OLD State:');
console.log(`   Balance: $${state.state.currentBalance}`);
console.log(`   Portfolio: ${Object.keys(state.state.portfolio || {}).length} positions`);

// Reset to match Kraken reality
state.state.currentBalance = 0.0035;  // Actual USD on Kraken
state.state.portfolio = {
    // Keep only SOL which is real
    'SOL/USD': state.state.portfolio['SOL/USD']
};

// Remove phantom XMR position if it exists
if (state.state.portfolio['XMR/USD']) {
    console.log('⚠️  Removing phantom XMR position');
    delete state.state.portfolio['XMR/USD'];
}

console.log('\nNEW State:');
console.log(`   Balance: $${state.state.currentBalance}`);
console.log(`   Portfolio: ${Object.keys(state.state.portfolio || {}).length} positions`);
console.log('   Keeping: SOL/USD (real position)');

fs.writeFileSync('paper-trading-state.json', JSON.stringify(state, null, 2));

console.log('\n✅ State fixed! AI will now sync properly with Kraken.');
console.log('⚠️  From now on, trades will ONLY execute if Kraken API succeeds!');
