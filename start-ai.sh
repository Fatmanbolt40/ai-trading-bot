#!/bin/bash

echo "🚀 STARTING ADVANCED CRYPTO AI TRADING SYSTEM"
echo "=============================================="

# Navigate to crypto-ai directory
cd /home/thalegegendgamer/crypto-ai

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🧠 ADVANCED AI FEATURES:"
echo "✅ Neural Network AI Traders (4 active)"  
echo "✅ Buy Low/Sell High Intelligence"
echo "✅ Smart Wallet Management (60% Main / 40% Trading)"
echo "✅ Real-time Market Data Integration"
echo "✅ Genetic Evolution Every 50 Cycles"
echo "✅ Professional Dashboard Monitoring"
echo ""

# Start the dashboard server in background
echo "🌐 Starting dashboard server..."
python3 -m http.server 8082 --bind 127.0.0.1 &
DASHBOARD_PID=$!

echo "📊 Dashboard will be available at: http://localhost:8082/dashboard.html"
echo ""

# Wait a moment for server to start
sleep 2

echo "🤖 Starting AI trading system..."
echo "⚡ Fast learning mode: 2-second cycles"
echo "🧬 Evolution every 50 cycles (100 seconds)"
echo "💰 Starting with $100 portfolio"
echo ""
echo "📋 REAL-TIME AI ACTIVITY:"
echo "========================="

# Trap to cleanup background processes
trap 'echo ""; echo "🛑 Shutting down..."; kill $DASHBOARD_PID 2>/dev/null; exit 0' INT

# Start the AI trading system
node advanced-crypto-ai.js

# Cleanup
kill $DASHBOARD_PID 2>/dev/null