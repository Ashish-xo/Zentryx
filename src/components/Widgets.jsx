import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { queryAI } from '../lib/ai';
import { escapeHtml } from '../lib/helpers';

export function ChatWidget() {
  const { state, setChatOpen, setChatMessages, openModal } = useApp();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const userMsg = { role: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setBusy(true);
    try {
      const reply = await queryAI(text);
      setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="ai-chat-widget" className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end w-[calc(100%-32px)] sm:w-[480px]">
      {state.chatOpen && (
        <div className="w-full glass-frontier border border-frontier-indigo/30 rounded-lg overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-frontier-indigo/20 bg-frontier-navy/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-frontier-lime">smart_toy</span>
              <span className="text-white text-xs font-black uppercase tracking-widest">Zentryx AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-frontier-lime animate-pulse"></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-frontier-indigo/60 uppercase tracking-widest">
                {20 - (state.aiQuota?.used || 0)} left
              </span>
              <button onClick={() => setChatOpen(false)} className="text-frontier-text/50 hover:text-frontier-indigo text-lg leading-none">&times;</button>
            </div>
          </div>
          <div id="chat-messages" className="h-80 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {state.chatMessages.length === 0 && (
              <div className="text-center text-frontier-indigo/50 text-[10px] uppercase tracking-widest py-8">
                Ask me about routes, weather, budgets, science, survival tips, and more.
              </div>
            )}
            {state.chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-frontier-indigo text-frontier-deep' : 'bg-frontier-navy text-frontier-text border border-frontier-indigo/20'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-frontier-navy border border-frontier-indigo/20 px-3 py-2 text-[11px] text-frontier-indigo/60 animate-pulse">Thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 p-3 border-t border-frontier-indigo/20">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Message Zentryx AI..." type="text"
              className="flex-1 bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[12px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime transition-colors" />
            <button onClick={send} disabled={busy}
              className="bg-frontier-lime text-frontier-deep px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FAB() {
  const { state, setChatOpen, openModal, setDashView, scrollToSection } = useApp();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[60] flex flex-col items-end gap-3">
      {expanded && (
        <div className="flex flex-col gap-2 items-end">
          <button onClick={() => { setExpanded(false); setChatOpen(true); }}
            className="flex items-center gap-2 bg-frontier-lime text-frontier-deep px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
            <span className="material-symbols-outlined text-sm">chat</span> AI Chat
          </button>
          <button onClick={() => { setExpanded(false); openModal('Co-Pilot', 'Co-pilot active. Ask me anything about your trip.'); }}
            className="flex items-center gap-2 bg-frontier-indigo text-frontier-deep px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
            <span className="material-symbols-outlined text-sm">psychology</span> Co-Pilot
          </button>
          <button onClick={() => { setExpanded(false); setDashView('map'); scrollToSection('dashboard-section'); }}
            className="flex items-center gap-2 bg-frontier-navy text-frontier-indigo border border-frontier-indigo/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
            <span className="material-symbols-outlined text-sm">map</span> Map
          </button>
        </div>
      )}
      <button id="fab-icon" onClick={() => setExpanded(!expanded)}
        className="w-12 h-12 rounded-full bg-frontier-indigo text-frontier-deep flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all neon-glow-indigo">
        <span className="material-symbols-outlined text-2xl">{expanded ? 'close' : 'explore'}</span>
      </button>
    </div>
  );
}

export function CoPilot() {
  const { state, addLog, openModal } = useApp();
  const [input, setInput] = useState('');

  const ask = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addLog(`Co-pilot query: ${text}`);
    openModal('Co-Pilot', `Co-pilot processing: "${text}"\n\nTip: Use the AI Chat (FAB → AI Chat) for full answers.`);
  };

  if (!state.showHud) return null;
  return (
    <div className="fixed bottom-24 right-4 sm:bottom-32 sm:right-8 z-[55] w-[300px] glass-frontier border border-frontier-indigo/30 rounded-lg overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-frontier-indigo/20 bg-frontier-navy/60">
        <span className="text-white text-[10px] font-black uppercase tracking-widest">Co-Pilot</span>
        <span className="material-symbols-outlined text-frontier-lime text-sm">psychology</span>
      </div>
      <div id="co-pilot-log" className="max-h-40 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {state.coPilotLog.slice(-6).map((l, i) => (
          <div key={i} className="text-[9px] text-frontier-text/70 border-l border-frontier-indigo/30 pl-2">{l.msg}</div>
        ))}
      </div>
      <div className="flex gap-2 p-2 border-t border-frontier-indigo/20">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()} placeholder="Ask co-pilot..."
          className="flex-1 bg-frontier-deep border border-frontier-indigo/30 px-2 py-1.5 text-[11px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime" />
        <button onClick={ask} className="bg-frontier-indigo text-frontier-deep px-2.5 text-[10px] font-black uppercase hover:brightness-110">Go</button>
      </div>
    </div>
  );
}