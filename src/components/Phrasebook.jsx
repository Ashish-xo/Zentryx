import React, { useState } from 'react';
import { LANGUAGES, PHRASES } from '../data/phrasebook';

// Travel phrasebook — pick a language, tap a phrase to copy it (or speak it).
// Works fully offline; no API keys needed.

export default function Phrasebook() {
  const [lang, setLang] = useState(LANGUAGES[0].key);
  const [copied, setCopied] = useState(null);
  const active = LANGUAGES.find(l => l.key === lang) || LANGUAGES[0];

  const speak = (text) => {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = active.langCode || active.key;
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch { /* speech unsupported */ }
  };

  const copy = async (phrase, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(phrase);
      setTimeout(() => setCopied(null), 1400);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div
      id="phrasebook-card"
      className="md:col-span-1 glass-frontier p-4 sm:p-6 flex flex-col gap-5 border border-frontier-indigo/10 hover:border-frontier-indigo/30 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-frontier-indigo/10 flex items-center justify-center text-frontier-indigo border border-frontier-indigo/30 neon-glow-indigo flex-shrink-0">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white uppercase">Phrasebook</h3>
          <p className="text-frontier-text text-[10px] uppercase tracking-wider">Essential phrases for common travel situations</p>
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {LANGUAGES.map(l => (
          <button key={l.key} onClick={() => setLang(l.key)}
            className={`flex-shrink-0 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all ${lang === l.key ? 'border-frontier-lime text-frontier-deep bg-frontier-lime' : 'border-frontier-indigo/30 text-frontier-indigo hover:border-frontier-lime hover:text-frontier-lime'}`}>
            {l.flag} {l.native}
          </button>
        ))}
      </div>

      {/* Phrases */}
      <div className="flex-1 space-y-2 min-h-[160px]">
        {PHRASES.map(p => (
          <div key={p.key}
            className="group flex items-center justify-between gap-2 border border-frontier-indigo/10 hover:border-frontier-lime/30 bg-frontier-navy/30 px-3 py-2 transition-all">
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-widest text-frontier-indigo/70">{p.label}</div>
              <div className="text-white font-bold text-[13px] leading-snug break-words">{active.phrases[p.key]}</div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => speak(active.phrases[p.key])}
                title="Speak"
                className="w-7 h-7 flex items-center justify-center text-frontier-indigo border border-frontier-indigo/20 hover:bg-frontier-indigo/10 hover:text-frontier-lime transition-all">
                <span className="material-symbols-outlined text-sm">volume_up</span>
              </button>
              <button onClick={() => copy(p.key, active.phrases[p.key])}
                title="Copy"
                className="w-7 h-7 flex items-center justify-center text-frontier-lime border border-frontier-lime/20 hover:bg-frontier-lime/10 transition-all">
                <span className="material-symbols-outlined text-sm">{copied === p.key ? 'check' : 'content_copy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-frontier-indigo/10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-frontier-lime animate-pulse"></span>
          <span className="text-[9px] text-frontier-text uppercase tracking-widest">Tap to copy · speak</span>
        </div>
        <span className="text-[9px] text-frontier-indigo uppercase tracking-widest">{active.native}</span>
      </div>
    </div>
  );
}
