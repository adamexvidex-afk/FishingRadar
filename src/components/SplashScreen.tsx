import { useState, useEffect } from 'react';
import logoImg from '@/assets/fishingradar-logo.png';

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const isFirstVisit = !localStorage.getItem('fr_visited');
  const duration = isFirstVisit ? 2200 : 800;
  const headline = isFirstVisit ? 'Welcome' : 'Welcome back';
  const subtitle = isFirstVisit ? 'Your smart fishing companion' : null;

  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    localStorage.setItem('fr_visited', '1');
    const holdTimer = setTimeout(() => setPhase('hold'), 400);
    const outTimer = setTimeout(() => setPhase('out'), duration - 350);
    const doneTimer = setTimeout(onDone, duration);
    return () => { clearTimeout(holdTimer); clearTimeout(outTimer); clearTimeout(doneTimer); };
  }, [duration, onDone]);

  if (phase === 'out') {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/70"
        style={{ animation: 'splash-fade-out 0.25s ease forwards' }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/70"
      style={{ animation: 'splash-fade-in 0.25s ease forwards' }}
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm shadow-lg ring-1 ring-white/20"
          style={{ animation: 'splash-icon 0.4s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s both' }}
        >
          <img src={logoImg} alt="FishingRadar" className="h-12 w-12 rounded-xl" />
        </div>

        <h1
          className="font-display text-3xl font-extrabold tracking-tight text-primary-foreground"
          style={{ animation: 'splash-slide-up 0.35s ease 0.25s both' }}
        >
          FishingRadar
        </h1>

        <p
          className="text-lg font-medium text-primary-foreground/80"
          style={{ animation: 'splash-slide-up 0.3s ease 0.45s both' }}
        >
          {headline} 🎣
        </p>

        {subtitle && (
          <p
            className="text-sm text-primary-foreground/60"
            style={{ animation: 'splash-fade-in 0.4s ease 0.9s both' }}
          >
            {subtitle}
          </p>
        )}

        <div className="flex gap-1.5 mt-4" style={{ animation: `splash-fade-in 0.3s ease ${isFirstVisit ? '1.4s' : '0.5s'} both` }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary-foreground/40"
              style={{ animation: `splash-dot 0.8s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
