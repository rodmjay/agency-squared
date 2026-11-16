"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Looping demos play only while on screen, never when the visitor asked for reduced motion,
 * and can be paused (WCAG 2.2.2: anything that moves on its own for over 5 seconds needs a pause).
 */
export function useAutoplay<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true); // Until the observer reports, assume on screen.
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { mq.removeEventListener("change", sync); io.disconnect(); };
  }, []);

  return { ref, playing: visible && !paused && !reduced, paused, reduced, setPaused };
}
