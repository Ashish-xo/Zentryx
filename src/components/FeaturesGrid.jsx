import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchWeatherByCoords, getWeatherForCurrentArea } from '../lib/weather';
import weatherCodes from '../data/weatherCodes';

function WeatherCard() {
  const { state, openModal, setWeatherModal } = useApp();
  const [temp, setTemp] = useState('--°C');
  const [desc, setDesc] = useState('Accurate, up-to-the-minute weather forecasts for every stop on your trip.');
  const [icon, setIcon] = useState('cloudy_snowing');

  useEffect(() => {
    let alive = true;
    getWeatherForCurrentArea().then(async (coords) => {
      try {
        const d = await fetchWeatherByCoords(coords.lat, coords.lon);
        if (!alive) return;
        const code = d.current?.weather_code;
        const t = d.current?.temperature_2m;
        if (t != null) setTemp(`${Math.round(t)}°C`);
        if (code != null) setDesc(weatherCodes[code] || 'Current conditions');
        if (code != null) {
          const map = { 0: 'sunny', 1: 'sunny', 2: 'partly_cloudy_day', 3: 'cloud', 45: 'foggy', 48: 'foggy', 51: 'rainy', 53: 'rainy', 55: 'rainy', 61: 'rainy', 63: 'rainy', 65: 'rainy', 71: 'weather_snowy', 73: 'weather_snowy', 75: 'weather_snowy', 80: 'rainy', 81: 'rainy', 82: 'rainy', 95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm' };
          setIcon(map[code] || 'cloudy_snowing');
        }
      } catch { /* keep defaults */ }
    });
    return () => { alive = false; };
  }, []);

  return (
    <div className="md:col-span-1 glass-frontier p-8 flex flex-col justify-between group hover:border-frontier-indigo transition-all border border-frontier-indigo/10 cursor-pointer"
      onClick={() => setWeatherModal({ open: true, data: null })}>
      <div className="flex justify-between items-start">
        <span className="material-symbols-outlined text-4xl text-frontier-indigo">{icon}</span>
        <div className="text-right">
          <div className="text-4xl font-headline font-black text-white">{temp}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-frontier-indigo">LIVE_UPDATE</div>
        </div>
      </div>
      <div className="mt-20">
        <h3 className="text-2xl font-headline font-bold text-white uppercase mb-2">Live Weather Tracking</h3>
        <p className="text-frontier-text text-sm uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
}

function StaysCard() {
  const { state, openModal, setDashView } = useApp();
  const [query, setQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const searchStays = async (q) => {
    const qq = (q ?? query).trim().toLowerCase();
    if (!qq) return;
    setSearched(false);
    // Local hotel data lives in community hotspots + curated stays
    const { default: hotels } = await import('../data/hotels');
    let list = hotels.filter(h => (h.name + ' ' + (h.city || '') + ' ' + (h.tags || []).join(' ')).toLowerCase().includes(qq));
    if (sortAsc) list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    else list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    setResults(list);
    setSearched(true);
  };

  return (
    <div className="md:col-span-2 glass-frontier p-4 sm:p-8 flex flex-col gap-6 border border-frontier-indigo/10 hover:border-frontier-indigo/30 transition-all overflow-hidden relative group"
      id="stays-card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-frontier-indigo/10 flex items-center justify-center text-frontier-indigo border border-frontier-indigo/30 neon-glow-indigo flex-shrink-0">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
        </div>
        <div>
          <h3 className="text-xl font-headline font-bold text-white uppercase">Curated Stays</h3>
          <p className="text-frontier-text text-[11px] uppercase tracking-wider">Expert-vetted accommodations — Intelligence-driven results</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-frontier-indigo/50 text-sm">search</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchStays()}
            type="text" placeholder="Location (e.g. Goa, Mumbai...)"
            className="w-full bg-frontier-deep border border-frontier-indigo/30 pl-9 pr-3 py-2 text-[11px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-indigo transition-colors" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => searchStays()}
            className="flex-1 sm:flex-none justify-center bg-frontier-indigo text-white px-4 py-2 text-[10px] uppercase font-black hover:scale-105 active:scale-95 transition-all">Search</button>
          <button onClick={() => { setSortAsc(!sortAsc); if (searched) searchStays(); }}
            className="flex-1 sm:flex-none justify-center border border-frontier-indigo/30 text-frontier-indigo px-3 py-2 text-[9px] uppercase font-bold hover:bg-frontier-indigo/10 flex items-center gap-1 transition-all">
            <span className="material-symbols-outlined text-sm">swap_vert</span> Price: {sortAsc ? 'Low' : 'High'}
          </button>
        </div>
      </div>

      <div id="stay-results-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {!searched && (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-frontier-indigo/40 space-y-3">
            <span className="material-symbols-outlined text-4xl opacity-20">travel_explore</span>
            <span className="text-[9px] uppercase tracking-[0.3em]">Querying global hospitality API...</span>
          </div>
        )}
        {searched && results.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-frontier-indigo/40 space-y-3">
            <span className="material-symbols-outlined text-4xl opacity-20">search_off</span>
            <span className="text-[9px] uppercase tracking-[0.3em]">No stays found for "{query}"</span>
          </div>
        )}
        {results.map((h, i) => (
          <div key={i} className="glass-frontier border border-frontier-indigo/10 hover:border-frontier-indigo group cursor-pointer transition-all p-3"
            onClick={() => openModal(h.name, h.desc || h.address || '', true)}>
            <div className="h-24 relative overflow-hidden mb-2">
              <img src={h.img} loading="lazy" alt={h.name} className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 group-hover:brightness-100 transition-all duration-700" />
              <div className="absolute top-1 right-1 bg-frontier-deep/90 px-1.5 py-0.5 text-[8px] font-bold text-frontier-lime">{h.rating || 4.5} ★</div>
            </div>
            <div className="text-white font-bold uppercase tracking-widest text-[11px]">{h.name}</div>
            <div className="text-frontier-text text-[9px] uppercase tracking-wider">{h.city || ''} · ₹{(h.price || 0).toLocaleString('en-IN')}/night</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-frontier-indigo/10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-frontier-lime animate-pulse"></span>
          <span className="text-[9px] text-frontier-text uppercase tracking-widest">Real-time occupancy tracking</span>
        </div>
        <div className="text-[10px] text-frontier-indigo font-bold uppercase tracking-widest cursor-pointer hover:underline"
          onClick={() => setDashView('map')}>View Map Heatmap</div>
      </div>
    </div>
  );
}

function RoutePlanner() {
  const { state, addLog, scrollToSection } = useApp();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState('driving');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateRoute = async () => {
    if (!from.trim() || !to.trim()) { setError('Enter both origin and destination.'); return; }
    setLoading(true); setError('');
    try {
      const geocode = async (q) => {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`);
        const d = await r.json();
        return d.results?.[0] ? { lat: d.results[0].latitude, lon: d.results[0].longitude } : null;
      };
      const [a, b] = await Promise.all([geocode(from), geocode(to)]);
      if (!a || !b) { setError('Could not find one of those places.'); setLoading(false); return; }
      const profile = mode === 'driving' ? 'driving' : mode === 'cycling' ? 'cycling' : 'walking';
      const r = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false&steps=true`);
      const d = await r.json();
      if (!d.routes?.length) { setError('No route found between those places.'); setLoading(false); return; }
      const rt = d.routes[0];
      const steps = rt.legs[0].steps.map(s => ({
        text: s.maneuver.instruction || s.name,
        dist: s.distance,
        time: s.duration
      }));
      setRoute({
        distanceKm: rt.distance / 1000,
        durationSec: rt.duration,
        steps,
        coords: [[a.lat, a.lon], [b.lat, b.lon]]
      });
      addLog(`Route calculated: ${from} → ${to} (${mode}).`);
    } catch {
      setError('Route service unreachable. Try again in a moment.');
    }
    setLoading(false);
  };

  return (
    <div className="md:col-span-2 glass-frontier p-4 sm:p-8 flex flex-col gap-6 border border-frontier-indigo/10 hover:border-frontier-lime transition-all"
      id="route-planner-card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-frontier-lime/10 flex items-center justify-center text-frontier-lime border border-frontier-lime/30 neon-glow-lime flex-shrink-0">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>alt_route</span>
        </div>
        <div>
          <h3 className="text-xl font-headline font-bold text-white uppercase">Route Planner</h3>
          <p className="text-frontier-text text-[11px] uppercase tracking-wider">Shortest path — powered by OpenStreetMap routing</p>
        </div>
        <button onClick={() => navigator.geolocation?.getCurrentPosition(
          (pos) => setFrom(`${pos.coords.latitude}, ${pos.coords.longitude}`),
          () => setError('Location access denied.'))}
          className="ml-auto flex-shrink-0 flex items-center gap-1 text-[10px] uppercase tracking-widest text-frontier-lime border border-frontier-lime/30 hover:bg-frontier-lime/10 px-3 py-2 transition-all">
          <span className="material-symbols-outlined text-sm">my_location</span> Use My Location
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-frontier-indigo/70 mb-1 block">From</label>
          <input value={from} onChange={e => setFrom(e.target.value)} type="text" placeholder="Origin (city, address...)"
            className="w-full bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[12px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime transition-colors" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-frontier-indigo/70 mb-1 block">To</label>
          <input value={to} onChange={e => setTo(e.target.value)} type="text" placeholder="Destination (city, address...)"
            className="w-full bg-frontier-deep border border-frontier-indigo/30 px-3 py-2 text-[12px] text-white placeholder-frontier-text focus:outline-none focus:border-frontier-lime transition-colors" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[['driving', 'directions_car', 'Drive'], ['cycling', 'directions_bike', 'Cycle'], ['walking', 'directions_walk', 'Walk']].map(([m, ic, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-all ${mode === m ? 'border-frontier-lime text-frontier-lime bg-frontier-lime/10' : 'border-frontier-indigo/30 text-frontier-indigo hover:border-frontier-lime hover:text-frontier-lime'}`}>
              <span className="material-symbols-outlined text-sm">{ic}</span> {label}
            </button>
          ))}
        </div>
        <button onClick={calculateRoute}
          className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-1.5 text-[10px] uppercase tracking-widest bg-frontier-lime text-frontier-deep font-black hover:brightness-110 transition-all">
          <span className="material-symbols-outlined text-sm">route</span> Get Route
        </button>
      </div>
      {loading && <div className="text-[11px] text-frontier-lime/60 uppercase tracking-widest animate-pulse">Calculating shortest path...</div>}
      {error && <div className="text-[11px] text-red-400 uppercase tracking-widest">{error}</div>}
      {route && (
        <div id="route-results">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="glass-frontier p-3 border border-frontier-lime/20 text-center">
              <div className="text-[9px] uppercase tracking-widest text-frontier-indigo/60 mb-1">Distance</div>
              <div className="text-frontier-lime font-black text-lg">{route.distanceKm < 1 ? Math.round(route.distanceKm * 1000) + ' m' : route.distanceKm.toFixed(1) + ' km'}</div>
            </div>
            <div className="glass-frontier p-3 border border-frontier-lime/20 text-center">
              <div className="text-[9px] uppercase tracking-widest text-frontier-indigo/60 mb-1">Est. Time</div>
              <div className="text-frontier-lime font-black text-lg">{Math.round(route.durationSec / 60)} min</div>
            </div>
            <div className="glass-frontier p-3 border border-frontier-lime/20 text-center">
              <div className="text-[9px] uppercase tracking-widest text-frontier-indigo/60 mb-1">Maneuvers</div>
              <div className="text-frontier-lime font-black text-lg">{route.steps.length}</div>
            </div>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {route.steps.map((s, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] text-frontier-text border-b border-frontier-indigo/10 pb-1">
                <span>{i + 1}. {s.text}</span>
                <span className="text-frontier-indigo/60 flex-shrink-0 ml-2">{s.dist < 1000 ? Math.round(s.dist) + ' m' : (s.dist / 1000).toFixed(1) + ' km'}</span>
              </div>
            ))}
          </div>
          <button onClick={() => scrollToSection('dashboard-section')}
            className="mt-3 text-[10px] uppercase tracking-widest text-frontier-lime border border-frontier-lime/30 hover:bg-frontier-lime/10 px-3 py-2 w-full transition-all flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">map</span> View on Map
          </button>
        </div>
      )}
    </div>
  );
}

function NavCard() {
  const { scrollToSection } = useApp();
  return (
    <div className="md:col-span-1 bg-frontier-indigo p-8 flex flex-col justify-between text-frontier-deep group hover:brightness-110 transition-all">
      <div className="flex justify-between items-start">
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        <span className="text-[10px] uppercase tracking-widest font-black">Navigation</span>
      </div>
      <div className="mt-20">
        <h3 className="text-2xl font-headline font-black uppercase mb-2">Hidden Gems</h3>
        <p className="text-frontier-deep/80 text-sm font-bold uppercase tracking-wide">Discover off-the-beaten-path locations recommended by our trusted community.</p>
        <button onClick={() => scrollToSection('dashboard-section')} className="mt-6 flex items-center gap-2 group-hover:translate-x-2 transition-transform">
          <span className="font-black text-xs uppercase tracking-widest">View Map</span>
          <span className="material-symbols-outlined text-sm">trending_flat</span>
        </button>
      </div>
    </div>
  );
}

export default function FeaturesGrid() {
  const { openModal } = useApp();
  return (
    <section className="py-24 px-6 bg-frontier-deep relative" id="features-grid-section">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="font-headline text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Real-Time Updates</h2>
            <p className="font-body text-frontier-text uppercase tracking-widest text-sm">Live information perfectly synchronized with your itinerary.</p>
          </div>
          <div className="flex gap-4">
            {['arrow_back', 'arrow_forward'].map(ic => (
              <button key={ic} onClick={() => openModal('Auto Sync On', 'We are automatically handling your navigation to save you time.')}
                className="w-12 h-12 border border-frontier-indigo/30 flex items-center justify-center text-frontier-indigo hover:bg-frontier-indigo hover:text-frontier-deep transition-all">
                <span className="material-symbols-outlined">{ic}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <WeatherCard />
          <StaysCard />
          <RoutePlanner />
          <NavCard />
        </div>
      </div>
    </section>
  );
}