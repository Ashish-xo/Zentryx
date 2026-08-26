import React, { useState } from 'react';

// Emergency contacts — tap a number to call it (tel: link works on mobile,
// harmless on desktop). Styled in red to stand out as life-critical info.

const CONTACTS = [
  { num: '112', label: 'EU Emergency',    flag: '🇪🇺', desc: 'Pan-European emergency number (ambulance, fire, police)' },
  { num: '911', label: 'US / Canada',     flag: '🇺🇸', desc: 'Emergency services in North America' },
  { num: '999', label: 'UK Emergency',    flag: '🇬🇧', desc: 'Emergency services in the United Kingdom' },
  { num: '000', label: 'Australia',       flag: '🇦🇺', desc: 'Emergency services in Australia' },
  { num: '100', label: 'India Police',    flag: '🇮🇳', desc: 'Police in India · 101 fire · 102 ambulance' },
  { num: '110', label: 'Japan Police',    flag: '🇯🇵', desc: 'Police in Japan · 119 for ambulance & fire' },
  { num: '119', label: 'Japan Ambulance', flag: '🇯🇵', desc: 'Ambulance and fire services in Japan' },
  { num: '112', label: 'Global (GSM)',    flag: '📡', desc: 'Works on most mobile networks worldwide' },
];

export default function EmergencyContacts() {
  const [copied, setCopied] = useState(null);

  const copy = async (num) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopied(num);
      setTimeout(() => setCopied(null), 1400);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div
      id="emergency-contacts-card"
      className="md:col-span-1 glass-frontier p-4 sm:p-6 flex flex-col gap-4 border border-red-400/20 hover:border-red-400/50 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-red-500/10 flex items-center justify-center text-red-400 border border-red-400/30 flex-shrink-0">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white uppercase">Emergency Contacts</h3>
          <p className="text-frontier-text text-[10px] uppercase tracking-wider">Important numbers — save these before you travel</p>
        </div>
      </div>

      {/* Contact rows */}
      <div className="flex-1 space-y-1.5">
        {CONTACTS.map(c => (
          <div key={c.label}
            className="group flex items-center justify-between gap-2 border border-red-400/10 hover:border-red-400/40 bg-frontier-navy/30 px-3 py-2 transition-all">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">{c.flag}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{c.label}</span>
              </div>
              <div className="text-[8px] text-frontier-text/80 uppercase tracking-wider truncate">{c.desc}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <a
                href={`tel:${c.num.replace(/-/g, '')}`}
                className="flex items-center gap-1.5 bg-red-500/90 hover:bg-red-500 text-white px-3 py-1.5 text-[11px] font-black tracking-widest transition-all"
                title={`Call ${c.num}`}>
                <span className="material-symbols-outlined text-sm">call</span>
                {c.num}
              </a>
              <button onClick={() => copy(c.num)}
                title="Copy number"
                className="w-7 h-7 flex items-center justify-center text-frontier-indigo border border-frontier-indigo/20 hover:bg-frontier-indigo/10 transition-all flex-shrink-0">
                <span className="material-symbols-outlined text-sm">{copied === c.num ? 'check' : 'content_copy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-red-400/10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          <span className="text-[9px] text-frontier-text uppercase tracking-widest">Tap to call · works on mobile</span>
        </div>
        <span className="text-[9px] text-red-400 uppercase tracking-widest">Stay safe</span>
      </div>
    </div>
  );
}
