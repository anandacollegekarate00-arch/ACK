import React from 'react';
import { X, CameraOff } from '../icons';
import jsQR from 'jsqr';

export interface QRScannerProps {
  onDetected: (text: string) => void;
  onClose: () => void;
  continuous?: boolean;
  cooldownMs?: number;
  title?: string;
}

export function QRScannerModal({
  onDetected,
  onClose,
  continuous = false,
  cooldownMs = 2000,
  title = 'Scan Student QR ID',
}: QRScannerProps) {
  const videoRef  = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef    = React.useRef<number | null>(null);

  // ── Stable callback ref ──────────────────────────────────────────────────
  // The rAF tick loop runs for the lifetime of the camera session and must
  // always call the *latest* version of onDetected without restarting the
  // camera effect. We achieve this by writing the prop into a ref on every
  // render; the tick closure reads from the ref, not the prop directly.
  const onDetectedRef = React.useRef(onDetected);
  React.useLayoutEffect(() => { onDetectedRef.current = onDetected; });

  const lastCodeRef     = React.useRef<string>('');
  const lastCodeTimeRef = React.useRef<number>(0);

  const [error,    setError]    = React.useState('');
  const [scanning, setScanning] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in this browser.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setScanning(true);
          tick();
        }
      } catch {
        setError('Could not access the camera. Permission denied or no camera found.');
      }
    }

    function tick() {
      if (cancelled) return;
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code?.data) {
          const now = Date.now();
          const isDuplicate =
            code.data === lastCodeRef.current &&
            now - lastCodeTimeRef.current < cooldownMs;

          if (!isDuplicate) {
            lastCodeRef.current     = code.data;
            lastCodeTimeRef.current = now;

            // Always call through the ref — picks up the latest callback
            // even though the effect only ran once (camera never remounts).
            onDetectedRef.current(code.data);

            if (!continuous) return; // one-shot: parent will unmount

            // Pause the scan loop for cooldownMs, then resume
            rafRef.current = window.setTimeout(() => {
              if (!cancelled) rafRef.current = requestAnimationFrame(tick);
            }, cooldownMs) as unknown as number;
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        clearTimeout(rafRef.current);
      }
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [continuous, cooldownMs]); // onDetected intentionally omitted — handled via ref above

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black/60">
        <span className="text-white font-semibold text-sm truncate pr-4">{title}</span>
        <button
          onClick={onClose}
          className="text-white p-2 active:scale-90 transition rounded-full shrink-0"
          aria-label="Close scanner"
        >
          <X size={20} />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />

        {scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/40"
              style={{ maskImage: 'radial-gradient(ellipse 55% 45% at 50% 50%, transparent 100%, black 100%)' }}
            />
            <div className="relative w-56 h-56">
              {(['top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                 'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
              ] as const).map((cls, i) => (
                <span key={i} className={`absolute w-7 h-7 border-white ${cls}`} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center bg-black/80">
            <CameraOff size={32} className="text-white/60" />
            <p className="text-white text-sm">{error}</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
