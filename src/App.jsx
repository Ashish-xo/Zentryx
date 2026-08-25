import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useScrollEffects } from './lib/useScrollEffects';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturesGrid from './components/FeaturesGrid';
import DashboardSection from './components/DashboardSection';
import CommunitySection from './components/CommunitySection';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import AuthOverlay from './components/AuthOverlay';
import { ChatWidget, FAB, CoPilot } from './components/Widgets';
import { GenericModal, SettingsModal, WeatherModal, BudgetModal, AskModal } from './components/Modals';

function AppContent() {
  const { state, scrollToSection } = useApp();
  const [ready, setReady] = useState(false);
  useScrollEffects();

  // Lock background scroll whenever any overlay/modal is open, so wheel
  // and touch events only scroll the overlay — never the page behind it.
  useEffect(() => {
    const anyOverlayOpen =
      state.modals.length > 0 ||
      state.authVisible ||
      state.settingsVisible ||
      state.weatherModal?.open ||
      state.budgetModal ||
      state.askModal;
    if (anyOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [
    state.modals.length,
    state.authVisible,
    state.settingsVisible,
    state.weatherModal?.open,
    state.budgetModal,
    state.askModal,
  ]);

  useEffect(() => {
    setReady(true);

    // Cinematic boot sequence (plays once per session)
    const boot = document.getElementById('boot-overlay');
    if (!boot) return;
    if (sessionStorage.getItem('zentryx_booted')) {
      boot.classList.add('done');
      document.querySelectorAll('.hero-reveal').forEach(el => el.classList.add('hero-in'));
      return;
    }
    sessionStorage.setItem('zentryx_booted', '1');
    const lines = ['Establishing network link...', 'Syncing travel grid...', 'Calibrating compass...', 'Access granted.'];
    let idx = 0;
    const lineEl = document.getElementById('boot-line');
    const timer = setInterval(() => { idx++; if (idx < lines.length && lineEl) lineEl.textContent = lines[idx]; }, 450);
    setTimeout(() => {
      boot.classList.add('done');
      clearInterval(timer);
      document.querySelectorAll('.hero-reveal').forEach((el, i) => setTimeout(() => el.classList.add('hero-in'), 150 + i * 200));
    }, 2400);
    setTimeout(() => {
      boot.classList.add('done');
      document.querySelectorAll('.hero-reveal').forEach(el => el.classList.add('hero-in'));
    }, 5000);
  }, []);

  return (
    <>
      <div className="fixed inset-0 scanline z-[100] opacity-20 pointer-events-none"></div>
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <DashboardSection />
      <CommunitySection />
      <Testimonials />
      <Footer />
      <AuthOverlay />
      <SettingsModal />
      <WeatherModal />
      <BudgetModal />
      <AskModal />
      <GenericModal />
      <ChatWidget />
      <FAB />
      <CoPilot />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}