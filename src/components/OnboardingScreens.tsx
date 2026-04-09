import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BarChart3, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import onboarding1 from '@/assets/onboarding-1.webp';
import onboarding2 from '@/assets/onboarding-2.webp';
import onboarding3 from '@/assets/onboarding-3.webp';

const slides = [
  {
    image: onboarding1,
    icon: MapPin,
    title: 'Discover fishing spots worldwide',
    subtitle: 'Thousands of locations across Europe, America & beyond with real-time conditions',
  },
  {
    image: onboarding2,
    icon: BarChart3,
    title: 'Track every catch & analyze your success',
    subtitle: 'Log catches, view trends, and beat your personal records',
  },
  {
    image: onboarding3,
    icon: Users,
    title: 'Connect with anglers everywhere',
    subtitle: 'Share catches, get tips, and join a global fishing community',
  },
];

const OnboardingScreens = ({ onDone }: { onDone: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent(prev => prev + 1);
    }
  };

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const handleFinish = () => {
    localStorage.setItem('fr_onboarded', '1');
    onDone();
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col bg-background">
      {/* Skip */}
      {!isLast && (
        <button
          onClick={handleFinish}
          className="absolute right-4 top-4 z-10 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
        >
          Skip
        </button>
      )}

      {/* Image area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-8 pt-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-xl ring-1 ring-border/10">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <slide.icon className="h-6 w-6 text-primary" />
            </div>

            <div className="text-center space-y-2 px-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {slide.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {slide.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-6 px-8 pb-10 pt-4">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        {isLast ? (
          <Button
            size="lg"
            onClick={handleFinish}
            className="w-full max-w-sm text-base font-semibold h-14 rounded-2xl"
          >
            🎣 Start Fishing
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={goNext}
            variant="outline"
            className="w-full max-w-sm text-base font-semibold h-14 rounded-2xl"
          >
            Next
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreens;
