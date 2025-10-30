const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./paper-trading-state.json', 'utf8'));
data.state.portfolio = {};
data.state.currentBalance = 15;
fs.writeFileSync('./paper-trading-state.json', JSON.stringify(data, null, 2));
console.log('✅ Reset: $15 USD, no positions');
