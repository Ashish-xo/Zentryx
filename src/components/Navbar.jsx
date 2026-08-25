import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { state, scrollToSection, setActiveNav, openModal, setSettingsVisible, setAuthVisible } = useApp();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#070d1f]/70 backdrop-blur-xl shadow-[0_0_15px_rgba(163,166,255,0.1)] h-16">
      <div className="flex justify-between items-center px-4 sm:px-8 h-full w-full">
        <div className="text-xl font-bold tracking-widest text-[#a3a6ff]">ZENTRYX</div>
        <div className="hidden md:flex items-center space-x-8 font-['Space_Grotesk'] tracking-tight text-sm uppercase">
          {['explore', 'partners', 'routes', 'blog'].map((key) => (
            <a
              key={key}
              id={`nav-${key}`}
              className={`cursor-pointer transition-colors ${
                state.activeNav === key
                  ? 'text-[#ceee93] border-b-2 border-[#ceee93] pb-1'
                  : 'text-[#a5aac2] hover:text-[#a3a6ff]'
              }`}
              onClick={() => { setActiveNav(key); scrollToSection(getSectionId(key)); }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </a>
          ))}
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center bg-[#11192e] px-4 py-1.5 rounded border border-[#a3a6ff]/20">
            <span className="material-symbols-outlined text-sm text-[#a3a6ff] mr-2">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-xs text-[#a3a6ff] placeholder-[#a3a6ff]/40 uppercase tracking-widest"
              placeholder="SEARCH DESTINATIONS" type="text"
              onKeyDown={(e) => e.key === 'Enter' && navSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-[#a3a6ff]">
            <span className="material-symbols-outlined cursor-pointer hover:bg-[#222b47]/50 p-1.5 rounded transition-all"
              onClick={() => openModal('Notifications', 'No new alerts. You are synced with the local travel network.')}>notifications</span>
            <span className="material-symbols-outlined cursor-pointer hover:bg-[#222b47]/50 p-1.5 rounded transition-all"
              onClick={() => { if (state.session) setSettingsVisible(true); else setAuthVisible(true); }}>settings</span>
          </div>
          <div id="nav-avatar"
            className="w-8 h-8 rounded-full overflow-hidden border border-[#a3a6ff]/50 ring-2 ring-[#a3a6ff]/10 flex items-center justify-center bg-frontier-navy cursor-pointer hover:ring-frontier-lime/30 transition-all"
            onClick={() => {
              if (state.session) setSettingsVisible(true);
              else setAuthVisible(true);
            }}>
            {state.session ? (
              <span className="w-full h-full flex items-center justify-center text-frontier-deep font-black text-sm bg-frontier-lime">
                {state.session.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span className="material-symbols-outlined text-frontier-indigo text-sm">person</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function getSectionId(key) {
  const map = { explore: 'dashboard-section', partners: 'features-grid-section', routes: 'route-planner-card', blog: 'testimonial-section' };
  return map[key] || 'dashboard-section';
}

function navSearch(value) {
  const q = value.trim().toLowerCase();
  if (q.includes('route') || q.includes('travel') || q.includes('plan')) scrollToSection('route-planner-card');
  else if (q.includes('weather') || q.includes('map')) scrollToSection('dashboard-section');
  else if (q.includes('stay') || q.includes('hotel')) scrollToSection('dashboard-section');
  else if (q.includes('community') || q.includes('chat')) scrollToSection('community-section');
  else scrollToSection('dashboard-section');
}