import { useEffect, useRef } from 'react';

// Ports the original scroll physics: smooth lerp scroll tracking,
// hero parallax zoom-out, title fade, spinner rotation, and the
// hero-image desaturation to black & white as the user scrolls away.
export function useScrollEffects() {
  const stateRef = useRef({
    current: 0,
    target: 0,
    rafId: null,
    lastFrame: 0
  });

  useEffect(() => {
    const st = stateRef.current;

    const onScroll = () => {
      st.target = window.scrollY;
      if (st.rafId === null) {
        st.rafId = requestAnimationFrame(renderLoop);
      }
    };

    const renderLoop = (timestamp) => {
      st.rafId = null;
      const dt = Math.min((timestamp - st.lastFrame) / 16.667, 3);
      st.lastFrame = timestamp;
      st.current += (st.target - st.current) * (1 - Math.pow(0.9, dt));
      const y = st.current;
      const delta = Math.abs(st.target - st.current);

      const heroWrap = document.getElementById('hero-images');
      const heroGroup = document.querySelector('#hero-section .z-10');
      const heroImgs = document.querySelectorAll('#hero-section img');
      const spinners = document.querySelectorAll('.grid .relative.w-full.h-full > div.rounded-full');
      const navbar = document.querySelector('nav');

      // Hero images: parallax + desaturate on scroll
      if (heroImgs.length >= 3) {
        const s1 = Math.max(1.3 - y * 0.0005, 1.0);
        const s2 = Math.max(1.2 - y * 0.0003, 1.0);
        const s3 = Math.max(1.4 - y * 0.0006, 1.0);
        heroImgs[0].style.transform = `scale(${s1}) translateY(${y * 0.15}px)`;
        heroImgs[1].style.transform = `scale(${s2}) translateY(${y * 0.05}px)`;
        heroImgs[2].style.transform = `scale(${s3}) translateY(${y * 0.25}px)`;
      }
      if (heroWrap) {
        const gray = Math.min(y / 800, 1);
        heroWrap.style.filter = `grayscale(${gray})`;
        heroWrap.style.opacity = String(Math.max(0.4 - y / 1500, 0.05));
      }
      if (heroGroup) {
        heroGroup.style.transform = `translateY(${y * -0.3}px)`;
        heroGroup.style.opacity = Math.max(1 - y / 500, 0);
      }
      if (spinners.length >= 2) {
        spinners[0].style.transform = `translate(-50%, -50%) rotate(${y * 0.25}deg)`;
        spinners[1].style.transform = `translate(-50%, -50%) rotate(${y * -0.35}deg)`;
      }
      if (navbar) {
        if (y > 50) navbar.classList.add('nav-scrolled');
        else navbar.classList.remove('nav-scrolled');
      }

      if (delta > 0.5) {
        st.rafId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    renderLoop(performance.now());

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (st.rafId !== null) cancelAnimationFrame(st.rafId);
    };
  }, []);
}