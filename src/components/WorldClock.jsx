import React, { useState, useEffect } from 'react';

// World clock — live time zones for major global cities.
// Updates every second via a single interval. No API calls needed.

const CITIES = [
  { name: 'Tokyo',    tz: 'Asia/Tokyo',        flag: '🇯🇵' },
  { name: 'London',   tz: 'Europe/London',     flag: '🇬🇧' },
  { name: 'New York', tz: 'America/New_York',  flag: '🗽' },
  { name: 'Sydney',   tz: 'Australia/Sydney',  flag: '🇦🇺' },
  { name: 'Paris',    tz: 'Europe/Paris',      flag: '🇫🇷' },
  { name: 'Mumbai',   tz: 'Asia/Kolkata',      flag: '🇮🇳' },
  { name: 'Singapore',tz: 'Asia/Singapore',    flag: '🇸🇬' },
  { name: 'São Paulo',tz: 'America/Sao_Paulo', flag: '🇧🇷' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles', flag: '🌴' },
  { name: 'Dubai',    tz: 'Asia/Dubai',        flag: '🇦🇪' },
];

function fmtTime(tz) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
  return { time, date };
}

export default function WorldClock() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Re-compute all cities on every tick, but only one state update.
  const rows = CITIES.map(c => ({
    ...c,
    ...fmtTime(c.tz),
  }));

  return (
    <div
      id="worldclock-card"
      className="md:col-span-1 glass-frontier p-4 sm:p-6 flex flex-col gap-4 border border-frontier-indigo/10 hover:border-frontier-indigo/30 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-frontier-lime/10 flex items-center justify-center text-frontier-lime border border-frontier-lime/30 neon-glow-lime flex-shrink-0">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>globe</span>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white uppercase">World Clock</h3>
          <p className="text-frontier-text text-[10px] uppercase tracking-wider">Time zones around the globe</p>
        </div>
      </div>

      {/* City rows */}
      <div className="flex-1 space-y-1.5">
        {rows.map(r => (
          <div key={r.name}
            className="flex items-center justify-between gap-2 border-b border-frontier-indigo/5 py-1.5 last:border-0 group">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm flex-shrink-0">{r.flag}</span>
              <span className="text-[11px] font-bold text-white uppercase tracking-widest truncate">{r.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-[9px] text-frontier-indigo/70 uppercase tracking-wider hidden sm:inline">{r.date}</span>
              <span className="text-white font-black text-sm tabular-nums font-mono tracking-wider">{r.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-frontier-indigo/10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-frontier-lime animate-pulse"></span>
          <span className="text-[9px] text-frontier-text uppercase tracking-widest">Live · updates every second</span>
        </div>
        <span className="text-[9px] text-frontier-indigo uppercase tracking-widest">10 cities</span>
      </div>
    </div>
  );
}