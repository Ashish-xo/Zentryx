import React from 'react';
import { useApp } from '../context/AppContext';

export default function Testimonials() {
  const { openModal } = useApp();
  const items = [
    {
      quote: "Zentryx completely changed how I travel. The route planner and live weather saved me twice on my trip to Shimla.",
      name: 'Priya Sharma', role: 'Backpacker · 12 countries',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUMMeZDpMj3Q-AKSRb7AyjfWIgckZz13QRxmUaaYKSDYRiLVCt1ewKKNR-yQzLzaawKqC6H_-8kyHWl-vXO6ahTMO4xJCBAKWqAG5uSObnwJ0Pzq1WUOGCZgBr51JeX7z_kX5J5Q7_fzdtIt031SLU2DsnvUP9aPINimJKcuAFfrLkwXFzDsiVGrd8GJWZjHwmEwBbqXDHPznIJpehnhnmKV7hYmUE0qeg7EMB37Sj3TloN1ywCBp92nzFn7wAe6NXaUT2t2bv1ow9'
    },
    {
      quote: "The community network is genius. I found a hidden cafe in Manali through the traveler intel that wasn't on any map.",
      name: 'Marcus Thorne', role: 'Digital Nomad',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUMMeZDpMj3Q-AKSRb7AyjfWIgckZz13QRxmUaaYKSDYRiLVCt1ewKKNR-yQzLzaawKqC6H_-8kyHWl-vXO6ahTMO4xJCBAKWqAG5uSObnwJ0Pzq1WUOGCZgBr51JeX7z_kX5J5Q7_fzdtIt031SLU2DsnvUP9aPINimJKcuAFfrLkwXFzDsiVGrd8GJWZjHwmEwBbqXDHPznIJpehnhnmKV7hYmUE0qeg7EMB37Sj3TloN1ywCBp92nzFn7wAe6NXaUT2t2bv1ow9'
    },
    {
      quote: "Budget planner gave me exact costs for a Goa trip — train, hotel, food, everything. Travel planning has never been this easy.",
      name: 'Ananya Patel', role: 'Student Traveler',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUMMeZDpMj3Q-AKSRb7AyjfWIgckZz13QRxmUaaYKSDYRiLVCt1ewKKNR-yQzLzaawKqC6H_-8kyHWl-vXO6ahTMO4xJCBAKWqAG5uSObnwJ0Pzq1WUOGCZgBr51JeX7z_kX5J5Q7_fzdtIt031SLU2DsnvUP9aPINimJKcuAFfrLkwXFzDsiVGrd8GJWZjHwmEwBbqXDHPznIJpehnhnmKV7hYmUE0qeg7EMB37Sj3TloN1ywCBp92nzFn7wAe6NXaUT2t2bv1ow9'
    }
  ];

  return (
    <section className="py-32 px-6 border-t border-frontier-indigo/10" id="testimonial-section">
      <div className="max-w-4xl mx-auto text-center">
        <span className="material-symbols-outlined text-frontier-lime text-6xl mb-8" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
        <h2 className="font-headline text-3xl sm:text-5xl font-black text-white mb-16 uppercase tracking-tighter">Traveler Stories</h2>
        <div className="space-y-16">
          {items.map((t, i) => (
            <div key={i} className="text-center">
              <blockquote className="font-headline text-xl sm:text-2xl text-frontier-text leading-relaxed mb-8 italic">
                "{t.quote}"
              </blockquote>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border border-frontier-indigo">
                  <img alt={t.name} loading="lazy" src={t.avatar} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-white uppercase tracking-widest">{t.name}</h4>
                <div className="text-frontier-indigo text-[10px] uppercase tracking-widest mt-1">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}