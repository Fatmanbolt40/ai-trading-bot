const fs = require('fs');

console.log('🔪 FORCE SELLING XRP POSITION...\n');

// Load current state (support both shapes: { ... } or { state: { ... } })
const path = require('path');
const statePath = path.resolve(__dirname, 'paper-trading-state.json');
const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
// container will point to the object that actually holds portfolio/wallets
const container = raw && raw.state ? raw.state : raw;

// Ensure portfolio and wallets exist
if (!container.portfolio) container.portfolio = {};
if (!container.wallets) container.wallets = { trading: container.currentBalance || 0, main: 0 };

console.log(`📊 Current Portfolio:`);
if (Object.keys(container.portfolio).length === 0) {
    console.log(`   (empty)`);
} else {
    for (const [coin, position] of Object.entries(container.portfolio)) {
        const amount = position.holdings ?? position.amount ?? position.qty ?? 0;
        const price = position.currentPrice ?? position.currentMarketPrice ?? position.price ?? position.buyPrice ?? 0;
        const value = amount * price;
        console.log(`   ${coin}: ${amount.toFixed(6)} @ $${price.toFixed(2)} = $${value.toFixed(2)}`);
    }
}

// Sell all positions (simulate by converting holdings to trading wallet)
let totalRecovered = 0;
for (const [coin, position] of Object.entries(container.portfolio)) {
    const amount = position.holdings ?? position.amount ?? position.qty ?? 0;
    const price = position.currentPrice ?? position.currentMarketPrice ?? position.price ?? position.buyPrice ?? 0;
    const sellValue = amount * price;
    totalRecovered += sellValue;
    console.log(`\n💰 Selling ${coin}: ${amount.toFixed(6)} @ $${price.toFixed(2)} = $${sellValue.toFixed(2)}`);
}

// Clear portfolio
container.portfolio = {};

// Add recovered money to trading wallet AND currentBalance (the AI reads both)
if (!container.wallets) container.wallets = { trading: 0, main: 0 };
container.wallets.trading = (container.wallets.trading || 0) + totalRecovered;
container.currentBalance = (container.currentBalance || 0) + totalRecovered;

console.log(`\n✅ Portfolio cleared!`);
console.log(`💵 Trading wallet: $${container.wallets.trading.toFixed(2)}`);
console.log(`💵 Current balance: $${container.currentBalance.toFixed(2)}`);
console.log(`🎯 Ready for ${Math.floor(container.wallets.trading / 3)} meme coin positions at $3 each!`);

// Save state back preserving original top-level shape
if (raw && raw.state) {
    raw.state = container;
    fs.writeFileSync(statePath, JSON.stringify(raw, null, 2));
} else {
    fs.writeFileSync(statePath, JSON.stringify(container, null, 2));
}

console.log(`\n💾 State saved. Restart AI to buy meme coins!\n`);
