import { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrendsStats {
  totalCatches: number;
  totalSpecies: number;
  longestCatch: string;
  heaviestCatch: string;
  mostCaughtSpecies: string;
  bestMonth: string;
  topBait: string;
  username?: string | null;
}

interface Props {
  stats: TrendsStats;
  open: boolean;
  onClose: () => void;
}

const CARD_W = 640;

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawTrendsCard = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  stats: TrendsStats,
) => {
  const pad = 36;
  const innerW = CARD_W - pad * 2;
  const totalH = 520;
  canvas.width = CARD_W;
  canvas.height = totalH;

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, totalH);
  bgGrad.addColorStop(0, '#0b1d2e');
  bgGrad.addColorStop(0.4, '#112d44');
  bgGrad.addColorStop(1, '#0a1a28');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, CARD_W, totalH, 24);
  ctx.fill();

  // Decorative circles
  ctx.fillStyle = 'rgba(74, 172, 223, 0.04)';
  ctx.beginPath();
  ctx.arc(CARD_W - 60, 80, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(50, totalH - 60, 80, 0, Math.PI * 2);
  ctx.fill();

  // Header
  let y = 52;
  ctx.font = '16px serif';
  ctx.textAlign = 'left';
  ctx.fillText('🎣', pad, y);

  ctx.fillStyle = '#4a9ec5';
  ctx.font = '600 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('FishingRadar', pad + 28, y - 1);

  if (stats.username) {
    ctx.fillStyle = '#5a8da8';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`@${stats.username}`, CARD_W - pad, y - 1);
  }

  // Title
  y = 100;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText('My Fishing Stats', pad, y);

  // Subtitle
  y = 126;
  ctx.fillStyle = '#6a9ab8';
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${stats.totalCatches} catches · ${stats.totalSpecies} species`, pad, y);

  // Divider
  y = 148;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(CARD_W - pad, y);
  ctx.stroke();

  // Stats list — single column, full width for readability
  const statItems: [string, string, string][] = [
    ['🏆', 'Longest Catch', stats.longestCatch],
    ['⚖️', 'Heaviest Catch', stats.heaviestCatch],
    ['🐟', 'Top Species', stats.mostCaughtSpecies],
    ['🪝', 'Top Bait', stats.topBait],
    ['📅', 'Best Month', stats.bestMonth],
    ['📊', 'Total Catches', `${stats.totalCatches}`],
  ];

  const startY = 170;
  const rowH = 52;

  statItems.forEach((item, i) => {
    const ry = startY + i * rowH;

    // Alternating row bg
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      roundRect(ctx, pad - 4, ry - 8, innerW + 8, rowH - 6, 10);
      ctx.fill();
    }

    // Icon
    ctx.font = '18px serif';
    ctx.textAlign = 'left';
    ctx.fillText(item[0], pad + 8, ry + 20);

    // Label
    ctx.fillStyle = '#6a9ab8';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item[1], pad + 38, ry + 20);

    // Value — right-aligned
    ctx.fillStyle = '#e8f2f8';
    ctx.font = '600 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    // Truncate if still too long
    let val = item[2];
    while (ctx.measureText(val).width > innerW - 160 && val.length > 4) {
      val = val.slice(0, -2) + '…';
    }
    ctx.fillText(val, CARD_W - pad - 8, ry + 20);
  });

  // Footer
  const footerY = totalH - 30;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, footerY - 20);
  ctx.lineTo(CARD_W - pad, footerY - 20);
  ctx.stroke();

  ctx.fillStyle = '#3d7a9a';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FishingRadar', CARD_W / 2, footerY);
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));

const ShareTrendsCard = ({ stats, open, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) { setReady(false); return; }
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawTrendsCard(ctx, canvas, stats);
      setReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [open, stats]);

  const getShareText = () => {
    const parts = ['My fishing stats 🎣'];
    parts.push(`${stats.totalCatches} catches · ${stats.totalSpecies} species`);
    if (stats.longestCatch !== '-') parts.push(`Longest: ${stats.longestCatch}`);
    if (stats.heaviestCatch !== '-') parts.push(`Heaviest: ${stats.heaviestCatch}`);
    parts.push('FishingRadar');
    return parts.join(' · ');
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSharing(true);
    try {
      const blob = await canvasToBlob(canvas);
      if (!blob) { handleDownload(); return; }
      const file = new File([blob], 'fishing-stats.png', { type: 'image/png' });
      const shareData: ShareData = { title: 'My Fishing Stats', text: getShareText(), files: [file] };
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
      // If file sharing not supported, try text-only share
      try {
        await navigator.share({ title: shareData.title, text: shareData.text, url: window.location.origin });
      } catch {
        // Fallback to download
        handleDownload();
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        // Fallback to download instead of showing error
        handleDownload();
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'fishing-stats.png';
    link.href = canvas.toDataURL('image/png', 1);
    link.click();
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[min(90vw,440px)] max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Share your stats</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <canvas ref={canvasRef} width={CARD_W} height={520} className="w-full rounded-xl shadow-elevated" />
          <div className="w-full flex gap-2">
            <Button onClick={supportsNativeShare ? handleNativeShare : handleDownload} disabled={!ready || sharing} className="flex-1">
              {sharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
              {sharing ? 'Preparing...' : 'Share'}
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={!ready} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTrendsCard;
