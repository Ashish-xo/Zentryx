// Vercel Serverless Function — OpenCode AI chat completions
// API key is stored as OPENCODE_API_KEY environment variable on Vercel

const DEFAULT_SYSTEM = `You are Zentryx, a general-purpose AI assistant in a travel & intelligence dashboard. Answer any question — travel, science, math, coding, history, geography, and more.

Rules:
- Plain text only. No markdown (no **, no ##, no bullet symbols, no backticks).
- Use numbered lists (1. 2. 3.) for step-by-step answers.
- Keep answers clear, concise, and under 300 words unless more detail is essential.
- For travel costs or prices, say they are approximate and may vary.
- If you don't know something, say so honestly.
- Friendly, confident, slightly futuristic personality.`;

// Simple in-memory rate limiter (per serverless instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 15; // 15 requests per minute per IP

// --- Token usage tracking (in-memory, per instance) ---
// Resets on server restart / Vercel redeploy. The OpenCode API returns a
// `usage` object (prompt/completion/cached tokens) and a `cost` string
// ("0" on the free tier) on every successful completion.
const usageStats = {
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    cachedTokens: 0,
    cost: 0,
    errors: 0,
    rateLimited: 0,
    cachedRequests: 0,   // served from cache, zero API tokens
    since: Date.now()
};

// --- Layer 4: response cache + single-flight dedup ---
// Identical questions from any user share ONE upstream call: the first
// answer is stored for 24h, and concurrent identical requests await the
// same in-flight promise instead of duplicating the API call.
const responseCache = new Map();     // key -> { text, at }
const inFlight = new Map();          // key -> Promise
const CACHE_TTL = 24 * 3600 * 1000;  // 24 hours

// --- Layer 2: hard daily token budget (safety valve) ---
// Once the free-tier quota is spent, the server refuses politely and the
// client falls back to the offline knowledge base instead of burning more.
const DAILY_TOKEN_BUDGET = 500000;   // 500K tokens per day per instance

function cacheKey(message) {
    return String(message).toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 200);
}

function recordUsage(data) {
    const u = data?.usage || {};
    usageStats.requests++;
    usageStats.promptTokens += u.prompt_tokens || 0;
    usageStats.completionTokens += u.completion_tokens || 0;
    usageStats.totalTokens += u.total_tokens || 0;
    usageStats.cachedTokens += u.prompt_tokens_details?.cached_tokens || 0;
    const c = parseFloat(data?.cost);
    if (!isNaN(c)) usageStats.cost += c;
    console.log(
        `[Zentryx AI] ${data?.model || 'unknown-model'} | ` +
        `+${u.prompt_tokens || 0} in / +${u.completion_tokens || 0} out ` +
        `(${u.total_tokens || 0} total) | cumulative: ${usageStats.totalTokens} tokens ` +
        `across ${usageStats.requests} requests`
    );
}

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return false;
    }
    
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) return true;
    return false;
}

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // GET /api/stats — live token usage snapshot (also served by dev-server)
    if (req.method === 'GET') {
        return res.status(200).json({
            requests: usageStats.requests,
            promptTokens: usageStats.promptTokens,
            completionTokens: usageStats.completionTokens,
            totalTokens: usageStats.totalTokens,
            cachedTokens: usageStats.cachedTokens,
            cachedRequests: usageStats.cachedRequests,
            cacheSize: responseCache.size,
            cost: usageStats.cost,
            errors: usageStats.errors,
            rateLimited: usageStats.rateLimited,
            dailyBudget: DAILY_TOKEN_BUDGET,
            budgetRemaining: Math.max(0, DAILY_TOKEN_BUDGET - usageStats.totalTokens),
            since: new Date(usageStats.since).toISOString(),
            note: 'In-memory totals since server start; resets on restart/redeploy.'
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    if (isRateLimited(clientIP)) {
        return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }

    const { message, history, system } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Limit message length
    if (message.length > 2000) {
        return res.status(400).json({ error: 'Message too long. Please keep it under 2000 characters.' });
    }

    // Use OPENCODE_API_KEY environment variable if defined, otherwise fallback to the shared key
    const apiKey = process.env.OPENCODE_API_KEY || 'REDACTED_API_KEY';
    if (!apiKey) {
        console.error('OpenCode API key is not set');
        return res.status(500).json({ error: 'AI service is not configured. Please contact the site owner.' });
    }

    // Map history format to OpenAI messages format
    const messages = [];

    // System instruction
    const systemPrompt = system || DEFAULT_SYSTEM;
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }

    // Convert history
    if (Array.isArray(history)) {
        for (const h of history) {
            const role = h.role === 'model' ? 'assistant' : (h.role || 'user');
            let content = '';
            if (h.parts && Array.isArray(h.parts)) {
                content = h.parts.map(p => p.text || '').join('');
            } else if (typeof h.content === 'string') {
                content = h.content;
            } else if (typeof h.text === 'string') {
                content = h.text;
            }
            if (content) {
                messages.push({ role, content });
            }
        }
    }

    // Add current user message
    messages.push({ role: 'user', content: message.trim() });

    // --- Layer 2: daily token budget safety valve ---
    if (usageStats.totalTokens >= DAILY_TOKEN_BUDGET) {
        return res.status(429).json({ error: 'Daily AI token budget exhausted. Please try again tomorrow.' });
    }

    // --- Layer 4: response cache (24h) + single-flight dedup ---
    const key = cacheKey(message);
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL) {
        usageStats.cachedRequests++;
        console.log(`[Zentryx AI] CACHE HIT "${message.slice(0, 48)}..." (saved an upstream call)`);
        return res.status(200).json({
            response: cached.text,
            grounded: false,
            searchQueries: [],
            sources: [],
            cached: true
        });
    }

    // If an identical question is already being answered, share that call
    if (inFlight.has(key)) {
        const shared = await inFlight.get(key);
        return res.status(200).json(shared);
    }

    const maxTokens = Number(req.body.max_tokens) || 512;

    const run = (async () => {
        const url = 'https://opencode.ai/zen/v1/chat/completions';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: 'laguna-s-2.1-free',
                messages: messages,
                temperature: 0.7,
                max_tokens: maxTokens
            })
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error(`OpenCode API error (${response.status}):`, errData);

            if (response.status === 429 || (errData.error && errData.error.type === 'CreditsError')) {
                usageStats.rateLimited++;
                return { status: 429, error: 'AI rate limit or credit limit reached. Please try again later.' };
            }
            if (response.status === 400 || response.status === 401 || response.status === 403) {
                usageStats.errors++;
                return { status: 502, error: 'AI service configuration or authorization error.' };
            }
            usageStats.errors++;
            return { status: 502, error: 'AI service temporarily unavailable.' };
        }

        const data = await response.json();
        recordUsage(data);
        let text = data?.choices?.[0]?.message?.content || '';

        // Clean any markdown formatting
        text = text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/`{1,3}/g, '')
            .trim();

        if (!text) {
            usageStats.errors++;
            return { status: 502, error: 'AI returned an empty response. Please try again.' };
        }

        return { status: 200, response: text };
    })().catch(e => {
        console.error('Server error:', e);
        usageStats.errors++;
        if (e.name === 'AbortError') {
            return { status: 504, error: 'AI request timed out. Please try again.' };
        }
        return { status: 500, error: 'Internal server error. Please try again.' };
    });

    inFlight.set(key, run);
    try {
        const result = await run;
        if (result.status === 200 && result.response) {
            responseCache.set(key, { text: result.response, at: Date.now() });
        }
        if (result.status === 200) {
            return res.status(200).json({
                response: result.response,
                grounded: false,
                searchQueries: [],
                sources: []
            });
        }
        return res.status(result.status).json({ error: result.error });
    } finally {
        inFlight.delete(key);
    }
};
