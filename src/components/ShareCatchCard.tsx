import { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CatchData {
  fish: string;
  length: number;
  weight: number;
  water: string;
  bait: string;
  catch_date: string;
  photo_url: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
}

interface UserProfile {
  username: string | null;
  avatar_url: string | null;
}

interface Props {
  catchData: CatchData;
  profile?: UserProfile | null;
  open: boolean;
  onClose: () => void;
}

const CARD_W = 640;
const MAX_PHOTO_H = 560;
const MIN_PHOTO_H = 280;

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

const drawCard = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  data: CatchData,
  photo: HTMLImageElement | null,
  profileData?: { username?: string | null; avatarImg?: HTMLImageElement | null }
) => {
  const pad = 32;
  const innerW = CARD_W - pad * 2;

  // Calculate photo height
  let photoH = MIN_PHOTO_H;
  if (photo) {
    const imgRatio = photo.width / photo.height;
    photoH = Math.round(innerW / imgRatio);
    photoH = Math.max(MIN_PHOTO_H, Math.min(MAX_PHOTO_H, photoH));
  }

  // Build rows
  const rows: [string, string, string][] = [];
  if (data.length > 0) rows.push(['📏', 'Length', `${(data.length / 2.54).toFixed(1)} in`]);
  if (data.weight > 0) rows.push(['⚖️', 'Weight', `${(data.weight * 2.205).toFixed(1)} lb`]);
  if (data.water) rows.push(['📍', 'Location', data.water]);
  if (data.location_lat && data.location_lng) {
    rows.push(['🗺️', 'Coordinates', `${data.location_lat.toFixed(4)}, ${data.location_lng.toFixed(4)}`]);
  }
  if (data.bait) rows.push(['🪝', 'Bait', data.bait]);
  rows.push(['📅', 'Date', data.catch_date]);

  const headerH = 80;
  const rowH = 44;
  const statsH = rows.length * rowH + 24;
  const footerH = 64;
  const gapAfterPhoto = 0;
  const totalH = photoH + headerH + statsH + footerH + gapAfterPhoto;
  canvas.height = totalH;

  // ── Background gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, totalH);
  bgGrad.addColorStop(0, '#0b1d2e');
  bgGrad.addColorStop(0.5, '#122a3f');
  bgGrad.addColorStop(1, '#0a1a28');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, CARD_W, totalH, 24);
  ctx.fill();

  // ── Photo (full-bleed with rounded top) ──
  if (photo) {
    ctx.save();
    roundRect(ctx, 0, 0, CARD_W, photoH, 24);
    // Override bottom corners to be square
    ctx.rect(0, photoH - 24, CARD_W, 24);
    ctx.clip();

    const imgRatio = photo.width / photo.height;
    const boxRatio = CARD_W / photoH;
    let dx = 0, dy = 0, dw = CARD_W, dh = photoH;
    if (imgRatio > boxRatio) {
      dw = photoH * imgRatio;
      dx = (CARD_W - dw) / 2;
    } else {
      dh = CARD_W / imgRatio;
      dy = (photoH - dh) / 2;
    }
    ctx.drawImage(photo, 0, 0, photo.width, photo.height, dx, dy, dw, dh);

    // Gradient overlay at bottom of photo
    const overlayGrad = ctx.createLinearGradient(0, photoH - 120, 0, photoH);
    overlayGrad.addColorStop(0, 'rgba(11, 29, 46, 0)');
    overlayGrad.addColorStop(1, 'rgba(11, 29, 46, 0.85)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, photoH - 120, CARD_W, 120);
    ctx.restore();
  } else {
    // No photo — decorative wave pattern
    ctx.save();
    const waveGrad = ctx.createLinearGradient(0, 0, CARD_W, photoH);
    waveGrad.addColorStop(0, '#163a54');
    waveGrad.addColorStop(1, '#1a4a6a');
    ctx.fillStyle = waveGrad;
    ctx.fillRect(0, 0, CARD_W, photoH);
    // Fish emoji
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐟', CARD_W / 2, photoH / 2 + 40);
    ctx.restore();
  }

  // ── Fish name (overlaid on bottom of photo) ──
  const nameY = photoH - 16;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.fillText(data.fish, pad, nameY);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // ── Caught by line ──
  const byLineY = photoH + 36;
  if (profileData?.username) {
    const avatarSize = 30;
    let px = pad;

    if (profileData.avatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px + avatarSize / 2, byLineY, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileData.avatarImg, px, byLineY - avatarSize / 2, avatarSize, avatarSize);
      ctx.restore();

      // Avatar ring
      ctx.strokeStyle = 'rgba(74, 172, 223, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + avatarSize / 2, byLineY, avatarSize / 2 + 1, 0, Math.PI * 2);
      ctx.stroke();
      px += avatarSize + 12;
    }

    ctx.fillStyle = '#7bb8d9';
    ctx.font = '15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Caught by', px, byLineY - 6);
    ctx.fillStyle = '#e4f0f8';
    ctx.font = '600 17px system-ui, -apple-system, sans-serif';
    ctx.fillText(profileData.username, px, byLineY + 16);
  }

  // ── Divider ──
  const dividerY = photoH + headerH - 8;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, dividerY);
  ctx.lineTo(CARD_W - pad, dividerY);
  ctx.stroke();

  // ── Stats rows ──
  const statsStart = photoH + headerH + 12;

  rows.forEach(([icon, label, value], i) => {
    const y = statsStart + i * rowH;

    // Subtle row background on alternating rows
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      roundRect(ctx, pad - 8, y - 14, innerW + 16, rowH - 4, 8);
      ctx.fill();
    }

    // Icon
    ctx.font = '18px serif';
    ctx.textAlign = 'left';
    ctx.fillText(icon, pad, y + 6);

    // Label
    ctx.fillStyle = '#7ba3be';
    ctx.font = '15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, pad + 30, y + 5);

    // Value
    ctx.fillStyle = '#e8f2f8';
    ctx.font = '600 17px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(value, CARD_W - pad, y + 5);
  });

  // ── Footer / branding ──
  const footerY = totalH - 28;

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, footerY - 24);
  ctx.lineTo(CARD_W - pad, footerY - 24);
  ctx.stroke();

  // Fish icon
  ctx.font = '16px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎣', CARD_W / 2 - 56, footerY + 2);

  // Brand
  ctx.fillStyle = '#4a8aaa';
  ctx.font = '600 15px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FishingRadar', CARD_W / 2, footerY);
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));

const ShareCatchCard = ({ catchData, profile, open, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  const renderCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadImage = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const run = async () => {
      const photo = catchData.photo_url ? await loadImage(catchData.photo_url) : null;
      const avatarImg = profile?.avatar_url ? await loadImage(profile.avatar_url) : null;
      drawCard(ctx, canvas, catchData, photo, {
        username: profile?.username,
        avatarImg,
      });
      setReady(true);
    };
    run();
  };

  useEffect(() => {
    if (!open) { setReady(false); return; }
    const timer = setTimeout(renderCard, 50);
    return () => clearTimeout(timer);
  }, [open, catchData]);

  const getShareText = () => {
    const parts = [`I caught a ${catchData.fish}!`];
    if (catchData.length > 0) parts.push(`${(catchData.length / 2.54).toFixed(1)} in`);
    if (catchData.weight > 0) parts.push(`${(catchData.weight * 2.205).toFixed(1)} lb`);
    if (catchData.water) parts.push(`📍 ${catchData.water}`);
    parts.push('🎣 FishingRadar');
    return parts.join(' · ');
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSharing(true);
    try {
      const blob = await canvasToBlob(canvas);
      if (!blob) return;
      const file = new File([blob], `catch-${catchData.fish}.png`, { type: 'image/png' });
      const shareData: ShareData = {
        title: `Catch: ${catchData.fish}`,
        text: getShareText(),
        files: [file],
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
      await navigator.share({ title: shareData.title, text: shareData.text, url: window.location.origin });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        toast({ title: 'Sharing failed', variant: 'destructive' });
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `catch-${catchData.fish}-${catchData.catch_date}.png`;
    link.href = canvas.toDataURL('image/png', 1);
    link.click();
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[min(90vw,440px)] max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Share your catch</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <canvas
            ref={canvasRef}
            width={CARD_W}
            height={900}
            className="w-full rounded-xl shadow-elevated"
          />

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

export default ShareCatchCard;
