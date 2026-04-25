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
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear with fade effect for trails
      ctx.fillStyle = "rgba(8, 8, 20, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw concentric circles emanating from center
      const maxRadius = Math.max(canvas.width, canvas.height);
      const numCircles = 8;

      for (let i = 0; i < numCircles; i++) {
        const baseRadius = ((time * 0.5 + i * (maxRadius / numCircles)) % maxRadius);
        const alpha = 1 - baseRadius / maxRadius;

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw grid with perspective effect
      const gridSize = 80;
      const cols = Math.ceil(canvas.width / gridSize) + 2;
      const rows = Math.ceil(canvas.height / gridSize) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize - (time * 0.2) % gridSize;
          const y = j * gridSize - (time * 0.1) % gridSize;

          // Distance from center for glow effect
          const dx = x - centerX;
          const dy = y - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

          // Distance from mouse for interaction
          const dxMouse = x - mouseX;
          const dyMouse = y - mouseY;
          const distFromMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          // Combined glow
          const centerGlow = 1 - distFromCenter / maxDist;
          const mouseGlow = Math.max(0, 1 - distFromMouse / 200);
          const pulse = Math.sin(time * 0.02 + i * 0.3 + j * 0.2) * 0.5 + 0.5;

          const alpha = (centerGlow * 0.2 + mouseGlow * 0.5 + pulse * 0.1) * 0.5;
          const size = 2 + mouseGlow * 4 + pulse * 2;

          if (alpha > 0.02) {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx.fill();
          }
        }
      }

      // Draw connecting lines near mouse
      ctx.strokeStyle = "rgba(0, 255, 136, 0.1)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize - (time * 0.2) % gridSize;
          const y = j * gridSize - (time * 0.1) % gridSize;

          const dxMouse = x - mouseX;
          const dyMouse = y - mouseY;
          const distFromMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distFromMouse < 150) {
            // Connect to nearby points
            const nextX = (i + 1) * gridSize - (time * 0.2) % gridSize;
            const nextY = (j + 1) * gridSize - (time * 0.1) % gridSize;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, nextY);
            ctx.stroke();
          }
        }
      }

      // Draw scanning beam
      const beamAngle = (time * 0.01) % (Math.PI * 2);
      const beamLength = maxRadius * 1.5;

      const gradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(beamAngle) * beamLength,
        centerY + Math.sin(beamAngle) * beamLength
      );
      gradient.addColorStop(0, "rgba(0, 255, 136, 0.3)");
      gradient.addColorStop(0.3, "rgba(0, 255, 136, 0.05)");
      gradient.addColorStop(1, "rgba(0, 255, 136, 0)");

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, beamLength, beamAngle - 0.1, beamAngle + 0.1);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Horizontal scanning line
      const scanY = (time * 0.8) % (canvas.height + 200) - 100;
      const scanGradient = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGradient.addColorStop(0, "rgba(0, 255, 136, 0)");
      scanGradient.addColorStop(0.5, "rgba(0, 255, 136, 0.08)");
      scanGradient.addColorStop(1, "rgba(0, 255, 136, 0)");
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 30, canvas.width, 60);

      time++;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "linear-gradient(180deg, #0a0a18 0%, #050510 100%)" }}
      aria-hidden="true"
    />
  );
}
