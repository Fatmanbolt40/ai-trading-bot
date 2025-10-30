#!/bin/bash

echo "🛑 Stopping AI..."
pkill -f "node paper-trading-ai.js"
sleep 2

echo "💰 Selling all positions..."
cd /home/thalegegendgamer/crypto-ai
node quick-reset.js

echo "📊 Studying markets for 30 seconds..."
sleep 30

echo "🚀 Starting AI with new strategy..."
node paper-trading-ai.js 2>&1 | tee ai-log.txt
