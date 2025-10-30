#!/usr/bin/env node

/**
 * Kraken Funding Methods Comparison Tool
 * Compare costs and times for different funding methods
 */

const methods = [
    {
        name: 'Bank Transfer (ACH)',
        countries: ['US'],
        fee: 0,
        feePercent: 0,
        minDeposit: 10,
        time: '1-5 business days',
        instant: false,
        pros: ['FREE', 'No limits', 'Best for large amounts'],
        cons: ['Slow (1-5 days)', 'US only', 'Requires bank verification']
    },
    {
        name: 'Wire Transfer',
        countries: ['Global'],
        fee: 5,
        feePercent: 0,
        minDeposit: 10,
        time: '1-3 business days',
        instant: false,
        pros: ['Works internationally', 'Large amounts', 'Reliable'],
        cons: ['$5-25 fee', 'Slow', 'Bank may charge extra']
    },
    {
        name: 'Debit/Credit Card',
        countries: ['Most countries'],
        fee: 0.25,
        feePercent: 3.75,
        minDeposit: 10,
        time: '1-5 minutes',
        instant: true,
        pros: ['INSTANT', 'Easy', 'No verification wait'],
        cons: ['High fees (3.75%)', '$5,000/week limit', 'Not available everywhere']
    },
    {
        name: 'PayPal',
        countries: ['Select countries'],
        fee: 0,
        feePercent: 1.5,
        minDeposit: 25,
        time: '5-30 minutes',
        instant: false,
        pros: ['Moderate fees', 'Familiar', 'Relatively fast'],
        cons: ['Not available everywhere', 'Limits may apply', 'Account must be verified']
    },
    {
        name: 'Crypto Transfer (USDT)',
        countries: ['Global'],
        fee: 1,
        feePercent: 0,
        minDeposit: 10,
        time: '10-60 minutes',
        instant: false,
        pros: ['Works globally', 'Low fees (~$1)', 'No bank needed'],
        cons: ['Need crypto already', 'Network delays', 'More complex']
    }
];

console.log('\n💰 KRAKEN FUNDING METHODS COMPARISON\n');
console.log('='.repeat(80));

// Calculate costs for different amounts
const amounts = [50, 100, 500, 1000];

console.log('\n📊 COST COMPARISON (USD)\n');
console.log('Method                    | $50      | $100     | $500     | $1,000   ');
console.log('-'.repeat(75));

methods.forEach(method => {
    const costs = amounts.map(amount => {
        const fee = method.fee + (amount * method.feePercent / 100);
        return `$${fee.toFixed(2)}`.padStart(8);
    });
    console.log(`${method.name.padEnd(25)} | ${costs.join(' | ')}`);
});

console.log('\n⏱️  SPEED COMPARISON\n');
methods.forEach(method => {
    const speedIcon = method.instant ? '⚡' : '🐢';
    console.log(`${speedIcon} ${method.name.padEnd(25)} : ${method.time}`);
});

console.log('\n🌍 AVAILABILITY\n');
methods.forEach(method => {
    console.log(`📍 ${method.name.padEnd(25)} : ${method.countries.join(', ')}`);
});

console.log('\n💡 RECOMMENDATIONS\n');
console.log('='.repeat(80));

console.log('\n🎯 For Beginners (Testing with $10-50):');
console.log('   Best Choice: Debit/Credit Card');
console.log('   Why: Instant, easy, worth the fee for small amounts');
console.log('   Cost: $50 deposit = $1.88 fee');

console.log('\n💼 For Regular Traders ($100-500):');
console.log('   Best Choice: ACH Bank Transfer (US) or PayPal');
console.log('   Why: Low fees, reasonable speed');
console.log('   Cost: $100 deposit = FREE (ACH) or $1.50 (PayPal)');

console.log('\n🏦 For Serious Traders ($1,000+):');
console.log('   Best Choice: ACH (US) or Wire Transfer');
console.log('   Why: FREE (ACH) or minimal fee (Wire) on large amounts');
console.log('   Cost: $1,000 deposit = FREE (ACH) or $5 (Wire)');

console.log('\n🌐 For International Users:');
console.log('   Best Choice: USDT Transfer or Wire');
console.log('   Why: Works globally, reasonable fees');
console.log('   Cost: Network fees only (~$1-5)');

console.log('\n📋 DETAILED BREAKDOWN\n');
console.log('='.repeat(80));

methods.forEach((method, i) => {
    console.log(`\n${i + 1}. ${method.name.toUpperCase()}`);
    console.log('   ' + '-'.repeat(60));
    console.log(`   ⏱️  Time:         ${method.time}`);
    console.log(`   💵 Base Fee:     $${method.fee.toFixed(2)}`);
    console.log(`   📊 Percentage:   ${method.feePercent}%`);
    console.log(`   💰 Min Deposit:  $${method.minDeposit}`);
    console.log(`   🌍 Countries:    ${method.countries.join(', ')}`);
    console.log(`   ✅ Pros:         ${method.pros.join(', ')}`);
    console.log(`   ❌ Cons:         ${method.cons.join(', ')}`);
});

console.log('\n📞 SUPPORT & RESOURCES\n');
console.log('='.repeat(80));
console.log('Kraken Funding FAQ:    https://support.kraken.com/hc/en-us/articles/360000381846');
console.log('Deposit Methods:       https://support.kraken.com/hc/en-us/articles/360000381846');
console.log('Fee Schedule:          https://www.kraken.com/features/fee-schedule');
console.log('Verification Guide:    https://support.kraken.com/hc/en-us/articles/360021973671');

console.log('\n⚠️  IMPORTANT REMINDERS\n');
console.log('='.repeat(80));
console.log('1. Complete verification BEFORE funding (takes 1-3 days)');
console.log('2. Start with small amounts ($10-50) to test');
console.log('3. ACH deposits have 72-hour hold before withdrawal');
console.log('4. Card deposits may have higher limits after verification');
console.log('5. Always enable 2FA (Two-Factor Authentication)');
console.log('6. Never invest more than you can afford to lose');

console.log('\n🎉 Ready to fund your account? Run: ./setup-kraken.sh\n');
