const fs = require('fs');
const state = JSON.parse(fs.readFileSync('ai-state.json', 'utf8'));
console.log('Resetting traders...');
state.traders.forEach(t => {
    if (t.holdings > 0) {
        t.balance += t.holdings * state.market.price;
        console.log('AI-' + t.id + ': Sold holdings for $' + (t.holdings * state.market.price).toFixed(2));
        t.holdings = 0;
        t.holdTime = 0;
    }
    t.dna.buyThreshold = 0.001;
    t.dna.sellThreshold = 0.005;
    t.dna.patience = 10;
});
state.recentActivity = ['System reset - aggressive trading mode activated'];
fs.writeFileSync('ai-state.json', JSON.stringify(state, null, 2));
console.log('Done!');
