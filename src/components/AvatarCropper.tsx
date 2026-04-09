import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface Props {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCrop: (blob: Blob) => void;
}

const OUTPUT_SIZE = 400;

const AvatarCropper = ({ imageSrc, open, onClose, onCrop }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    // Draw image centered + offset + scale
    const minDim = Math.min(img.width, img.height);
    const baseScale = size / minDim;
    const s = baseScale * scale;
    const w = img.width * s;
    const h = img.height * s;
    const x = (size - w) / 2 + offset.x;
    const y = (size - h) / 2 + offset.y;

    ctx.drawImage(img, x, y, w, h);

    // Circular mask overlay
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Circle guide border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, offset]);

  useEffect(() => {
    if (!open || !imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setScale(1);
      setOffset({ x: 0, y: 0 });
      draw();
    };
    img.src = imageSrc;
  }, [open, imageSrc]);

  useEffect(() => { draw(); }, [draw]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: offsetStart.current.x + (e.clientX - dragStart.current.x),
      y: offsetStart.current.y + (e.clientY - dragStart.current.y),
    });
  };

  const handlePointerUp = () => setDragging(false);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Render high-res output
    const out = document.createElement('canvas');
    out.width = OUTPUT_SIZE;
    out.height = OUTPUT_SIZE;
    const octx = out.getContext('2d');
    if (!octx || !imgRef.current) return;

    const img = imgRef.current;
    const size = OUTPUT_SIZE;
    const minDim = Math.min(img.width, img.height);
    const displaySize = canvas.width;
    const ratio = size / displaySize;
    const baseScale = displaySize / minDim;
    const s = baseScale * scale * ratio;
    const w = img.width * s;
    const h = img.height * s;
    const x = (size - w) / 2 + offset.x * ratio;
    const y = (size - h) / 2 + offset.y * ratio;

    octx.beginPath();
    octx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    octx.clip();
    octx.drawImage(img, x, y, w, h);

    out.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, 'image/png');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Prilagodi sliko</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-full cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          <div className="flex items-center gap-3 w-full px-4">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[scale]}
              min={0.5}
              max={3}
              step={0.05}
              onValueChange={([v]) => setScale(v)}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={onClose}>Prekliči</Button>
            <Button className="flex-1" onClick={handleCrop}>Potrdi</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropper;
