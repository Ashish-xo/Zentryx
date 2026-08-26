import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { queryAI, queryBudgetAI } from '../lib/ai';
import { getWeatherForCurrentArea, fetchWeatherByCoords } from '../lib/weather';
import { WMO_CODES } from '../lib/helpers';

export function GenericModal() {
  const { state, closeModal, addLog } = useApp();
  const m = state.modals[0];
  if (!m) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-frontier-deep/95 backdrop-blur-md opacity-100 transition-opacity duration-300"
      onClick={() => { if (!m.persistent) closeModal(m.id); }}>
      <div className="w-full max-w-md glass-frontier border border-frontier-indigo/30 p-8 m-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-headline font-black text-white text-sm uppercase tracking-widest">{m.title}</h3>
          <button onClick={() => closeModal(m.id)} className="text-frontier-text/50 hover:text-frontier-indigo text-lg">&times;</button>
        </div>
        <div className="text-frontier-text text-[11px] uppercase tracking-wider leading-relaxed whitespace-pre-wrap">{m.message}</div>
      </div>
    </div>
  );
}

export function SettingsModal() {
  const { state, openModal, closeModal, setSettingsVisible, setModals, setSession, clearSession, setAuthVisible } = useApp();
  const [ai, setAi] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zentryx_ai') || 'null') || { provider: 'openai', baseUrl: 'https://api.b.ai/v1', apiKey: '', model: '' }; } catch { return { provider: 'openai', baseUrl: 'https://api.b.ai/v1', apiKey: '', model: '' }; }
  });
  const [showKey, setShowKey] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  if (!state.settingsVisible) return null;

  const saveAi = () => {
    const key = String(ai.apiKey || '').trim();
    if (!key) { setAiStatus({ msg: 'Enter an API key first.', color: 'text-red-400' }); return; }
    const base = String(ai.baseUrl || '').trim();
    if (base && !/^https:\/\//i.test(base)) { setAiStatus({ msg: 'Base URL must start with https://', color: 'text-red-400' }); return; }
    const model = String(ai.model || '').trim();
    if (model.length > 200) { setAiStatus({ msg: 'Model name too long.', color: 'text-red-400' }); return; }
    const cleaned = { apiKey: key, baseUrl: base || undefined, provider: ai.provider, model: model || undefined };
    localStorage.setItem('zentryx_ai', JSON.stringify(cleaned));
    setAiStatus({ msg: 'Key saved. Your key stays in this browser.', color: 'text-frontier-lime' });
  };

  const clearAi = () => {
    localStorage.removeItem('zentryx_ai');
    setAi({ provider: 'openai', baseUrl: 'https://api.b.ai/v1', apiKey: '', model: '' });
    setAiStatus({ msg: 'AI key cleared.', color: 'text-frontier-text' });
  };

  return (
    <div id="settings-modal" className="fixed inset-0 z-[1500] flex items-center justify-center p-4 opacity-100 transition-opacity duration-300 bg-frontier-deep/95 backdrop-blur-md"
      onClick={() => setSettingsVisible(false)}>
      <div className="w-full max-w-md glass-frontier border border-frontier-indigo/30 p-8 max-h-[90dvh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">Settings</h3>
          <button onClick={() => setSettingsVisible(false)} className="text-frontier-text/50 hover:text-frontier-indigo text-lg">&times;</button>
        </div>
        <div className="space-y-4">
          <div><span className="text-[10px] uppercase tracking-widest text-frontier-indigo/60">Name</span>
            <div id="settings-name" className="text-white text-sm font-bold">{state.session?.name || '—'}</div></div>
          <div><span className="text-[10px] uppercase tracking-widest text-frontier-indigo/60">Email</span>
            <div id="settings-email" className="text-white text-sm font-bold">{state.session?.email || '—'}</div></div>
          <div><span className="text-[10px] uppercase tracking-widest text-frontier-indigo/60">AI Quota</span>
            <div id="settings-quota" className="text-white text-sm font-bold">{state.aiQuota ? (20 - (state.aiQuota?.used || 0)) + ' / 20' : '20 / 20'}</div></div>

          {/* === AI Connection (BYOK) === */}
          <div className="border border-frontier-indigo/30 bg-frontier-navy/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest text-frontier-lime">AI Connection (Your Own Key)</span>
              <button onClick={() => setGuideOpen(!guideOpen)} className="text-frontier-indigo text-[9px] font-bold uppercase tracking-widest hover:underline">Setup Guide</button>
            </div>
            <div>
              <label className="text-[8px] uppercase tracking-widest text-frontier-text/70 block mb-1">Provider Format</label>
              <select value={ai.provider} onChange={e => setAi({ ...ai, provider: e.target.value })}
                className="w-full bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[11px] text-white focus:outline-none focus:border-frontier-lime">
                <option value="openai">OpenAI-compatible (b.ai, OpenCode, OpenRouter, Groq...)</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>
            <div>
              <label className="text-[8px] uppercase tracking-widest text-frontier-text/70 block mb-1">Base URL</label>
              <input value={ai.baseUrl} onChange={e => setAi({ ...ai, baseUrl: e.target.value })} type="text" placeholder="https://api.b.ai/v1"
                className="w-full bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[11px] text-white placeholder-frontier-text/40 focus:outline-none focus:border-frontier-lime" />
            </div>
            <div>
              <label className="text-[8px] uppercase tracking-widest text-frontier-text/70 block mb-1">Model (optional)</label>
              <input value={ai.model} onChange={e => setAi({ ...ai, model: e.target.value })} type="text" placeholder="auto (gpt-4o-mini by default)"
                className="w-full bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[11px] text-white placeholder-frontier-text/40 focus:outline-none focus:border-frontier-lime" />
            </div>
            <div>
              <label className="text-[8px] uppercase tracking-widest text-frontier-text/70 block mb-1">Your API Key</label>
              <div className="flex gap-2">
                <input id="ai-apikey" value={ai.apiKey} onChange={e => setAi({ ...ai, apiKey: e.target.value })} type={showKey ? 'text' : 'password'} placeholder="sk-...  (your own free key)" autoComplete="off" autoCorrect="off" spellCheck={false} name="zentryx-ai-key"
                  className="flex-1 bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[11px] text-white placeholder-frontier-text/40 focus:outline-none focus:border-frontier-lime" />
                <button onClick={() => setShowKey(!showKey)} className="px-3 border border-frontier-indigo/30 text-frontier-indigo hover:bg-frontier-indigo/10 text-sm">
                  <span className="material-symbols-outlined">{showKey ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button onClick={saveAi} className="flex-1 bg-frontier-lime text-frontier-deep py-2 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Save AI Key</button>
              <button onClick={clearAi} className="border border-frontier-indigo/30 text-frontier-indigo px-3 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-frontier-indigo/10 transition-all">Clear</button>
            </div>
            {aiStatus && <div className={`text-[9px] uppercase tracking-widest ${aiStatus.color}`}>{aiStatus.msg}</div>}

            {guideOpen && (
              <div className="p-3 border border-frontier-indigo/20 bg-frontier-deep/60">
                <div className="text-[9px] font-black uppercase tracking-widest text-frontier-indigo mb-2">How to get your free AI key</div>
                <ol className="text-[10px] text-frontier-text space-y-1.5 list-decimal list-inside">
                  <li>Pick a free provider (all work with Zentryx):</li>
                  <li className="ml-2"><b className="text-white">OpenCode</b> — free tier, no card. Go to <span className="text-frontier-lime">opencode.ai</span> → Account → API keys → Create.</li>
                  <li className="ml-2"><b className="text-white">b.ai</b> — free unlimited. Create an account at <span className="text-frontier-lime">api.b.ai</span> and grab your API key.</li>
                  <li className="ml-2"><b className="text-white">OpenRouter</b> — free daily credits. Sign up at <span className="text-frontier-lime">openrouter.ai</span> → Keys.</li>
                  <li>Copy your key (it starts with <span className="text-frontier-lime">sk-</span>).</li>
                  <li>Paste it in the <b className="text-white">Your API Key</b> field above.</li>
                  <li>Choose your provider format + base URL, then click <b className="text-frontier-lime">Save AI Key</b>.</li>
                  <li>Your key is stored <b className="text-white">only in your browser</b> and sent with your requests — the site owner never sees it.</li>
                </ol>
              </div>
            )}
          </div>

          <div className="border-t border-frontier-indigo/10 pt-4 flex gap-3">
            <button onClick={() => { setSettingsVisible(false); clearSession(); }}
              className="flex-1 border border-red-400/40 text-red-400 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-400/10 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeatherModal() {
  const { state, setWeatherModal } = useApp();
  const [days, setDays] = useState([]);
  const [areaLabel, setAreaLabel] = useState('your area');

  useEffect(() => {
    if (!state.weatherModal?.open) return;
    let cancelled = false;
    getWeatherForCurrentArea().then(async (c) => {
      try {
        const d = await fetchWeatherByCoords(c.lat, c.lon);
        if (cancelled) return;
        setAreaLabel(c.label);
        const list = (d.daily?.time || []).slice(0, 6).map((t, i) => ({
          day: new Date(t).toLocaleDateString([], { weekday: 'short' }),
          max: d.daily.temperature_2m_max?.[i] ?? '--',
          min: d.daily.temperature_2m_min?.[i] ?? '--',
          code: d.daily.weather_code?.[i] ?? 0,
        }));
        setDays(list);
      } catch { /* keep placeholders */ }
    });
    return () => { cancelled = true; };
  }, [state.weatherModal?.open]);

  if (!state.weatherModal?.open) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-frontier-deep/95 backdrop-blur-md"
      onClick={() => setWeatherModal({ open: false, data: null })}>
      <div className="w-full max-w-2xl glass-frontier border border-frontier-indigo/30 p-8 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">Weather Forecast · {areaLabel}</h3>
          <button onClick={() => setWeatherModal({ open: false, data: null })} className="text-frontier-text/50 hover:text-frontier-indigo text-lg">&times;</button>
        </div>
        <div id="forecast-grid" className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {(days.length ? days : [1,2,3,4,5,6].map(i => ({ day: `Day ${i}`, max: '--', min: '--', code: 0 }))).map((d, i) => (
            <div key={i} className="glass-frontier p-3 text-center border border-frontier-indigo/10">
              <div className="text-[9px] uppercase tracking-widest text-frontier-indigo/60 mb-1">{d.day}</div>
              <span className="material-symbols-outlined text-frontier-indigo text-lg">cloud</span>
              <div className="text-white font-bold text-sm">{d.max}° <span className="text-frontier-text/50 font-normal">{d.min}°</span></div>
              <div className="text-[7px] uppercase tracking-widest text-frontier-text/50">{WMO_CODES[d.code] || ''}</div>
            </div>
          ))}
        </div>
        <div className="text-frontier-text text-[10px] uppercase tracking-widest text-center">
          Live data from Open-Meteo · {areaLabel}
        </div>
      </div>
    </div>
  );
}

export function BudgetModal() {
  const { state, setBudgetModal, addLog } = useApp();
  const [busy, setBusy] = useState(false);
  const [tiers, setTiers] = useState(null);
  const [err, setErr] = useState('');

  if (!state.budgetModal) return null;

  const estimate = async () => {
    const from = document.getElementById('budget-origin')?.value.trim();
    const to = document.getElementById('budget-dest')?.value.trim();
    if (!from || !to) { setErr('Enter both origin and destination.'); return; }
    setBusy(true); setErr(''); setTiers(null);
    addLog(`Budget estimate requested: ${from} → ${to}`);
    try {
      const raw = await queryBudgetAI(`travel budget from ${from} to ${to}`);
      if (!raw) {
        setErr("No estimate available — add your AI key in Settings → AI Connection, or try a known route (e.g. Delhi to Goa).");
      } else {
        // Only forward the 3 known tier keys with string values — a rogue
        // provider response can't inject extra keys (e.g. __proto__).
        const parsed = JSON.parse(raw);
        const clean = {};
        for (const k of ['cheapest', 'moderate', 'expensive']) {
          const v = parsed && typeof parsed === 'object' ? parsed[k] : null;
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            clean[k] = {
              travel_cost: String(v.travel_cost ?? '—'),
              hotel_rating: String(v.hotel_rating ?? '—'),
              hotel_cost: String(v.hotel_cost ?? '—'),
              tickets: String(v.tickets ?? '—'),
              food: String(v.food ?? '—'),
              total: String(v.total ?? '—')
            };
          }
        }
        if (Object.keys(clean).length) setTiers(clean);
        else setErr('Could not parse the estimate. Try again.');
      }
    } catch {
      setErr('Could not compute the estimate. Try again.');
    }
    setBusy(false);
  };

  const tierMeta = {
    cheapest: { label: 'Backpacker', color: 'text-frontier-lime' },
    moderate: { label: 'Moderate', color: 'text-frontier-indigo' },
    expensive: { label: 'Luxury', color: 'text-amber-400' },
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-frontier-deep/95 backdrop-blur-md"
      onClick={() => setBudgetModal(false)}>
      <div className="w-full max-w-lg glass-frontier border border-frontier-indigo/30 p-8 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">Budget Planner</h3>
          <button onClick={() => setBudgetModal(false)} className="text-frontier-text/50 hover:text-frontier-indigo text-lg">&times;</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-frontier-indigo/60 mb-1 block">From</label>
              <input id="budget-origin" type="text" placeholder="Origin"
                className="w-full bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[12px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-frontier-indigo/60 mb-1 block">To</label>
              <input id="budget-dest" type="text" placeholder="Destination"
                className="w-full bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[12px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime transition-colors" />
            </div>
          </div>
          <button onClick={estimate} disabled={busy}
            className="w-full bg-frontier-lime text-frontier-deep py-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">
            {busy ? 'Calculating...' : 'Estimate Budget'}
          </button>
          {busy && <div id="budget-loading" className="text-center text-frontier-lime/60 text-[10px] animate-pulse">Calculating optimum...</div>}
          {err && <div className="text-red-400 text-[10px] uppercase tracking-widest text-center">{err}</div>}
          {tiers && (
            <div id="budget-grid" className="grid grid-cols-1 gap-3">
              {Object.entries(tiers).map(([key, v]) => (
                <div key={key} className="border border-frontier-indigo/20 bg-frontier-navy/50 p-4">
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${tierMeta[key]?.color || 'text-frontier-text'}`}>
                    {tierMeta[key]?.label || key} · {v.travel_cost || '—'}
                  </div>
                  <div className="text-[10px] text-frontier-text space-y-1">
                    <div>Hotel: {v.hotel_rating || '—'} — {v.hotel_cost || '—'}</div>
                    <div>Tickets: {v.tickets || '—'}</div>
                    <div>Food: {v.food || '—'}</div>
                    <div className="text-white font-bold pt-1">Total: {v.total || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AskModal() {
  const { state, setAskModal } = useApp();
  const [ask, setAsk] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  if (!state.askModal) return null;

  const askAI = async () => {
    const t = ask.trim();
    if (!t || busy) return;
    setBusy(true);
    setAnswer('Thinking...');
    try {
      setAnswer(await queryAI(t));
    } catch {
      setAnswer('Could not reach the AI. Try again.');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-frontier-deep/90 backdrop-blur-sm"
      onClick={() => setAskModal(false)}>
      <div className="w-full max-w-lg glass-frontier border border-frontier-indigo/30 p-8 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 id="ask-title" className="font-headline font-black text-white text-sm uppercase tracking-widest">Ask AI</h3>
          <button onClick={() => setAskModal(false)} className="text-frontier-text/50 hover:text-frontier-indigo text-lg">&times;</button>
        </div>
        <div id="ask-modal-content" className="max-h-64 overflow-y-auto mb-4 text-[11px] text-frontier-text uppercase tracking-wider whitespace-pre-wrap">
          {answer}
        </div>
        <div className="flex gap-2">
          <input id="ask-input" type="text" placeholder="Ask anything..." value={ask}
            onChange={e => setAsk(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') askAI(); }}
            className="flex-1 bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[12px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime transition-colors" />
          <button onClick={askAI} disabled={busy} className="bg-frontier-lime text-frontier-deep px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50">Ask</button>
        </div>
      </div>
    </div>
  );
}