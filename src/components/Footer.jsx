import React from 'react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-frontier-indigo/10 bg-frontier-navy/30">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-2xl font-black tracking-widest text-frontier-indigo mb-4">ZENTRYX</div>
        <p className="text-frontier-text text-[11px] uppercase tracking-widest mb-8">
          The Digital Frontier — Your smart travel companion.
        </p>
        <div className="flex justify-center gap-6 mb-8">
          {['About', 'Privacy', 'Terms', 'Contact'].map((item) => (
            <a key={item} href="#" className="text-frontier-text text-[10px] uppercase tracking-widest hover:text-frontier-indigo transition-colors"
              onClick={(e) => { e.preventDefault(); }}>
              {item}
            </a>
          ))}
        </div>
        <div className="text-frontier-text/40 text-[9px] uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Zentryx — All rights reserved.
        </div>
      </div>
    </footer>
  );
}