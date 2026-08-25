import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import community from '../data/community';
import { escapeHtml } from '../lib/helpers';

export default function CommunitySection() {
  const { state, setCommunity, openModal, addLog } = useApp();
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [threads, setThreads] = useState(community.threads);

  const sendMessage = () => {
    const text = msg.trim();
    if (!text) return;
    setMsg('');
    addLog(`Community message sent: ${text.slice(0, 40)}...`);
    setThreads(prev => [{
      id: Date.now(),
      user: state.session?.name || 'Guest_Explorer',
      rank: 'Verified Traveler',
      trust: '4.5★',
      msg: text,
      time: 'just now'
    }, ...prev]);
  };

  return (
    <section className="py-24 px-6 border-t border-frontier-indigo/10" id="community-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="material-symbols-outlined text-frontier-lime text-6xl mb-8" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          <h2 className="font-headline text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Traveler Network</h2>
          <p className="font-body text-frontier-text uppercase tracking-widest text-sm max-w-2xl mx-auto">
            Connect with verified travelers, share intel, and discover the hidden gems only locals know.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Threads */}
          <div className="glass-frontier border border-frontier-indigo/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black uppercase tracking-widest text-sm">Community Intel</h3>
              <button onClick={() => setChatOpen(!chatOpen)}
                className="text-[9px] font-black uppercase tracking-widest text-frontier-lime border border-frontier-lime/30 px-3 py-1.5 hover:bg-frontier-lime/10 transition-all">
                {chatOpen ? 'Hide Chat' : 'Open Chat'}
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {threads.map(t => (
                <div key={t.id} className="glass-frontier p-4 border border-frontier-indigo/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-frontier-indigo/20 flex items-center justify-center text-frontier-deep font-black text-xs">
                      {t.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white text-[10px] font-bold uppercase tracking-widest">{t.user}</div>
                      <div className="text-[8px] text-frontier-indigo/60 uppercase tracking-widest">{t.rank} · {t.trust} · {t.time}</div>
                    </div>
                  </div>
                  <p className="text-frontier-text text-[11px] leading-relaxed">{t.msg}</p>
                </div>
              ))}
            </div>
            {chatOpen && (
              <div className="flex gap-2 mt-4">
                <input value={msg} onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Share intel with the network..."
                  className="flex-1 bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[11px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime transition-colors" />
                <button onClick={sendMessage} className="bg-frontier-lime text-frontier-deep px-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110">Send</button>
              </div>
            )}
          </div>

          {/* Reputation ranking */}
          <div className="glass-frontier border border-frontier-indigo/10 p-6">
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6">Top Contributors</h3>
            <div className="space-y-3">
              {community.ranking.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border border-frontier-indigo/10 hover:border-frontier-indigo/30 transition-all">
                  <div className={`w-8 h-8 flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-frontier-lime text-frontier-deep' : i === 1 ? 'bg-frontier-indigo text-frontier-deep' : 'bg-frontier-navy text-frontier-text border border-frontier-indigo/20'}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[11px] font-bold uppercase tracking-widest">{r.user}</div>
                    <div className="text-[9px] text-frontier-indigo/60 uppercase tracking-widest">{r.assists} assists</div>
                  </div>
                  <div className="text-frontier-lime text-xs font-black">{r.xp} XP</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}