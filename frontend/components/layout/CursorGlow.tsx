'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme-context';

export function CursorGlow() {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  useEffect(() => {
    // Only track if device supports fine pointer (mouse/trackpad)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed w-64 h-64 rounded-full filter blur-3xl transition-transform duration-75 ease-out z-50 ${
        isMorning ? 'bg-rose-500/10' : 'bg-emerald-500/10'
      }`}
      style={{
        transform: `translate3d(${position.x - 128}px, ${position.y - 128}px, 0)`,
        opacity: isVisible ? 1 : 0,
        transition: 'transform 75ms ease-out, opacity 250ms ease',
      }}
    />
  );
}
