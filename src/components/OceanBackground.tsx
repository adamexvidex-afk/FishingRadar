import { motion } from 'framer-motion';

const OceanBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Waves */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        style={{ height: '100%' }}
      >
        <motion.path
          d="M0,280 C180,220 360,320 540,260 C720,200 900,300 1080,240 C1260,180 1350,280 1440,250 L1440,400 L0,400 Z"
          fill="hsl(var(--primary) / 0.08)"
          animate={{
            d: [
              "M0,280 C180,220 360,320 540,260 C720,200 900,300 1080,240 C1260,180 1350,280 1440,250 L1440,400 L0,400 Z",
              "M0,260 C180,300 360,240 540,290 C720,240 900,220 1080,270 C1260,220 1350,260 1440,280 L1440,400 L0,400 Z",
              "M0,290 C180,240 360,280 540,230 C720,280 900,260 1080,230 C1260,260 1350,240 1440,260 L1440,400 L0,400 Z",
              "M0,280 C180,220 360,320 540,260 C720,200 900,300 1080,240 C1260,180 1350,280 1440,250 L1440,400 L0,400 Z",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,310 C200,270 400,350 600,300 C800,250 1000,330 1200,280 C1320,250 1400,310 1440,290 L1440,400 L0,400 Z"
          fill="hsl(var(--water) / 0.06)"
          animate={{
            d: [
              "M0,310 C200,270 400,350 600,300 C800,250 1000,330 1200,280 C1320,250 1400,310 1440,290 L1440,400 L0,400 Z",
              "M0,300 C200,340 400,280 600,320 C800,280 1000,260 1200,310 C1320,280 1400,300 1440,320 L1440,400 L0,400 Z",
              "M0,320 C200,280 400,310 600,270 C800,310 1000,290 1200,260 C1320,300 1400,280 1440,300 L1440,400 L0,400 Z",
              "M0,310 C200,270 400,350 600,300 C800,250 1000,330 1200,280 C1320,250 1400,310 1440,290 L1440,400 L0,400 Z",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,350 C240,320 480,370 720,340 C960,310 1200,360 1440,330 L1440,400 L0,400 Z"
          fill="hsl(var(--primary) / 0.05)"
          animate={{
            d: [
              "M0,350 C240,320 480,370 720,340 C960,310 1200,360 1440,330 L1440,400 L0,400 Z",
              "M0,340 C240,360 480,330 720,360 C960,340 1200,320 1440,350 L1440,400 L0,400 Z",
              "M0,350 C240,320 480,370 720,340 C960,310 1200,360 1440,330 L1440,400 L0,400 Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Fish silhouettes */}
      <FishSilhouette delay={0} y="60%" size={32} duration={22} direction={1} />
      <FishSilhouette delay={5} y="72%" size={22} duration={18} direction={-1} />
      <FishSilhouette delay={10} y="52%" size={18} duration={26} direction={1} />
      <FishSilhouette delay={15} y="78%" size={26} duration={20} direction={-1} />

      {/* Bubbles */}
      <Bubble delay={0} x="22%" size={8} duration={8} />
      <Bubble delay={3} x="50%" size={5} duration={10} />
      <Bubble delay={7} x="72%" size={6} duration={9} />
      <Bubble delay={4} x="38%" size={4} duration={11} />
    </div>
  );
};

const FishSilhouette = ({
  delay,
  y,
  size,
  duration,
  direction,
}: {
  delay: number;
  y: string;
  size: number;
  duration: number;
  direction: 1 | -1;
}) => (
  <motion.div
    className="absolute"
    style={{ top: y }}
    initial={{ x: direction === 1 ? '-10vw' : '110vw', opacity: 0 }}
    animate={{
      x: direction === 1 ? '110vw' : '-10vw',
      opacity: [0, 0.12, 0.12, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 40 22"
      fill="hsl(var(--primary))"
      style={{ transform: direction === -1 ? 'scaleX(-1)' : undefined }}
    >
      <path d="M2,11 C2,5 8,1 16,1 C22,1 28,3 32,7 L40,4 L38,11 L40,18 L32,15 C28,19 22,21 16,21 C8,21 2,17 2,11 Z" />
      <circle cx="12" cy="9" r="1.5" fill="hsl(var(--background))" opacity="0.4" />
    </svg>
  </motion.div>
);

const Bubble = ({
  delay,
  x,
  size,
  duration,
}: {
  delay: number;
  x: string;
  size: number;
  duration: number;
}) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      left: x,
      width: size,
      height: size,
      border: '1px solid hsl(var(--primary) / 0.15)',
      background: 'hsl(var(--primary) / 0.04)',
    }}
    initial={{ bottom: '5%', opacity: 0 }}
    animate={{ bottom: '55%', opacity: [0, 0.5, 0] }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

export default OceanBackground;
