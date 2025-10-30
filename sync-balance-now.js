// Force sync with Kraken and reset phantom positions
const fs = require('fs');

console.log('🔄 Forcing balance sync...');

// Load current state
const statePath = './paper-trading-state.json';
let data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
let state = data.state;

console.log('\n📊 BEFORE:');
console.log('Balance:', state.currentBalance);
console.log('Portfolio:', Object.keys(state.portfolio || {}));

// Clear LRC position since you sold it
delete state.portfolio['LRC/USD'];

// Update balance to $0.05 USD (you said you have .05 in usd)
state.currentBalance = 0.05;

console.log('\n📊 AFTER:');
console.log('Balance:', state.currentBalance);
console.log('Portfolio:', Object.keys(state.portfolio || {}));

// Save
fs.writeFileSync(statePath, JSON.stringify(data, null, 2));
console.log('\n✅ State synced! LRC removed, balance set to $0.05');
console.log('💡 Restart AI to apply changes');
