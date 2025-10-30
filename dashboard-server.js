const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve dashboard HTML
    if (req.url === '/' || req.url === '/dashboard') {
        fs.readFile(path.join(__dirname, 'dashboard.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading dashboard');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
        return;
    }

    // Serve state JSON
    if (req.url.startsWith('/paper-trading-state.json')) {
        fs.readFile(path.join(__dirname, 'paper-trading-state.json'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('{}');
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(data);
        });
        return;
    }

    // Serve live logs
    if (req.url === '/tmp/live-ai.log' || req.url === '/logs') {
        fs.readFile('/tmp/live-ai.log', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Log file not found');
                return;
            }
            const lines = data.split('\n').slice(-30).join('\n');
            res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end(lines);
        });
        return;
    }

    // Serve status page
    if (req.url === '/status') {
        fs.readFile(path.join(__dirname, 'paper-trading-state.json'), (err, data) => {
            if (err) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end('<pre style="color:#f00;">State file not found</pre>');
                return;
            }
            
            const state = JSON.parse(data);
            const s = state.state || {};
            const w = state.wallets || {};
            const portfolio = s.portfolio || {};
            const position = Object.values(portfolio)[0];
            
            let html = '<html><head><style>body{background:#000;color:#0f0;font-family:monospace;padding:20px;}</style></head><body>';
            html += '<h2 style="color:#ff0;">💰 LIVE STATUS</h2>';
            html += `<p><strong>Generation:</strong> ${s.generation || 1}</p>`;
            html += `<p><strong>Balance:</strong> <span style="color:#ff0;font-size:20px;">$${(w.trading || 0).toFixed(2)}</span></p>`;
            html += `<p><strong>Total Trades:</strong> ${s.totalTrades || 0}</p>`;
            html += `<p><strong>Win Rate:</strong> ${((s.wins / Math.max(s.totalTrades, 1)) * 100 || 0).toFixed(1)}%</p>`;
            html += `<p><strong>Cycle:</strong> ${s.cycle || 0}</p>`;
            
            if (position) {
                const market = Object.keys(portfolio)[0];
                const pl = ((s.currentPrice - position.buyPrice) / position.buyPrice) * 100;
                const plColor = pl >= 0 ? '#0f0' : '#f00';
                html += '<hr>';
                html += '<h3 style="color:#ffff00;">Current Position:</h3>';
                html += `<p><strong>${market}:</strong> ${position.holdings.toFixed(4)}</p>`;
                html += `<p><strong>Buy Price:</strong> $${position.buyPrice.toFixed(2)}</p>`;
                html += `<p><strong>Current Price:</strong> $${(s.currentPrice || 0).toFixed(2)}</p>`;
                html += `<p><strong>P/L:</strong> <span style="color:${plColor};font-size:18px;">${pl >= 0 ? '+' : ''}${pl.toFixed(2)}%</span></p>`;
            } else {
                html += '<p style="color:#ff0;">No open positions</p>';
            }
            
            html += '</body></html>';
            
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    // API: Update markets
    if (req.url === '/api/update-markets' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log('🌐 Updating markets:', data.markets);
            
            // TODO: Write to config file or send signal to AI
            fs.writeFileSync(path.join(__dirname, 'ai-config.json'), JSON.stringify({
                markets: data.markets,
                timestamp: Date.now()
            }));
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true}));
        });
        return;
    }

    // API: Update speed
    if (req.url === '/api/update-speed' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log('⚡ Updating speed:', data.interval + 'ms');
            
            // Write to config
            const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai-config.json'), 'utf8') || '{}');
            config.checkInterval = data.interval;
            fs.writeFileSync(path.join(__dirname, 'ai-config.json'), JSON.stringify(config));
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true}));
        });
        return;
    }

    // API: Update profit targets
    if (req.url === '/api/update-targets' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log('🎯 Updating targets:', data);
            
            const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai-config.json'), 'utf8') || '{}');
            config.minProfit = data.minProfit;
            config.targetProfit = data.targetProfit;
            fs.writeFileSync(path.join(__dirname, 'ai-config.json'), JSON.stringify(config));
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true}));
        });
        return;
    }

    // API: Update evolution
    if (req.url === '/api/update-evolution' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log('🧬 Updating evolution frequency:', data.frequency);
            
            const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai-config.json'), 'utf8') || '{}');
            config.evolutionFrequency = data.frequency;
            fs.writeFileSync(path.join(__dirname, 'ai-config.json'), JSON.stringify(config));
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true}));
        });
        return;
    }

    // API: Sell all
    if (req.url === '/api/sell-all' && req.method === 'POST') {
        console.log('🔴 EMERGENCY SELL ALL triggered!');
        
        fs.writeFileSync(path.join(__dirname, 'ai-command.txt'), 'SELL_ALL');
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
        return;
    }

    // API: Pause trading
    if (req.url === '/api/pause' && req.method === 'POST') {
        console.log('⏸️ Pausing trading...');
        
        fs.writeFileSync(path.join(__dirname, 'ai-command.txt'), 'PAUSE');
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
        return;
    }

    // API: Resume trading
    if (req.url === '/api/resume' && req.method === 'POST') {
        console.log('▶️ Resuming trading...');
        
        fs.writeFileSync(path.join(__dirname, 'ai-command.txt'), 'RESUME');
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
        return;
    }

    // API: Force evolution
    if (req.url === '/api/force-evolution' && req.method === 'POST') {
        console.log('🧬 Forcing evolution...');
        
        fs.writeFileSync(path.join(__dirname, 'ai-command.txt'), 'EVOLVE');
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
        return;
    }

    // API: Reset generation
    if (req.url === '/api/reset-generation' && req.method === 'POST') {
        console.log('🔄 Resetting generation...');
        
        fs.writeFileSync(path.join(__dirname, 'ai-command.txt'), 'RESET_GEN');
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  🚀 LIVE KRAKEN AI DASHBOARD SERVER RUNNING 🚀       ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📊 Dashboard URL: http://localhost:${PORT}`);
    console.log(`💰 Tracking: Real Kraken Trading (LIVE MONEY)`);
    console.log(`📈 Features: Live logs, Real-time controls, Balance tracking`);
    console.log('');
    console.log('🎮 Controls Available:');
    console.log('   • Switch trading markets');
    console.log('   • Adjust speed & profit targets');
    console.log('   • Emergency sell all positions');
    console.log('   • Pause/resume trading');
    console.log('   • Force AI evolution');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});
