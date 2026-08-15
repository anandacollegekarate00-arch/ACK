import React from 'react';
import { X, CameraOff } from '../icons';
import jsQR from 'jsqr';

/**
 * Opens the device camera, continuously scans frames for a QR code, and
 * calls onDetected(text) the moment one is found. Falls back gracefully
 * (calls onError) if the camera can't be accessed — no camera on the
 * device, permission denied, or not served over HTTPS (getUserMedia
 * requires a secure context, which Vercel/Netlify give you by default).
 */
export function QRScannerModal({ onDetected, onClose }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser doesn\u2019t support camera access. Use "Enter code" instead.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          tick();
        }
      } catch (e) {
        setError('Couldn\u2019t access the camera (permission denied, or none available). Use "Enter code" instead.');
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          onDetected(code.data);
          return; // stop the scan loop — parent unmounts this modal
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <span className="text-white font-semibold text-sm">Scan Student QR ID</span>
        <button onClick={onClose} className="text-white p-2 active:scale-90 transition">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 border-4 border-white/80 rounded-2xl" />
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
