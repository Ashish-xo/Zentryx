import React, { useState } from 'react';

// Daily travel expense budget planner.
// Each category is an editable slider; totals are derived live.
// Values persist per-currency in localStorage so a visitor's budget
// survives a refresh.

const DEFAULT_CATS = [
  { key: 'accommodation', label: 'Accommodation', icon: 'bed', color: 'text-frontier-indigo', value: 80 },
  { key: 'food', label: 'Food', icon: 'restaurant', color: 'text-frontier-lime', value: 40 },
  { key: 'transport', label: 'Transport', icon: 'directions_bus', color: 'text-frontier-indigo', value: 25 },
  { key: 'activities', label: 'Activities', icon: 'attractions', color: 'text-frontier-lime', value: 30 },
  { key: 'misc', label: 'Misc', icon: 'more_horiz', color: 'text-frontier-indigo', value: 20 },
];

const CURRENCIES = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };

function loadCats(currency) {
  try {
    const raw = localStorage.getItem('zentryx_budget_' + currency);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved) && saved.length === DEFAULT_CATS.length) {
      return DEFAULT_CATS.map((d, i) => ({
        ...d,
        value: typeof saved[i]?.value === 'number' ? saved[i].value : d.value,
      }));
    }
  } catch { /* ignore corrupt storage */ }
  return null;
}

function saveCats(currency, cats) {
  try {
    localStorage.setItem('zentryx_budget_' + currency, JSON.stringify(cats.map(c => ({ value: c.value }))));
  } catch { /* storage may be unavailable */ }
}

export default function BudgetPlanner() {
  const [currency, setCurrency] = useState('USD');
  const [cats, setCats] = useState(() => loadCats('USD') || DEFAULT_CATS.map(c => ({ ...c })));

  const sym = CURRENCIES[currency] || '$';
  const day = cats.reduce((s, c) => s + c.value, 0);
  const week = day * 7;
  const month = day * 30;

  const setValue = (key, v) => {
    const next = cats.map(c => c.key === key ? { ...c, value: v } : c);
    setCats(next);
    saveCats(currency, next);
  };

  const switchCurrency = (code) => {
    setCurrency(code);
    setCats(loadCats(code) || DEFAULT_CATS.map(c => ({ ...c })));
  };

  const reset = () => {
    const base = DEFAULT_CATS.map(c => ({ ...c }));
    setCats(base);
    saveCats(currency, base);
  };

  return (
    <div
      id="budget-planner-card"
      className="md:col-span-2 glass-frontier p-4 sm:p-8 flex flex-col gap-6 border border-frontier-indigo/10 hover:border-frontier-indigo/30 transition-all">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-frontier-lime/10 flex items-center justify-center text-frontier-lime border border-frontier-lime/30 neon-glow-lime flex-shrink-0">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-headline font-bold text-white uppercase">Budget Planner</h3>
          <p className="text-frontier-text text-[11px] uppercase tracking-wider">Plan your daily travel expenses</p>
        </div>
        {/* Currency toggle */}
        <div className="flex gap-1">
          {Object.keys(CURRENCIES).map(code => (
            <button key={code} onClick={() => switchCurrency(code)}
              className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${currency === code ? 'border-frontier-lime text-frontier-deep bg-frontier-lime' : 'border-frontier-indigo/30 text-frontier-indigo hover:border-frontier-lime hover:text-frontier-lime'}`}>
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Category sliders */}
      <div className="space-y-4">
        {cats.map(c => (
          <div key={c.key} className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-lg flex-shrink-0 ${c.color}`}>{c.icon}</span>
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] uppercase tracking-widest text-frontier-text font-bold">{c.label}</span>
                <span className="text-white font-black text-sm">{sym}{c.value}</span>
              </div>
              <input
                type="range" min={0} max={500} step={5} value={c.value}
                onChange={e => setValue(c.key, Number(e.target.value))}
                aria-label={c.label}
                className="w-full budget-range" />
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-frontier-indigo/10 pt-4">
        <div className="text-center mb-3">
          <div className="text-4xl font-headline font-black text-white">{sym}{day}<span className="text-lg text-frontier-indigo">/day</span></div>
          <div className="text-[10px] uppercase tracking-widest text-frontier-text mt-1">{sym}{week}/week · {sym}{month}/month</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-frontier-lime animate-pulse"></span>
            <span className="text-[9px] text-frontier-text uppercase tracking-widest">Live auto-total</span>
          </div>
          <button onClick={reset}
            className="text-[10px] uppercase tracking-widest text-frontier-indigo border border-frontier-indigo/30 hover:bg-frontier-indigo/10 px-3 py-1.5 transition-all flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">restart_alt</span> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
