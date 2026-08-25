import React from 'react';
import { useApp } from '../context/AppContext';

export default function Hero() {
  const { openModal, scrollToSection } = useApp();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden" id="hero-section">
      {/* Single HD scenery photo as background */}
      <div id="hero-images" className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover" loading="eager"
          alt="Scenic travel destination"
          src="/assets/hero-scenery.jpg" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
        <div className="hero-reveal inline-block mb-4 px-4 py-1.5 bg-frontier-deep/60 backdrop-blur-sm border border-frontier-indigo/40 text-frontier-indigo text-xs font-bold tracking-[0.35em] uppercase rounded-full">
          Find Your Next Adventure
        </div>
        <h1 className="hero-reveal font-headline font-black text-4xl sm:text-6xl md:text-8xl text-white leading-none mb-6 tracking-tight uppercase">
          Travel with <span className="text-frontier-lime neon-glow-lime">Ease</span>
        </h1>
        <p className="hero-reveal font-body text-lg md:text-xl text-frontier-text max-w-2xl mx-auto mb-12 tracking-wide uppercase font-light">
          Experience the world with a smart travel companion that adapts to your unique preferences and keeps you connected.
        </p>
        <div className="hero-reveal flex flex-col md:flex-row gap-6 justify-center px-4 sm:px-0">
          <button onClick={() => openModal('Budget Planner', 'Budget planning modal')}
            className="bg-frontier-indigo text-frontier-deep px-6 py-3 sm:px-12 sm:py-4 font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 neon-glow-indigo">
            Start Planning
          </button>
          <button onClick={() => openModal('Live Updates', 'Connecting to current travel conditions in your area. Please wait...')}
            className="border border-frontier-indigo text-frontier-indigo px-6 py-3 sm:px-12 sm:py-4 font-bold uppercase tracking-widest hover:bg-frontier-indigo/10 transition-all duration-300">
            Live Travel Updates
          </button>
        </div>
      </div>
    </section>
  );
}