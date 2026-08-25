// Vercel Serverless Function — Universal BYOK AI proxy
// Every user brings their OWN API key (OpenAI-compatible or Anthropic).
// The site owner's key is NOT used — each request is forwarded with the
// caller's key to their chosen provider/base URL.
//
// Supported providers (auto-detected by base_url + provider field):
//   - OpenAI-compatible: any base URL + /chat/completions (OpenCode, b.ai,
//     OpenRouter, OpenAI, Groq, Together, ...)
//   - Anthropic: Anthropic Messages API format (/v1/messages)

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
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP (users BYOK, so generous)

// --- Token usage tracking (in-memory, per instance) ---
const usageStats = {
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    cachedTokens: 0,
    cost: 0,
    errors: 0,
    rateLimited: 0,
    cachedRequests: 0,
    since: Date.now()
};

// --- Layer 4: response cache + single-flight dedup (24h) ---
const responseCache = new Map();
const inFlight = new Map();
const CACHE_TTL = 24 * 3600 * 1000;

const DAILY_TOKEN_BUDGET = 500000;

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
}

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

// --- Provider config helpers ---

// Default base URLs per provider flavor when the client doesn't send one.
const DEFAULT_BASE_URLS = {
    openai: 'https://api.b.ai/v1',          // free unlimited tier (default)
    anthropic: 'https://api.anthropic.com/v1'
};

// A tiny allowlist of known OpenAI-compatible hosts (the client can also
// send its own https base_url; non-https is always rejected).
function normalizeBaseUrl(baseUrl, provider) {
    let b = String(baseUrl || '').trim().replace(/\/+$/, '');
    if (!b) return DEFAULT_BASE_URLS[provider] || DEFAULT_BASE_URLS.openai;
    if (!/^https:\/\//i.test(b)) return null; // https only — no http, no file:
    return b;
}

// Pick a sensible default model when the client doesn't specify one.
function defaultModel(provider, baseUrl) {
    const b = String(baseUrl || '').toLowerCase();
    if (provider === 'anthropic' || b.includes('anthropic')) return 'claude-3-5-sonnet-20241022';
    if (b.includes('opencode')) return 'laguna-s-2.1-free';
    if (b.includes('openrouter')) return 'openai/gpt-4o-mini';
    if (b.includes('groq')) return 'llama-3.3-70b-versatile';
    return 'gpt-4o-mini';
}

export default async function handler(req, res) {
    // Same-origin only: the dashboard and this function share an origin,
    // so no CORS headers are emitted.
    if (req.method === 'OPTIONS') return res.status(200).end();

    // GET /api/stats — live token usage snapshot
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
            note: 'BYOK proxy — usage is per-caller; resets on restart/redeploy.'
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

    const {
        message,
        history,
        system,
        apiKey,        // USER'S OWN KEY (the whole point of BYOK)
        baseUrl,       // e.g. https://api.b.ai/v1  (or sent by client)
        provider,      // 'openai' | 'anthropic'
        model          // optional model override
    } = req.body || {};

    // Guard rails: system prompts and history come from the client — cap size.
    const safeSystem = (typeof system === 'string' && system.length <= 2000) ? system : DEFAULT_SYSTEM;
    const safeHistory = (Array.isArray(history) ? history : []).slice(-20);

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
    }
    if (message.length > 2000) {
        return res.status(400).json({ error: 'Message too long. Please keep it under 2000 characters.' });
    }

    // --- BYOK: the caller's key is REQUIRED. No site-owner key fallback. ---
    const key = String(apiKey || '').trim();
    if (!key) {
        return res.status(401).json({
            error: 'No API key provided. Add your own free key in Settings → AI (see the setup guide on the site).'
        });
    }

    const prov = provider === 'anthropic' ? 'anthropic' : 'openai';
    const base = normalizeBaseUrl(baseUrl, prov);
    if (!base) {
        return res.status(400).json({ error: 'base_url must be a valid https URL.' });
    }
    const chosenModel = (typeof model === 'string' && model.trim()) ? model.trim() : defaultModel(prov, base);

    // --- Daily token budget safety valve ---
    if (usageStats.totalTokens >= DAILY_TOKEN_BUDGET) {
        return res.status(429).json({ error: 'Daily AI token budget exhausted. Please try again tomorrow.' });
    }

    // --- Response cache (24h) + single-flight dedup (keyed on message only,
    // so identical questions share one upstream call regardless of caller) ---
    const ckey = cacheKey(message);
    const cached = responseCache.get(ckey);
    if (cached && Date.now() - cached.at < CACHE_TTL) {
        usageStats.cachedRequests++;
        return res.status(200).json({ response: cached.text, grounded: false, searchQueries: [], sources: [], cached: true });
    }
    if (inFlight.has(ckey)) {
        const shared = await inFlight.get(ckey);
        return res.status(200).json(shared);
    }

    const maxTokens = Math.min(Math.max(Number(req.body.max_tokens) || 512, 1), 2048);

    // Build the messages array (shared by both formats)
    const messages = [];
    messages.push({ role: 'system', content: safeSystem });
    for (const h of safeHistory) {
        const role = h.role === 'model' ? 'assistant' : (h.role || 'user');
        let content = '';
        if (h.parts && Array.isArray(h.parts)) content = h.parts.map(p => p.text || '').join('');
        else if (typeof h.content === 'string') content = h.content;
        else if (typeof h.text === 'string') content = h.text;
        if (content) messages.push({ role, content });
    }
    messages.push({ role: 'user', content: message.trim() });

    const run = (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        let url, headers, body;
        if (prov === 'anthropic') {
            // --- Anthropic Messages API format ---
            url = base + '/messages';
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01'
            };
            body = JSON.stringify({
                model: chosenModel,
                max_tokens: maxTokens,
                system: safeSystem,
                messages: messages.filter(m => m.role !== 'system')
            });
        } else {
            // --- OpenAI-compatible chat completions ---
            url = base + '/chat/completions';
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            };
            body = JSON.stringify({
                model: chosenModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: maxTokens
            });
        }

        let response;
        try {
            response = await fetch(url, { method: 'POST', headers, signal: controller.signal, body });
        } catch (e) {
            clearTimeout(timeout);
            usageStats.errors++;
            if (e.name === 'AbortError') return { status: 504, error: 'AI request timed out. Please try again.' };
            return { status: 502, error: 'AI service unreachable. Check your base URL or try again.' };
        }
        clearTimeout(timeout);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            usageStats.errors++;
            if (response.status === 401 || response.status === 403) {
                return { status: 401, error: 'Your API key was rejected by the provider. Check it in Settings → AI.' };
            }
            if (response.status === 429) {
                usageStats.rateLimited++;
                return { status: 429, error: 'Provider rate limit reached. Wait a moment and retry, or check your key.' };
            }
            return { status: 502, error: (errData?.error?.message || 'AI provider error.') };
        }

        const data = await response.json();
        recordUsage(data);
        let text = '';
        if (prov === 'anthropic') {
            text = (data.content || []).map(b => b.text || '').join('').trim();
        } else {
            text = data?.choices?.[0]?.message?.content || '';
        }

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
    })();

    inFlight.set(ckey, run);
    try {
        const result = await run;
        if (result.status === 200 && result.response) {
            responseCache.set(ckey, { text: result.response, at: Date.now() });
        }
        if (result.status === 200) {
            return res.status(200).json({ response: result.response, grounded: false, searchQueries: [], sources: [] });
        }
        return res.status(result.status).json({ error: result.error });
    } finally {
        inFlight.delete(ckey);
    }
};