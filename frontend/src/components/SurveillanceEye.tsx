import { useEffect, useRef, useState } from 'react';

export default function SurveillanceEye() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let rotation = 0;
    let scanLine = 0;
    let pulsePhase = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, 'rgba(0, 217, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(0, 217, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Rotating hexagon
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.strokeStyle = '#00D9FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Eye iris
      const irisGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.6);
      irisGradient.addColorStop(0, '#0EA5E9');
      irisGradient.addColorStop(0.5, '#00D9FF');
      irisGradient.addColorStop(1, '#0891B2');
      ctx.fillStyle = irisGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Pupil glow
      const pupilGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.25);
      pupilGlow.addColorStop(0, 'rgba(0, 217, 255, 0.8)');
      pupilGlow.addColorStop(1, 'rgba(0, 217, 255, 0)');
      ctx.fillStyle = pupilGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Scan lines
      if (isScanning) {
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanLine);
        ctx.lineTo(width, scanLine);
        ctx.stroke();

        scanLine += 3;
        if (scanLine > height) scanLine = 0;
      }

      // Pulse effect
      const pulseRadius = radius * 0.6 + Math.sin(pulsePhase) * 10;
      ctx.strokeStyle = `rgba(0, 217, 255, ${0.5 - Math.abs(Math.sin(pulsePhase)) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Grid overlay
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      rotation += 0.005;
      pulsePhase += 0.05;

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isScanning]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full max-h-full"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-cyan-400 text-sm font-mono mb-2 animate-pulse">
            SURVEILLANCE ACTIVE
          </div>
          <div className="text-cyan-300 text-xs font-mono opacity-70">
            24/7 MONITORING
          </div>
        </div>
      </div>
    </div>
  );
}