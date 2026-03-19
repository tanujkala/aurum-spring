"use client";

import { useEffect, useRef } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  dailyChange: number;
  dailyChangeText: string;
  trendDirection: string;
  history: number[];
}

export function MetricCard({
  title,
  value,
  dailyChange,
  dailyChangeText,
  trendDirection,
  history,
}: MetricCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || history.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    history.forEach((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [history]);

  const changeColor =
    dailyChange > 0
      ? "stat-positive"
      : dailyChange < 0
      ? "stat-negative"
      : "stat-neutral";

  return (
    <div className="metric-card">
      <div className="metric-header">
        <span>{title}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div
        style={{
          height: "40px",
          width: "100%",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <canvas
          ref={canvasRef}
          width={200}
          height={40}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="metric-stats">
        <span className={changeColor}>
          {dailyChange > 0 ? "+" : ""}
          {dailyChangeText}
        </span>
        <span>{trendDirection}</span>
      </div>
    </div>
  );
}
