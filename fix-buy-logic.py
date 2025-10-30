#!/usr/bin/env python3
"""Fix buy logic to use realistic thresholds"""

# Read the file
with open('paper-trading-ai.js', 'r') as f:
    lines = f.readlines()

# Find and replace the buy logic section (around line 715-750)
for i, line in enumerate(lines):
    # Remove old variable definitions
    if 'const strongMomentum = momentum5 > 0.005' in line:
        lines[i] = ''
    elif 'const explosiveMomentum = momentum3 > 0.010' in line:
        lines[i] = ''
    
    # Update comment header
    elif '🎯 SWING TRADER LOGIC - Wait for BIG setups!' in line:
        lines[i] = '        // 🎯 BALANCED TRADER LOGIC - Realistic setups that beat 0.52% fees\n'
    
    # RULE 1: Bottom 10% -> Bottom 25%
    elif '// 🎯 RULE 1: Bottom 10% + STRONG momentum' in line:
        lines[i] = '        // 🎯 RULE 1: Bottom 25% + ANY upward tick (0.05%+) = VALUE BUY\n'
    elif 'if (positionInRange < 0.10 && strongMomentum)' in line:
        lines[i] = '        if (positionInRange < 0.25 && momentum3 > 0.0005) {\n'
    elif '💎 DEEP VALUE: Bottom 10% + 0.5%+ momentum' in line:
        lines[i] = "            buyReason = '💎 VALUE: Bottom 25% + upward momentum';\n"
    
    # RULE 2: 1%+ explosive -> 0.4%+ scalp
    elif '// 🎯 RULE 2: EXPLOSIVE 1%+ breakout' in line:
        lines[i] = '        // 🎯 RULE 2: 0.4%+ quick momentum = SCALP BUY\n'
    elif 'if (!shouldBuy && explosiveMomentum)' in line:
        lines[i] = '        if (!shouldBuy && momentum5 > 0.004) {\n'
    elif '🚀 EXPLOSIVE: 1%+ breakout detected!' in line:
        lines[i] = "            buyReason = '⚡ SCALP: 0.4%+ quick move detected';\n"
    elif "selectedStrategy = 'breakout';" in line and i > 700 and i < 760:
        lines[i] = "            selectedStrategy = 'scalping';\n"
    
    # RULE 3: Bottom 20% + 0.8% -> Bottom 40% + 0.2%
    elif '// 🎯 RULE 3: Bottom 20% + 0.8%+ rise' in line:
        lines[i] = '        // 🎯 RULE 3: Bottom 40% + 0.2%+ rise = REVERSION BUY\n'
    elif 'if (!shouldBuy && positionInRange < 0.20 && momentum5 > 0.008)' in line:
        lines[i] = '        if (!shouldBuy && positionInRange < 0.40 && momentum5 > 0.002) {\n'
    elif '🔄 REVERSION: Low price + 0.8%+ momentum' in line:
        lines[i] = "            buyReason = '🔄 REVERSION: Low price + 0.2%+ momentum';\n"
    
    # RULE 4: 1%+ trend -> 0.3%+ trend
    elif '// 🎯 RULE 4: Strong 1%+ trend from mid-range' in line:
        lines[i] = '        // 🎯 RULE 4: 0.3%+ steady trend from upper-mid = TREND BUY\n'
    elif 'if (!shouldBuy && momentum10 > 0.010 && positionInRange < 0.50)' in line:
        lines[i] = '        if (!shouldBuy && momentum10 > 0.003 && positionInRange < 0.65) {\n'
    elif '📈 STRONG TREND: 1%+ rise detected' in line:
        lines[i] = "            buyReason = '📈 TREND: 0.3%+ sustained rise';\n"
    
    # Update debug message
    elif '💡 Scanning for STRONG setups (1-3% moves)' in line:
        lines[i] = "            console.log(`   💡 Scanning for realistic setups (0.4-1% moves)...`);\n"

# Write the file
with open('paper-trading-ai.js', 'w') as f:
    f.writelines(lines)

print("✅ Buy logic updated to realistic thresholds")
print("   - Bottom 25%/40% instead of 10%/20%")
print("   - 0.05%/0.2%/0.3%/0.4% momentum instead of 0.5%/0.8%/1%")
