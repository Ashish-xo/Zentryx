import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import travelDB from '../data/travelDB';
import destinations from '../data/destinations';
import communityData from '../data/community';
import weatherCodes from '../data/weatherCodes';

const AppContext = createContext(null);

const AI_HOURLY_LIMIT = 20;
const DEFAULT_COORDS = { lat: 31.6340, lon: 74.8723, label: 'Amritsar (GPS off)' };
const NAV_KEYS = ['explore', 'partners', 'routes', 'blog'];

let modalIdCounter = 0;

export function AppProvider({ children }) {
  // --- Auth state ---
  const [session, setSessionState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zentryx_session') || 'null'); } catch { return null; }
  });
  const [authVisible, setAuthVisible] = useState(false);
  const [authError, setAuthError] = useState('');

  // --- Modal state ---
  const [modals, setModals] = useState([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [weatherModal, setWeatherModal] = useState({ open: false, data: null });
  const [budgetModal, setBudgetModal] = useState(false);
  const [askModal, setAskModal] = useState(false);

  // --- Chat state ---
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [aiQuota, setAiQuota] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zentryx_quota') || 'null') || { used: 0, resetAt: Date.now() + 3600000 }; } catch { return { used: 0, resetAt: Date.now() + 3600000 }; }
  });
  const [coPilotLog, setCoPilotLog] = useState([]);

  // --- Map state ---
  const [mapCenter, setMapCenter] = useState([DEFAULT_COORDS.lat, DEFAULT_COORDS.lon]);
  const [mapZoom, setMapZoom] = useState(14);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [routeMode, setRouteModeState] = useState('driving');
  const [currentRoute, setCurrentRoute] = useState(null);
  const [showHud, setShowHud] = useState(false);

  // --- Scroll state ---
  const currentScrollY = useRef(0);
  const targetScrollY = useRef(0);
  const [activeNav, setActiveNavState] = useState('explore');
  const [dashView, setDashView] = useState('map');

  // --- Community ---
  const [community, setCommunity] = useState(communityData);
  const [communityChatOpen, setCommunityChatOpen] = useState(false);
  const [communityChatMsgs, setCommunityChatMsgs] = useState([]);

  // --- View state ---
  const [visible, setVisible] = useState(true);

  // --- Auth helpers ---
  const getUsers = useCallback(() => {
    try { return JSON.parse(localStorage.getItem('zentryx_users') || '[]'); } catch { return []; }
  }, []);
  const saveUsers = useCallback((users) => {
    localStorage.setItem('zentryx_users', JSON.stringify(users));
  }, []);
  const setSession = useCallback((s) => {
    localStorage.setItem('zentryx_session', JSON.stringify(s));
    setSessionState(s);
  }, []);
  const clearSession = useCallback(() => {
    localStorage.removeItem('zentryx_session');
    setSessionState(null);
  }, []);

  // --- Modal helpers ---
  const openModal = useCallback((title, message, persistent = false) => {
    const id = ++modalIdCounter;
    setModals(prev => [...prev, { id, title, message, persistent }]);
  }, []);
  const closeModal = useCallback((id) => {
    setModals(prev => prev.filter(m => m.id !== id));
  }, []);

  // --- Scroll ---
  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // --- AI Quota ---
  const aiQuotaRemaining = useCallback(() => {
    const now = Date.now();
    if (now > aiQuota.resetAt) return AI_HOURLY_LIMIT;
    return Math.max(0, AI_HOURLY_LIMIT - aiQuota.used);
  }, [aiQuota]);
  const aiQuotaConsume = useCallback(() => {
    const now = Date.now();
    let q = { ...aiQuota };
    if (now > q.resetAt) { q = { used: 0, resetAt: now + 3600000 }; }
    q.used += 1;
    localStorage.setItem('zentryx_quota', JSON.stringify(q));
    setAiQuota(q);
    return q.used <= AI_HOURLY_LIMIT;
  }, [aiQuota]);

  // --- CoPilot ---
  const addLog = useCallback((msg) => {
    setCoPilotLog(prev => [...prev, { time: Date.now(), msg }]);
  }, []);

  // --- Nav ---
  const setActiveNav = useCallback((key) => {
    setActiveNavState(key);
  }, []);

  // --- Value ---
  const value = {
    state: {
      session, authVisible, authError, modals, settingsVisible,
      weatherModal, budgetModal, askModal, chatMessages, chatOpen,
      aiQuota, coPilotLog, mapCenter, mapZoom, heatmapVisible,
      routeMode, currentRoute, showHud, activeNav, dashView,
      community, communityChatOpen, communityChatMsgs, visible,
      travelDB, destinations, weatherCodes, AI_HOURLY_LIMIT,
      DEFAULT_COORDS, NAV_KEYS, currentScrollY, targetScrollY,
    },
    // Auth
    setSession, clearSession, getUsers, saveUsers,
    setAuthVisible, setAuthError,
    // Modals
    openModal, closeModal, setSettingsVisible, setWeatherModal,
    setBudgetModal, setAskModal, setModals,
    // Chat
    setChatMessages, setChatOpen, setAiQuota, aiQuotaRemaining, aiQuotaConsume,
    setCoPilotLog, addLog,
    // Map
    setMapCenter, setMapZoom, setHeatmapVisible, setRouteMode: setRouteModeState,
    setCurrentRoute, setShowHud,
    // Scroll
    scrollToSection, setActiveNav, setDashView,
    // Community
    setCommunity, setCommunityChatOpen, setCommunityChatMsgs,
    // View
    setVisible,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}