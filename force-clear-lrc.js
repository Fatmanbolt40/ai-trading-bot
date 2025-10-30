// FORCE CLEAR LRC - ignore Kraken sync
const fs = require('fs');

console.log('🚨 FORCE CLEARING LRC (ignoring Kraken)...');

const statePath = './paper-trading-state.json';

// Create a watcher to keep removing LRC
setInterval(() => {
    try {
        let data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        
        if (data.state.portfolio['LRC/USD']) {
            console.log('⚠️  LRC detected! Removing...');
            delete data.state.portfolio['LRC/USD'];
            data.state.currentBalance = 0.05; // Your actual balance
            fs.writeFileSync(statePath, JSON.stringify(data, null, 2));
            console.log('✅ LRC removed!');
        }
    } catch (e) {
        // Ignore errors
    }
}, 1000);

console.log('🔄 Watching for LRC... Press Ctrl+C to stop');
console.log('📝 Run this alongside the AI to keep clearing phantom LRC');
