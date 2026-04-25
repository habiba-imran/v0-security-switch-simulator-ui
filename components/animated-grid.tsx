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

    // Warm amber/gold color palette
    const goldRGB = { r: 210, g: 170, b: 90 };
    const amberRGB = { r: 180, g: 130, b: 60 };

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

      // Clear with fade effect for trails - warm dark background
      ctx.fillStyle = "rgba(12, 10, 8, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw subtle concentric circles emanating from center
      const maxRadius = Math.max(canvas.width, canvas.height);
      const numCircles = 6;

      for (let i = 0; i < numCircles; i++) {
        const baseRadius = ((time * 0.3 + i * (maxRadius / numCircles)) % maxRadius);
        const alpha = 1 - baseRadius / maxRadius;

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${goldRGB.r}, ${goldRGB.g}, ${goldRGB.b}, ${alpha * 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw sparse grid with warm glow
      const gridSize = 100;
      const cols = Math.ceil(canvas.width / gridSize) + 2;
      const rows = Math.ceil(canvas.height / gridSize) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize - (time * 0.15) % gridSize;
          const y = j * gridSize - (time * 0.08) % gridSize;

          // Distance from center for glow effect
          const dx = x - centerX;
          const dy = y - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

          // Distance from mouse for interaction
          const dxMouse = x - mouseX;
          const dyMouse = y - mouseY;
          const distFromMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          // Combined glow - more subtle
          const centerGlow = 1 - distFromCenter / maxDist;
          const mouseGlow = Math.max(0, 1 - distFromMouse / 180);
          const pulse = Math.sin(time * 0.015 + i * 0.4 + j * 0.3) * 0.5 + 0.5;

          const alpha = (centerGlow * 0.12 + mouseGlow * 0.4 + pulse * 0.08) * 0.4;
          const size = 1.5 + mouseGlow * 3 + pulse * 1.5;

          if (alpha > 0.015) {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${goldRGB.r}, ${goldRGB.g}, ${goldRGB.b}, ${alpha})`;
            ctx.fill();
          }
        }
      }

      // Draw elegant connecting lines near mouse
      ctx.strokeStyle = `rgba(${amberRGB.r}, ${amberRGB.g}, ${amberRGB.b}, 0.06)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize - (time * 0.15) % gridSize;
          const y = j * gridSize - (time * 0.08) % gridSize;

          const dxMouse = x - mouseX;
          const dyMouse = y - mouseY;
          const distFromMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distFromMouse < 140) {
            const nextX = (i + 1) * gridSize - (time * 0.15) % gridSize;
            const nextY = (j + 1) * gridSize - (time * 0.08) % gridSize;

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

      // Draw subtle rotating beam
      const beamAngle = (time * 0.006) % (Math.PI * 2);
      const beamLength = maxRadius * 1.2;

      const gradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(beamAngle) * beamLength,
        centerY + Math.sin(beamAngle) * beamLength
      );
      gradient.addColorStop(0, `rgba(${goldRGB.r}, ${goldRGB.g}, ${goldRGB.b}, 0.15)`);
      gradient.addColorStop(0.2, `rgba(${goldRGB.r}, ${goldRGB.g}, ${goldRGB.b}, 0.03)`);
      gradient.addColorStop(1, `rgba(${goldRGB.r}, ${goldRGB.g}, ${goldRGB.b}, 0)`);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, beamLength, beamAngle - 0.08, beamAngle + 0.08);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Subtle horizontal scanning line
      const scanY = (time * 0.5) % (canvas.height + 150) - 75;
      const scanGradient = ctx.createLinearGradient(0, scanY - 25, 0, scanY + 25);
      scanGradient.addColorStop(0, `rgba(${amberRGB.r}, ${amberRGB.g}, ${amberRGB.b}, 0)`);
      scanGradient.addColorStop(0.5, `rgba(${amberRGB.r}, ${amberRGB.g}, ${amberRGB.b}, 0.04)`);
      scanGradient.addColorStop(1, `rgba(${amberRGB.r}, ${amberRGB.g}, ${amberRGB.b}, 0)`);
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 25, canvas.width, 50);

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
      style={{ background: "linear-gradient(180deg, #0c0a08 0%, #080604 100%)" }}
      aria-hidden="true"
    />
  );
}
