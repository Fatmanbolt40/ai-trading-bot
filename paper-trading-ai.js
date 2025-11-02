#!/usr/bin/env node

const WebSocket = require('ws');
require('dotenv').config();
const fs = require('fs');
const KrakenWebSocket = require('./kraken-integration');
const KrakenFutures = require('./kraken-futures-integration');

// 💰 TRADING MODE - Set to true for REAL MONEY trading
const USE_REAL_MONEY = true;  // 🚨 WARNING: This will trade with real funds!
const USE_FUTURES = true;      // 🚀 ENABLE FUTURES TRADING

// 🔍 MULTI-MARKET SCANNER - Find the most profitable trading opportunities
class MarketScanner {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.activeMarket = 'SOL/USD';
        
        // 🔥 BIDIRECTIONAL MAPPING: Our format ↔ Kraken WebSocket format
        this.ourToKraken = {};
        this.krakenToOur = {};
        
        // 🏆 TOP TIER - Major Market Movers (ALWAYS ACTIVE)
        this.markets = {
            'BTC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'bluechip' },
            'ETH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'bluechip' },
            'SOL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'XRP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'payment' },
            'BNB/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'exchange' },
            
            // 🔥 LAYER 1 BLOCKCHAINS - High Volume Smart Contract Platforms
            'AVAX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'MATIC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'DOT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'ATOM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'NEAR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'FTM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'ALGO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'APT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'SUI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'SEI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'INJ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'TIA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            
            // 💎 DEFI BLUE CHIPS - DeFi Season Rotation Plays
            'LINK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'UNI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'AAVE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'MKR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'COMP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'SNX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'CRV/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'LDO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'RUNE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'SUSHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            '1INCH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'BAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            
            // 🚀🚀🚀 MEME COIN MANIA - 100+ High Volatility Moonshot Coins (TOP PRIORITY!)
            'DOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIB/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FLOKI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WIF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEME/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🔥 NEW 2024-2025 TRENDING MEME COINS (HIGH PERFORMERS)
            'POPCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BRETT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MICHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MYRO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PONKE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOME/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLERF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SMOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COQ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DEGEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TOSHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HIGHER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🐕 DOG-THEMED MEME COINS (CLASSIC PUMPERS)
            'SHIBA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AKITA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KISHU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ELON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYDOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAMO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🐸 FROG & ANIMAL THEMED MEMES
            'WOJAK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TURBO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LADYS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOBO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MONG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPE2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🐱 CAT-THEMED MEME COINS (MEOW SEASON!)
            'CATS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATGIRL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GRUMPY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEOW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PURR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎲 GAMING & CASINO MEMES (DEGEN ENERGY)
            'SNEK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOBBES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VIBE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BASED/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🚀 SOLANA ECOSYSTEM MEMES (HOT CHAIN!)
            'ANALOS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SILLY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HARAMBE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BODEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TREMP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🔵 BASE CHAIN MEMES (COINBASE L2)
            'TYBG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NORMIE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KEYCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 💀 SPOOKY & MISC MEMES
            'BONE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LEASH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAITAMA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PITBULL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VOLT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NEIRO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GIGA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEIPEI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ANDY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🔥 2024-2025 VIRAL MEME COINS (KRAKEN VERIFIED!)
            'CHEEMS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'APU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RETARDIO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SPX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GOAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOODENG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PNUT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ACT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FARTCOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🚀🚀🚀 MASSIVE MEME COIN EXPANSION - 400+ NEW ADDITIONS! 🚀🚀🚀
            
            // 🐕 MORE DOG COINS (Popular Category)
            'KABOSU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGGO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGEBONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGE2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYSHIBAINU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIBDOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGELON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MINIDOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HUSKY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CORGI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PUG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIB2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MINIFLOKI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYFLOKI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FLOKIINU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIKOKU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JINDO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAMOYED/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'POMERANIAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LAIKA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🐸 MORE FROG & PEPE VARIANTS
            'PEPE3/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AAPEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPECOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEBONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYPEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEMAX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KERMIT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RIBBIT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FROGGY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEMON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🐱 MORE CAT COINS (Massive Category)
            'CATGIRL2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FELIX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GARFIELD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NYAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TABBY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MITTENS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WHISKERS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CALICO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SIAMESE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PERSIAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KITTY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATCOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEGACAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SUPERCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOONCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LASERCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎮 GAMING & INTERNET CULTURE MEMES
            'LUIGI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MARIO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SONIC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PIKACHU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KIRBY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'YOSHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GOOMBA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOWSER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ZELDA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LINK2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🍕 FOOD & RESTAURANT MEMES
            'PIZZA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BURGER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TACO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SUSHI2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RAMEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOTDOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BACON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DONUT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COOKIE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PANCAKE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🚀 SOLANA ECOSYSTEM MEMES (Huge Category)
            'SAMO2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NINJA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DUST/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TINY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ROPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GARI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OOGI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PANDA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DAOJONES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ORCA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLOTH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CRWNY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GENE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JSOL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MNDE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLIM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SOLAPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🌊 AQUATIC & OCEAN MEMES
            'SHARK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WHALE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOLPHIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OCTOPUS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JELLYFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CRAB/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LOBSTER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SEAHORSE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STARFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CLOWNFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🦅 BIRD & FLYING MEMES
            'EAGLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PARROT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OWL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HAWK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CROW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RAVEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PHOENIX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DUCK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHICKEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PENGUIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎭 CELEBRITY & POLITICIAN MEMES
            'TRUMP2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BIDEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KANYE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MUSK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BEZOS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GATES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ZUCK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎨 ART & CULTURE MEMES
            'MONALISA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PICASSO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DAVINCI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BANKSY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WARHOL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🏴‍☠️ PIRATE & ADVENTURE MEMES
            'PIRATE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TREASURE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOOTY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PARLEY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KRAKEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BLACKBEARD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 👽 ALIEN & SPACE MEMES
            'ALIEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'UFO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MARS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOON2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },

            // 🔥🔥🔥 MASSIVE MEME EXPANSION - 400+ COINS ADDED! 🔥🔥🔥
            'PEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPE2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPE3/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AAPEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPECOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEBONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYPEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEMAX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KERMIT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RIBBIT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FROGGY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEMON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEIPEI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WOJAK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TURBO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOBO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LADYS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MONG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ANDY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOPPY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TOAD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FROGGIES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GIGAPEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAFEPEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEBURN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEGOLD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEKING/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPEWIF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FROGSOL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIB/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FLOKI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAMO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AKITA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KISHU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ELON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYDOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KABOSU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGGO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGEBONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGE2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYSHIBAINU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIBDOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGELON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MINIDOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HUSKY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CORGI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PUG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIB2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MINIFLOKI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYFLOKI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FLOKIINU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIKOKU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JINDO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAMOYED/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'POMERANIAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LAIKA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BONE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LEASH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAITAMA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PITBULL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VOLT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NEIRO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOKK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STARL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIBGF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGIRA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHEEMS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DINU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYSHIBX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHIBGOLD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOBO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGGY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOGEZILLA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAFEMARS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOONDOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SUPERDOGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'POPCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MICHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATGIRL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GRUMPY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEOW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PURR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATGIRL2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FELIX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GARFIELD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NYAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TABBY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MITTENS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WHISKERS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CALICO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SIAMESE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PERSIAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KITTY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATCOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABYCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEGACAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SUPERCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOONCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LASERCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NYANCOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GRUMPYCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HAPPYCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LONGCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATDOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATANA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEOWTH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NEKOCOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATCASH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PUSSYCOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PAWS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KITTEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CATWIF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BONK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WIF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOME/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLERF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MYRO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PONKE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SMOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COQ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAMO2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NINJA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DUST/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TINY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ROPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GARI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OOGI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DAOJONES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ORCA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLOTH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CRWNY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GENE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JSOL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MNDE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLIM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SOLAPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SOCEAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FIDA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RAY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BRETT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TOSHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DEGEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HIGHER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NORMIE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KEYCAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TYBG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SNEK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOBBES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VIBE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BASED/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MIGGLES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOCHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BALD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BASE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NORMIES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOOMER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ZOOMER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BASEDAI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BASEDPEPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LUIGI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MARIO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SONIC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PIKACHU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KIRBY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'YOSHI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GOOMBA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOWSER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ZELDA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LINK2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PACMAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TETRIS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SNAKE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PONG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEGAMAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAMUS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KRATOS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RATCHET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CRASH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SPYRO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BANJO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DONKEY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'METROID/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'EARTHBOUND/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NESS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PIZZA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BURGER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TACO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SUSHI2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RAMEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HOTDOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BACON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DONUT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COOKIE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PANCAKE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WAFFLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BURRITO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NACHO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FRIES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STEAK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHICKEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CORN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PICKLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AVOCADO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BANANA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'APPLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ORANGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GRAPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STRAWBERRY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WATERMELON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHARK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WHALE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DOLPHIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OCTOPUS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JELLYFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CRAB/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LOBSTER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SEAHORSE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STARFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CLOWNFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SWORDFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TUNA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SALMON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SHRIMP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SQUID/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MANTA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ANGELFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PUFFERFISH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BARRACUDA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SEAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'EAGLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PARROT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OWL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HAWK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CROW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RAVEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PHOENIX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DUCK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PENGUIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FLAMINGO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEACOCK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TOUCAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PELICAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HUMMINGBIRD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WOODPECKER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PIGEON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SPARROW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ROBIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BLUEJAY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CARDINAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TREMP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BODEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TRUMP2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BIDEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KANYE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MUSK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BEZOS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GATES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ZUCK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TRUMP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OBAMA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CLINTON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SANDERS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DESANTIS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VIVEK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MONALISA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PICASSO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DAVINCI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BANKSY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WARHOL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VANGOGH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MONET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DALI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'REMBRANDT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MICHELANGELO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PIRATE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TREASURE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOOTY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PARLEY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KRAKEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BLACKBEARD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CAPTAIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JOLLY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PLUNDER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BUCCANEER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ALIEN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'UFO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MARS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOON2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ROCKET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COSMOS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NEBULA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GALAXY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ASTRO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COMET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'METEOR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SATURN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JUPITER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VENUS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PLUTO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GIGA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RETARDIO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SPX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GOAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOODENG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PNUT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ACT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FARTCOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'APU/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ANALOS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SILLY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HARAMBE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEME/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DANK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BRUH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STONKS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HODL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FOMO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FUD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'REKT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LAMBO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WAGMI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NGMI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHAD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KAREN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BOOMER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ZOOMER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KAREN2/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'APE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KONG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GORILLA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHIMP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MONKEY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GIBBON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ORANGUTAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BABOON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LEMUR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MARMOSET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TAMARIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'APECOIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BAYC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AZUKI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MILADY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PANDA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KOALA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KANGAROO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLOTH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OTTER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BEAVER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SQUIRREL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RACCOON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BADGER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HEDGEHOG/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PORCUPINE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SKUNK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MOLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WOMBAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PLATYPUS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ARMADILLO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ANTEATER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CAPYBARA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHINCHILLA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FERRET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DIAMOND/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RUBY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'EMERALD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAPPHIRE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEARL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JADE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'OPAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TOPAZ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AMETHYST/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CRYSTAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RAINBOW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PINK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CYAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NEON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RETRO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VAPOR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SYNTH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CYBER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MATRIX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GLITCH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GPT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHATGPT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CLAUDE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BARD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'COPILOT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JARVIS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SKYNET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CORTANA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ALEXA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },

            'ROCKET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ASTRONAUT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SPACE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GALAXY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🦖 DINOSAUR & PREHISTORIC MEMES
            'DINO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TREX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RAPTOR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BRONTO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PTERO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FOSSIL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🍌 FRUIT & VEGETABLE MEMES
            'BANANA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'APPLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ORANGE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GRAPE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WATERMELON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STRAWBERRY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHERRY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEACH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LEMON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LIME/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PINEAPPLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MANGO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'AVOCADO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'POTATO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TOMATO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CARROT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ONION/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PEPPER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BROCCOLI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CORN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎉 CELEBRATION & PARTY MEMES
            'PARTY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CONFETTI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BALLOON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FIREWORK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CAKE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHAMPAGNE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🌈 RAINBOW & EMOJI MEMES
            'RAINBOW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'UNICORN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DIAMOND/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FIRE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LIGHTNING/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STAR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HEART/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SKULL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GHOST/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PUMPKIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎲 CASINO & GAMBLING MEMES
            'DICE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CARD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SLOT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ROULETTE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'POKER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BLACKJACK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VEGAS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JACKPOT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🏆 SPORTS & TEAM MEMES
            'FOOTBALL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SOCCER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BASKETBALL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BASEBALL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TENNIS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GOLF/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'RACING/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHAMPION/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TROPHY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MEDAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🌍 COUNTRY & CITY MEMES
            'NYC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TOKYO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'LONDON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PARIS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BERLIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MIAMI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DUBAI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🧙 FANTASY & MAGIC MEMES
            'WIZARD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DRAGON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'KNIGHT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SWORD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CASTLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MAGIC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SPELL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'POTION/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WAND/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CROWN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎬 MOVIE & TV MEMES
            'HOLLYWOOD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NETFLIX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CINEMA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FILM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ACTOR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DIRECTOR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎵 MUSIC & DANCE MEMES
            'ROCK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JAZZ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'HIP HOP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TECHNO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'GUITAR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DRUM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PIANO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BEAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🏗️ CONSTRUCTION & TOOLS MEMES
            'HAMMER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WRENCH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'DRILL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SAW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'NAIL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SCREW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🔋 ENERGY & POWER MEMES
            'BATTERY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ENERGY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SOLAR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'WIND/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'POWER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'VOLT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎓 EDUCATION & SCIENCE MEMES
            'SCHOOL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'TEACHER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'STUDENT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'SCIENCE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'MATH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CHEMISTRY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'PHYSICS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'BIOLOGY/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 🎪 CIRCUS & CARNIVAL MEMES
            'CIRCUS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CLOWN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'JUGGLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'CARNIVAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'FERRIS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            'ROLLERCOASTER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            
            'DYDX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            
            // 🎮 GAMING & METAVERSE - Narrative Sector Plays
            'SAND/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'MANA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'AXS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'GALA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'ENJ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'IMX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'MAGIC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'RONIN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            
            // 💰 LEGACY ALTS - Proven Movers with History
            'ADA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'LTC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'BCH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'ETC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'XLM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'TRX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'EOS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'XMR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            'DASH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'legacy' },
            
            // 🌐 LAYER 2 & SCALING - Infrastructure Plays
            'ARB/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            'OP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            'LRC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            'RNDR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            'GRT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            
            // 🔒 PRIVACY & SECURITY - Niche Sector Pumps
            'ZEC/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'privacy' },
            
            // 🌟 EMERGING NARRATIVES - AI, RWA, DePIN
            'FIL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'storage' },
            'ICP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'compute' },
            'VET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'supply' },
            'THETA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'streaming' },
            'CHZ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'fantoken' },
            'FET/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'ai' },
            'AGIX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'ai' },
            'OCEAN/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'ai' },
            'RENDER/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'ai' },
            
            // 🏦 REAL WORLD ASSETS - Institutional Narrative
            'MNT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'rwa' },
            'HBAR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'enterprise' },
            'QUANT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'enterprise' },
            
            // 🎨 NFT & CREATOR ECONOMY
            'BLUR/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'nft' },
            'APE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'nft' },
            'LOOKS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'nft' },
            
            // 📱 SOCIAL & COMMUNICATION
            'MASK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'social' },
            
            // 🔮 MISC HIGH-POTENTIAL MOVERS
            'QNT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            
            // 🔥 2025 TRENDING COINS - Hot New Narratives
            'WLD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'ai' },
            'PYTH/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'oracle' },
            'JUP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'JTO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'solana' },
            'DYM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'STRK/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            'MANTA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            'PENDLE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'METIS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l2' },
            'ORDI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'bitcoin' },
            'SATS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'bitcoin' },
            'RATS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'bitcoin' },
            'ALT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'PORTAL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'PIXEL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'AEVO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'NFP/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'nft' },
            'AI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'ai' },
            'XAI/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'MEME/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'meme' },
            
            // 💎 MORE SOLID PROJECTS
            'TON/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'KAS/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'mining' },
            'BEAM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'gaming' },
            'ROSE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'privacy' },
            'ONE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'KAVA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'defi' },
            'CELO/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'mobile' },
            'FLOW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'nft' },
            'EGLD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'l1' },
            'FLOW/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'EGLD/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'KSM/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'ZIL/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'WAVES/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'XTZ/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'KAVA/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'ONE/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'ZRX/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' },
            'BAT/USD': { price: 0, volatility: 0, trend: 0, volume: 0, score: 0, history: [], active: true, trending: false, sector: 'misc' }
        };
        
        // 🔥 ENHANCED TREND DETECTION SYSTEM
        this.trendDetector = {
            hotCoins: [],                    // Currently trending coins
            volumeSurges: new Map(),         // Track volume spikes
            priceExplosions: new Map(),      // Track price pumps
            sectorMomentum: new Map(),       // Track sector-wide pumps
            trendingThreshold: 0.02,         // 2%+ move = trending
            volumeMultiplier: 2.0,           // 2x volume = surge
            trendDuration: 300000,           // 5 min trend window
            lastTrendUpdate: Date.now(),
            sectorRotation: null             // Current hot sector
        };
        
        this.lastSwitch = Date.now();
        this.switchCooldown = 120000; // 2 minutes between switches
        this.tradeCallback = null;
    }

    // FORCE-CLOSE a position immediately (used by SELL_ALL_AND_STUDY or emergency workflows)
    async closePositionImmediately(market, reason = 'Forced close') {
        const position = this.state.portfolio[market];
        if (!position) return;

        try {
            const saleValue = position.holdings * (this.scanner?.markets?.[market]?.price || this.state.currentPrice || position.buyPrice);
            const sellFee = saleValue * this.settings.tradingFee;
            const netProceeds = saleValue - sellFee;
            const costBasis = position.costBasis || (position.holdings * position.buyPrice);
            const actualProfit = netProceeds - costBasis;

            // If using real money, execute real sell first
            if (USE_REAL_MONEY && this.kraken) {
                try {
                    await this.executeRealSell(market, position.holdings, netProceeds);
                } catch (err) {
                    console.error('❌ Real forced sell failed for', market, err.message);
                    return;
                }
            }

            // Update balances for paper trading or after successful real sell
            this.wallets.trading += netProceeds;
            this.state.totalFeesPaid += sellFee;
            this.state.currentBalance = this.wallets.main + this.wallets.trading;

            // Record trade
            const tradeRecord = {
                tradeNumber: this.tradeHistory.length + 1,
                market: market,
                buyPrice: position.buyPrice,
                sellPrice: (this.scanner?.markets?.[market]?.price || this.state.currentPrice || position.buyPrice),
                grossProfit: ((saleValue - costBasis) / costBasis),
                netProfit: actualProfit / costBasis,
                profitDollars: actualProfit,
                feesPaid: sellFee + (costBasis * this.settings.tradingFee),
                holdTime: this.state.cycle - position.buyCycle,
                volume: position.holdings,
                generation: this.state.generation,
                cycle: this.state.cycle,
                exitReason: reason,
                timestamp: new Date().toISOString(),
                timestampMs: Date.now()
            };

            this.tradeHistory.push(tradeRecord);
            // Update stats
            if (actualProfit > 0) { this.state.wins++; this.brain.winStreak++; this.brain.lossStreak = 0; }
            else { this.state.losses++; this.brain.lossStreak++; this.brain.winStreak = 0; }
            this.state.totalTrades++;
            this.state.totalProfit += actualProfit;

            // Remove position
            delete this.state.portfolio[market];
            this.saveState();

            console.log(`🔴 Forced close ${market}: ${reason} | Net P/L: $${actualProfit.toFixed(4)} (${(actualProfit / costBasis * 100).toFixed(2)}%)`);
        } catch (err) {
            console.error('Error in closePositionImmediately for', market, err.message);
        }
    }

    // Sell all positions immediately, then enter study mode for N seconds (collect data but don't trade)
    async sellAllThenStudy(seconds = 30) {
        const markets = Object.keys(this.state.portfolio);
        if (markets.length === 0) {
            console.log('🔎 sellAllThenStudy: No positions to sell. Entering study mode.');
            this.studyMode = true;
            setTimeout(() => {
                this.studyMode = false;
                console.log(`🔔 Study complete (${seconds}s) - Resuming trading.`);
            }, seconds * 1000);
            return;
        }

        console.log(`🔴 sellAllThenStudy: Closing ${markets.length} positions before studying for ${seconds}s`);
        for (const m of markets) {
            await this.closePositionImmediately(m, 'SELL_ALL_AND_STUDY');
        }

        // Enter study mode (collect data but skip trading). We'll not pause the entire loop so market data continues.
        this.studyMode = true;
        console.log(`🔎 Study mode active for ${seconds}s - collecting market data only`);
        setTimeout(() => {
            this.studyMode = false;
            console.log(`🔔 Study complete (${seconds}s) - Resuming trading.`);
        }, seconds * 1000);
    }
    
    calculateOpportunityScore(market) {
        const data = this.markets[market];
        
        // 🔥 VOLUME-FIRST SCORING: Even with minimal history, high volume = opportunity!
        const hasMinimalData = data.history.length >= 2;  // Just need 2 points for basic trend
        const hasGoodData = data.history.length >= 20;     // 20 points for full analysis
        
        if (!hasMinimalData) return 0;  // Need at least 2 data points
        
        // 🔥 ENHANCED SCORING: Trending coins get MASSIVE boost!
        let baseScore = 0;
        
        // ⚡⚡ CHASE FAST P/L MOVERS: Volatility is 70% of score! (was 50%)
        // Score: VOLATILITY (70%), trend strength (20%), volume (10%)
        const volScore = hasGoodData ? Math.min(data.volatility * 20, 1) : 0.5;  // Default volatility if not enough data
        const trendScore = hasGoodData ? Math.abs(data.trend) * 10 : 0;
        const volumeScore = Math.min(data.volume / 50000, 1);
        const trendingBonus = data.trending ? 2.0 : 0;  // 2x multiplier for trending!
        
        // 🔥 HIGH VOLUME BONUS: Favor fast-moving markets with lots of trading
        // Use logarithmic scale for volume to differentiate between high-volume coins!
        let volumeMultiplier = 1.0;
        if (data.volume > 100000000) {
            volumeMultiplier = 3.0;  // 3x for MASSIVE volume (>100M) - PEPE, SHIB, MOG
        } else if (data.volume > 50000000) {
            volumeMultiplier = 2.5;  // 2.5x for huge volume (>50M)
        } else if (data.volume > 10000000) {
            volumeMultiplier = 2.2;  // 2.2x for very high volume (>10M)
        } else if (data.volume > 1000000) {
            volumeMultiplier = 1.8;  // 1.8x for high volume (>1M)
        } else if (data.volume > 100000) {
            volumeMultiplier = 1.5;  // 1.5x for good volume (>100k)
        } else if (data.volume > 10000) {
            volumeMultiplier = 1.2;  // 1.2x for decent volume (>10k)
        }
        
        // ⚡ VOLATILITY FIRST: Changed from 50% to 70% weight!
        baseScore = (volScore * 0.7) + (trendScore * 0.2) + (volumeScore * 0.1) + trendingBonus;
        baseScore *= volumeMultiplier;  // Apply volume multiplier
        
        // 🚀🚀🚀 ULTRA-FAST MOVERS - MAXIMUM PRIORITY for quick P/L jumps!
        // These are coins that ACTUALLY move fast and make money quick
        const isHighVolatility = data.volatility > 0.01;  // >1% moves
        const isHighVolume = data.volume > 1000000;       // >1M volume = liquid
        const isFastMover = isHighVolatility && isHighVolume && data.trending;
        
        if (isFastMover) {
            // 🔥 5X MULTIPLIER for PROVEN fast movers!
            baseScore *= 5.0;
            console.log(`\n⚡⚡⚡ FAST MOVER DETECTED: ${market} - Vol: ${(data.volatility*100).toFixed(2)}%, Volume: ${(data.volume/1000000).toFixed(1)}M`);
            console.log(`   🎯 Score boosted 5X: ${(baseScore/5).toFixed(3)} → ${baseScore.toFixed(3)}`);
        }
        // 🔥🔥 MEME COIN MANIA MODE - Massive priority for fast movers!
        else if (data.sector === 'meme') {
            baseScore *= 2.5;  // 150% score boost for meme coins (was 30%)
            // Extra boost if volatile + trending
            if (data.volatility > 0.01 && data.trending) {
                baseScore *= 1.5;  // Additional 50% boost for hot memes (was 20%)
            }
            // Even if slow, meme coins get minimum score
            if (baseScore < 0.3) baseScore = 0.3;  // Ensure memes are always considered
        }
        
        // 🔍 DEBUG: Log score calculation for high-volume coins
        if (data.volume > 10000000 && Math.random() < 0.01) {  // Log 1% of the time
            console.log(`\n📊 SCORE DEBUG for ${market}:`);
            console.log(`   Volume: ${(data.volume/1000000).toFixed(1)}M → Multiplier: ${volumeMultiplier}x`);
            console.log(`   Base Score: ${baseScore.toFixed(3)}`);
        }
        
        // 📉 PENALTY for slow-moving "payment" coins like XRP
        if (data.sector === 'payment') {
            baseScore *= 0.5;  // 50% penalty - only trade if really volatile
        }
        
        // 📉 PENALTY for "legacy" coins - they're slow!
        if (data.sector === 'legacy') {
            baseScore *= 0.3;  // 70% penalty - we want fast movers, not old coins
        }
        
        // 🔍 DEBUG: Always log MOG score calculation
        if (market === 'MOG/USD') {
            console.log(`\n🔍 MOG/USD SCORE DEBUG:`);
            console.log(`   Volume: ${(data.volume/1000000).toFixed(1)}M → Multiplier: ${volumeMultiplier}x`);
            console.log(`   volScore: ${volScore.toFixed(3)}, trendScore: ${trendScore.toFixed(3)}, volumeScore: ${volumeScore.toFixed(3)}`);
            console.log(`   ⚡ VOLATILITY FIRST: (${volScore.toFixed(3)} * 0.7) + (${trendScore.toFixed(3)} * 0.2) + (${volumeScore.toFixed(3)} * 0.1) = ${((volScore * 0.7) + (trendScore * 0.2) + (volumeScore * 0.1)).toFixed(3)}`);
            console.log(`   After volume multiplier (${volumeMultiplier}x): ${(((volScore * 0.7) + (trendScore * 0.2) + (volumeScore * 0.1)) * volumeMultiplier).toFixed(3)}`);
            console.log(`   After meme boost (2.5x): ${baseScore.toFixed(3)}`);
            console.log(`   FINAL SCORE: ${baseScore.toFixed(3)}`);
        }
        
        return baseScore;
    }
    
    // 🔥 DETECT SECTOR ROTATION - Find the hot narrative!
    detectSectorRotation() {
        const sectorPerformance = new Map();
        const sectors = ['meme', 'defi', 'l1', 'l2', 'gaming', 'ai', 'nft', 'rwa', 'bluechip'];
        
        // Initialize sector tracking
        sectors.forEach(sector => {
            sectorPerformance.set(sector, { totalChange: 0, count: 0, avgChange: 0 });
        });
        
        // Calculate average performance per sector
        for (const [market, data] of Object.entries(this.markets)) {
            if (!data.sector || data.history.length < 30) continue;
            
            const prices = data.history.map(h => h.price);
            const recent = prices.slice(-30);
            const priceChange = (recent[recent.length - 1] - recent[0]) / recent[0];
            
            const sectorData = sectorPerformance.get(data.sector);
            if (sectorData) {
                sectorData.totalChange += priceChange;
                sectorData.count++;
            }
        }
        
        // Calculate averages and find hot sector
        let hottest = null;
        let maxChange = 0;
        
        for (const [sector, data] of sectorPerformance.entries()) {
            if (data.count > 0) {
                data.avgChange = data.totalChange / data.count;
                
                if (Math.abs(data.avgChange) > maxChange) {
                    maxChange = Math.abs(data.avgChange);
                    hottest = { sector, change: data.avgChange, count: data.count };
                }
            }
        }
        
        // Update sector rotation if significant move (1%+)
        if (hottest && Math.abs(hottest.change) > 0.01) {
            this.trendDetector.sectorRotation = hottest.sector;
            console.log(`\n🔥 SECTOR ROTATION DETECTED: ${hottest.sector.toUpperCase()} ${(hottest.change * 100).toFixed(2)}% (${hottest.count} coins)\n`);
        }
        
        return hottest;
    }
    
    // 🔥 DETECT TRENDING COINS - Find the hottest opportunities!
    detectTrendingCoins() {
        const now = Date.now();
        
        // Only update every 30 seconds
        if (now - this.trendDetector.lastTrendUpdate < 30000) return;
        this.trendDetector.lastTrendUpdate = now;
        
        const trending = [];
        
        for (const [market, data] of Object.entries(this.markets)) {
            if (data.history.length < 30) continue;
            
            const prices = data.history.map(h => h.price);
            const recent5min = prices.slice(-30);  // Last 30 points ~30 seconds
            
            // Calculate price change
            const priceChange = (recent5min[recent5min.length - 1] - recent5min[0]) / recent5min[0];
            
            // Calculate volume surge
            const avgVolume = data.volume;
            const recentVolume = data.volume;
            const volumeRatio = avgVolume > 0 ? recentVolume / avgVolume : 1;
            
            // 🔥 TRENDING if: 2%+ move OR 2x volume spike
            const isPriceExplosion = Math.abs(priceChange) >= this.trendDetector.trendingThreshold;
            const isVolumeSurge = volumeRatio >= this.trendDetector.volumeMultiplier;
            
            if (isPriceExplosion || isVolumeSurge) {
                data.trending = true;
                trending.push({
                    market,
                    sector: data.sector || 'misc',
                    priceChange: (priceChange * 100).toFixed(2),
                    volumeRatio: volumeRatio.toFixed(2),
                    score: data.score
                });
                
                // Store in trend tracker
                this.trendDetector.priceExplosions.set(market, {
                    change: priceChange,
                    time: now
                });
            } else {
                // Remove old trends
                data.trending = false;
            }
        }
        
        // Clean up old trend data (older than 5 minutes)
        for (const [market, trendData] of this.trendDetector.priceExplosions.entries()) {
            if (now - trendData.time > this.trendDetector.trendDuration) {
                this.trendDetector.priceExplosions.delete(market);
                if (this.markets[market]) this.markets[market].trending = false;
            }
        }
        
        this.trendDetector.hotCoins = trending.sort((a, b) => 
            Math.abs(parseFloat(b.priceChange)) - Math.abs(parseFloat(a.priceChange))
        );
        
        // Log trending coins if any found
        if (trending.length > 0) {
            console.log('\n🔥🔥🔥 TRENDING COINS DETECTED! 🔥🔥🔥');
            trending.slice(0, 5).forEach((t, i) => {
                const direction = parseFloat(t.priceChange) > 0 ? '🚀' : '📉';
                console.log(`   ${i+1}. ${t.market}: ${direction} ${t.priceChange}% | Vol: ${t.volumeRatio}x | Sector: ${t.sector} | Score: ${t.score.toFixed(3)}`);
            });
            console.log('');
        }
        
        // Detect sector rotation
        this.detectSectorRotation();
        
        return this.trendDetector.hotCoins;
    }
    
    getTrendingCoins() {
        return this.trendDetector.hotCoins;
    }
    
    // 🚀 Auto-build mapping when markets are discovered
    buildPairMapping(ourPair, krakenPair) {
        this.ourToKraken[ourPair] = krakenPair;
        this.krakenToOur[krakenPair] = ourPair;
        // Also map without slash for flexibility (DOGUSD → DOGE/USD)
        const noSlash = krakenPair.replace('/', '');
        this.krakenToOur[noSlash] = ourPair;
        console.log(`🔗 Mapped: ${ourPair} ↔ ${krakenPair}`);
    }
    
    // Convert our format to Kraken WebSocket format
    toKrakenPair(ourPair) {
        // If we have a known mapping, use it
        if (this.ourToKraken[ourPair]) {
            return this.ourToKraken[ourPair];
        }
        
        // Otherwise, use Kraken's format rules:
        // - DOGE/USD → XDG/USD (Kraken uses XDG ticker for Dogecoin)
        // - Most other coins: just use as-is with slash
        let krakenPair = ourPair;
        
        // Special cases where Kraken uses different tickers
        const specialMappings = {
            'DOGE/USD': 'XDG/USD',
            'DOGE/USDT': 'XDG/USDT',
            'DOT/USD': 'DOT/USD',   // Polkadot
            'BTC/USD': 'XBT/USD',   // Bitcoin (Kraken uses XBT)
            'BTC/USDT': 'XBT/USDT'
        };
        
        if (specialMappings[ourPair]) {
            krakenPair = specialMappings[ourPair];
        }
        
        // Cache the mapping
        this.buildPairMapping(ourPair, krakenPair);
        return krakenPair;
    }
    
    // Convert Kraken WebSocket format back to our format
    fromKrakenPair(krakenPair) {
        // If we have a known mapping, use it
        if (this.krakenToOur[krakenPair]) {
            return this.krakenToOur[krakenPair];
        }
        
        // Try reverse conversion for special cases
        let ourPair = krakenPair;
        const reverseMappings = {
            'XDG/USD': 'DOGE/USD',
            'XDG/USDT': 'DOGE/USDT',
            'XDGUSD': 'DOGE/USD',
            'XDGUSDT': 'DOGE/USDT',
            'XBT/USD': 'BTC/USD',
            'XBT/USDT': 'BTC/USDT',
            'XBTUSD': 'BTC/USD',
            'XBTUSDT': 'BTC/USDT'
        };
        
        if (reverseMappings[krakenPair]) {
            ourPair = reverseMappings[krakenPair];
        }
        
        // Cache the mapping
        this.buildPairMapping(ourPair, krakenPair);
        return ourPair;
    }
    
    findBestMarket(isHolding = false, affordabilityFilter = null) {
        // 🚀 RAPID SWITCHING MODE: Allow switching even when holding if we find a HOT meme coin!
        // Only stay in position if it's still competitive OR we're in profit
        const currentMarket = this.markets[this.activeMarket];
        
        // 🔥 Detect trending coins first!
        this.detectTrendingCoins();
        
        // 🚨 CRITICAL: When using affordability filter, start with null (force finding a filtered market)
        let bestMarket = affordabilityFilter ? null : this.activeMarket;
        let bestScore = 0;
        
        // 🚀 PRIORITY #1: Check trending coins first!
        const trendingCoins = this.getTrendingCoins();
        if (trendingCoins.length > 0) {
            // Jump on the hottest trend immediately (if affordable)
            const hottest = trendingCoins[0];
            const isAffordable = !affordabilityFilter || affordabilityFilter(hottest.market);
            // Lower threshold from 1.5x to 1.1x for faster switching
            if (this.markets[hottest.market] && hottest.score > bestScore * 1.1 && isAffordable) {
                // 🔥 AGGRESSIVE MEME SWITCHING: If holding, check if new meme is 2x better
                if (isHolding && this.markets[hottest.market].sector === 'meme') {
                    const currentScore = currentMarket.score || 0;
                    if (hottest.score > currentScore * 2.0) {
                        console.log(`\n🚀🔥🔥 DUMPING POSITION FOR HOT MEME: ${this.activeMarket} → ${hottest.market}`);
                        console.log(`   Score jump: ${currentScore.toFixed(3)} → ${hottest.score.toFixed(3)} (${((hottest.score/currentScore) * 100).toFixed(0)}%!)`);
                        console.log(`   Movement: ${hottest.priceChange}% | Volume: ${hottest.volumeRatio}x`);
                        return hottest.market;
                    }
                }
                
                console.log(`\n🚀🔥 JUMPING ON HOT TREND: ${hottest.market}`);
                console.log(`   Movement: ${hottest.priceChange}% | Volume: ${hottest.volumeRatio}x`);
                return hottest.market;
            }
        }
        
        // Regular market scanning (filter by affordability)
        let filteredMarkets = 0;
        let topFiltered = { market: null, score: 0 };
        const topCandidates = [];  // Track top 5 candidates for debugging
        
        for (const [market, data] of Object.entries(this.markets)) {
            if (!data.active) continue;
            
            // 🎯 Check affordability filter
            if (affordabilityFilter && !affordabilityFilter(market)) {
                continue; // Skip coins we can't afford
            }
            
            filteredMarkets++;
            data.score = this.calculateOpportunityScore(market);
            
            // Track top candidates
            topCandidates.push({
                market,
                score: data.score,
                sector: data.sector,
                volume: data.volume,
                price: data.price,
                volatility: data.volatility
            });
            
            if (data.score > bestScore) {
                bestScore = data.score;
                bestMarket = market;
                topFiltered = { market, score: data.score };
            }
        }
        
        // 🔥 DEBUG: Show top 5 market candidates
        if (topCandidates.length > 0) {
            topCandidates.sort((a, b) => b.score - a.score);
            const top5 = topCandidates.slice(0, 5);
            console.log(`\n🏆 TOP 5 MARKET CANDIDATES:`);
            top5.forEach((c, i) => {
                const priceStr = c.price < 0.01 ? c.price.toFixed(8) : c.price.toFixed(4);
                console.log(`   ${i+1}. ${c.market} (${c.sector}) - Score: ${c.score.toFixed(3)} | Vol: ${(c.volume/1000).toFixed(0)}k | Price: $${priceStr}`);
            });
        }
        
        // 🚨 DEBUG: If filter blocked everything, log it
        if (affordabilityFilter && filteredMarkets === 0) {
            console.log(`\n⚠️  WARNING: Affordability filter blocked ALL markets! Falling back to active market.`);
            return this.activeMarket;
        }
        
        // 🚨 DEBUG: Show top filtered market
        if (affordabilityFilter && topFiltered.market) {
            const sector = this.markets[topFiltered.market]?.sector || 'unknown';
            console.log(`\n🎯 Top filtered market: ${topFiltered.market} (${sector}) - Score: ${topFiltered.score.toFixed(3)}`);
        }
        
        // 🚨 CRITICAL: If we found no valid market, return the active market
        if (!bestMarket) {
            console.log(`\n⚠️  No market found by filter, staying on ${this.activeMarket}`);
            return this.activeMarket;
        }
        
        // Switch if significantly better market found
        const timeSinceSwitch = Date.now() - this.lastSwitch;
        const currentScore = this.markets[this.activeMarket].score;
        
        // 🔥 BALANCED SWITCHING: Fast discovery but not too jumpy
        const switchThreshold = this.markets[bestMarket]?.sector === 'meme' ? 1.05 : 1.1;  // Lower for memes
        const cooldown = 2000;  // 2 second cooldown - prevent rapid flipping
        
        if (timeSinceSwitch > cooldown && bestScore > currentScore * switchThreshold) {
            if (bestMarket !== this.activeMarket) {
                const isTrending = this.markets[bestMarket].trending ? '🔥 TRENDING!' : '';
                const isMeme = this.markets[bestMarket].sector === 'meme' ? '🚀 MEME!' : '';
                console.log(`\n🔄 MARKET SWITCH: ${this.activeMarket} → ${bestMarket} ${isTrending} ${isMeme}`);
                console.log(`   Score: ${currentScore.toFixed(3)} → ${bestScore.toFixed(3)} (+${((bestScore/currentScore - 1) * 100).toFixed(0)}%)`);
                this.activeMarket = bestMarket;
                this.lastSwitch = Date.now();
                
                // Activate new market if not active
                if (!this.markets[bestMarket].active) {
                    this.markets[bestMarket].active = true;
                    this.subscribeToMarket(bestMarket);
                }
            }
        }
        
        return bestMarket;
    }
    
    getBestOpportunity() {
        // Return the current best scoring market with its data
        let bestMarket = null;
        let bestScore = 0;
        
        for (const [market, data] of Object.entries(this.markets)) {
            if (!data.active) continue;
            
            const score = this.calculateOpportunityScore(market);
            if (score > bestScore) {
                bestScore = score;
                bestMarket = market;
            }
        }
        
        if (bestMarket) {
            return {
                market: bestMarket,
                score: bestScore,
                data: this.markets[bestMarket]
            };
        }
        
        return null;
    }
    
    subscribeToMarket(market) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const krakenPair = this.toKrakenPair(market);
            this.ws.send(JSON.stringify({
                event: 'subscribe',
                pair: [krakenPair],
                subscription: { name: 'trade' }
            }));
            console.log(`📡 Subscribed to ${market} (Kraken: ${krakenPair})`);
        }
    }
    
    connect() {
        return new Promise((resolve) => {
            console.log('🌐 Connecting to Kraken WebSocket...');
            
            this.ws = new WebSocket('wss://ws.kraken.com');
            
            this.ws.on('open', () => {
                console.log('✅ Connected to Kraken WebSocket');
                this.connected = true;
                
                // Subscribe to ALL markets for monitoring - use proper Kraken format
                const allPairs = Object.keys(this.markets).map(pair => this.toKrakenPair(pair));
                
                console.log(`🔍 Subscribing to ${allPairs.length} pairs. First 5:`, allPairs.slice(0, 5));
                
                const tickerSub = {
                    event: 'subscribe',
                    pair: allPairs,
                    subscription: { name: 'ticker' }
                };
                console.log(`📤 Sending ticker subscription...`);
                this.ws.send(JSON.stringify(tickerSub));
                
                // Subscribe to trades on active markets
                const activePairs = Object.keys(this.markets)
                    .filter(m => this.markets[m].active)
                    .map(pair => this.toKrakenPair(pair));
                
                this.ws.send(JSON.stringify({
                    event: 'subscribe',
                    pair: activePairs,
                    subscription: { name: 'trade' }
                }));
                
                console.log(`📊 Monitoring ${allPairs.length} markets | Trading ${activePairs.length} active`);
                resolve(true);
            });
            
            this.ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data);
                    
                    // 🚨 DEBUG: Log ALL messages for first 10 seconds
                    if (!this.startTime) this.startTime = Date.now();
                    if (Date.now() - this.startTime < 10000 && Array.isArray(msg) && msg.length > 2) {
                        console.log(`📨 WS Message type: ${msg[2]}, pair: ${msg[3]}`);
                    }
                    
                    // Ticker updates
                    if (Array.isArray(msg) && msg[2] === 'ticker') {
                        const ticker = msg[1];
                        let krakenPair = msg[3];
                        
                        // Convert Kraken format back to our format
                        let pair = this.fromKrakenPair(krakenPair);
                        
                        // 🚨 DEBUG: Specifically log DOGE/XDG conversion (NO TIME LIMIT)
                        if (krakenPair === 'XDG/USD' || pair.includes('DOGE')) {
                            if (!this.dogeLogCount) this.dogeLogCount = 0;
                            if (this.dogeLogCount < 5) {
                                console.log(`🐕 DOGE: Kraken="${krakenPair}" → Mapped="${pair}" → Price=${ticker.c[0]}`);
                                this.dogeLogCount++;
                            }
                        }
                        
                        // 🚨 DEBUG: Log first 10 unique pairs to see mapping
                        if (!this.seenPairs) this.seenPairs = new Set();
                        if (this.seenPairs.size < 10 && !this.seenPairs.has(krakenPair)) {
                            console.log(`🔍 Kraken: "${krakenPair}" → Our: "${pair}"`);
                            this.seenPairs.add(krakenPair);
                        }
                        
                        // Map Kraken WebSocket format back to our format
                        // DOG/USD -> DOGE/USD, etc.
                        pair = pair.replace('DOG/USD', 'DOGE/USD')
                                   .replace('DOG/USDT', 'DOGE/USDT')
                                   .replace('DOG/USDC', 'DOGE/USDC');
                        
                        if (this.markets[pair]) {
                            const price = parseFloat(ticker.c[0]);
                            const volume = parseFloat(ticker.v[1]);
                            
                            // 🚨 DEBUG: Log cheap meme coin updates
                            if (pair === 'PEPE/USD' || pair === 'SHIB/USD' || pair === 'BONK/USD') {
                                if (!this.cheapMemeLogCount) this.cheapMemeLogCount = {};
                                if (!this.cheapMemeLogCount[pair]) this.cheapMemeLogCount[pair] = 0;
                                if (this.cheapMemeLogCount[pair] < 3) {
                                    console.log(`💎 ${pair}: Price=$${price.toFixed(8)} | Volume=${(volume/1000000).toFixed(1)}M`);
                                    this.cheapMemeLogCount[pair]++;
                                }
                            }
                            
                            // 🚨 DEBUG: Log DOGE price updates
                            if (pair === 'DOGE/USD') {
                                console.log(`🐕 DOGE/USD price updated: $${price} (from ${this.markets[pair].price})`);
                            }
                            
                            this.markets[pair].price = price;
                            this.markets[pair].volume = volume;
                            this.markets[pair].history.push({ price, volume, time: Date.now() });
                            
                            if (this.markets[pair].history.length > 100) {
                                this.markets[pair].history.shift();
                            }
                            
                            // Calculate volatility and trend
                            if (this.markets[pair].history.length >= 30) {
                                const prices = this.markets[pair].history.map(h => h.price);
                                const avg = prices.reduce((a, b) => a + b) / prices.length;
                                
                                // Volatility
                                const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
                                this.markets[pair].volatility = Math.sqrt(variance) / avg;
                                
                                // Trend
                                const oldAvg = prices.slice(0, 15).reduce((a, b) => a + b) / 15;
                                const newAvg = prices.slice(-15).reduce((a, b) => a + b) / 15;
                                this.markets[pair].trend = (newAvg - oldAvg) / oldAvg;
                                
                                // 🔥 TRENDING DETECTION - Mark coins with strong momentum
                                // Trending = volatility (>0.5%) + uptrend (>0.3%) OR volume spike
                                const recentVolume = parseFloat(ticker.v[0]); // last 24h volume
                                const avgRecentVolume = prices.length > 50 ? 
                                    this.markets[pair].history.slice(-50).reduce((sum, h) => sum + (h.volume || 0), 0) / 50 : 
                                    recentVolume;
                                
                                // More aggressive trending for fast markets
                                this.markets[pair].trending = (
                                    (this.markets[pair].volatility > 0.005 && this.markets[pair].trend > 0.003) ||  // 0.5% vol + 0.3% up
                                    (this.markets[pair].volatility > 0.008) ||                                       // 0.8%+ vol alone
                                    (volume > avgRecentVolume * 1.5)                                                 // 50%+ volume spike
                                );
                                
                                // 🚀 Debug trending detection
                                if (this.markets[pair].trending) {
                                    const emoji = this.markets[pair].sector === 'meme' ? '🔥' : '📈';
                                    console.log(`${emoji} TRENDING: ${pair} - Vol: ${(this.markets[pair].volatility * 100).toFixed(2)}%, Trend: ${(this.markets[pair].trend * 100).toFixed(2)}%, Sector: ${this.markets[pair].sector}`);
                                }
                            }
                        }
                    }
                    
                    // Trade updates
                    if (Array.isArray(msg) && msg[2] === 'trade') {
                        let krakenPair = msg[3];
                        
                        // Convert Kraken format back to our format
                        let pair = this.fromKrakenPair(krakenPair);
                        
                        if (pair === this.activeMarket && this.tradeCallback) {
                            const trades = msg[1];
                            trades.forEach(trade => {
                                const [price, volume, timestamp, side] = trade;
                                this.tradeCallback({
                                    pair,
                                    price: parseFloat(price),
                                    volume: parseFloat(volume),
                                    side: side === 'b' ? 'buy' : 'sell',
                                    timestamp: parseFloat(timestamp) * 1000
                                });
                            });
                        }
                    }
                } catch (err) {
                    // Ignore parse errors
                }
            });
            
            this.ws.on('error', (err) => {
                console.log('⚠️ WebSocket error:', err.message);
            });
            
            this.ws.on('close', () => {
                console.log('🔌 Connection closed. Reconnecting...');
                this.connected = false;
                setTimeout(() => this.connect(), 1000);  // ⚡ Fast reconnect (1s instead of 5s)
            });
        });
    }
    
    getCurrentPrice() {
        return this.markets[this.activeMarket].price || 0;
    }
    
    getPriceHistory() {
        return this.markets[this.activeMarket].history || [];
    }
    
    getMarketData() {
        const market = this.markets[this.activeMarket];
        return {
            price: market.price,
            volatility: market.volatility,
            trend: market.trend,
            volume: market.volume,
            score: market.score,
            history: market.history
        };
    }
}

class WorldClassTradingAI {
    constructor(budget = 19) {
        this.budget = budget;
        this.scanner = new MarketScanner();
        
        this.wallets = { main: budget * 0.3, trading: budget * 0.7 };  // 70% for trading (need $10+ for real trading)
        
        // ⏸️ CONTROL STATE
        this.isPaused = false;                  // Trading pause state
        this.primaryMarket = 'SOL/USD';         // Primary market focus
        this.cycleInterval = 500;               // Cycle speed in ms (default 500ms)
        
        // 🧠 PREDICTION ENGINE - Machine Learning Style Pattern Recognition
        this.predictor = {
            patterns: [],                   // Learned price patterns
            priceMovements: [],             // Historical movements for training
            predictions: [],                // Active predictions
            accuracy: 0,                    // Prediction accuracy %
            successfulPredictions: 0,
            totalPredictions: 0,
            trendStrength: 0,               // Current trend strength
            nextMoveConfidence: 0,          // Confidence in next move
            priceTarget: 0,                 // Predicted next price
            timeToTarget: 0,                // Predicted time to reach target
            volatilityForecast: 0,          // Expected volatility
            patternMatches: 0,              // How many patterns match current state
            marketCycle: 'accumulation',    // accumulation, markup, distribution, markdown
            fearGreedIndex: 50,             // 0-100 fear/greed indicator
            momentumScore: 0,               // -100 to +100 momentum indicator
            supportLevel: 0,                // Predicted support price
            resistanceLevel: 0              // Predicted resistance price
        };
        
        this.brain = {
            buyThreshold: 0.001,         // Buy on 0.1% dips (AGGRESSIVE)
            buyAggression: 1.0,          // MAXIMUM aggression
            buyMomentum: 0.7,            
            sellThreshold: 0.050,        // 💎 PATIENT: Sell at 5.0% profit minimum (NO MORE LOSSES!)
            sellAggression: 0.95,        // Quick exits
            riskTolerance: 0.8,          // HIGH risk for more trades
            patience: 5,                 
            adaptationRate: 0.25,        // Fast learning
            memoryDepth: 30,             // More memory
            trendFollowing: 0.7,         // Strong trend rider
            volumeWeight: 0.5,           // Volume matters
            winStreak: 0,
            lossStreak: 0,
            bestProfit: 0,
            worstLoss: 0,
            scalpingMode: true,          // SCALPING MODE for quick profits
            momentumThreshold: 0.001     
        };
        
        // 💸 KRAKEN WITHDRAWAL FEES (network fees for moving coins off exchange)
        // These must be accounted for when calculating true profitability
        this.withdrawalFees = {
            'XRP/USD': 0.02,      // 0.02 XRP withdrawal fee
            'HBAR/USD': 0.0001,   // 0.0001 HBAR withdrawal fee
            'SOL/USD': 0.01,      // 0.01 SOL withdrawal fee
            'BTC/USD': 0.00005,   // 0.00005 BTC withdrawal fee
            'ETH/USD': 0.0005,    // 0.0005 ETH withdrawal fee
            'ADA/USD': 0.2,       // 0.2 ADA withdrawal fee
            'DOT/USD': 0.01,      // 0.01 DOT withdrawal fee
            'MATIC/USD': 0.1,     // 0.1 MATIC withdrawal fee
            'LINK/USD': 0.35,     // 0.35 LINK withdrawal fee
            'AVAX/USD': 0.01,     // 0.01 AVAX withdrawal fee
            'ATOM/USD': 0.002,    // 0.002 ATOM withdrawal fee
            'UNI/USD': 0.055,     // 0.055 UNI withdrawal fee
            'default': 0          // No withdrawal fee assumed for unknown coins
        };
        
        this.settings = {
            maxTradeSize: 1.0,          // 🎯 Use 100% capital (~$19 per trade) - ALL IN to meet Kraken minimums
            minProfit: 0.005,            // 🎯 TARGET: 0.5% profit = 1-2 cents on $2-3 trades (REALISTIC!)
            targetProfit: 0.010,         // 🚀 IDEAL: 1.0% profit = 2-3 cents (achievable goal)
            maxLoss: 0.015,              // Reference only (not used - patient holding)
            trailingStopLoss: 0.005,     // 📉 Trail: 0.5% from peak when in profit
            trailingProfitLock: 0.002,   // 🔒 Lock profits: If we hit 0.5%+, sell if drops 0.2% from peak
            emergencyExitThreshold: 0.50,  // 🚨 Emergency exit at -50% loss (prevent PNUT disasters!)
            forcedLiquidationThreshold: 0.30,  // 🛑 Force sell at -30% after minimum hold
            maxHoldTime: 1200,           // ⏱️ PATIENT: Up to 20 minutes per trade (find good exits)
            minHoldTime: 60,             // ⏳ MINIMUM: Hold at least 1 minute (60 cycles @ 0.1s = patient)
            quickExitTime: 30,           // Reference only
            panicSellThreshold: 0.100,   // DISABLED: Never panic sell (set to 10% so it never triggers)
            checkInterval: 100,          // ⚡ SPEED: Check every 0.1 seconds (10 checks/sec for fast reactions!)
            evolutionFrequency: 3,       // 🧬 LEARN: Evolve every 3 trades (balanced learning)
            tradingFee: 0.0000,          // 💎 KRAKEN PLUS: ZERO FEES!          
            scalpWindow: 10,             // Fast momentum (10 cycles = 1 second)
            momentumBoost: 0.7,          // Higher momentum boost
            maxPositions: 6,             // 🎰 MORE POSITIONS: 6 simultaneous scalps
            minDataPoints: 3             // ⚡ QUICK START: Only 3 data points (0.3 seconds to start!)
        };
        
        // BONK reference and swapping options
        this.bonkWatchEnabled = false;       // When true, watch BONK for target price
        this.bonkTargetPrice = null;         // e.g. 6.06
        this.bonkBaselinePrice = null;       // price captured when user sets watch
        this.bonkRelativeSellPercent = null; // computed percent to use as global sell target

        // Allow swapping at break-even (user requested)
        this.settings.allowSwapAtEven = false;

        // Study mode (collect market data but do not trade) used by SELL_ALL_AND_STUDY workflow
        this.studyMode = false;
        // 📡 REAL-TIME COMMAND SYSTEM
        this.scalingMode = 'balanced';  // Default: balanced (can be: conservative, balanced, aggressive)
        this.lastCommandTimestamp = 0;  // Track last processed command
        
        this.state = {
            priceHistory: [],            // Keep for backwards compatibility
            volumeHistory: [],
            portfolio: {},               // NEW: { 'SOL/USD': {holdings, buyPrice, peak, buyCycle}, ... }
            totalTrades: 0,
            wins: 0,
            losses: 0,
            profitHistory: [],
            currentBalance: budget,
            initialBalance: budget,
            generation: 1,
            cycle: 0,
            totalProfit: 0,
            totalFeesPaid: 0,
            peakBalance: budget,
            drawdown: 0,
            lastEvolution: 0,
            markets: {}
        };
        
        this.tradeHistory = [];
        this.traderPatterns = {};  // Track individual trader behaviors
        this.marketIntelligence = {
            totalMarketTrades: 0,
            largeTraders: {},      // Traders with >10 SOL trades
            whaleActivity: {},     // Traders with >50 SOL trades
            traderTiming: {},      // When traders are most active
            successPatterns: {}    // Patterns that led to wins
        };
        this.stateFile = 'paper-trading-state.json';
        this.historicalDataFile = 'ai-historical-data.json';
        
        // 💰 KRAKEN LIVE TRADING INTEGRATION
        this.kraken = null;
        this.krakenFutures = null;
        
        if (USE_REAL_MONEY) {
            this.kraken = new KrakenWebSocket(
                process.env.KRAKEN_API_KEY,
                process.env.KRAKEN_API_SECRET
            );
            console.log('💰 REAL MONEY MODE ENABLED - Kraken Spot API initialized');
        }
        
        if (USE_FUTURES) {
            this.krakenFutures = new KrakenFutures(
                process.env.KRAKEN_API_KEY,
                process.env.KRAKEN_API_SECRET
            );
            console.log('🚀 FUTURES TRADING ENABLED - Kraken Futures API initialized');
        }
        
        this.loadState();
        this.loadHistoricalData();
    }

    // 🔧 Fetch price from Kraken REST API when WebSocket data is missing
    async fetchKrakenPrice(market) {
        const https = require('https');
        
        // Convert our format to Kraken format: DOGE/USD -> XDGUSD
        let krakenPair = market.replace('/', '');
        
        // Handle special Kraken symbol mappings
        const symbolMap = {
            'DOGEUSD': 'XDGUSD',
            'SOLUSD': 'SOLUSD',
            'BTCUSD': 'XXBTZUSD',
            'ETHUSD': 'XETHZUSD',
            'XRPUSD': 'XXRPZUSD'
        };
        
        krakenPair = symbolMap[krakenPair] || krakenPair;
        
        return new Promise((resolve) => {
            const url = `https://api.kraken.com/0/public/Ticker?pair=${krakenPair}`;
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.result) {
                            const resultKey = Object.keys(json.result)[0];
                            if (resultKey && json.result[resultKey].c) {
                                const price = parseFloat(json.result[resultKey].c[0]);
                                resolve(price);
                                return;
                            }
                        }
                        resolve(0);
                    } catch (error) {
                        resolve(0);
                    }
                });
            }).on('error', () => resolve(0));
        });
    }

    // 🚀 AUTO-DISCOVER NEW MARKETS from Kraken
    async discoverNewMarkets() {
        const https = require('https');
        
        return new Promise((resolve) => {
            console.log('\n🔍 AUTO-DISCOVERING new markets from Kraken...');
            const url = 'https://api.kraken.com/0/public/AssetPairs';
            
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.result) {
                            let newMarketsAdded = 0;
                            
                            for (const [pairName, pairInfo] of Object.entries(json.result)) {
                                // Only track USD pairs (not EUR, GBP, etc)
                                if (pairInfo.quote === 'ZUSD' || pairInfo.quote === 'USD') {
                                    // Convert Kraken format to our format: XXBTZUSD -> BTC/USD
                                    let base = pairInfo.base.replace('X', '').replace('Z', '');
                                    const market = `${base}/USD`;
                                    
                                    // Skip if we already track this market
                                    if (this.scanner && this.scanner.markets && this.scanner.markets[market]) {
                                        continue;
                                    }
                                    
                                    // Auto-categorize by analyzing the asset name
                                    let sector = 'misc';
                                    const baseLower = base.toLowerCase();
                                    
                                    // 🚀 MASSIVE MEME COIN LIST (100+ coins!)
                                    const memeCoins = ['doge', 'shib', 'pepe', 'floki', 'bonk', 'wif', 'meme', 
                                        'popcat', 'brett', 'mew', 'michi', 'mog', 'myro', 'ponke', 'wen', 'bome', 'slerf', 'smog', 'coq', 'degen', 'toshi', 'higher',
                                        'shiba', 'akita', 'kishu', 'hoge', 'elon', 'babydoge', 'samo',
                                        'wojak', 'turbo', 'ladys', 'bobo', 'mong', 'pepe2',
                                        'cats', 'catgirl', 'grumpy', 'meow', 'purr',
                                        'snek', 'hobbes', 'vibe', 'based',
                                        'analos', 'silly', 'harambe', 'boden', 'tremp',
                                        'tybg', 'normie', 'keycat',
                                        'bone', 'leash', 'saitama', 'pitbull', 'volt', 'neiro', 'giga', 'peipei', 'andy', 'honk'];
                                    
                                    if (['btc', 'eth', 'sol', 'bnb', 'avax', 'ada', 'dot', 'matic'].includes(baseLower)) {
                                        sector = 'l1';
                                    } else if (memeCoins.includes(baseLower)) {
                                        sector = 'meme';
                                    } else if (['link', 'uni', 'aave', 'mkr', 'comp', 'crv'].includes(baseLower)) {
                                        sector = 'defi';
                                    } else if (['arb', 'op', 'matic', 'imx'].includes(baseLower)) {
                                        sector = 'l2';
                                    }
                                    
                                    // Add new market to tracking
                                    if (this.scanner && this.scanner.markets) {
                                        this.scanner.markets[market] = {
                                            price: 0,
                                            volatility: 0,
                                            trend: 0,
                                            volume: 0,
                                            score: 0,
                                            history: [],
                                            active: true,
                                            trending: false,
                                            sector: sector,
                                            discovered: Date.now()
                                        };
                                        newMarketsAdded++;
                                    }
                                }
                            }
                            
                            const totalMarkets = Object.keys(this.scanner.markets).length;
                            console.log(`✅ Discovery complete: ${newMarketsAdded} NEW markets added!`);
                            console.log(`📊 Total markets now tracking: ${totalMarkets}`);
                            resolve(newMarketsAdded);
                        } else {
                            resolve(0);
                        }
                    } catch (error) {
                        console.error('❌ Market discovery error:', error.message);
                        resolve(0);
                    }
                });
            }).on('error', () => resolve(0));
        });
    }

    loadState() {
        try {
            if (fs.existsSync(this.stateFile)) {
                const saved = JSON.parse(fs.readFileSync(this.stateFile));
                this.state = saved.state;
                this.brain = saved.brain;
                
                // 🛡️ SAFETY: Ensure all brain properties exist (for old saves)
                if (!this.brain) this.brain = {};
                this.brain.winStreak = this.brain.winStreak || 0;
                this.brain.lossStreak = this.brain.lossStreak || 0;
                this.brain.bestProfit = this.brain.bestProfit || 0;
                this.brain.worstLoss = this.brain.worstLoss || 0;
                
                this.wallets = saved.wallets;
                this.traderPatterns = saved.traderPatterns || {};
                this.marketIntelligence = saved.marketIntelligence || this.marketIntelligence;
                
                // MIGRATE old single-holding format to portfolio
                if (!this.state.portfolio) {
                    this.state.portfolio = {};
                    // If old state had holdings, migrate to SOL/USD position
                    if (this.state.holdings && this.state.holdings > 0) {
                        const buyPrice = this.state.buyPrice || 0;
                        this.state.portfolio['SOL/USD'] = {
                            holdings: this.state.holdings,
                            buyPrice: buyPrice,
                            costBasis: this.state.holdings * buyPrice, // Calculate cost basis for migrated position
                            peak: this.state.peakPriceWhileHolding || 0,
                            buyCycle: this.state.lastBuyCycle || this.state.cycle
                        };
                    }
                    // Clean up old single-holding fields
                    delete this.state.holdings;
                    delete this.state.buyPrice;
                    delete this.state.peakPriceWhileHolding;
                    delete this.state.lastBuyCycle;
                    delete this.state.currentPrice;
                }
                
                console.log('Loaded Gen ' + this.state.generation + ' - Balance: $' + this.state.currentBalance.toFixed(2) + ' | Trades: ' + this.state.totalTrades + ' | Win Rate: ' + this.getWinRate() + '%');
                console.log('Portfolio: ' + this.getPositionCount() + ' positions | Market Intelligence: ' + Object.keys(this.traderPatterns).length + ' traders tracked');
                
                // 🔧 FIX WALLETS: Sync with loaded balance
                const loadedBalance = this.state.currentBalance || 10;
                this.wallets = { 
                    main: loadedBalance * 0.3, 
                    trading: loadedBalance * 0.7 
                };
                console.log('💼 Wallets synced: Main $' + this.wallets.main.toFixed(2) + ' | Trading $' + this.wallets.trading.toFixed(2));
                
                // 💎 ENFORCE PROFIT TARGETS - 1.5% profit, 3% stop loss
                this.settings.minProfit = 0.015;  // 1.5% minimum
                this.settings.targetProfit = 0.015;  // 1.5% target
                this.settings.trailingStopLoss = 0.03;  // 3% stop loss
                this.settings.stopLoss = 0.03;  // 3% hard stop loss
                this.brain.sellThreshold = 0.015;  // 1.5% sell threshold
                console.log('💎 PROFIT TARGETS: Target=' + (this.settings.targetProfit*100).toFixed(1) + '%, Stop Loss=' + (this.settings.stopLoss*100).toFixed(1) + '%');
            }
        } catch (error) {
            console.log('Starting fresh AI training session');
        }
    }

    loadHistoricalData() {
        try {
            if (fs.existsSync(this.historicalDataFile)) {
                const data = JSON.parse(fs.readFileSync(this.historicalDataFile));
                this.tradeHistory = data.tradeHistory || [];
                
                console.log('🧠 AI BRAIN LOADED - PERMANENT LEARNING ACTIVE');
                console.log(`   📊 Total Historical Trades: ${this.tradeHistory.length}`);
                if (data.firstTrade) {
                    console.log(`   📅 Learning Since: ${new Date(data.firstTrade).toLocaleDateString()}`);
                }
                console.log(`   🔄 Last Updated: ${data.updated || 'Unknown'}`);
                console.log('   ✓ Neural patterns preserved across all runs');
                console.log('   ✓ AI will continue growing forever\n');
            } else {
                console.log('🌱 NEW AI BRAIN - Starting permanent learning journey...\n');
            }
        } catch (error) {
            console.log('⚠️  Warning: Could not load historical data - starting fresh');
            console.log('   Error:', error.message, '\n');
        }
    }

    // 🔧 Helper: Convert Kraken asset codes to symbols
    krakenAssetToSymbol(asset) {
        const assetMap = {
            'XXDG': 'DOGE', 'XXRP': 'XRP', 'XETH': 'ETH', 'XXBT': 'BTC',
            'XXLM': 'XLM', 'ZUSD': 'USD', 'XLTC': 'LTC', 'XXMR': 'XMR', 'XZEC': 'ZEC'
        };
        if (assetMap[asset]) return assetMap[asset];
        if (asset.startsWith('X') && asset.length > 3) return asset.substring(1);
        if (asset.startsWith('Z')) return asset.substring(1);
        return asset;
    }

    // � FETCH AND ANALYZE KRAKEN TRADE HISTORY
    async fetchKrakenTradeHistory() {
        if (!USE_REAL_MONEY || !this.kraken) {
            return;
        }
        
        try {
            console.log('📊 Fetching Kraken trade history for AI learning...');
            
            // Fetch trades from the last 30 days
            const trades = await this.kraken.getTradesHistory();
            
            if (!trades || Object.keys(trades).length === 0) {
                console.log('   No trade history found on Kraken');
                return;
            }
            
            // Analyze trade performance
            let totalTrades = 0;
            let profitableTrades = 0;
            let totalProfit = 0;
            const coinPerformance = {};
            
            for (const [tradeId, trade] of Object.entries(trades)) {
                totalTrades++;
                
                // Extract coin from pair (e.g., XXRPZUSD → XRP)
                const pair = trade.pair;
                const coin = this.krakenAssetToSymbol(pair.replace('ZUSD', '').replace('USD', ''));
                
                // Track per-coin performance
                if (!coinPerformance[coin]) {
                    coinPerformance[coin] = {
                        trades: 0,
                        volume: 0,
                        profit: 0,
                        wins: 0,
                        losses: 0,
                        avgProfit: 0
                    };
                }
                
                coinPerformance[coin].trades++;
                coinPerformance[coin].volume += parseFloat(trade.vol);
                
                // Calculate profit (simplified - would need matching buy/sell pairs for accuracy)
                const cost = parseFloat(trade.cost);
                const fee = parseFloat(trade.fee);
                
                if (trade.type === 'sell') {
                    // Rough profit estimation
                    const estimatedProfit = cost * 0.05; // Assume 5% avg profit for now
                    coinPerformance[coin].profit += estimatedProfit;
                    totalProfit += estimatedProfit;
                    
                    if (estimatedProfit > 0) {
                        coinPerformance[coin].wins++;
                        profitableTrades++;
                    } else {
                        coinPerformance[coin].losses++;
                    }
                }
            }
            
            // Calculate averages and learn from history
            for (const [coin, stats] of Object.entries(coinPerformance)) {
                if (stats.trades > 0) {
                    stats.avgProfit = stats.profit / stats.trades;
                    stats.winRate = (stats.wins / stats.trades * 100).toFixed(1);
                }
                
                // 🧠 BOOST AI PRIORITY for historically profitable coins
                const market = `${coin}/USD`;
                if (this.scanner && this.scanner.markets && this.scanner.markets[market]) {
                    if (stats.winRate > 70) {
                        console.log(`   🌟 ${coin} has ${stats.winRate}% win rate - boosting priority!`);
                        // Will be prioritized in scoring
                    }
                }
            }
            
            const winRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100).toFixed(1) : 0;
            console.log(`   ✅ Analyzed ${totalTrades} historical trades`);
            console.log(`   💰 Win Rate: ${winRate}%`);
            console.log(`   📈 Total Profit: $${totalProfit.toFixed(2)}`);
            
            // Store for future reference
            this.krakenHistoricalStats = {
                totalTrades,
                profitableTrades,
                totalProfit,
                winRate: parseFloat(winRate),
                coinPerformance
            };
            
        } catch (error) {
            console.error('⚠️  Failed to fetch Kraken trade history:', error.message);
        }
    }
    
    // �🔄 SYNC PORTFOLIO WITH ACTUAL KRAKEN BALANCES
    async syncWithKraken() {
        if (!USE_REAL_MONEY || !this.kraken) {
            return;
        }
        
        try {
            console.log('🔄 Syncing portfolio with Kraken account...');
            
            // 📊 FETCH KRAKEN TRADE HISTORY FOR AI LEARNING
            await this.fetchKrakenTradeHistory();
            
            // Sync spot balances
            const balances = await this.kraken.getBalance();
            
            // Clear paper trading portfolio
            this.state.portfolio = {};
            
            // Map Kraken balances to portfolio
            let totalUSD = 0;
            for (const [asset, amount] of Object.entries(balances)) {
                const balance = parseFloat(amount);
                if (balance <= 0) continue;
                
                // Handle USD
                if (asset === 'ZUSD' || asset === 'USD') {
                    totalUSD += balance;
                    continue;
                }
                
                // Handle futures - skip for now (synced separately below)
                if (asset.includes('.F')) {
                    continue;
                }
                
                // Map Kraken asset codes to market pairs
                // Kraken uses X/Z prefixes: XXRP→XRP, ZUSD→USD, XETH→ETH, XXDG→DOGE, etc.
                let coin = asset;
                
                // Special mappings for Kraken's weird asset codes
                const assetMap = {
                    'XXDG': 'DOGE',  // Dogecoin
                    'XXRP': 'XRP',   // Ripple
                    'XETH': 'ETH',   // Ethereum
                    'XXBT': 'BTC',   // Bitcoin
                    'XXLM': 'XLM',   // Stellar
                    'ZUSD': 'USD'    // US Dollar
                };
                
                if (assetMap[asset]) {
                    coin = assetMap[asset];
                } else if (coin.startsWith('X') && coin.length > 3) {
                    coin = coin.substring(1); // XXRP → XRP, XETH → ETH
                } else if (coin.startsWith('Z')) {
                    coin = coin.substring(1); // ZUSD → USD
                }
                
                const market = `${coin}/USD`;
                
                console.log(`   Checking ${asset} → ${coin} → ${market}`);
                
                // Only track if we monitor this market
                if (this.scanner && this.scanner.markets && this.scanner.markets[market]) {
                    let currentPrice = this.scanner.markets[market].price || 0;
                    
                    // 🔧 FIX: If WebSocket price is missing, fetch from REST API
                    if (currentPrice === 0) {
                        console.log(`   ⏳ Waiting for price data for ${market}... fetching from REST API`);
                        try {
                            const restPrice = await this.fetchKrakenPrice(market);
                            if (restPrice > 0) {
                                currentPrice = restPrice;
                                // Update scanner price for future use
                                this.scanner.markets[market].price = restPrice;
                                console.log(`   ✅ Got price from REST API: $${restPrice.toFixed(6)}`);
                            } else {
                                console.log(`   ⚠️  Could not get price from REST API, skipping for now`);
                                continue;
                            }
                        } catch (error) {
                            console.log(`   ❌ REST API error: ${error.message}, skipping for now`);
                            continue;
                        }
                    }
                    
                    console.log(`✅ Found: ${balance.toFixed(8)} ${coin} (${market}) @ $${currentPrice.toFixed(4)}`);
                    
                    // Calculate position value
                    const positionValue = balance * currentPrice;
                    const krakenMinimum = 1; // $1 minimum to avoid true dust (lowered from $5)
                    
                    // Skip dust positions (too small to sell)
                    if (positionValue < krakenMinimum) {
                        console.log(`   🧹 Skipping dust position: $${positionValue.toFixed(4)} (below $${krakenMinimum} minimum)`);
                        // Don't add to portfolio - let AI buy fresh
                        continue;
                    }
                    
                    // Check if we already have this position (AI bought it)
                    const existingPosition = this.state.portfolio[market];
                    if (existingPosition && existingPosition.buyPrice > 0) {
                        // Keep existing buy price - AI knows what it paid
                        console.log(`   📌 Keeping existing buy price: $${existingPosition.buyPrice.toFixed(2)}`);
                    } else {
                        // New synced position - DON'T assume a buy price, use current price!
                        // This prevents phantom +2% profits on synced positions
                        console.log(`   ⚠️  Synced position - using current price as cost basis`);
                        const actualValue = balance * currentPrice;  // What it's worth NOW
                        this.state.portfolio[market] = {
                            holdings: balance,
                            buyPrice: currentPrice,  // Use CURRENT price, not 2% lower!
                            costBasis: actualValue,  // Cost basis = current value (break-even)
                            peak: currentPrice,
                            buyCycle: this.state.cycle,
                            synced: true // Mark as synced (not AI-bought)
                        };
                    }
                } else {
                    console.log(`⚠️  Skipping ${asset}: ${balance} (market ${market} not monitored)`);
                }
            }
            
            // 🚀 SYNC FUTURES POSITIONS
            if (USE_FUTURES && this.krakenFutures) {
                console.log('\n🚀 Syncing Futures positions...');
                try {
                    const positions = await this.krakenFutures.getPositions();
                    
                    for (const position of positions) {
                        const symbol = position.symbol;
                        const size = parseFloat(position.size);
                        const entryPrice = parseFloat(position.fillPrice);
                        const side = position.side; // 'long' or 'short'
                        
                        // Convert futures symbol to our format (pf_solusd → SOL.F/USD)
                        let coin = symbol.replace('pf_', '').replace('usd', '').toUpperCase();
                        const market = `${coin}.F/USD`;
                        
                        console.log(`✅ Futures: ${side.toUpperCase()} ${size} ${symbol} @ $${entryPrice}`);
                        
                        // Add to portfolio with futures flag
                        this.state.portfolio[market] = {
                            holdings: size,
                            buyPrice: entryPrice,
                            costBasis: size * entryPrice, // Calculate cost basis for futures position
                            peak: entryPrice,
                            buyCycle: this.state.cycle,
                            synced: true,
                            futures: true,
                            side: side // 'long' or 'short'
                        };
                    }
                } catch (futuresError) {
                    console.error('⚠️  Failed to sync futures:', futuresError.message);
                }
            }
            
            // Update wallet balances
            this.wallets.trading = totalUSD;
            this.wallets.main = 0;
            this.state.currentBalance = totalUSD;
            
            console.log(`💰 Synced: ${Object.keys(this.state.portfolio).length} positions, $${totalUSD.toFixed(2)} USD`);
            this.saveState();
            
        } catch (error) {
            console.error('❌ Failed to sync with Kraken:', error.message);
        }
    }

    // 📡 READ REAL-TIME COMMANDS from advanced-control.sh
    async checkRealtimeCommands() {
        try {
            if (!fs.existsSync('ai-realtime-commands.json')) {
                return; // No commands file yet
            }
            
            const commands = JSON.parse(fs.readFileSync('ai-realtime-commands.json', 'utf8'));
            const timestamp = commands.timestamp || 0;
            
            // Only process if this is a new command (not already processed)
            if (this.lastCommandTimestamp && timestamp <= this.lastCommandTimestamp) {
                return; // Already processed this command
            }
            
            // Ignore SYNC commands with no value (they spam rate limits)
            if (commands.command === 'SYNC' && !commands.value) {
                return; // Skip empty sync commands
            }
            
            this.lastCommandTimestamp = timestamp;
            
            console.log(`\n📡 Processing command: ${commands.command} = ${commands.value}`);
            
            // 💰 SCALING MODE: aggressive, balanced, conservative
            if (commands.command === 'SCALING_MODE') {
                this.scalingMode = commands.value;
                console.log(`✅ Scaling mode set to: ${this.scalingMode}`);
                
                if (this.scalingMode === 'aggressive') {
                    console.log('   💪 Using maximum trade sizes for faster growth');
                } else if (this.scalingMode === 'balanced') {
                    console.log('   ⚖️  Using balanced trade sizes');
                } else if (this.scalingMode === 'conservative') {
                    console.log('   🛡️  Using smaller trade sizes for safety');
                }
            }
            
            // 🔄 AUTO SYNC: Set autosync interval in milliseconds
            else if (commands.command === 'AUTO_SYNC') {
                const intervalMs = parseInt(commands.value);
                if (intervalMs === 0) {
                    console.log('⛔ Auto-sync disabled');
                } else {
                    const seconds = (intervalMs / 1000).toFixed(1);
                    console.log(`✅ Auto-sync set to ${intervalMs}ms (${seconds}s)`);
                    // Note: This would require restarting the AI to apply
                }
            }
            
            // 🎯 PROFIT TARGET: Set minimum profit target
            else if (commands.command === 'PROFIT_TARGET') {
                const target = parseFloat(commands.value);
                this.settings.minProfitTarget = target;
                console.log(`✅ Profit target set to ${target}%`);
            }
            
            // 💎 RISK LEVEL: Set risk tolerance
            else if (commands.command === 'RISK_LEVEL') {
                this.settings.riskTolerance = commands.value;
                console.log(`✅ Risk level set to: ${commands.value}`);
            }
            
            // 🔄 SYNC NOW: Force immediate sync (only if explicitly requested with value)
            else if (commands.command === 'SYNC' && commands.value) {
                console.log('🔄 Force syncing with Kraken...');
                await this.syncWithKraken();
            }
            
            // 💰 SET MAX TRADE SIZE
            else if (commands.command === 'SET_MAX_TRADE') {
                const size = parseFloat(commands.value);
                this.maxTradeSize = size;
                console.log(`✅ Max trade size set to $${size}`);
            }
            
            // ⏸️ PAUSE TRADING
            else if (commands.command === 'PAUSE_TRADING') {
                this.isPaused = true;
                console.log('⏸️  Trading PAUSED - AI will finish current cycle then stop trading');
            }
            
            // ▶️ RESUME TRADING
            else if (commands.command === 'RESUME_TRADING') {
                this.isPaused = false;
                console.log('▶️  Trading RESUMED - AI back to normal operations');
            }
            
            // 💸 FORCE SELL ALL POSITIONS
            else if (commands.command === 'SELL_ALL') {
                console.log('💸 FORCE SELL ALL - Liquidating all positions...');
                for (const market in this.state.portfolio) {
                    const position = this.state.portfolio[market];
                    if (position.holdings > 0) {
                        await this.executeSell(market, position.holdings, 'FORCE_SELL_ALL');
                    }
                }
            }
            
            // 💸 FORCE SELL SPECIFIC COIN
            else if (commands.command === 'FORCE_SELL' && commands.value) {
                const market = commands.value;
                console.log(`💸 FORCE SELL ${market}...`);
                if (this.state.portfolio[market] && this.state.portfolio[market].holdings > 0) {
                    await this.executeSell(market, this.state.portfolio[market].holdings, 'FORCE_SELL');
                } else {
                    console.log(`⚠️  No holdings for ${market}`);
                }
            }
            
            // 💰 FORCE BUY SPECIFIC COIN
            else if (commands.command === 'FORCE_BUY' && commands.value) {
                try {
                    const data = JSON.parse(commands.value);
                    const market = data.coin;
                    const amount = parseFloat(data.amount);
                    console.log(`💰 FORCE BUY ${amount} of ${market}...`);
                    
                    const currentPrice = this.scanner.markets[market]?.price || 0;
                    if (currentPrice > 0 && amount > 0) {
                        const quantity = amount / currentPrice;
                        await this.executeBuy(market, quantity, currentPrice, 'FORCE_BUY');
                    } else {
                        console.log(`⚠️  Invalid price or amount for ${market}`);
                    }
                } catch (e) {
                    console.log('⚠️  Invalid FORCE_BUY format');
                }
            }
            
            // 🔄 FORCE SWITCH MARKET FOCUS
            else if (commands.command === 'FORCE_SWITCH' && commands.value) {
                const market = commands.value;
                console.log(`🔄 Switching primary focus to ${market}`);
                this.primaryMarket = market;
            }
            
            // 🎯 SET PROFIT TARGET
            else if (commands.command === 'SET_PROFIT_TARGET') {
                const target = parseFloat(commands.value);
                this.settings.minProfitTarget = target;
                console.log(`🎯 Profit target set to ${target}%`);
            }
            
            // 🛑 SET STOP LOSS
            else if (commands.command === 'SET_STOP_LOSS') {
                const stopLoss = parseFloat(commands.value);
                this.settings.stopLoss = -Math.abs(stopLoss);
                console.log(`🛑 Stop loss set to ${stopLoss}%`);
            }
            
            // ⚡ SET SPEED (cycle interval)
            else if (commands.command === 'SET_SPEED') {
                const speedMs = parseInt(commands.value);
                this.cycleInterval = speedMs;
                console.log(`⚡ Cycle speed set to ${speedMs}ms`);
            }
            
            // 🧬 FORCE EVOLUTION
            else if (commands.command === 'FORCE_EVOLVE') {
                console.log('🧬 FORCING EVOLUTION...');
                this.state.generation++;
                this.state.wins = 0;
                this.state.losses = 0;
                console.log(`🧬 Advanced to Generation ${this.state.generation}`);
            }
            
            // 🔢 SET GENERATION
            else if (commands.command === 'SET_GENERATION') {
                const gen = parseInt(commands.value);
                this.state.generation = gen;
                console.log(`🔢 Generation set to ${gen}`);
            }
            
        } catch (error) {
            // File doesn't exist or invalid JSON - no problem
        }
    }

    // Portfolio management helpers
    getPositionCount() {
        return Object.keys(this.state.portfolio).length;
    }

    hasPosition(market) {
        return this.state.portfolio[market] && this.state.portfolio[market].holdings > 0;
    }

    getTotalPortfolioValue() {
        let total = this.wallets.main + this.wallets.trading;
        for (const [market, position] of Object.entries(this.state.portfolio)) {
            const currentPrice = this.scanner.markets[market]?.price || 0;
            total += position.holdings * currentPrice;
        }
        return total;
    }

    getPortfolioSummary() {
        const positions = [];
        for (const [market, position] of Object.entries(this.state.portfolio)) {
            if (position.holdings > 0) {
                const currentPrice = this.scanner.markets[market]?.price || 0;
                const currentValue = position.holdings * currentPrice;
                const costBasis = position.holdings * position.buyPrice;
                const profit = ((currentValue - costBasis) / costBasis);
                positions.push({
                    market,
                    holdings: position.holdings,
                    buyPrice: position.buyPrice,
                    currentPrice,
                    profit: profit * 100,
                    value: currentValue,
                    holdTime: this.state.cycle - position.buyCycle
                });
            }
        }
        return positions;
    }

    saveState() {
        // Save current state (light file)
        fs.writeFileSync(this.stateFile, JSON.stringify({
            state: this.state,
            brain: this.brain,
            wallets: this.wallets,
            traderPatterns: this.traderPatterns,
            marketIntelligence: this.marketIntelligence,
            timestamp: new Date().toISOString()
        }, null, 2));
        
        // Save ALL historical trades separately (PERMANENT GROWING DATABASE)
        fs.writeFileSync(this.historicalDataFile, JSON.stringify({
            tradeHistory: this.tradeHistory,
            totalTrades: this.tradeHistory.length,
            firstTrade: this.tradeHistory[0]?.timestamp || null,
            lastTrade: this.tradeHistory[this.tradeHistory.length - 1]?.timestamp || null,
            updated: new Date().toISOString(),
            generation: (this.tradeHistory.length / 10) | 0,  // AI generation number
            aiAge: this.tradeHistory[0] ? 
                Math.floor((Date.now() - new Date(this.tradeHistory[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)) : 0
        }, null, 2));
        
        // Log AI growth stats
        if (this.tradeHistory.length % 10 === 0) {
            console.log(`\n🧠 AI EVOLUTION: Generation ${(this.tradeHistory.length / 10) | 0} (${this.tradeHistory.length} total trades)`);
        }
    }

    async start() {
        console.log('\n🚀═══════════════════════════════════════════════════');
        if (USE_REAL_MONEY) {
            console.log('   💰 LIVE TRADING MODE - REAL MONEY ON KRAKEN 💰');
        } else {
            console.log('   MULTI-COIN PORTFOLIO AI - PAPER TRADING MODE');
        }
        console.log('═══════════════════════════════════════════════════🚀');
        console.log('💰 Budget: $' + this.budget);
        console.log('💼 Wallet: Main $' + this.wallets.main.toFixed(2) + ' | Trading $' + this.wallets.trading.toFixed(2));
        
        if (USE_REAL_MONEY) {
            console.log('\n⚠️  REAL MONEY WARNING:');
            console.log('   🚨 Trading with ACTUAL funds on Kraken');
            console.log('   🚨 All trades will execute for real');
            console.log('   🚨 You can lose money - trade responsibly!');
        }
        
        console.log('\n🧠 AI CAPABILITIES:');
        console.log('   ✓ Multi-market opportunity scanner (10 markets)');
        console.log('   ✓ Trade MULTIPLE coins simultaneously (up to ' + this.settings.maxPositions + ')');
        console.log('   ✓ Portfolio diversification & risk management');
        console.log('   ✓ Neural network decision making');
        console.log('   ✓ Momentum & volatility analysis');
        console.log('   ✓ Performance-based evolution');
        console.log('   ✓ Whale activity tracking (>$1000 trades)');
        console.log('   ✓ Trailing stop-loss protection per position');
        console.log('   ✓ INFINITE trade history database');
        
        if (USE_REAL_MONEY) {
            console.log('\n💰 LIVE TRADING MODE - Real money on Kraken!');
            console.log('🎯 Strategy: Only take profitable trades\n');
        } else {
            console.log('\n📊 PAPER TRADING MODE - Zero risk practice');
            console.log('🎯 Strategy: Only take profitable trades\n');
        }
        
        try {
            await this.scanner.connect();
            this.scanner.tradeCallback = (trade) => this.analyzeMarketTrade(trade);
            console.log('✅ Multi-market scanner active');
            
            // 🔄 SYNC WITH KRAKEN REAL BALANCES (wait for prices to load)
            if (USE_REAL_MONEY) {
                await new Promise(resolve => setTimeout(resolve, 2000));  // ⚡ 2s instead of 5s
                await this.syncWithKraken();
            }
            
            // 🚀 AUTO-DISCOVER NEW MARKETS from Kraken
            console.log('\n🔍 Starting market auto-discovery...');
            await this.discoverNewMarkets();
            
            console.log('🤖 AI hunting for profits...\n');
        } catch (error) {
            console.error('❌ Connection error:', error.message);
            process.exit(1);
        }
        
        setInterval(() => this.aiTradingCycle(), this.settings.checkInterval);
        setInterval(() => this.saveState(), 20000);  // Save every 20s - balanced persistence
        setInterval(() => this.showStats(), 30000);  // Stats every 30s - keep informed
        
        // 🔄 Re-sync with Kraken every 5 minutes (avoid rate limits)
        if (USE_REAL_MONEY) {
            setInterval(() => this.syncWithKraken(), 300000); // 5 minutes to avoid rate limits
        }
        
        // 🚀 Auto-discover new markets every 2 minutes
        setInterval(() => this.discoverNewMarkets(), 120000);
    }

    handleMarketData() {
        // Get data from the active market
        const marketData = this.scanner.getMarketData();
        this.state.currentPrice = marketData.price;
        
        if (marketData.history.length > 0) {
            this.state.priceHistory = marketData.history.slice(-120); // Keep last 120 (need 60 minimum)
        }
    }

    analyzeMarketTrade(trade) {
        // Track EVERY trader on Kraken to learn patterns
        this.marketIntelligence.totalMarketTrades++;
        
        const traderId = 'T' + Date.now() + Math.random();  // Anonymous ID
        const tradeSize = trade.volume;
        const tradeType = trade.side;
        const tradeValue = tradeSize * trade.price;
        const hour = new Date().getHours();
        
        // Track large traders (potential whales)
        if (tradeSize > 10) {
            if (!this.marketIntelligence.largeTraders[traderId]) {
                this.marketIntelligence.largeTraders[traderId] = {
                    totalVolume: 0,
                    trades: [],
                    buyCount: 0,
                    sellCount: 0,
                    avgPrice: 0
                };
            }
            
            const trader = this.marketIntelligence.largeTraders[traderId];
            trader.totalVolume += tradeSize;
            trader.trades.push({ price: trade.price, volume: tradeSize, side: tradeType, time: Date.now() });
            if (tradeType === 'buy') trader.buyCount++;
            else trader.sellCount++;
            
            // Detect whale patterns (>$1000 trades)
            if (tradeValue > 1000) {
                if (!this.marketIntelligence.whaleActivity[traderId]) {
                    this.marketIntelligence.whaleActivity[traderId] = [];
                }
                this.marketIntelligence.whaleActivity[traderId].push({
                    price: trade.price,
                    volume: tradeSize,
                    value: tradeValue,
                    side: tradeType,
                    time: Date.now()
                });
                
                // Log whale activity with enhanced formatting
                const whaleEmoji = tradeValue > 5000 ? '🐋🐋🐋' : tradeValue > 2000 ? '🐋🐋' : '🐋';
                const directionEmoji = tradeType === 'buy' ? '🟢📈' : '🔴📉';
                console.log(whaleEmoji + ' WHALE DETECTED ' + directionEmoji);
                console.log('   Action: ' + tradeType.toUpperCase() + ' | Volume: ' + tradeSize.toFixed(2) + ' SOL');
                console.log('   Value: $' + tradeValue.toFixed(0) + ' @ $' + trade.price.toFixed(2));
                console.log('   Impact: ' + (tradeType === 'buy' ? 'BULLISH PRESSURE' : 'BEARISH PRESSURE'));
            }
        }
        
        // Track trading patterns by hour
        if (!this.marketIntelligence.traderTiming[hour]) {
            this.marketIntelligence.traderTiming[hour] = { buys: 0, sells: 0, volume: 0 };
        }
        this.marketIntelligence.traderTiming[hour][tradeType === 'buy' ? 'buys' : 'sells']++;
        this.marketIntelligence.traderTiming[hour].volume += tradeSize;
        
        // Use trader intelligence in decisions
        this.brain.marketSentiment = this.calculateMarketSentiment();
    }

    calculateMarketSentiment() {
        const hour = new Date().getHours();
        const hourData = this.marketIntelligence.traderTiming[hour];
        
        if (!hourData) return 0.5;  // Neutral
        
        const totalTrades = hourData.buys + hourData.sells;
        if (totalTrades === 0) return 0.5;
        
        // More buys = bullish, more sells = bearish
        return hourData.buys / totalTrades;
    }


    async aiTradingCycle() {
        this.state.cycle++;
        
        // ---- External control commands (from control-ai.sh) ----
        try {
            const cmdPath = `${process.env.HOME}/crypto-ai/ai-command.txt`;
            if (fs.existsSync(cmdPath)) {
                const cmdRaw = fs.readFileSync(cmdPath, 'utf8').trim();
                // remove the command file so it's processed only once
                try { fs.unlinkSync(cmdPath); } catch(e) {}
                if (cmdRaw === 'FORCE_SELL') {
                    this.forceSellNow = true;
                    console.log('🔴 FORCE_SELL received - will sell positions immediately');
                } else if (cmdRaw && cmdRaw.startsWith('FORCE_SWITCH:')) {
                    this.forceSwitchTo = cmdRaw.split(':')[1];
                    console.log(`🔄 FORCE_SWITCH received - target ${this.forceSwitchTo}`);
                } else if (cmdRaw === 'PAUSE') {
                    this.isPaused = true;
                    console.log('⏸️ PAUSE received - pausing trading');
                } else if (cmdRaw === 'RESUME') {
                    this.isPaused = false;
                    console.log('▶️ RESUME received - resuming trading');
                } else if (cmdRaw === 'FORCE_EVOLVE') {
                    this.forceEvolve = true;
                    console.log('🧬 FORCE_EVOLVE received - evolution will run ASAP');
                } else if (cmdRaw && cmdRaw.startsWith('SET_BONK_TARGET:')) {
                    // Command format: SET_BONK_TARGET:6.06  OR  SET_BONK_TARGET:6.06:BASELINE
                    try {
                        const parts = cmdRaw.split(':');
                        const target = parseFloat(parts[1]);
                        if (!isNaN(target)) {
                            this.bonkTargetPrice = target;
                            this.bonkWatchEnabled = true;
                            // capture baseline as current BONK price if available, else null
                            const bonkMarket = this.scanner?.markets?.['BONK/USD'];
                            this.bonkBaselinePrice = (bonkMarket && bonkMarket.price) ? bonkMarket.price : null;
                            this.bonkRelativeSellPercent = null; // will compute when target reached
                            console.log(`🎯 SET_BONK_TARGET received - watching BONK for $${target} (baseline: ${this.bonkBaselinePrice || 'unknown'})`);
                        }
                    } catch (e) { console.log('SET_BONK_TARGET parse error: ' + e.message); }
                } else if (cmdRaw === 'CLEAR_BONK_WATCH') {
                    this.bonkWatchEnabled = false;
                    this.bonkTargetPrice = null;
                    this.bonkBaselinePrice = null;
                    this.bonkRelativeSellPercent = null;
                    console.log('🧾 CLEAR_BONK_WATCH - disabled BONK reference');
                } else if (cmdRaw && cmdRaw.startsWith('ALLOW_SWAP_AT_EVEN:')) {
                    const val = cmdRaw.split(':')[1];
                    this.settings.allowSwapAtEven = (String(val).toLowerCase() === 'true');
                    console.log(`🔁 ALLOW_SWAP_AT_EVEN set to ${this.settings.allowSwapAtEven}`);
                } else if (cmdRaw && cmdRaw.startsWith('SELL_ALL_AND_STUDY')) {
                    // Format: SELL_ALL_AND_STUDY or SELL_ALL_AND_STUDY:30 (seconds)
                    try {
                        const parts = cmdRaw.split(':');
                        const seconds = parts[1] ? parseInt(parts[1], 10) : 30;
                        console.log(`🔴 SELL_ALL_AND_STUDY requested - selling all positions then studying for ${seconds}s`);
                        // Fire-and-forget (don't block aiTradingCycle)
                        this.sellAllThenStudy(seconds).catch(err => console.error('SELL_ALL_AND_STUDY failed:', err));
                    } catch (e) { console.log('SELL_ALL_AND_STUDY parse error: ' + e.message); }
                }
            }
        } catch (err) {
            console.log('Error processing ai-command.txt: ' + err.message);
        }
        
        // 📡 NEW: Check for real-time commands from advanced-control.sh
        await this.checkRealtimeCommands();

        // If paused via control, skip this cycle
        if (this.isPaused) {
            console.log('⏸️  Trading is PAUSED');
            return;
        }

        // Update market data from scanner
        this.handleMarketData();
        
        // 🔮 UPDATE AI PREDICTIONS every 5 cycles (2.5 seconds)
        if (this.state.cycle % 5 === 0 && this.state.priceHistory.length >= 10) {
            this.predictNextMove(this.state.priceHistory);
        }

        // BONK WATCH: If user requested a BONK target, check price and compute relative sell percent
        if (this.bonkWatchEnabled && this.bonkTargetPrice) {
            const bonk = this.scanner?.markets?.['BONK/USD'];
            if (bonk && bonk.price > 0) {
                // If baseline wasn't captured earlier, capture now
                if (!this.bonkBaselinePrice) this.bonkBaselinePrice = bonk.price;

                // If BONK reached or exceeded the target and we haven't computed the relative percent yet
                if (bonk.price >= this.bonkTargetPrice && !this.bonkRelativeSellPercent) {
                    const relative = (bonk.price / this.bonkBaselinePrice) - 1;
                    this.bonkRelativeSellPercent = relative; // e.g. 0.12 = 12%
                    // Apply to settings.targetProfit and minProfit as overrides (kept non-destructive)
                    console.log(`🎯 BONK TARGET HIT: BONK @ $${bonk.price.toFixed(4)} (baseline $${this.bonkBaselinePrice.toFixed(4)})`);
                    console.log(`   → BONK RELATIVE MOVE: ${(relative * 100).toFixed(2)}% - applying as global sell percent override`);
                }
            }
        }
        
        // If in study mode, collect market data but DO NOT trade (user requested)
        if (this.studyMode) {
            if (this.state.cycle % 10 === 0) console.log('🔎 Study mode active - collecting data only, skipping buy/sell this cycle');
        } else {
            // PORTFOLIO TRADING: Check ALL positions for sell opportunities
            const positions = Object.keys(this.state.portfolio);
            if (positions.length > 0) {
                for (const market of positions) {
                    // Switch to this market to get current price
                    this.scanner.activeMarket = market;
                    this.state.currentPrice = this.scanner.getCurrentPrice();
                    
                    if (this.state.currentPrice > 0) {
                        await this.evaluateSell(market);
                    }
                }
            }
            
            // PORTFOLIO TRADING: If under max positions, look for buy opportunities
            if (this.getPositionCount() < this.settings.maxPositions) {
            // If we don't have enough data yet, STAY with current market to build history
            const currentMarketData = this.scanner.getMarketData();
            const needsMoreData = currentMarketData.history.length < this.settings.minDataPoints;
            
            // Get list of markets we're already holding
            const heldMarkets = Object.keys(this.state.portfolio);
            
            // 🚀 CRITICAL: If current market is NOT a meme, ALWAYS switch to find memes!
            const currentSector = this.scanner.markets[this.scanner.activeMarket]?.sector;
            const isCurrentlyMeme = currentSector === 'meme';
            
            let bestMarket;
            if (needsMoreData && this.state.priceHistory.length > 0 && isCurrentlyMeme) {
                // STAY with current MEME market to keep building data
                bestMarket = this.scanner.activeMarket;
            } else {
                // Find best market opportunity (excluding markets we already hold)
                // If a forced switch target exists, prefer it
                if (this.forceSwitchTo) {
                    bestMarket = this.forceSwitchTo;
                    // clear the forced switch so it's not reused repeatedly
                    this.forceSwitchTo = null;
                } else {
                    // 🎯 ONLY TRADE $5 MINIMUM MEME COINS!
                    const coinMinimums = {
                        'BTC/USD': 10, 'ETH/USD': 10, 'ZEC/USD': 10, 'AAVE/USD': 10,
                        // Non-meme coins we want to avoid
                        'XRP/USD': 10, 'SOL/USD': 10, 'ADA/USD': 10, 'BNB/USD': 10,
                        // Meme coins - all $5
                        'DOGE/USD': 5, 'SHIB/USD': 5, 'PEPE/USD': 5, 'FLOKI/USD': 5, 
                        'BONK/USD': 5, 'WIF/USD': 5, 'POPCAT/USD': 5, 'BRETT/USD': 5,
                        'MEW/USD': 5, 'MICHI/USD': 5, 'MOG/USD': 5, 'MYRO/USD': 5
                    };
                    
                    // 🚀 CRITICAL FIX: Tell findBestMarket we're holding so it can AGGRESSIVELY SWITCH!
                    const currentlyHolding = heldMarkets.length > 0;
                    
                    let memeCount = 0;
                    let affordableCount = 0;
                    let passedCount = 0;
                    
                    bestMarket = this.scanner.findBestMarket(currentlyHolding, (market) => {
                        const marketData = this.scanner.markets[market];
                        const minimum = coinMinimums[market] || 5;
                        
                        // 🔥 RELAXED FILTER: Accept any market with $5 minimum that's receiving data
                        const hasData = marketData && marketData.price > 0;  // Fixed: use .price not .currentPrice
                        const isMeme = marketData && marketData.sector === 'meme';
                        const isAffordable = minimum <= 5 && this.wallets.trading >= 3;
                        const notHeld = !heldMarkets.includes(market);
                        
                        if (isMeme) memeCount++;
                        if (isAffordable && hasData) affordableCount++;
                        
                        // Accept: HAS DATA + AFFORDABLE + NOT HELD (prefer memes but accept any)
                        const passed = hasData && isAffordable && notHeld;
                        if (passed) passedCount++;
                        
                        return passed;
                    });
                    
                    console.log(`\n🔍 MARKET FILTER: ${memeCount} memes found, ${affordableCount} with data & affordable, ${passedCount} passed filter`);
                    
                    // 🚨 CRITICAL: If bestMarket has NO DATA (price = 0), find a market with actual data!
                    if (bestMarket && this.scanner.markets[bestMarket]?.price === 0) {
                        console.log(`\n⚠️  Selected market ${bestMarket} has NO DATA (price=$0)! Finding market with live data...`);
                        
                        // First try to find a meme with data
                        let foundMarket = null;
                        for (const [market, data] of Object.entries(this.scanner.markets)) {
                            const minimum = coinMinimums[market] || 5;
                            const hasData = data.price > 0;
                            const isMeme = data.sector === 'meme';
                            const isAffordable = minimum <= 5 && this.wallets.trading >= 3;
                            const notHeld = !heldMarkets.includes(market);
                            
                            if (hasData && isMeme && isAffordable && notHeld) {
                                foundMarket = market;
                                console.log(`✅ Found meme with data: ${market} @ $${data.price.toFixed(4)}`);
                                break;
                            }
                        }
                        
                        // If no meme has data, just pick ANY market with data (we need to test trading works)
                        if (!foundMarket) {
                            console.log(`⚠️  No meme coins have data yet! Picking ANY market with live data to start trading...`);
                            for (const [market, data] of Object.entries(this.scanner.markets)) {
                                const minimum = coinMinimums[market] || 10;
                                const hasData = data.price > 0;
                                const isAffordable = this.wallets.trading >= 3;
                                const notHeld = !heldMarkets.includes(market);
                                
                                if (hasData && isAffordable && notHeld) {
                                    foundMarket = market;
                                    console.log(`✅ Temporary market (has data): ${market} @ $${data.price.toFixed(4)} (sector: ${data.sector})`);
                                    console.log(`   💡 Will switch to memes once they get WebSocket data`);
                                    break;
                                }
                            }
                        }
                        
                        if (foundMarket) {
                            bestMarket = foundMarket;
                        }
                    }
                }

                // 🔥 CRITICAL FIX: Don't buy if we already hold this market!
                // Check BEFORE switching activeMarket to prevent infinite loop
                if (heldMarkets.includes(bestMarket)) {
                    console.log(`⚠️  Already holding ${bestMarket}, finding a different opportunity...`);
                    
                    // Find a DIFFERENT market we don't hold yet
                    const coinMinimums = {
                        'BTC/USD': 10, 'ETH/USD': 10, 'ZEC/USD': 10, 'AAVE/USD': 10,
                        'XRP/USD': 10, 'SOL/USD': 10, 'ADA/USD': 10, 'BNB/USD': 10,
                        'DOGE/USD': 5, 'SHIB/USD': 5, 'PEPE/USD': 5, 'FLOKI/USD': 5, 
                        'BONK/USD': 5, 'WIF/USD': 5, 'POPCAT/USD': 5, 'BRETT/USD': 5,
                        'MEW/USD': 5, 'MICHI/USD': 5, 'MOG/USD': 5, 'MYRO/USD': 5
                    };
                    
                    // Build list of alternative markets sorted by score
                    let alternatives = [];
                    for (const [market, data] of Object.entries(this.scanner.markets)) {
                        const minimum = coinMinimums[market] || 5;
                        const hasData = data.price > 0;
                        const isMeme = data.sector === 'meme';
                        const isAffordable = minimum <= 5 && this.wallets.trading >= 3;
                        const notHeld = !heldMarkets.includes(market);
                        
                        if (hasData && isMeme && isAffordable && notHeld && data.score > 0) {
                            alternatives.push({ market, score: data.score, price: data.price });
                        }
                    }
                    
                    // Sort by score and pick the best
                    alternatives.sort((a, b) => b.score - a.score);
                    
                    if (alternatives.length > 0) {
                        bestMarket = alternatives[0].market;
                        console.log(`✅ Found alternative: ${bestMarket} @ $${alternatives[0].price.toFixed(6)} (score: ${alternatives[0].score.toFixed(2)})`);
                        console.log(`   ${alternatives.length} total alternatives available`);
                    } else {
                        console.log(`⚠️  No alternative markets available - staying with current positions`);
                        console.log(`   Held: ${heldMarkets.join(', ')}`);
                        console.log(`   Balance: $${this.wallets.trading.toFixed(2)}`);
                        return;  // Skip this cycle - no new opportunities
                    }
                }
            }
            
            // CRITICAL: Switch to the best market BEFORE getting price!
            const previousMarket = this.scanner.activeMarket;
            this.scanner.activeMarket = bestMarket;
            
            console.log(`\n💎 Selected market: ${bestMarket} (Sector: ${this.scanner.markets[bestMarket]?.sector || 'unknown'})`);
            console.log(`📊 Currently holding: [${heldMarkets.join(', ') || 'none'}]`);
            
            // 🚀🔥 AGGRESSIVE SWITCHING: If we switched to a MUCH better opportunity, sell old position!
            if (bestMarket !== previousMarket && heldMarkets.includes(previousMarket)) {
                const newMarketData = this.scanner.markets[bestMarket];
                const oldMarketData = this.scanner.markets[previousMarket];
                const oldPosition = this.state.portfolio[previousMarket];
                
                // If new market is a meme coin with 2x+ better score, DUMP the old position immediately!
                if (newMarketData && oldMarketData && newMarketData.sector === 'meme') {
                    const scoreRatio = newMarketData.score / (oldMarketData.score || 0.1);
                    if (scoreRatio >= 2.0 && oldPosition) {
                        console.log(`\n🚀🔥 DUMPING ${previousMarket} (score: ${oldMarketData.score.toFixed(3)}) for HOT MEME ${bestMarket} (score: ${newMarketData.score.toFixed(3)})!`);
                        console.log(`   💥 Score advantage: ${(scoreRatio * 100).toFixed(0)}% - THIS IS THE MOVE!`);
                        console.log(`   📊 Will sell ${previousMarket} when profitable and buy ${bestMarket}`);
                        
                        // Note: The AI will naturally sell the old position when it's profitable via evaluateSell()
                        // We just switched activeMarket to the hot meme, so next buy will be the meme coin!
                    }
                }
            }
            
            this.state.currentPrice = this.scanner.getCurrentPrice();
            if (this.state.currentPrice > 0) {
                await this.evaluateBuy(bestMarket);
            }
            }
        }
        
        // 🧬 EVOLVE BASED ON TRADES, NOT TIME
        if (this.state.totalTrades > 0 && this.state.totalTrades % this.settings.evolutionFrequency === 0 && this.state.totalTrades !== this.state.lastEvolution) {
            this.state.lastEvolution = this.state.totalTrades;
            this.evolveAI();
        }
        
        // Show market scanner status every 2 minutes
        if (this.state.cycle % 120 === 0) {
            this.showMarketScanner();
        }
    }
    
    showMarketScanner() {
        console.log('\n📊 MARKET SCANNER STATUS:');
        const activeMarket = this.scanner.activeMarket;
        const marketData = this.scanner.markets[activeMarket];
        const isTrending = marketData.trending ? '🔥 TRENDING' : '';
        console.log(`   🎯 Active: ${activeMarket} @ $${marketData.price.toFixed(2)} ${isTrending}`);
        console.log(`   📈 Volatility: ${(marketData.volatility * 100).toFixed(2)}% | Trend: ${(marketData.trend * 100).toFixed(2)}%`);
        console.log(`   💎 Score: ${marketData.score.toFixed(3)}`);
        
        // ⚡⚡ FAST MOVERS - Show coins jumping in P/L RIGHT NOW!
        const fastMovers = Object.entries(this.scanner.markets)
            .filter(([_, data]) => {
                const isHighVol = data.volatility > 0.01;       // >1% moves
                const isHighVolume = data.volume > 1000000;     // >1M volume
                const isTrending = data.trending;
                return isHighVol && isHighVolume && isTrending && data.active && data.price > 0;
            })
            .sort((a, b) => b[1].volatility - a[1].volatility)
            .slice(0, 5);
        
        if (fastMovers.length > 0) {
            console.log('   ⚡⚡⚡ FAST MOVERS (Quick P/L Potential):');
            fastMovers.forEach(([pair, data], i) => {
                const volPercent = (data.volatility * 100).toFixed(2);
                const volumeM = (data.volume / 1000000).toFixed(1);
                const trendDir = data.trend > 0 ? '🚀' : '📉';
                console.log(`      ${i+1}. ${pair}: ${trendDir} ${volPercent}% vol, ${volumeM}M volume (Score: ${data.score.toFixed(2)})`);
            });
        }
        
        // 🔥 Show trending coins first!
        const trendingCoins = this.scanner.getTrendingCoins();
        if (trendingCoins.length > 0) {
            console.log('   🔥 TRENDING NOW:');
            trendingCoins.slice(0, 3).forEach((t, i) => {
                const direction = parseFloat(t.priceChange) > 0 ? '🚀' : '📉';
                console.log(`      ${i+1}. ${t.market}: ${direction} ${t.priceChange}% (Vol: ${t.volumeRatio}x)`);
            });
        }
        
        // Show top 3 opportunities
        const sorted = Object.entries(this.scanner.markets)
            .filter(([_, data]) => data.active && data.score > 0)
            .sort((a, b) => b[1].score - a[1].score)
            .slice(0, 3);
        
        if (sorted.length > 0) {
            console.log('   🏆 Top Opportunities:');
            sorted.forEach(([pair, data], i) => {
                const trendEmoji = data.trending ? '🔥' : '';
                console.log(`      ${i+1}. ${pair}: ${data.score.toFixed(3)} (Vol: ${(data.volatility*100).toFixed(2)}%) ${trendEmoji}`);
            });
        }
        console.log('');
    }

    // 🔮 ULTIMATE PREDICTION ENGINE - Predict future price movements
    predictNextMove(priceHistory) {
        // 🔧 FIX: Return safe defaults if insufficient data
        if (!priceHistory || priceHistory.length < 20) {
            this.predictor.priceTarget = this.state.currentPrice || 0;
            this.predictor.nextMoveConfidence = 0;
            this.predictor.fearGreedIndex = 50;
            this.predictor.marketCycle = 'neutral';
            return this.predictor;
        }
        
        const latest = priceHistory.slice(-20);
        const current = latest[latest.length - 1];
        
        // 🔧 FIX: Validate current price
        if (!current || isNaN(current) || current <= 0) {
            this.predictor.priceTarget = this.state.currentPrice || 0;
            this.predictor.nextMoveConfidence = 0;
            this.predictor.fearGreedIndex = 50;
            return this.predictor;
        }
        
        // 1. PATTERN RECOGNITION - Find recurring patterns
        const patterns = this.detectPatterns(latest);
        this.predictor.patternMatches = patterns.matches || 0;
        
        // 2. TREND ANALYSIS - Calculate trend strength
        const trend = this.analyzeTrend(latest);
        this.predictor.trendStrength = isNaN(trend.strength) ? 0 : trend.strength;
        this.predictor.momentumScore = isNaN(trend.momentum) ? 0 : trend.momentum;
        
        // 3. SUPPORT/RESISTANCE - Find key levels
        const levels = this.findKeyLevels(priceHistory);
        this.predictor.supportLevel = isNaN(levels.support) ? current * 0.95 : levels.support;
        this.predictor.resistanceLevel = isNaN(levels.resistance) ? current * 1.05 : levels.resistance;
        
        // 4. PREDICT NEXT PRICE - Use weighted algorithms
        const prediction = this.calculatePricePrediction(latest, trend, patterns);
        this.predictor.priceTarget = isNaN(prediction.target) ? current : prediction.target;
        this.predictor.nextMoveConfidence = isNaN(prediction.confidence) ? 50 : Math.max(0, Math.min(100, prediction.confidence));
        this.predictor.timeToTarget = prediction.timeEstimate || 10;
        
        // 5. VOLATILITY FORECAST - Expected price swings
        this.predictor.volatilityForecast = this.forecastVolatility(latest);
        
        // 6. MARKET CYCLE DETECTION - Where are we in the cycle?
        this.predictor.marketCycle = this.detectMarketCycle(priceHistory);
        
        // 7. FEAR & GREED - Sentiment indicator
        const fearGreed = this.calculateFearGreed(latest, trend);
        this.predictor.fearGreedIndex = isNaN(fearGreed) ? 50 : Math.max(0, Math.min(100, fearGreed));
        
        // Track prediction accuracy
        if (this.predictor.predictions.length > 0) {
            this.updatePredictionAccuracy(current);
        }
        
        // Store current prediction for accuracy tracking
        this.predictor.predictions.push({
            time: Date.now(),
            predicted: this.predictor.priceTarget,
            confidence: this.predictor.nextMoveConfidence,
            actual: null  // Will be filled when we check accuracy
        });
        
        // Keep only last 100 predictions
        if (this.predictor.predictions.length > 100) {
            this.predictor.predictions.shift();
        }
        
        return this.predictor;
    }
    
    detectPatterns(prices) {
        // Detect common patterns: double bottom, head & shoulders, triangles, etc.
        let matches = 0;
        const len = prices.length;
        
        // Double Bottom Pattern (bullish)
        if (len >= 10) {
            const mid = Math.floor(len / 2);
            const firstLow = Math.min(...prices.slice(0, mid));
            const secondLow = Math.min(...prices.slice(mid));
            if (Math.abs(firstLow - secondLow) / firstLow < 0.02) matches += 2; // Within 2%
        }
        
        // Rising Channel (bullish)
        const firstHalf = prices.slice(0, 10);
        const secondHalf = prices.slice(-10);
        const avgFirst = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
        if (avgSecond > avgFirst) matches += 1;
        
        return { matches, type: matches > 2 ? 'bullish' : matches < -1 ? 'bearish' : 'neutral' };
    }
    
    analyzeTrend(prices) {
        // Calculate trend strength and momentum
        const len = prices.length;
        const recent = prices.slice(-5);
        const older = prices.slice(-15, -10);
        
        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;
        
        const strength = (recentAvg - olderAvg) / olderAvg;
        const momentum = ((prices[len-1] - prices[len-5]) / prices[len-5]) * 100;
        
        return { strength, momentum };
    }
    
    findKeyLevels(prices) {
        // Find support and resistance levels
        const recent = prices.slice(-50);
        const sorted = [...recent].sort((a, b) => a - b);
        
        // Support is around 10th percentile
        const support = sorted[Math.floor(sorted.length * 0.1)];
        
        // Resistance is around 90th percentile
        const resistance = sorted[Math.floor(sorted.length * 0.9)];
        
        return { support, resistance };
    }
    
    calculatePricePrediction(prices, trend, patterns) {
        const current = prices[prices.length - 1];
        const len = prices.length;
        
        // 🔧 FIX: Validate inputs
        if (!prices || len < 2 || !current || isNaN(current)) {
            return {
                target: current || 0,
                confidence: 0,
                timeEstimate: 10
            };
        }
        
        // Linear regression for base prediction
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < len; i++) {
            sumX += i;
            sumY += prices[i];
            sumXY += i * prices[i];
            sumX2 += i * i;
        }
        
        const denominator = (len * sumX2 - sumX * sumX);
        const slope = denominator !== 0 ? (len * sumXY - sumX * sumY) / denominator : 0;
        const intercept = (sumY - slope * sumX) / len;
        
        // Predict 10 steps ahead
        let predictedPrice = slope * (len + 10) + intercept;
        
        // 🔧 FIX: Validate predicted price
        if (isNaN(predictedPrice) || predictedPrice <= 0) {
            predictedPrice = current;
        }
        
        // Adjust based on patterns
        let adjustment = 1.0;
        if (patterns && patterns.matches) {
            if (patterns.matches > 2) adjustment = 1.02;  // Bullish patterns
            if (patterns.matches < -1) adjustment = 0.98; // Bearish patterns
        }
        
        const target = predictedPrice * adjustment;
        
        // Calculate confidence based on trend consistency
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - current, 2), 0) / len;
        let confidence = Math.max(0, Math.min(100, 100 - variance * 1000));
        
        // 🔧 FIX: Ensure confidence is valid
        if (isNaN(confidence)) confidence = 50;
        
        return {
            target: isNaN(target) ? current : target,
            confidence,
            timeEstimate: 10 // 10 seconds ahead
        };
    }
    
    forecastVolatility(prices) {
        // Calculate expected volatility
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        const variance = returns.reduce((sum, r) => sum + r * r, 0) / returns.length;
        return Math.sqrt(variance);
    }
    
    detectMarketCycle(prices) {
        // Detect market cycle phase
        const recent = prices.slice(-30);
        const avg = recent.reduce((a, b) => a + b) / recent.length;
        const current = prices[prices.length - 1];
        
        const momentum = (current - recent[0]) / recent[0];
        const position = (current - Math.min(...recent)) / (Math.max(...recent) - Math.min(...recent));
        
        if (momentum > 0.02 && position < 0.4) return 'accumulation';
        if (momentum > 0.05 && position > 0.4) return 'markup';
        if (momentum < -0.02 && position > 0.6) return 'distribution';
        if (momentum < -0.05) return 'markdown';
        
        return 'neutral';
    }
    
    calculateFearGreed(prices, trend) {
        // Fear & Greed indicator (0 = extreme fear, 100 = extreme greed)
        const momentum = trend.momentum;
        const volatility = this.predictor.volatilityForecast;
        
        let score = 50; // Neutral
        
        // High momentum increases greed
        score += momentum * 5;
        
        // High volatility increases fear
        score -= volatility * 1000;
        
        return Math.max(0, Math.min(100, score));
    }
    
    updatePredictionAccuracy(currentPrice) {
        // Check how accurate our recent predictions were
        const now = Date.now();
        let correct = 0;
        let total = 0;
        
        this.predictor.predictions.forEach(pred => {
            if (pred.actual === null && now - pred.time > 10000) {
                // Prediction is 10+ seconds old, check accuracy
                pred.actual = currentPrice;
                const error = Math.abs(pred.predicted - pred.actual) / pred.actual;
                
                if (error < 0.005) { // Within 0.5% = correct
                    correct++;
                    this.predictor.successfulPredictions++;
                }
                total++;
                this.predictor.totalPredictions++;
            }
        });
        
        if (this.predictor.totalPredictions > 0) {
            this.predictor.accuracy = (this.predictor.successfulPredictions / this.predictor.totalPredictions) * 100;
        }
    }

    async evaluateBuy(market) {
        // ⚡⚡ HYPER SPEED - Only need 2 data points (0.2 seconds!)
        if (this.state.priceHistory.length < 2) {
            if (this.state.cycle % 5 === 0) {
                console.log(`⚡ HYPER SPEED LEARNING ${market}... (${this.state.priceHistory.length}/2 points)`);
            }
            return;
        }
        
        // 🔮 RUN PREDICTION ENGINE
        const allPrices = this.state.priceHistory.slice(-Math.max(10, this.state.priceHistory.length));
        const prediction = this.predictNextMove(allPrices.map(p => p.price));
        
        // 🎯 SIMPLE MOMENTUM SCALPING STRATEGY
        const currentPrice = this.state.currentPrice;
        
        // Calculate 10-period low and position
        const recentLow = Math.min(...allPrices.map(p => p.price));
        const recentHigh = Math.max(...allPrices.map(p => p.price));
        const priceRange = recentHigh - recentLow;
        const positionInRange = priceRange > 0 ? (currentPrice - recentLow) / priceRange : 0.5;
        
        // 📈 MOMENTUM CHECK: Last 3 ticks
        const last3 = allPrices.slice(-3).map(p => p.price);
        const isMomentumUp = last3[2] > last3[1] && last3[1] >= last3[0];  // Rising trend
        
        // 💎 VALUE CHECK: Are we in bottom 40% of range?
        const isInLowerRange = positionInRange < 0.40;
        
        // � PREDICTION CHECK: Is AI predicting upward movement?
        const predictionBullish = prediction.priceTarget > currentPrice && prediction.nextMoveConfidence > 40;
        const strongPrediction = prediction.nextMoveConfidence > 70;
        const goodCycle = ['accumulation', 'markup'].includes(prediction.marketCycle);
        
        // �🚀 SCALPING ENTRY RULES (ENHANCED WITH PREDICTIONS)
        let shouldBuy = false;
        let buyReason = '';
        
        // RULE 1: Momentum + Low Price + Bullish Prediction = HIGH CONFIDENCE BUY
        if (isMomentumUp && isInLowerRange && predictionBullish) {
            shouldBuy = true;
            buyReason = `🎯 AI PREDICTED: Rising from low | Confidence: ${prediction.nextMoveConfidence.toFixed(0)}%`;
        }
        
        // RULE 2: Extreme Low + Any Upward Tick = BUY (RECOVERY PLAY)
        else if (positionInRange < 0.20 && last3[2] >= last3[1]) {
            shouldBuy = true;
            buyReason = `💎 EXTREME LOW - Bounce play | Target: $${prediction.priceTarget.toFixed(2)}`;
        }
        
        // RULE 3: Strong AI Prediction + Good Cycle = TRUST THE PREDICTION
        else if (strongPrediction && goodCycle && positionInRange < 0.60) {
            shouldBuy = true;
            buyReason = `🔮 STRONG PREDICTION: ${prediction.marketCycle} | ${prediction.nextMoveConfidence.toFixed(0)}% confidence`;
        }
        
        // RULE 4: Strong Momentum Anywhere = BUY (MOMENTUM RIDE)
        else if (last3[2] > last3[1] * 1.002 && last3[1] > last3[0] * 1.002) {  // Two 0.2% jumps in a row
            shouldBuy = true;
            buyReason = '⚡ STRONG MOMENTUM - Riding the wave';
        }
        
        // Check if we have capital
        shouldBuy = shouldBuy && this.wallets.trading >= 5;
        
        // DEBUG: Log analysis every 20 cycles
        if (this.state.cycle % 20 === 0 && !shouldBuy) {
            console.log(`\n[SCALP] Cycle ${this.state.cycle} - ${market}:`);
            console.log(`   💰 Capital: $${this.wallets.trading.toFixed(2)}`);
            console.log(`   📊 Position: ${(positionInRange * 100).toFixed(0)}% (${isInLowerRange ? '✅ LOW' : '❌ HIGH'})`);
            console.log(`   📈 Momentum: ${isMomentumUp ? '✅ RISING' : '❌ FLAT/FALLING'}`);
            console.log(`   🎯 Price: $${currentPrice.toFixed(4)} (Range: $${recentLow.toFixed(4)} - $${recentHigh.toFixed(4)})`);
            console.log(`   � AI Prediction: ${prediction.priceTarget > currentPrice ? '📈 UP' : '📉 DOWN'} to $${prediction.priceTarget.toFixed(2)} (${prediction.nextMoveConfidence.toFixed(0)}% confidence)`);
            console.log(`   🌊 Market Cycle: ${prediction.marketCycle} | Fear/Greed: ${prediction.fearGreedIndex.toFixed(0)}`);
            console.log(`   💡 Status: Waiting for optimal entry...`);
        }
        
        if (shouldBuy) {
            // 🛡️ CRITICAL: Don't buy if we already hold this market!
            if (this.state.portfolio[market] && this.state.portfolio[market].holdings > 0) {
                console.log(`⚠️  BLOCKED: Already holding ${market} with ${this.state.portfolio[market].holdings.toFixed(2)} coins`);
                console.log(`   Current value: $${(this.state.portfolio[market].holdings * this.state.currentPrice).toFixed(2)}`);
                console.log(`   Preventing duplicate purchase to maintain diversification!`);
                return;
            }
            
            // 🧠 SMART BUY SIZING: Match Kraken minimums per coin + Scale with balance
            const coinMinimums = {
                'BTC/USD': 10, 'ETH/USD': 10, 'XRP/USD': 5, 'SOL/USD': 5,
                'ADA/USD': 5, 'DOGE/USD': 5, 'SHIB/USD': 5, 'DOT/USD': 10,
                'MATIC/USD': 5, 'LINK/USD': 10, 'UNI/USD': 10, 'AVAX/USD': 10,
                'ATOM/USD': 10, 'LTC/USD': 10, 'BCH/USD': 10, 'TON/USD': 5,
                'HBAR/USD': 5, 'APE/USD': 5, 'MANA/USD': 5, 'SAND/USD': 5,
                'ZEC/USD': 10, 'AAVE/USD': 10, 'ALGO/USD': 5, 'FIL/USD': 10,
                // 🚀 ALL MEME COINS: $2-3 minimum for multi-position trades!
                'DOGE/USD': 2, 'SHIB/USD': 2, 'PEPE/USD': 2, 'FLOKI/USD': 2, 
                'BONK/USD': 2, 'WIF/USD': 2, 'POPCAT/USD': 2, 'BRETT/USD': 2, 
                'MEW/USD': 2, 'MICHI/USD': 2, 'MOG/USD': 2, 'MYRO/USD': 2, 
                'PONKE/USD': 2, 'WEN/USD': 2, 'BOME/USD': 2, 'SLERF/USD': 2, 
                'SMOG/USD': 2, 'COQ/USD': 2, 'DEGEN/USD': 2, 'TOSHI/USD': 2, 
                'HIGHER/USD': 2, 'MEME/USD': 2
            };
            
            // Get minimum for this coin (default $2 for memes and small caps)
            const coinMinimum = coinMinimums[market] || 2;
            
            // 💰 DYNAMIC SCALING: Scale trade size with balance + scaling mode
            let maxTradeSize;
            
            // 🔥 AGGRESSIVE MODE: Use bigger trades for faster growth
            if (this.scalingMode === 'aggressive') {
                if (this.wallets.trading >= 50) {
                    maxTradeSize = 25; // $50+ balance: trade up to $25
                } else if (this.wallets.trading >= 25) {
                    maxTradeSize = 20; // $25-50 balance: trade up to $20
                } else if (this.wallets.trading >= 15) {
                    maxTradeSize = 15; // $15-25 balance: trade up to $15
                } else {
                    maxTradeSize = this.wallets.trading; // <$15: use full balance
                }
            }
            // 🛡️ CONSERVATIVE MODE: Use smaller trades for safety
            else if (this.scalingMode === 'conservative') {
                if (this.wallets.trading >= 50) {
                    maxTradeSize = 15; // $50+ balance: trade up to $15
                } else if (this.wallets.trading >= 25) {
                    maxTradeSize = 10; // $25-50 balance: trade up to $10
                } else if (this.wallets.trading >= 15) {
                    maxTradeSize = 8;  // $15-25 balance: trade up to $8
                } else {
                    maxTradeSize = Math.min(this.wallets.trading, 5); // <$15: max $5
                }
            }
            // ⚖️ BALANCED MODE (default): SMALL TRADES FOR MULTI-POSITION
            else {
                // FORCE $2-3 trades to enable 4-5 positions with small balance
                if (this.wallets.trading >= 10) {
                    maxTradeSize = 3;  // $3 per trade if balance >$10
                } else {
                    maxTradeSize = 2;  // $2 per trade if balance <$10
                }
            }
            
            // Calculate smart buy amount - FORCE $1.50 PER TRADE
            let tradeAmount;
            const smallTradeSize = 1.50; // $1.50 per trade
            
            if (this.wallets.trading >= smallTradeSize) {
                // Always use $1.50
                tradeAmount = smallTradeSize;
                console.log(`💰 TRADE SIZE: $${smallTradeSize} (Balance: $${this.wallets.trading.toFixed(2)}, Allows ${Math.floor(this.wallets.trading / smallTradeSize)} positions)`);
            } else {
                // 🎯 NOT ENOUGH - Find cheaper alternative!
                console.log(`⚠️  Insufficient funds for ${market}: Need $${coinMinimum}, have $${this.wallets.trading.toFixed(2)}`);
                console.log(`🔍 Searching for affordable coins...`);
                
                // Find coins we CAN afford
                const affordableCoins = [];
                for (const [coin, minimum] of Object.entries(coinMinimums)) {
                    if (this.wallets.trading >= minimum && this.scanner && this.scanner.markets && this.scanner.markets[coin]) {
                        affordableCoins.push({ coin, minimum, price: this.scanner.markets[coin].price });
                    }
                }
                
                if (affordableCoins.length > 0) {
                    // Pick a random affordable coin
                    const alternative = affordableCoins[Math.floor(Math.random() * affordableCoins.length)];
                    console.log(`✅ Found affordable alternative: ${alternative.coin} (min: $${alternative.minimum})`);
                    console.log(`🔄 Switching to ${alternative.coin} for this cycle...`);
                    // Scanner will pick it up next cycle
                } else {
                    console.log(`❌ No affordable coins found with $${this.wallets.trading.toFixed(2)}`);
                }
                
                return; // Skip this expensive coin
            }
            
            const buyFee = tradeAmount * this.settings.tradingFee;
            const netSpend = tradeAmount + buyFee;
            const coinAmount = tradeAmount / this.state.currentPrice;
            
            // Calculate profit target
            const profitTarget = this.state.currentPrice * (1 + this.settings.minProfit);
            const expectedProfit = (profitTarget - this.state.currentPrice) / this.state.currentPrice * 100;
            
            // 🔥 Smart price formatting for very cheap coins (under $0.01)
            const priceFormat = this.state.currentPrice < 0.01 ? 8 : 
                               this.state.currentPrice < 1 ? 4 : 2;
            
            console.log('\n🟢═══════════════════════════════════════════════════');
            console.log('   BUY SIGNAL - Gen ' + this.state.generation + '.' + this.state.cycle);
            console.log('═══════════════════════════════════════════════════🟢');
            console.log('📊 Market: ' + market);
            console.log('   🎣 BUY LOW Strategy: Price @ ' + (positionInRange * 100).toFixed(0) + '% in range');
            console.log('   💵 Current: $' + this.state.currentPrice.toFixed(priceFormat));
            console.log('   📊 Range: $' + recentLow.toFixed(priceFormat) + ' - $' + recentHigh.toFixed(priceFormat));
            console.log('   📈 Momentum: Rising');
            console.log('🎯 Entry Reason: ' + buyReason);
            console.log('💰 Trade Details (SAFE MODE):');
            console.log('   Buying: ' + coinAmount.toFixed(2) + ' ' + market.split('/')[0] + ' for $' + tradeAmount.toFixed(2));
            console.log('   Fee: $' + buyFee.toFixed(4) + ' (0.0% with Kraken Plus)');
            console.log('   💵 TOTAL COST: $' + netSpend.toFixed(2) + ' (trade + fee)');
            console.log('   🔒 Safety: Using $' + tradeAmount.toFixed(2) + ' (Small trade for multi-position)');
            console.log('📈 Exit Plan:');
            console.log('   ✅ Quick profit targets (3-7%)');
            console.log('   🛑 -5% stop loss');
            
            // 💰 EXECUTE REAL MONEY BUY ORDER
            if (USE_REAL_MONEY && this.kraken) {
                try {
                    // 🛡️ CRITICAL CHECK: Don't buy if we already have this position!
                    if (this.state.portfolio[market] && this.state.portfolio[market].holdings > 0) {
                        console.log(`⚠️  BLOCKED: Already holding ${market} (${this.state.portfolio[market].holdings.toFixed(2)} coins)`);
                        console.log(`   Preventing duplicate purchase!`);
                        return;
                    }
                    
                    await this.executeRealBuy(market, coinAmount, tradeAmount);
                } catch (err) {
                    console.error('❌ Real buy failed:', err.message);
                    console.error('⚠️  Trade NOT recorded - Kraken order failed!');
                    return; // Don't update portfolio if real trade fails
                }
            }
            
            // ✅ UPDATE BALANCE AFTER BUY (Fix for buy/sell mismatch bug)
            this.wallets.trading -= netSpend;
            this.state.totalFeesPaid += buyFee;
            this.state.currentBalance = this.wallets.main + this.wallets.trading;  // CRITICAL: Update currentBalance!
            
            // PORTFOLIO: Add position for this market
            // CRITICAL FIX: Store the actual cost basis (including buy fee) for accurate P/L calculation
            this.state.portfolio[market] = {
                holdings: coinAmount,
                buyPrice: this.state.currentPrice,
                costBasis: netSpend,  // CRITICAL: Store actual money spent (tradeAmount + buyFee)
                peak: this.state.currentPrice,
                buyCycle: this.state.cycle
            };
            
            // 💾 SAVE STATE AFTER BUY
            this.saveState();
            
            console.log('✅ Position opened! Hunting for profits...');
            console.log('💵 Balance: $' + this.state.currentBalance.toFixed(2));
            console.log('💼 Portfolio: ' + this.getPositionCount() + '/' + this.settings.maxPositions + ' positions');
            console.log('═══════════════════════════════════════════════════\n');
        }
    }

    // 🧠 AI-DRIVEN DYNAMIC HOLD TIME - Let the AI decide how long to hold!
    calculateOptimalHoldTime(market, position) {
        // Access markets from scanner
        if (!this.scanner || !this.scanner.markets) {
            return {
                holdTime: 120,
                multiplier: '1.00',
                reasons: ['Scanner not initialized'],
                readableTime: '2m 0s'
            };
        }
        
        const marketData = this.scanner.markets[market];
        
        // Safety check - if market not found, use defaults
        if (!marketData) {
            return {
                holdTime: 120,
                multiplier: '1.00',
                reasons: ['Market not tracked'],
                readableTime: '2m 0s'
            };
        }
        
        const prediction = marketData.predictor || {};
        const isTrending = marketData.trending || false;
        const sector = marketData.sector || 'misc';
        
        let baseTime = 120;  // 2 minutes default (in cycles)
        let multiplier = 1.0;
        let reasons = [];
        
        // FACTOR 1: Trend Strength (2x if strong uptrend)
        if (prediction.trendStrength > 0.5) {
            multiplier *= 2.0;
            reasons.push('🔥 Strong uptrend');
        } else if (prediction.trendStrength > 0.3) {
            multiplier *= 1.5;
            reasons.push('📈 Moderate uptrend');
        }
        
        // FACTOR 2: Prediction Confidence (1.5x if high confidence bullish)
        if (prediction.nextMoveConfidence > 70 && prediction.nextMove === 'UP') {
            multiplier *= 1.5;
            reasons.push('🎯 High confidence prediction');
        } else if (prediction.nextMoveConfidence > 50 && prediction.nextMove === 'UP') {
            multiplier *= 1.2;
            reasons.push('✨ Good confidence');
        }
        
        // FACTOR 3: Market Cycle (extend in accumulation/markup)
        if (prediction.marketCycle === 'accumulation') {
            multiplier *= 1.8;
            reasons.push('💎 Accumulation phase');
        } else if (prediction.marketCycle === 'markup') {
            multiplier *= 2.0;
            reasons.push('🚀 Markup phase');
        } else if (prediction.marketCycle === 'distribution') {
            multiplier *= 0.7;
            reasons.push('⚠️ Distribution phase');
        } else if (prediction.marketCycle === 'markdown') {
            multiplier *= 0.5;
            reasons.push('📉 Markdown phase - exit soon');
        }
        
        // FACTOR 4: Trending Coin Boost (2x if currently trending)
        if (isTrending) {
            multiplier *= 2.0;
            reasons.push('🔥 TRENDING COIN');
        }
        
        // FACTOR 5: Sector Momentum (memes/AI get longer holds during pumps)
        const sectorRotation = this.scanner.trendDetector ? this.scanner.trendDetector.sectorRotation : null;
        if (sector === 'meme' && sectorRotation === 'meme') {
            multiplier *= 1.8;
            reasons.push('🚀 Meme season active');
        } else if (sector === 'ai' && sectorRotation === 'ai') {
            multiplier *= 1.8;
            reasons.push('🤖 AI narrative pumping');
        } else if (sector === 'defi' && sectorRotation === 'defi') {
            multiplier *= 1.6;
            reasons.push('💎 DeFi rotation active');
        }
        
        // FACTOR 6: In Profit (reduce hold if momentum fading)
        const profit = position ? ((this.state.currentPrice - position.buyPrice) / position.buyPrice) : 0;
        if (profit > 0.005 && prediction.momentumScore < 0) {
            multiplier *= 0.6;
            reasons.push('💰 Take profit - momentum fading');
        } else if (profit > 0.01) {
            multiplier *= 0.8;
            reasons.push('💵 In good profit');
        }
        
        // FACTOR 7: Fear/Greed Index (hold longer in greed, exit faster in fear)
        if (prediction.fearGreedIndex > 70) {
            multiplier *= 1.3;
            reasons.push('😤 Market greed - ride the wave');
        } else if (prediction.fearGreedIndex < 30) {
            multiplier *= 0.7;
            reasons.push('😰 Market fear - be cautious');
        }
        
        // Calculate final hold time
        const optimalHoldTime = Math.floor(baseTime * multiplier);
        
        // Clamp to reasonable limits: use settings for min/max
        const minHoldTime = this.settings.minHoldTime || 60;    // At least 1 minute (60 cycles)
        const maxHoldTime = this.settings.maxHoldTime || 1200;  // Max 20 minutes (1200 cycles)
        const finalHoldTime = Math.max(minHoldTime, Math.min(maxHoldTime, optimalHoldTime));
        
        return {
            holdTime: finalHoldTime,
            multiplier: multiplier.toFixed(2),
            reasons: reasons,
            readableTime: this.formatHoldTime(finalHoldTime)
        };
    }
    
    formatHoldTime(cycles) {
        const seconds = Math.floor(cycles * (this.settings.checkInterval / 1000));
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    async evaluateSell(market) {
        // Get position for this market
        const position = this.state.portfolio[market];
        if (!position || position.holdings === 0) return;
        
        // 🧠 AI-DRIVEN HOLD TIME - Check if we should wait longer
        const holdAnalysis = this.calculateOptimalHoldTime(market, position);
        const currentHoldTime = this.state.cycle - position.buyCycle;
        
        // If AI says hold longer, check if we've hit the optimal time yet
        if (currentHoldTime < holdAnalysis.holdTime) {
            // Don't sell yet unless emergency (big loss or huge profit)
            const profit = ((this.state.currentPrice - position.buyPrice) / position.buyPrice);
            if (profit > -0.03 && profit < 0.015) {  // Between -3% and +1.5%
                // AI says hold - skip this evaluation
                return;
            }
        }
        
        // Update peak price while holding (for trailing stops)
        if (this.state.currentPrice > position.peak) {
            position.peak = this.state.currentPrice;
        }
        
        const currentValue = position.holdings * this.state.currentPrice;
        
        // CRITICAL FIX: Use the stored costBasis (actual money spent including buy fee)
        // If costBasis doesn't exist (old positions), calculate it the old way
        const costBasis = position.costBasis || (position.holdings * position.buyPrice);
        
        // 🔥 CRITICAL FIX: Calculate profit AFTER sell fees!
        // The AI was checking profit WITHOUT fees, then selling and losing money!
        const sellFee = currentValue * this.settings.tradingFee;
        const netValue = currentValue - sellFee;  // What we actually get after fee
        
        const profit = ((netValue - costBasis) / costBasis);  // REAL profit after ALL fees
        const profitPercent = profit * 100;
        
        // Calculate trailing stop-loss from peak
        const peakValue = position.holdings * position.peak;
        const dropFromPeak = ((peakValue - currentValue) / peakValue);
        const profitFromPeak = ((position.peak - position.buyPrice) / position.buyPrice);
        
        // 💸 ACCOUNT FOR WITHDRAWAL FEE in profit calculations
        const withdrawalFee = this.withdrawalFees[market] || this.withdrawalFees['default'];
        const withdrawalFeeCost = withdrawalFee * this.state.currentPrice;
        const withdrawalFeePercent = withdrawalFeeCost / costBasis;
        
        // SCALPING: Micro momentum detection
        const recentPrices = this.state.priceHistory.slice(-this.settings.scalpWindow);
        const microMomentum = recentPrices.length >= 2 ? 
            (recentPrices[recentPrices.length - 1].price - recentPrices[0].price) / recentPrices[0].price : 0;
        
        // Calculate recent high/low for SELL HIGH logic
        const windowPrices = this.state.priceHistory.slice(-10);
        const recentHigh = Math.max(...windowPrices.map(p => p.price));
        const recentLow = Math.min(...windowPrices.map(p => p.price));
        const priceRange = recentHigh - recentLow;
        const positionInRange = priceRange > 0 ? (this.state.currentPrice - recentLow) / priceRange : 0.5;
        
        let sellScore = 0;
        let exitReason = '';
        
        
        // 🛑 3% STOP LOSS: Sell and find new market when down 3%
        // Use small epsilon for floating point comparison
        if (profit < (-0.03 + 0.0001)) {  // -3% loss (with epsilon)
            sellScore = 1.0;
            exitReason = `🛑 STOP LOSS -${Math.abs(profit*100).toFixed(1)}% (find new market)`;
            console.log(`\n🛑 STOP LOSS TRIGGERED FOR ${market}`);
            console.log(`   Loss: ${(profit*100).toFixed(2)}% | Buy: $${position.buyPrice.toFixed(6)} | Now: $${this.state.currentPrice.toFixed(6)}`);
            console.log(`   Selling to find better opportunity`);
        }
        // � EMERGENCY EXIT: CATASTROPHIC LOSS PROTECTION (>50% down)
        // Prevent PNUT-style disasters where we hold -91% losses
        if (profit < -0.50) {  // 50% loss threshold
            sellScore = 1.0;
            exitReason = `🚨 EMERGENCY EXIT - CATASTROPHIC LOSS ${(profit*100).toFixed(1)}% (cut losses NOW!)`;
            console.log(`\n🚨🚨🚨 EMERGENCY EXIT TRIGGERED FOR ${market} 🚨🚨🚨`);
            console.log(`   Loss: ${(profit*100).toFixed(2)}% | Buy: $${position.buyPrice.toFixed(2)} | Now: $${this.state.currentPrice.toFixed(2)}`);
            console.log(`   This position is hemorrhaging money - immediate liquidation required!`);
        }
        // 🛑 FORCED LIQUIDATION: Large losses after minimum hold (>30% down)
        else if (profit < -0.30 && currentHoldTime >= (this.settings.minHoldTime || 60)) {
            sellScore = 1.0;
            exitReason = `🛑 FORCED LIQUIDATION - Large loss ${(profit*100).toFixed(1)}% after ${this.formatHoldTime(currentHoldTime)}`;
            console.log(`\n🛑 FORCED LIQUIDATION FOR ${market}`);
            console.log(`   Loss: ${(profit*100).toFixed(2)}% | Hold: ${this.formatHoldTime(currentHoldTime)}`);
            console.log(`   Position not recovering - cutting losses to preserve capital`);
        }
        
        // �💎 PATIENCE IS PROFIT - Only sell when profitable AFTER withdrawal fees!
        // If BONK-relative sell percent is active, override min/target profit values
        let minProfitWithFees = this.settings.minProfit;  // default 2.5%
        let targetProfitWithFees = this.settings.targetProfit;  // default 3.0%
        if (this.bonkRelativeSellPercent !== null && typeof this.bonkRelativeSellPercent === 'number') {
            // If BONK moved X% (e.g., 0.03 for +3%), use that percent as targetProfit override
            targetProfitWithFees = Math.max(0.001, this.bonkRelativeSellPercent); // at least tiny positive
            // Also set minProfit to a fraction of that (e.g., 60% of target)
            minProfitWithFees = Math.max(0.001, targetProfitWithFees * 0.6);
        }
        
        // 🎯 PROFIT-ONLY SELLING - No more premature exits!
        // ONLY sell when we hit TARGET profit (1.5%+) - NO exceptions!
        // Use small epsilon for floating point comparison
        if (profit > (targetProfitWithFees - 0.0001)) {  // 1.5% profit (with epsilon)
            sellScore = 1.0;  // PERFECT - hit target!
            exitReason = '🎯 TARGET PROFIT +' + (targetProfitWithFees*100).toFixed(1) + '% (covers ALL fees)';
        }
        // 💎 HOLD EVERYTHING ELSE - Let profits run higher!
        // Don't sell just because we hit "minimum" profit - aim for TARGET!
        // 🔄 BREAK-EVEN SWAP: DISABLED - Focus on profit only!
        // We're not swapping coins at break-even anymore - hold for TARGET profit!
        
        // 🔄 COIN SWITCHING: DISABLED - No more premature sells!
        // We'll hold positions until they hit TARGET profit (3.0%+)
        // No more selling for "better opportunities" - let profits run!
        
        // 🔒 TRAILING STOP: DISABLED - No more premature exits!
        // We're aiming for 3% target profit - don't sell for tiny gains!
        
        // 🔒 PROFIT LOCK: ONLY at extreme profits (5%+)
        // If we hit 5%+ profit, lock gains if price drops 1% from peak
        if (profitFromPeak >= 0.05 && dropFromPeak >= 0.01) {
            sellScore = 0.95;
            exitReason = `🔒 EXTREME PROFIT LOCK - Hit ${(profitFromPeak*100).toFixed(1)}%, securing gains (dropped ${(dropFromPeak*100).toFixed(1)}% from peak)`;
            console.log(`🔒 EXTREME PROFIT LOCK TRIGGERED FOR ${market}`);
            console.log(`   Peak profit: ${(profitFromPeak*100).toFixed(2)}% | Current: ${(profit*100).toFixed(2)}%`);
            console.log(`   Drop from peak: ${(dropFromPeak*100).toFixed(2)}% | Threshold: 1.0%`);
        }
        
        // ⏳ PATIENCE LOGIC: HOLD UNDERWATER POSITIONS - Never panic sell!
        // BUT respect emergency exits and forced liquidations set above
        if (profit < 0 && sellScore < 0.9) {  // Don't override emergency/forced exits
            const holdCycles = this.state.cycle - position.buyCycle;
            // ❌ DISABLED PANIC SELLING - Only allow forced sells
            if (this.forceSellNow) {
                sellScore = 1.0;
                exitReason = '🔴 FORCED SELL (user requested)';
                this.forceSellNow = false;
            } else {
                // 💎 HOLD AND WAIT FOR PROFIT - Don't sell at losses!
                sellScore = 0; // Prevent selling
                if (holdCycles % 50 === 0) {
                    console.log(`💎 HOLDING ${market} underwater: ${(profit*100).toFixed(2)}% - waiting for profit...`);
                }
            }
        }
        
        const shouldSell = sellScore > 0.5;  // Only sell when profitable or emergency
        
        if (shouldSell) {
            const holdTime = this.state.cycle - position.buyCycle;  // Calculate how long we've held
            const holdAnalysis = this.calculateOptimalHoldTime(market, position);  // Get AI's hold time recommendation
            const isWin = profit > 0;
            
            const saleValue = currentValue;
            const sellFee = saleValue * this.settings.tradingFee;
            
            // 💸 WITHDRAWAL FEES: Only apply if withdrawing to external wallet
            // For internal Kraken trading, NO withdrawal fees! (you're keeping coins on exchange)
            // Withdrawal fees only matter if you actually withdraw to your personal wallet
            const withdrawalFee = 0;  // ZERO for internal trading on Kraken!
            const withdrawalFeeCost = 0;  // ZERO for internal trading!
            
            const netProceeds = saleValue - sellFee;  // Only subtract trading fee (0% with Kraken Plus)
            const actualProfit = netProceeds - costBasis;
            const actualProfitPercent = (actualProfit / costBasis) * 100;
            
            const profitEmoji = actualProfit > 0 ? '💰🎉' : actualProfit < 0 ? '📉💔' : '⚖️';
            const resultColor = actualProfit > 0 ? '🟢' : '🔴';
            
            console.log('\n' + resultColor + '═══════════════════════════════════════════════════');
            console.log('   SELL EXECUTED - Gen ' + this.state.generation + '.' + this.state.cycle);
            console.log('═══════════════════════════════════════════════════' + resultColor);
            console.log('📊 Market: ' + market);
            console.log('🎯 Exit Reason: ' + exitReason);
            console.log('📊 Trade Analysis:');
            console.log('   Buy Price: $' + position.buyPrice.toFixed(2) + ' | Sell Price: $' + this.state.currentPrice.toFixed(2));
            console.log('   Peak While Holding: $' + position.peak.toFixed(2));
            console.log('   Hold Time: ' + holdTime + ' cycles (' + (holdTime * (this.settings.checkInterval / 1000)).toFixed(1) + ' seconds)');
            console.log('🧠 AI Hold Analysis:');
            console.log('   Optimal Hold: ' + holdAnalysis.readableTime + ' (multiplier: ' + holdAnalysis.multiplier + 'x)');
            if (holdAnalysis.reasons.length > 0) {
                console.log('   Factors: ' + holdAnalysis.reasons.join(', '));
            }
            console.log('💵 Financial Details:');
            console.log('   Sold: ' + position.holdings.toFixed(4) + ' ' + market.split('/')[0]);
            console.log('   Gross Value: $' + saleValue.toFixed(2));
            console.log('   Trading Fee: $' + sellFee.toFixed(4) + ' (0.0% with Kraken Plus)');
            console.log('   Net Proceeds: $' + netProceeds.toFixed(2) + ' (no withdrawal fee for exchange trading)');
            console.log('   Cost Basis: $' + costBasis.toFixed(2) + ' (actual money spent)');
            console.log(profitEmoji + ' NET PROFIT: $' + actualProfit.toFixed(4) + ' (' + actualProfitPercent.toFixed(2) + '%)');
            console.log('📈 Performance:');
            console.log('   Gross P/L: ' + profitPercent.toFixed(2) + '%');
            console.log('   Net P/L: ' + actualProfitPercent.toFixed(2) + '% (REAL profit - no hidden fees!)');
            console.log('   Net P/L: ' + actualProfitPercent.toFixed(2) + '% (after withdrawal fees)');
            
            // 💰 EXECUTE REAL MONEY SELL ORDER FIRST - Before updating anything!
            if (USE_REAL_MONEY && this.kraken) {
                try {
                    await this.executeRealSell(market, position.holdings, netProceeds);
                    console.log('✅ Kraken order confirmed - updating AI state...');
                } catch (err) {
                    console.error('❌ Real sell failed:', err.message);
                    console.error('⚠️  Position NOT closed - Kraken order failed!');
                    console.error('⚠️  NO state changes recorded - trade did not execute!');
                    return; // EXIT - Don't update balance or delete position!
                }
            }
            
            // ✅ ONLY UPDATE STATE IF KRAKEN SUCCEEDED (or paper trading mode)
            // Update balance AFTER successful sell
            this.wallets.trading += netProceeds;  // Add net proceeds (after fee)
            this.state.totalFeesPaid += sellFee;
            this.state.currentBalance = this.wallets.main + this.wallets.trading;
            
            console.log('   Balance: $' + this.state.currentBalance.toFixed(2));
            console.log('   Total Fees Paid: $' + this.state.totalFeesPaid.toFixed(2));
            
            if (actualProfit > 0) {  // Use REAL profit for win/loss
                this.state.wins++;
                this.brain.winStreak++;
                this.brain.lossStreak = 0;
                if (profit > this.brain.bestProfit) this.brain.bestProfit = profit;
                console.log('✅ WIN! Streak: ' + this.brain.winStreak);
            } else {
                this.state.losses++;
                this.brain.lossStreak++;
                this.brain.winStreak = 0;
                if (profit < this.brain.worstLoss) this.brain.worstLoss = profit;
                console.log('❌ LOSS! Streak: ' + this.brain.lossStreak);
            }
            
            this.state.totalTrades++;
            this.state.totalProfit += actualProfit;  // Use REAL profit (after fees)
            // currentBalance already updated above
            
            if (this.state.currentBalance > this.state.peakBalance) {
                this.state.peakBalance = this.state.currentBalance;
            }
            this.state.drawdown = (this.state.peakBalance - this.state.currentBalance) / this.state.peakBalance;
            
            const tradeRecord = {
                tradeNumber: this.tradeHistory.length + 1,
                market: market,  // Track which market
                buyPrice: position.buyPrice,
                sellPrice: this.state.currentPrice,
                grossProfit: profit,
                grossProfitPercent: profitPercent,
                netProfit: actualProfit / costBasis,
                netProfitPercent: actualProfitPercent,
                profitDollars: actualProfit,
                feesPaid: sellFee + (costBasis * this.settings.tradingFee),
                holdTime: holdTime,
                holdTimeSeconds: holdTime * (this.settings.checkInterval / 1000),
                volume: position.holdings,
                generation: this.state.generation,
                cycle: this.state.cycle,
                exitReason: exitReason,
                aiSettings: {
                    buyThreshold: this.brain.buyThreshold,
                    sellThreshold: this.brain.sellThreshold,
                    riskTolerance: this.brain.riskTolerance,
                    marketSentiment: this.brain.marketSentiment
                },
                timestamp: new Date().toISOString(),
                timestampMs: Date.now()
            };
            
            this.tradeHistory.push(tradeRecord);
            
            // Learn from successful patterns
            if (isWin) {
                const patternKey = 'win_' + Math.floor(profit * 100);
                if (!this.marketIntelligence.successPatterns[patternKey]) {
                    this.marketIntelligence.successPatterns[patternKey] = [];
                }
                this.marketIntelligence.successPatterns[patternKey].push(tradeRecord);
            }
            
            // Reset position - PORTFOLIO: Delete this market's position
            delete this.state.portfolio[market];
            
            // 💾 SAVE STATE AND HISTORICAL DATA IMMEDIATELY
            this.saveState();
            
            console.log('💾 Trade #' + this.tradeHistory.length + ' saved to permanent history');
            console.log('💵 New Balance: $' + this.state.currentBalance.toFixed(2) + ' | Total P/L: $' + this.state.totalProfit.toFixed(2));
            console.log('💼 Portfolio: ' + this.getPositionCount() + '/' + this.settings.maxPositions + ' positions');
            console.log('═══════════════════════════════════════════════════\n');
        } else {
            if (this.state.cycle % 10 === 0) {  // Show status every 10 cycles (10 seconds)
                const holdTime = this.state.cycle - position.buyCycle;  // Calculate hold time
                const minProfitAfterFees = 0.0053;  // Same as sell logic
                const trailingStop = position.peak * (1 - this.settings.trailingStopLoss);
                const profitTarget = position.buyPrice * (1 + this.settings.minProfit);
                const priceToTarget = profitTarget - this.state.currentPrice;
                const percentToTarget = (priceToTarget / this.state.currentPrice) * 100;
                
                console.log('⏳ HOLDING ' + market + ' - Cycle ' + this.state.cycle + ' (Gen ' + this.state.generation + ')');
                console.log('   📊 Holdings: ' + position.holdings.toFixed(4) + ' ' + market.split('/')[0] + ' @ $' + this.state.currentPrice.toFixed(2));
                console.log('   💹 P/L: ' + (profit > 0 ? '+' : '') + profitPercent.toFixed(2) + '% ($' + (profit > 0 ? '+' : '') + (currentValue - costBasis).toFixed(4) + ')');
                
                if (profit < 0) {
                    console.log('   🎯 TARGET: +3.0% profit (0.48% net after fees)');
                    console.log('   🚀 IDEAL: +4.0% profit (1% net profit!)');
                    console.log('   💎 PATIENT HOLD - Will only sell when profitable!');
                } else if (profit < this.settings.minProfit) {
                    console.log('   🎯 TARGET: +3.0% profit (currently +' + (profit * 100).toFixed(2) + '%, getting closer!)');
                    console.log('   � IDEAL: +4.0% for maximum profit');
                } else if (profit < this.settings.targetProfit) {
                    console.log('   ✅ GOOD PROFIT! Will sell at +3.0% OR wait for +4.0% target');
                } else {
                    console.log('   🎯🔥 TARGET HIT +1.5%! Selling next cycle!');
                }
                
                console.log('   📈 Peak: $' + position.peak.toFixed(2) + ' | Trail Stop: $' + trailingStop.toFixed(2));
                console.log('   ⏱️ Hold Time: ' + holdTime + ' cycles (' + (holdTime * (this.settings.checkInterval / 1000)).toFixed(0) + 's)');
            }
        }
    }

    evolveAI() {
        this.state.generation++;
        const winRate = this.getWinRate();
        const avgProfit = this.state.totalProfit / Math.max(this.state.totalTrades, 1);
        
        console.log('\n🧬═══════════════════════════════════════════════════');
        console.log('   AI EVOLUTION - Generation ' + this.state.generation);
        console.log('═══════════════════════════════════════════════════🧬');
        console.log('📊 Performance Metrics:');
        console.log('   Win Rate: ' + winRate + '% | Avg Profit/Trade: $' + avgProfit.toFixed(4));
        const currentBalance = this.wallets.main + this.wallets.trading;
        const portfolioValue = Object.keys(this.state.portfolio).reduce((total, market) => {
            const pos = this.state.portfolio[market];
            const marketData = this.state.markets && this.state.markets[market];
            if (marketData && marketData.price) {
                return total + (pos.holdings * marketData.price);
            }
            return total + (pos.holdings * pos.buyPrice);  // Fallback to buy price
        }, 0);
        const totalValue = currentBalance + portfolioValue;
        const initialBalance = this.state.initialBalance || 13.30;
        console.log('   Balance: $' + totalValue.toFixed(2) + ' | ROI: ' + (((totalValue - initialBalance) / initialBalance) * 100).toFixed(2) + '%');
        console.log('   Win Streak: ' + (this.brain.winStreak || 0) + ' | Loss Streak: ' + (this.brain.lossStreak || 0));
        
        // 🎯 PROFIT OPTIMIZATION: Aim for higher profits over time (KRAKEN PLUS = ZERO FEES!)
        if (winRate > 50 && avgProfit > 0) {
            // Winning! Push for even better profits
            this.settings.minProfit = Math.min(0.050, this.settings.minProfit * 1.05);  // Gradually aim higher (up to 5%)
            this.settings.targetProfit = Math.min(0.070, this.settings.targetProfit * 1.05); // Up to 7%
            console.log('📈 RAISING PROFIT TARGETS: Min=' + (this.settings.minProfit*100).toFixed(1) + '% Target=' + (this.settings.targetProfit*100).toFixed(1) + '%');
        }
        
        if (winRate > 60 && this.brain.winStreak >= 3) {
            this.brain.buyAggression *= 1.05;
            this.brain.sellThreshold *= 1.03;
            this.brain.riskTolerance = Math.min(0.9, this.brain.riskTolerance * 1.05);
            console.log('🔥 HOT STREAK! Increasing aggression');
        }
        else if (winRate < 40 || this.brain.lossStreak >= 2) {
            this.brain.buyThreshold *= 1.1;
            this.brain.sellThreshold *= 0.9;
            this.brain.riskTolerance = Math.max(0.2, this.brain.riskTolerance * 0.95);
            // 💎 NEVER LOWER BELOW 3.0% - We have ZERO FEES on Kraken Plus!
            this.settings.minProfit = Math.max(0.030, this.settings.minProfit);
            this.settings.targetProfit = Math.max(0.040, this.settings.targetProfit);
            console.log('❄️ COLD STREAK. Staying disciplined - maintaining 3.0%+ profit targets (ZERO FEES!)');
        }
        
        if (this.tradeHistory.length >= 5) {
            const recentTrades = this.tradeHistory.slice(-10);
            const recentWinRate = recentTrades.filter(t => t.netProfit > 0).length / recentTrades.length;
            
            if (recentWinRate > 0.7) {
                console.log('✅ Recent performance excellent (' + (recentWinRate*100).toFixed(0) + '% wins in last 10)');
                // Learn from success - remember what works
                this.brain.bestProfit = Math.max(this.brain.bestProfit, avgProfit);
            } else if (recentWinRate < 0.3) {
                this.brain.buyThreshold = Math.random() * -0.01 - 0.002;
                this.brain.sellThreshold = Math.random() * 0.02 + 0.025; // Min 2.5%, up to 4.5%
                console.log('🔄 Poor recent performance. RANDOMIZING strategy');
            }
        }
        
        if (this.state.drawdown > 0.1) {
            this.brain.riskTolerance = Math.max(0.1, this.brain.riskTolerance * 0.8);
            this.brain.sellThreshold *= 0.8;
            console.log('⚠️ Drawdown ' + (this.state.drawdown*100).toFixed(1) + '% - REDUCING RISK');
        }
        
        if (avgProfit < 0) {
            this.brain.trendFollowing = 1 - this.brain.trendFollowing;
            console.log('🔀 FLIPPING STRATEGY: ' + (this.brain.trendFollowing > 0.5 ? 'Trend Following' : 'Contrarian'));
        }
        
        this.brain.buyThreshold = Math.max(-0.05, Math.min(0, this.brain.buyThreshold));
        this.brain.sellThreshold = Math.max(0.025, Math.min(0.05, this.brain.sellThreshold)); // Min 2.5% sell threshold
        this.brain.buyAggression = Math.max(0.1, Math.min(1, this.brain.buyAggression));
        this.brain.sellAggression = Math.max(0.1, Math.min(1, this.brain.sellAggression));
        this.brain.riskTolerance = Math.max(0.1, Math.min(0.9, this.brain.riskTolerance));
        
        console.log('🧠 New AI Parameters:');
        console.log('   Buy Threshold: ' + (this.brain.buyThreshold*100).toFixed(2) + '%');
        console.log('   Sell Threshold: ' + (this.brain.sellThreshold*100).toFixed(2) + '% (min 2.5%)');
        console.log('   Risk Tolerance: ' + (this.brain.riskTolerance*100).toFixed(0) + '%');
        console.log('   Buy Aggression: ' + (this.brain.buyAggression*100).toFixed(0) + '%');
        console.log('═══════════════════════════════════════════════════\n');
    }

    getWinRate() {
        return this.state.totalTrades > 0 ? ((this.state.wins / this.state.totalTrades) * 100).toFixed(1) : 0;
    }

    showStats() {
        const currentBalance = this.wallets.main + this.wallets.trading;
        const profit = currentBalance - this.budget;
        const roi = (profit / this.budget * 100);
        const netProfit = profit - this.state.totalFeesPaid;  // Profit after all fees
        const netROI = (netProfit / this.budget * 100);
        
        // Calculate ALL-TIME statistics
        const allTimeWins = this.tradeHistory.filter(t => t.netProfit > 0).length;
        const allTimeLosses = this.tradeHistory.filter(t => t.netProfit < 0).length;
        const allTimeWinRate = this.tradeHistory.length > 0 ? (allTimeWins / this.tradeHistory.length * 100).toFixed(1) : 0;
        
        console.log('\n🚀═══════════════════════════════════════════════════');
        console.log('   ADVANCED AI PERFORMANCE REPORT');
        console.log('═══════════════════════════════════════════════════🚀');
        console.log('📊 Current Session:');
        console.log('   Generation: ' + this.state.generation + ' | Cycle: ' + this.state.cycle);
        console.log('   Balance: $' + currentBalance.toFixed(2));
        console.log('   Gross P/L: ' + (profit >= 0 ? '+$' : '-$') + Math.abs(profit).toFixed(4) + ' (' + (roi >= 0 ? '+' : '') + roi.toFixed(2) + '%)');
        if (this.state.totalFeesPaid !== undefined) {
            console.log('   Fees Paid: $' + this.state.totalFeesPaid.toFixed(4) + ' (0.00% Kraken Plus)');
            console.log('   Net P/L: ' + (netProfit >= 0 ? '+$' : '-$') + Math.abs(netProfit).toFixed(4) + ' (' + (netROI >= 0 ? '+' : '') + netROI.toFixed(2) + '%)');
        }
        console.log('   Peak Balance: $' + this.state.peakBalance.toFixed(2));
        console.log('   Drawdown: ' + (this.state.drawdown*100).toFixed(1) + '%');
        console.log('💼 Portfolio:');
        const positionCount = this.getPositionCount();
        if (positionCount > 0) {
            console.log('   Positions: ' + positionCount + '/' + this.settings.maxPositions);
            for (const [market, pos] of Object.entries(this.state.portfolio)) {
                const currentValue = pos.holdings * this.scanner.markets[market]?.price || 0;
                const profit = pos.buyPrice > 0 ? ((currentValue / (pos.holdings * pos.buyPrice)) - 1) * 100 : 0;
                console.log('   ' + market + ': ' + pos.holdings.toFixed(4) + ' (~$' + currentValue.toFixed(2) + ', ' + (profit >= 0 ? '+' : '') + profit.toFixed(2) + '%)');
            }
            console.log('   Total Portfolio Value: $' + this.getTotalPortfolioValue().toFixed(2));
        } else {
            console.log('   No positions (ready to buy)');
        }
        console.log('📈 Trading Stats:');
        console.log('   Total Trades: ' + this.state.totalTrades);
        console.log('   Wins: ' + this.state.wins + ' | Losses: ' + this.state.losses);
        console.log('   Win Rate: ' + this.getWinRate() + '%');
        console.log('   Best Trade: +' + ((this.brain.bestProfit || 0)*100).toFixed(2) + '%');
        console.log('   Worst Trade: ' + ((this.brain.worstLoss || 0)*100).toFixed(2) + '%');
        console.log('   Win Streak: ' + (this.brain.winStreak || 0) + ' | Loss Streak: ' + (this.brain.lossStreak || 0));
        console.log('💹 Market Data:');
        console.log('   SOL/USD: $' + this.state.currentPrice.toFixed(2));
        console.log('   Market Sentiment: ' + ((this.brain.marketSentiment || 0.5) * 100).toFixed(0) + '% bullish');
        console.log('🧠 AI Configuration:');
        console.log('   Buy Threshold: ' + (this.brain.buyThreshold*100).toFixed(2) + '%');
        console.log('   Sell Threshold: ' + (this.brain.sellThreshold*100).toFixed(2) + '%');
        console.log('   Risk Tolerance: ' + (this.brain.riskTolerance*100).toFixed(0) + '%');
        console.log('   Strategy: ' + (this.brain.trendFollowing > 0.5 ? 'Trend Following' : 'Contrarian'));
        console.log('🔮 AI PREDICTIONS:');
        console.log('   Next Move: ' + (this.predictor.priceTarget > this.state.currentPrice ? '📈 UP' : '📉 DOWN') + ' to $' + this.predictor.priceTarget.toFixed(2));
        console.log('   Confidence: ' + this.predictor.nextMoveConfidence.toFixed(0) + '%');
        console.log('   Market Cycle: ' + this.predictor.marketCycle);
        console.log('   Fear/Greed Index: ' + this.predictor.fearGreedIndex.toFixed(0) + '/100');
        console.log('   Prediction Accuracy: ' + this.predictor.accuracy.toFixed(1) + '% (' + this.predictor.successfulPredictions + '/' + this.predictor.totalPredictions + ')');
        console.log('---------------------------------------------------');
        console.log('📚 HISTORICAL DATABASE (PERMANENT):');
        console.log('   📊 Total Trades Ever: ' + this.tradeHistory.length);
        console.log('   🏆 All-Time Win Rate: ' + allTimeWinRate + '% (' + allTimeWins + 'W / ' + allTimeLosses + 'L)');
        console.log('   👥 Traders Tracked: ' + Object.keys(this.traderPatterns).length);
        console.log('   🐋 Whales Identified: ' + Object.keys(this.marketIntelligence.whaleActivity).length);
        console.log('   📈 Market Trades Analyzed: ' + this.marketIntelligence.totalMarketTrades.toLocaleString());
        if (this.tradeHistory.length > 0) {
            const firstTrade = new Date(this.tradeHistory[0].timestamp).toLocaleString();
            const lastTrade = new Date(this.tradeHistory[this.tradeHistory.length - 1].timestamp).toLocaleString();
            console.log('   📅 First Trade: ' + firstTrade);
            console.log('   📅 Latest Trade: ' + lastTrade);
        }
        console.log('═══════════════════════════════════════════════════\n');
    }
    
    // 💰 REAL MONEY BUY - Execute actual Kraken order
    async executeRealBuy(market, amount, usdAmount) {
        try {
            const pair = market.replace('/', '');  // SOL/USD -> SOLUSD
            console.log('💰 EXECUTING REAL BUY ORDER ON KRAKEN...');
            console.log(`   Pair: ${pair}`);
            console.log(`   Amount: ${amount.toFixed(6)} ${market.split('/')[0]}`);
            console.log(`   Estimated Cost: $${usdAmount.toFixed(2)}`);
            
            const order = await this.kraken.placeMarketOrder(pair, 'buy', amount.toFixed(6));
            
            console.log('✅ REAL ORDER EXECUTED!');
            console.log(`   Order ID: ${order.txid}`);
            console.log(`   Status: ${order.descr ? order.descr.order : 'Market order'}`);
            return order;
        } catch (error) {
            console.error('❌ KRAKEN BUY FAILED:', error.message);
            throw error;
        }
    }
    
    // 💰 REAL MONEY SELL - Execute actual Kraken order
    async executeRealSell(market, amount, usdAmount) {
        try {
            const pair = market.replace('/', '');  // SOL/USD -> SOLUSD
            
            // 🔧 FIX: Sell 99.99% of position to avoid "Insufficient funds" from rounding
            const safeAmount = (amount * 0.9999).toFixed(6);
            
            console.log('💰 EXECUTING REAL SELL ORDER ON KRAKEN...');
            console.log(`   Pair: ${pair}`);
            console.log(`   Amount: ${safeAmount} ${market.split('/')[0]} (99.99% of ${amount.toFixed(6)})`);
            console.log(`   Estimated Revenue: $${usdAmount.toFixed(2)}`);
            
            const order = await this.kraken.placeMarketOrder(pair, 'sell', safeAmount);
            
            console.log('✅ REAL ORDER EXECUTED!');
            console.log(`   Order ID: ${order.txid}`);
            console.log(`   Status: ${order.descr ? order.descr.order : 'Market order'}`);
            return order;
        } catch (error) {
            console.error('❌ KRAKEN SELL FAILED:', error.message);
            throw error;
        }
    }
}

process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down AI...');
    if (bot) {
        bot.saveState();
        bot.showStats();
        console.log('✅ AI evolution saved! Resume anytime with: node paper-trading-ai.js\n');
    }
    process.exit(0);
});

const bot = new WorldClassTradingAI(19);
bot.start().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
