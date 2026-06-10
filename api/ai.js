// Vercel Serverless Function — Gemini AI with Google Search Grounding
// API key is stored as GEMINI_API_KEY environment variable on Vercel

const DEFAULT_SYSTEM = `You are Zentryx, an advanced general-purpose AI assistant embedded in a futuristic travel & intelligence dashboard. You can answer ANY question on ANY topic — science, math, coding, travel, history, geography, philosophy, current events, cooking, fitness, technology, business, and everything else. You are NOT limited to travel topics.

You have access to Google Search to find the latest, most accurate information from the internet. Use it whenever a question involves:
- Current events, prices, news, or real-time data
- Specific facts you're not 100% certain about
- Travel costs, routes, bookings, or destination info
- Any topic that benefits from fresh internet data

Rules:
- Answer confidently and accurately using search results when available.
- Use plain text only. No markdown formatting (no **, no ##, no bullet symbols, no backticks).
- Use numbered lists (1. 2. 3.) for step-by-step answers.
- Keep answers clear, concise, and under 300 words unless more detail is essential.
- When providing travel costs or prices, mention that prices are approximate and may vary.
- If you genuinely don't know something even after searching, say so honestly.
- Maintain a friendly, confident, and slightly futuristic personality.`;

// Simple in-memory rate limiter (per serverless instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 15; // 15 requests per minute per IP

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

    // Map Gemini history format to OpenAI messages format
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

    try {
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
                model: 'deepseek-v4-flash-free',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error(`OpenCode API error (${response.status}):`, errData);

            if (response.status === 429 || (errData.error && errData.error.type === 'CreditsError')) {
                return res.status(429).json({ error: 'AI rate limit or credit limit reached. Please try again later.' });
            }
            if (response.status === 400 || response.status === 401 || response.status === 403) {
                return res.status(502).json({ error: 'AI service configuration or authorization error.' });
            }
            return res.status(502).json({ error: 'AI service temporarily unavailable.' });
        }

        const data = await response.json();
        let text = data?.choices?.[0]?.message?.content || '';

        // Clean any markdown formatting
        text = text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/`{1,3}/g, '')
            .trim();

        if (!text) {
            return res.status(502).json({ error: 'AI returned an empty response. Please try again.' });
        }

        return res.status(200).json({
            response: text,
            grounded: false,
            searchQueries: [],
            sources: []
        });

    } catch (e) {
        console.error('Server error:', e);
        if (e.name === 'AbortError') {
            return res.status(504).json({ error: 'AI request timed out. Please try again.' });
        }
        return res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
};
