const http = require('http');
const fs = require('fs');
const path = require('path');
const handler = require('./api/ai.js');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Route /api/* to the serverless handler (POST /api/ai for chat,
    // GET /api/stats for live token usage)
    if (req.url.startsWith('/api/') && (req.method === 'POST' || req.method === 'GET')) {
        const isPost = req.method === 'POST';
        const finish = () => {
            try {
                const parsedBody = isPost ? JSON.parse(body || '{}') : {};

                // Wrap req and res to match Vercel environment
                const vercelReq = {
                    method: req.method,
                    headers: req.headers,
                    body: parsedBody
                };

                let statusCode = 200;
                const headers = {};

                const vercelRes = {
                    setHeader(name, value) {
                        headers[name.toLowerCase()] = value;
                    },
                    status(code) {
                        statusCode = code;
                        return this;
                    },
                    json(data) {
                        res.writeHead(statusCode, {
                            ...headers,
                            'Content-Type': 'application/json'
                        });
                        res.end(JSON.stringify(data));
                        return this;
                    },
                    end() {
                        res.writeHead(statusCode, headers);
                        res.end();
                    }
                };

                handler(vercelReq, vercelRes).catch(err => {
                    console.error('Error in local /api handler:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal server error' }));
                });
            } catch (err) {
                console.error('Error in local /api handler:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        };

        let body = '';
        if (isPost) {
            req.on('data', chunk => { body += chunk; });
            req.on('end', finish);
        } else {
            finish();
        }
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? './index.html' : '.' + req.url;
    filePath = filePath.split('?')[0].split('#')[0];
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n================ ZENTRYX DEV SERVER ================`);
    console.log(`Frontend URL: http://localhost:${PORT}/`);
    console.log(`Backend API : http://localhost:${PORT}/api/ai`);
    console.log(`Connected To: OpenCode AI (laguna-s-2.1)`);
    console.log(`====================================================\n`);
});
