import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FishDetail from '@/components/FishDetail';
import { X } from 'lucide-react';

interface DbFish {
  id: string;
  name_en: string;
  latin_name: string | null;
  category: string | null;
  habitat: string | null;
  techniques: string[] | null;
  baits: string[] | null;
  description: string | null;
  protection: string | null;
  min_size: string | null;
  image_url: string | null;
}

interface FishDetailOverlayProps {
  fish: DbFish | null;
  onClose: () => void;
  translatedName?: string;
}

const FishDetailOverlay = ({ fish, onClose, translatedName }: FishDetailOverlayProps) => {
  const scrollYRef = useRef(0);

  // Lock body scroll when overlay is open, restore position on close
  useEffect(() => {
    if (fish) {
      scrollYRef.current = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        // Restore scroll position after browser repaints
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollYRef.current);
        });
      };
    }
  }, [fish]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (fish) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [fish, handleKeyDown]);

  return (
    <AnimatePresence>
      {fish && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-background/80 backdrop-blur-sm p-4 pt-6 pb-20"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Close button - always visible */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-[60] rounded-full bg-card/90 backdrop-blur-sm p-2 shadow-lg border border-border hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-2xl"
          >
            <FishDetail
              fish={fish}
              onBack={onClose}
              translatedName={translatedName}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FishDetailOverlay;
