const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./paper-trading-state.json', 'utf8'));
data.state.currentBalance = 14.35;
fs.writeFileSync('./paper-trading-state.json', JSON.stringify(data, null, 2));
console.log('✅ Balance set to $14.35');
