"use client";

import { useEffect, useRef, useCallback } from "react";

interface Plant {
  x: number;
  baseY: number;
  height: number;
  angle: number;
  swaySpeed: number;
  swayAmount: number;
  phase: number;
  thickness: number;
  headSize: number;
  headColor: string;
  stalkColor: string;
  leafSide: number;
}

export default function SunflowerField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plantsRef = useRef<Plant[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);
  const frameRef = useRef(0);

  const initPlants = useCallback((width: number, height: number) => {
    const plants: Plant[] = [];
    const count = window.innerWidth < 768 ? 600 : 1200;
    const horizonY = height * 0.45;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const depth = Math.random();
      const y = horizonY + depth * (height - horizonY);
      const scale = 0.3 + depth * 0.7;

      plants.push({
        x,
        baseY: y,
        height: (40 + Math.random() * 80) * scale,
        angle: (Math.random() - 0.5) * 0.15,
        swaySpeed: 0.8 + Math.random() * 1.2,
        swayAmount: (0.02 + Math.random() * 0.04) * scale,
        phase: Math.random() * Math.PI * 2,
        thickness: (2 + Math.random() * 3) * scale,
        headSize: (6 + Math.random() * 8) * scale,
        headColor:
          Math.random() > 0.3
            ? `hsl(${38 + Math.random() * 8}, ${70 + Math.random() * 20}%, ${45 + Math.random() * 15}%)`
            : `hsl(${45 + Math.random() * 10}, ${60 + Math.random() * 15}%, ${55 + Math.random() * 10}%)`,
        stalkColor: `hsl(${100 + Math.random() * 20}, ${30 + Math.random() * 20}%, ${20 + Math.random() * 15}%)`,
        leafSide: Math.random() > 0.5 ? 1 : -1,
      });
    }

    return plants.sort((a, b) => a.baseY - b.baseY);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      plantsRef.current = initPlants(canvas.offsetWidth, canvas.offsetHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });

    const drawSky = (w: number, h: number) => {
      const horizonY = h * 0.45;
      const gradient = ctx.createLinearGradient(0, 0, 0, horizonY);
      gradient.addColorStop(0, "#F0D498");
      gradient.addColorStop(0.4, "#E8C97A");
      gradient.addColorStop(0.7, "#D8C9B8");
      gradient.addColorStop(1, "#C4B5A0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, horizonY);

      const sunGradient = ctx.createRadialGradient(
        w * 0.7,
        horizonY * 0.35,
        0,
        w * 0.7,
        horizonY * 0.35,
        w * 0.25
      );
      sunGradient.addColorStop(0, "rgba(255, 220, 140, 0.4)");
      sunGradient.addColorStop(0.5, "rgba(240, 212, 152, 0.15)");
      sunGradient.addColorStop(1, "rgba(240, 212, 152, 0)");
      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, w, horizonY);
    };

    const drawGround = (w: number, h: number) => {
      const horizonY = h * 0.45;
      const gradient = ctx.createLinearGradient(0, horizonY, 0, h);
      gradient.addColorStop(0, "#3A5A28");
      gradient.addColorStop(0.3, "#2D4A1E");
      gradient.addColorStop(1, "#1E3A12");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= w; x += 2) {
        const y =
          horizonY +
          Math.sin(x * 0.003) * 15 +
          Math.sin(x * 0.007 + 1) * 10 +
          Math.sin(x * 0.0015 + 2) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const hillGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      hillGrad.addColorStop(0, "#4A6A32");
      hillGrad.addColorStop(0.5, "#3A5A28");
      hillGrad.addColorStop(1, "#2D4A1E");
      ctx.fillStyle = hillGrad;
      ctx.fill();
    };

    const drawPlant = (plant: Plant, time: number, mouseX: number, mouseY: number) => {
      const sway = Math.sin(time * plant.swaySpeed + plant.phase) * plant.swayAmount;

      const dx = mouseX - plant.x;
      const dy = mouseY - plant.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseInfluence = Math.max(0, 1 - dist / 150) * 0.12;
      const mouseBend = mouseInfluence * (dx > 0 ? -1 : 1);

      const totalAngle = plant.angle + sway + mouseBend;
      const topX = plant.x + Math.sin(totalAngle) * plant.height;
      const topY = plant.baseY - Math.cos(totalAngle) * plant.height;

      ctx.beginPath();
      ctx.moveTo(plant.x, plant.baseY);
      ctx.quadraticCurveTo(
        plant.x + Math.sin(totalAngle) * plant.height * 0.5,
        plant.baseY - Math.cos(totalAngle) * plant.height * 0.5,
        topX,
        topY
      );
      ctx.strokeStyle = plant.stalkColor;
      ctx.lineWidth = plant.thickness;
      ctx.lineCap = "round";
      ctx.stroke();

      const leafY = plant.baseY - plant.height * 0.45;
      const leafT = 0.45;
      const leafX =
        plant.x +
        Math.sin(
          plant.angle +
            Math.sin(time * plant.swaySpeed + plant.phase) * plant.swayAmount * leafT
        ) *
          plant.height *
          leafT;
      const leafAngle = totalAngle + plant.leafSide * 0.8;

      ctx.beginPath();
      ctx.ellipse(
        leafX + Math.cos(leafAngle) * plant.thickness * 3,
        leafY,
        plant.thickness * 4,
        plant.thickness * 1.5,
        leafAngle,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = plant.stalkColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(topX, topY, plant.headSize, 0, Math.PI * 2);
      ctx.fillStyle = plant.headColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(topX, topY, plant.headSize * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "#3A1F00";
      ctx.fill();

      const petalCount = 8;
      for (let i = 0; i < petalCount; i++) {
        const petalAngle = (i / petalCount) * Math.PI * 2 + time * 0.2 + plant.phase;
        const px = topX + Math.cos(petalAngle) * plant.headSize * 0.9;
        const py = topY + Math.sin(petalAngle) * plant.headSize * 0.9;

        ctx.beginPath();
        ctx.ellipse(
          px,
          py,
          plant.headSize * 0.35,
          plant.headSize * 0.2,
          petalAngle,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = plant.headColor;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, w, h);

      drawSky(w, h);
      drawGround(w, h);

      const plants = plantsRef.current;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      for (let i = 0; i < plants.length; i++) {
        drawPlant(plants[i], timeRef.current, mouseX, mouseY);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [initPlants]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}