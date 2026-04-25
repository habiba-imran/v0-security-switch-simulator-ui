"use client";

import { useEffect, useRef } from "react";

export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 50;
      const cols = Math.ceil(canvas.width / gridSize) + 1;
      const rows = Math.ceil(canvas.height / gridSize) + 1;

      // Draw grid lines
      ctx.strokeStyle = "rgba(0, 255, 136, 0.08)";
      ctx.lineWidth = 1;

      for (let i = 0; i < cols; i++) {
        const x = i * gridSize;
        const wave = Math.sin(time * 0.002 + i * 0.1) * 2;
        ctx.beginPath();
        ctx.moveTo(x + wave, 0);
        ctx.lineTo(x + wave, canvas.height);
        ctx.stroke();
      }

      for (let j = 0; j < rows; j++) {
        const y = j * gridSize;
        const wave = Math.sin(time * 0.002 + j * 0.1) * 2;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(canvas.width, y + wave);
        ctx.stroke();
      }

      // Draw glowing particles at intersections
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize + Math.sin(time * 0.002 + i * 0.1) * 2;
          const y = j * gridSize + Math.sin(time * 0.002 + j * 0.1) * 2;

          const pulse = Math.sin(time * 0.003 + i * 0.5 + j * 0.3) * 0.5 + 0.5;
          const alpha = pulse * 0.3;

          ctx.beginPath();
          ctx.arc(x, y, 2 + pulse * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.fill();
        }
      }

      // Draw scanning line
      const scanY = (time * 0.5) % (canvas.height + 200) - 100;
      const gradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      gradient.addColorStop(0, "rgba(0, 255, 136, 0)");
      gradient.addColorStop(0.5, "rgba(0, 255, 136, 0.15)");
      gradient.addColorStop(1, "rgba(0, 255, 136, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 50, canvas.width, 100);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
