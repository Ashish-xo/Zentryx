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
// The BYOK backend does not need an owner API key — this loader only
// exists for forward compatibility (e.g. future server-side settings).
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
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
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
                let parsedBody = {};
                if (isPost) {
                    try {
                        parsedBody = JSON.parse(body || '{}');
                    } catch {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                        return;
                    }
                }

                // Wrap req and res to match Vercel environment.
                // X-Forwarded-For is OVERWRITTEN from the socket so a client
                // can't spoof it and bypass the proxy's per-IP rate limiter.
                const vercelReq = {
                    method: req.method,
                    headers: {
                        ...req.headers,
                        'x-forwarded-for': req.socket.remoteAddress,
                        'x-real-ip': req.socket.remoteAddress
                    },
                    body: parsedBody,
                    socket: req.socket
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
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-store'
                        });
                        res.end(JSON.stringify(data));
                        return this;
                    },
                    end() {
                        res.writeHead(statusCode, { ...headers, 'Cache-Control': 'no-store' });
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
        let bodyRejected = false;
        if (isPost) {
            req.on('data', chunk => {
                if (bodyRejected) return;
                body += chunk;
                if (body.length > 256 * 1024) {
                    bodyRejected = true;
                    res.writeHead(413, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Request body too large' }));
                    req.destroy();
                }
            });
            req.on('end', () => { if (!bodyRejected) finish(); });
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
                console.error('Static file error:', error.code);
                res.writeHead(500);
                res.end('Server Error');
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
