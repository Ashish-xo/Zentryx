import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchWeatherByCoords, getWeatherForCurrentArea } from '../lib/weather';
import weatherCodes from '../data/weatherCodes';
import community from '../data/community';
import { escapeHtml } from '../lib/helpers';

// Leaflet is lazy-loaded inside the map effect — saves ~150KB from the initial
// bundle so the site loads faster, especially on mobile 4G.

function MapView() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const heatRef = useRef(null);
  const { state, addLog, openModal } = useApp();
  const [layers, setLayers] = useState({ users: true, hotspots: true, alerts: true });
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [visible, setVisible] = useState(true);
  const [temp, setTemp] = useState('--°');
  const [coord, setCoord] = useState(null);
  const [mapScrollOn, setMapScrollOn] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // Toggle map interaction — works for BOTH pointer (mouse wheel) and touch.
  // Locked  = page scrolls normally over the map (wheel AND touch drag disabled)
  // Unlocked = map captures input for zoom + pan (wheel, touch, double-click)
  const toggleMapScroll = () => {
    if (!leafletMap.current) return;
    const next = !mapScrollOn;
    setMapScrollOn(next);
    const map = leafletMap.current;
    if (next) {
      map.scrollWheelZoom.enable();
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      map.getContainer().style.setProperty('cursor', 'grab', 'important');
    } else {
      map.scrollWheelZoom.disable();
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      map.getContainer().style.setProperty('cursor', 'default', 'important');
    }
  };

  // Init map once — Leaflet loads on demand (code-split, ~150KB saved initially)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (leafletMap.current || !mapRef.current) return;
      const [{ default: L }, { default: leafletCss }] = await Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
      ]);
      if (cancelled || leafletMap.current) return;
      const map = L.map(mapRef.current, {
        center: [22.5, 79.5],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0,
        minZoom: 2,
        // Starts LOCKED for both pointer and touch: the page scrolls normally
        // over the map until the user taps the toggle to enable interaction.
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
        bounds: [[-90, -180], [90, 180]],
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      // Add custom zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      leafletMap.current = map;

      // Try to get the user's precise location — if they allow, fly to
      // their position AND drop a blue pulsing "you are here" dot.
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          map.setView([lat, lon], 14, { animate: true, duration: 1.5 });
          window.__addUserDot(lat, lon);
          addLog(`Location acquired: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        },
        () => { /* geolocation denied — keep India overview */ },
        { timeout: 7000, enableHighAccuracy: true }
      );

      // Map starts locked — enforce a "default" cursor so the grab-hand doesn't
      // suggest the map is pannable before the user unlocks it.
      map.getContainer().style.cursor = 'default';
      map.getContainer().style.setProperty('cursor', 'default', 'important');

      // Blue pulsing "you are here" dot — visible precise-location marker.
      // Exposed on window so both geolocation and snapToMe can drop it.
      let userDotLayer = null;
      let userPulseLayer = null;
      window.__addUserDot = (lat, lon) => {
        if (userDotLayer) map.removeLayer(userDotLayer);
        if (userPulseLayer) map.removeLayer(userPulseLayer);
        userDotLayer = L.circleMarker([lat, lon], {
          radius: 8,
          color: '#ffffff',
          weight: 2.5,
          fillColor: '#3b82f6',
          fillOpacity: 0.95
        }).addTo(map);
        userPulseLayer = L.circleMarker([lat, lon], {
          radius: 18,
          color: 'transparent',
          fillColor: '#3b82f6',
          fillOpacity: 0.25
        }).addTo(map);
        const pulseEl = userPulseLayer.getElement();
        if (pulseEl) {
          pulseEl.style.animation = 'locPulse 2s ease-out infinite';
          pulseEl.style.transformOrigin = 'center';
        }
      };

      // Community markers
      community.users.forEach(u => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full border-2 border-frontier-indigo animate-pulse p-0.5 bg-frontier-navy overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=${u.id}" loading="lazy" class="rounded-full w-full h-full object-cover">
          </div>
          <div class="absolute -bottom-1 -right-1 bg-frontier-lime w-2.5 h-2.5 rounded-full border border-frontier-deep"></div>
        </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        const mk = L.marker([u.lat, u.lon], { icon }).addTo(map);
        mk.bindPopup(`<div class="glass-frontier p-4 border border-frontier-indigo/30 min-w-[200px]">
          <div class="flex justify-between items-center mb-2">
            <span class="text-[10px] font-black text-white uppercase">${escapeHtml(u.name)}</span>
            <span class="reputation-badge">Trust: ${u.trust}★</span>
          </div>
          <p class="text-[9px] text-frontier-indigo uppercase tracking-wider italic mb-3">"${escapeHtml(u.status)}"</p>
        </div>`);
        markersRef.current.push(mk);
      });

      // Hotspots
      community.hotspots.forEach(h => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="w-6 h-6 rounded border border-frontier-indigo/50 flex-shrink-0 opacity-80 overflow-hidden"><img loading="lazy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3ALzx01r-awRGOh7Dsk-AcsxbAfyhkqvV9r6NX4ha6YT6myF_FNHcqcqtsOTTDnEExCuYsI6vU6JzT8MqjQJrzsnUHuQY_Ysk42SvP0ZK4AkFSYXoVDMLVGa2gm1slf0mv6R3SVO4JoOlfj8tk73XmTZ4oOJjMZu9a4oTH4LQwkjh4peFxcfOtRAPPZhxfGCSEA2RUQqGvpP91S0b1M0HjSnGQRETZx2ez3GYq8RaEyYMc4ZyTGT9IKHB_8d2FrvioVC01p5PVxxx" class="w-full h-full object-cover"/></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const mk = L.marker([h.lat, h.lon], { icon }).addTo(map);
        mk.bindPopup(`<div class="glass-frontier p-4 border border-frontier-indigo/30 min-w-[220px]">
          <h4 class="text-xs font-black text-white uppercase mb-1">${escapeHtml(h.name)}</h4>
          <div class="flex items-center gap-2 mb-3">
            <span class="text-[8px] font-bold uppercase tracking-widest text-frontier-lime">${escapeHtml(h.availability)}</span>
            <span class="w-1 h-1 bg-white/20 rounded-full"></span>
            <span class="text-[8px] text-frontier-text uppercase">${escapeHtml(h.type)}</span>
          </div>
          <div class="space-y-1">${h.posts.map(p => `<div class="text-[9px] text-frontier-text border-b border-frontier-indigo/10 pb-1">"${escapeHtml(p)}"</div>`).join('')}</div>
        </div>`);
        markersRef.current.push(mk);
      });

      // Alerts
      community.alerts.forEach(a => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="w-5 h-5 rounded-full bg-red-500/80 border border-red-300 flex items-center justify-center text-[10px] text-white font-black">!</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        const mk = L.marker([a.lat, a.lon], { icon }).addTo(map);
        mk.bindPopup(`<div class="glass-frontier p-4 border border-red-400/30 min-w-[200px]">
          <div class="text-[8px] font-bold uppercase tracking-widest text-red-400 mb-1">${escapeHtml(a.type)} alert · ${escapeHtml(a.severity)}</div>
          <p class="text-[10px] text-white">${escapeHtml(a.msg)}</p>
        </div>`);
        markersRef.current.push(mk);
      });

      // Heatmap
      try {
        const heat = L.heatLayer(
          community.hotspots.map(h => [h.lat, h.lon, 1]),
          { radius: 30, blur: 25, maxZoom: 17 }
        );
        heatRef.current = heat;
        heat.addTo(map);
      } catch { /* heat plugin may not load in some environments */ }

      // Click to show coords
      map.on('click', (e) => setCoord({ lat: e.latlng.lat.toFixed(5), lon: e.latlng.lng.toFixed(5) }));
      map.on('click', () => addLog('Map signal acquired.'));
      setMapLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Weather mini-HUD
  useEffect(() => {
    getWeatherForCurrentArea().then(async (c) => {
      try {
        const d = await fetchWeatherByCoords(c.lat, c.lon);
        setTemp(`${Math.round(d.current?.temperature_2m ?? 0)}°`);
      } catch { /* keep default */ }
    });
  }, []);

  // Toggle layers
  useEffect(() => {
    markersRef.current.forEach((mk, i) => {
      const type = i < community.users.length ? 'users' : i < community.users.length + community.hotspots.length ? 'hotspots' : 'alerts';
      if (leafletMap.current) {
        if (layers[type]) leafletMap.current.addLayer(mk);
        else leafletMap.current.removeLayer(mk);
      }
    });
  }, [layers]);

  useEffect(() => {
    if (heatRef.current && leafletMap.current) {
      if (heatmapOn) leafletMap.current.addLayer(heatRef.current);
      else leafletMap.current.removeLayer(heatRef.current);
    }
  }, [heatmapOn]);

  const snapToMe = () => {
    if (!leafletMap.current) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        leafletMap.current.setView([pos.coords.latitude, pos.coords.longitude], 15);
        if (window.__addUserDot) window.__addUserDot(pos.coords.latitude, pos.coords.longitude);
        addLog('Location locked via GPS.');
      },
      () => addLog('GPS denied — using default position.'),
      { timeout: 6000 }
    );
  };

  const toggleLayerBtn = (key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[700px] shadow-[0_0_80px_rgba(4,8,22,0.8)] border border-frontier-indigo/10 rounded-sm group">
      <div ref={mapRef} id="map" className="w-full h-full"></div>
      {mapLoading && (
        <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-frontier-deep/80 backdrop-blur-sm">
          <span className="material-symbols-outlined text-frontier-lime text-3xl animate-pulse mb-2">map</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-frontier-indigo">Initializing map grid...</span>
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1001]"></div>

      {/* Layer buttons */}
      <div className="absolute top-2 left-2 sm:top-6 sm:left-6 z-[1000] flex flex-col gap-1 sm:gap-2">
        {[['users', 'group', 'text-frontier-indigo border-frontier-indigo/30'], ['hotspots', 'local_fire_department', 'text-frontier-lime border-frontier-lime/30'], ['alerts', 'warning', 'text-red-400 border-red-400/30']].map(([key, ic, colors]) => (
          <button key={key} onClick={() => toggleLayerBtn(key)}
            className={`glass-frontier p-2.5 rounded-lg group transition-all ${colors} ${layers[key] ? 'bg-frontier-navy/80' : 'opacity-40'}`}>
            <span className="material-symbols-outlined text-lg">{ic}</span>
          </button>
        ))}
        <button onClick={() => setHeatmapOn(!heatmapOn)}
          className={`glass-frontier p-2.5 text-orange-400 border border-orange-400/30 rounded-lg group transition-all ${heatmapOn ? 'bg-frontier-navy/80' : 'opacity-40'}`}>
          <span className="material-symbols-outlined text-lg">heat_pump</span>
        </button>
      </div>

      {/* Visibility switch */}
      <div className="absolute top-2 right-2 sm:top-6 sm:right-6 z-[1000] glass-frontier p-2 sm:p-3 flex items-center gap-2 sm:gap-4 rounded-lg border border-frontier-indigo/20">
        <span className="text-[8px] font-black uppercase tracking-widest text-frontier-text">{visible ? 'Visible' : 'Incognito'}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={visible} onChange={() => { setVisible(!visible); addLog(visible ? 'Switched to incognito.' : 'Now visible to travelers.'); }}
            className="sr-only peer" />
          <div className={`w-8 h-4 rounded-full transition-all ${visible ? 'bg-frontier-lime/20' : 'bg-frontier-indigo/10'} after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-frontier-indigo after:rounded-full after:h-3 after:w-3 after:transition-all ${visible ? 'after:translate-x-full after:bg-frontier-lime' : ''}`}></div>
        </label>
      </div>

      {/* Weather mini-HUD */}
      <div className="absolute bottom-2 left-2 sm:bottom-6 sm:left-6 z-[1000] glass-frontier p-2 sm:p-4 border border-frontier-indigo/10 flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-frontier-lime">cloud</span>
          <span className="text-xl font-black text-white">{temp}</span>
        </div>
        <div className="h-6 w-px bg-white/10"></div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-frontier-indigo">Sync active</span>
      </div>

      {/* Coords display */}
      {coord && (
        <div className="absolute bottom-16 left-2 sm:bottom-24 sm:left-6 z-[1000] glass-frontier p-2 border border-frontier-lime/30 flex items-center gap-3 text-[8px] font-bold uppercase tracking-widest">
          <span className="text-frontier-lime">COORD</span>
          <span className="text-white">{coord.lat}</span>
          <span className="w-px h-4 bg-white/10"></span>
          <span className="text-white">{coord.lon}</span>
        </div>
      )}

      {/* Map scroll lock toggle (top-center) */}
      <button onClick={toggleMapScroll}
        className={`absolute top-2 left-1/2 -translate-x-1/2 z-[1000] glass-frontier px-3 py-2 rounded-full border transition-all flex items-center gap-2 ${mapScrollOn ? 'border-frontier-lime/30 text-frontier-lime' : 'border-frontier-indigo/30 text-frontier-indigo'}`}>
        <span className="material-symbols-outlined text-sm">{mapScrollOn ? 'lock_open' : 'lock'}</span>
        <span className="text-[8px] font-black uppercase tracking-widest">{mapScrollOn ? 'Scroll On' : 'Scroll Locked'}</span>
      </button>

      {/* Snap to me */}
      <button onClick={snapToMe}
        className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 z-[1000] glass-frontier p-2 sm:p-3 text-frontier-lime border border-frontier-lime/30 rounded-full hover:bg-frontier-lime/10 transition-all">
        <span className="material-symbols-outlined">location_searching</span>
      </button>
    </div>
  );
}

function FeedView() {
  const { openModal } = useApp();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-4 bg-frontier-navy/40 p-6 flex items-center gap-8 border border-frontier-indigo/5">
        <div id="stories-strip" className="flex gap-6 overflow-x-auto no-scrollbar flex-1">
          {community.stories.map(s => (
            <div key={s.id} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => openModal(`Intel Briefing: ${s.loc}`, `<img src="${s.img}" loading="lazy" class="w-full h-64 object-cover mb-4 grayscale">`, true)}>
              <div className="story-circle ring-offset-2 ring-offset-frontier-deep">
                <img src={s.img} loading="lazy" alt={s.loc} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <span className="text-[7px] font-bold text-frontier-indigo uppercase tracking-widest">{s.loc}</span>
            </div>
          ))}
        </div>
        <button onClick={() => openModal('Share Story', 'Story upload coming in the React port.')}
          className="flex-shrink-0 w-12 h-12 border-2 border-dashed border-frontier-lime/30 rounded-full flex items-center justify-center text-frontier-lime hover:border-frontier-lime transition-all">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
      <div className="lg:col-span-4 glass-frontier border border-frontier-indigo/10 p-6">
        <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4">Community Threads</h3>
        <div className="space-y-3">
          {community.threads.map(t => (
            <div key={t.id} className="glass-frontier p-4 border border-frontier-indigo/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-frontier-indigo/20 flex items-center justify-center text-frontier-deep font-black text-xs">
                  {t.user.charAt(0)}
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
      </div>
    </div>
  );
}

function ChatView() {
  const { state } = useApp();
  return (
    <div className="glass-frontier border border-frontier-indigo/10 p-6 max-w-2xl mx-auto">
      <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4">Co-Pilot Log</h3>
      <div className="space-y-2">
        {state.coPilotLog.length === 0 && (
          <div className="text-frontier-indigo/40 text-[10px] uppercase tracking-widest py-4 text-center">No activity yet</div>
        )}
        {state.coPilotLog.slice(-12).map((l, i) => (
          <div key={i} className="text-[10px] text-frontier-text/80 border-l border-frontier-lime/30 pl-3 py-1">
            <span className="text-frontier-lime/60 mr-2">{new Date(l.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {l.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardSection() {
  const { state, setDashView } = useApp();
  const view = state.dashView;

  const tabs = [
    ['map', 'map', 'Map'],
    ['feed', 'broadcast_on_personal', 'Feed'],
    ['chat', 'forum', 'Co-Pilot']
  ];

  return (
    <section className="py-12 bg-frontier-deep border-y border-frontier-indigo/10 relative overflow-hidden" id="dashboard-section">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#ceee93 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex items-center justify-center mb-12 border-b border-frontier-indigo/10">
          <nav className="flex gap-4 sm:gap-12">
            {tabs.map(([key, ic, label]) => (
              <button key={key} onClick={() => setDashView(key)}
                className={`pb-4 text-sm font-black uppercase tracking-[0.3em] transition-all border-b-2 flex items-center gap-2 ${view === key ? 'text-frontier-indigo border-frontier-indigo' : 'text-frontier-text border-transparent hover:text-frontier-indigo'}`}>
                <span className="material-symbols-outlined text-lg">{ic}</span> {label}
              </button>
            ))}
          </nav>
        </div>
        {view === 'map' && <MapView />}
        {view === 'feed' && <FeedView />}
        {view === 'chat' && <ChatView />}
      </div>
    </section>
  );
}