'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import gsap from 'gsap';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const iconRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    // Animate icon
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: 360,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(iconRef.current, { rotation: 0 });
        },
      });
    }
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full transition-all duration-300 hover:bg-accent"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div ref={iconRef} className="relative h-5 w-5">
        <Sun
          className={`absolute h-5 w-5 transition-all duration-300 ${
            resolvedTheme === 'dark'
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`absolute h-5 w-5 transition-all duration-300 ${
            resolvedTheme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </Button>
  );
}
