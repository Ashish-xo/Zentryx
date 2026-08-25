import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import handler from './api/ai.js';

// ESM shim for __dirname (package.json is "type": "module")
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 3000;

// --- Security headers (same policy as the Vercel deployment, see vercel.json) ---
const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://images.unsplash.com https://lh3.googleusercontent.com https://i.pravatar.cc",
    "connect-src 'self' https://nominatim.openstreetmap.org https://overpass-api.de https://api.open-meteo.com https://geocoding-api.open-meteo.com https://router.project-osrm.org",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
].join('; ');

// --- .env loader (KEY=VALUE lines) ---
// OPENCODE_API_KEY is read from the environment (Vercel injects it natively).
// Locally, put it in a .env file next to this script — it stays out of git.
try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    for (const line of envFile.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
} catch (e) { /* no .env present — env vars may be set externally */ }

const server = http.createServer((req, res) => {
    // Security headers on every response
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', CSP);
    // Same-origin only: no CORS headers, so third-party sites can't call /api/*

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
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

    // Serve static files — resolve strictly inside the project root so a
    // request like /../../etc/passwd can never escape the site directory.
    // Also normalize a bare "/" (with or without a query string) to index.html
    // and never try to readFile a directory (EISDIR).
    let rawPath = req.url.split('?')[0].split('#')[0];
    if (rawPath === '/') rawPath = '/index.html';
    const resolved = path.normalize(path.join(__dirname, rawPath));
    if (!resolved.startsWith(__dirname + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    let filePath = resolved;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }
    
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
    console.log(`Connected To: BYOK AI proxy (visitors bring their own keys)`);
    console.log(`====================================================\n`);
});
