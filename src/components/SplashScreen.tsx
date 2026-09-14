import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Complete after fade animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted transition-opacity duration-500",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Logo */}
      <div className="mb-6 animate-fade-in">
        <img 
          src="/logo.png" 
          alt="Study Track Logo" 
          className="h-32 w-auto object-contain drop-shadow-2xl"
        />
      </div>
      
      {/* App Name */}
      <h1 className="text-4xl font-bold text-foreground mb-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
        Study Track
      </h1>
      
      {/* Tagline */}
      <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: '400ms' }}>
        Stay Focused. Stay Productive.
      </p>

      {/* Loading indicator */}
      <div className="mt-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
