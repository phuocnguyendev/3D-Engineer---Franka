import { useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type { PerfStats } from "@/types/robot";

/** Reads renderer.info every N frames and reports performance metrics */
function PerfReader({ onStats }: { onStats: (s: PerfStats) => void }) {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsAccum = useRef(0);

  useFrame(() => {
    frameCount.current++;
    fpsAccum.current++;

    const now = performance.now();
    if (now - lastTime.current >= 500) {
      const elapsed = (now - lastTime.current) / 1000;
      const fps = fpsAccum.current / elapsed;
      fpsAccum.current = 0;
      lastTime.current = now;

      const info = gl.info;
      const mem = (performance as any).memory;
      onStats({
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        memoryMB: mem ? mem.usedJSHeapSize / 1024 / 1024 : 0,
        fps: Math.round(fps),
      });
    }
  });

  return null;
}

export { PerfReader };

/** Glass panel showing render stats */
export function PerformancePanel() {
  const [stats, setStats] = useState<PerfStats>({
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    memoryMB: 0,
    fps: 0,
  });

  // Expose setStats so PerfReader (inside canvas) can call it
  (window as any).__setRenderStats = setStats;

  const fpsColor =
    stats.fps >= 55 ? "#3fb950" : stats.fps >= 30 ? "#d29922" : "#f85149";

  return (
    <div
      className="glass pointer-events-none select-none animate-fade-in"
      style={{ minWidth: 200 }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-border">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
          style={{ background: fpsColor }}
        />
        <span className="text-brand-muted text-xs font-mono uppercase tracking-widest">
          Renderer
        </span>
        <span
          className="ml-auto font-mono text-xs font-bold"
          style={{ color: fpsColor }}
        >
          {stats.fps} FPS
        </span>
      </div>
      <div className="px-3 py-2 space-y-1">
        <div className="stat-row">
          <span className="stat-label">Draw Calls</span>
          <span className="stat-value">{stats.drawCalls}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Triangles</span>
          <span className="stat-value">{stats.triangles.toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Geometries</span>
          <span className="stat-value">{stats.geometries}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Textures</span>
          <span className="stat-value">{stats.textures}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">JS Heap</span>
          <span className="stat-value">{stats.memoryMB.toFixed(1)} MB</span>
        </div>
      </div>
    </div>
  );
}
