import { useDriveStore } from "@/store/useDriveStore";
import { useKeyboard } from "@/hooks/useKeyboard";

const rad2deg = (r: number) => ((r * 180) / Math.PI).toFixed(1);
const fmt = (n: number, digits = 3) => n.toFixed(digits);

export function TelemetryPanel() {
  const pose = useDriveStore((s) => s.pose);
  const vel = useDriveStore((s) => s.velocity);
  const keys = useKeyboard();

  return (
    <div className="glass pointer-events-none select-none animate-fade-in" style={{ minWidth: 220 }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-border">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse-slow" />
        <span className="text-brand-muted text-xs font-mono uppercase tracking-widest">Telemetry</span>
      </div>

      <div className="px-3 py-2 space-y-1">
        <div className="text-brand-muted text-xs uppercase tracking-widest mb-1 mt-1">Position</div>
        <div className="stat-row">
          <span className="stat-label">X</span>
          <span className="stat-value">{fmt(pose.x)} m</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Z</span>
          <span className="stat-value">{fmt(pose.z)} m</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">θ (heading)</span>
          <span className="stat-value">{rad2deg(pose.theta)}°</span>
        </div>

        <div className="text-brand-muted text-xs uppercase tracking-widest mb-1 mt-3">Velocities</div>
        <div className="stat-row">
          <span className="stat-label">Linear</span>
          <span className="stat-value" style={{ color: Math.abs(vel.linear) > 0.01 ? "#00d4ff" : "#8b949e" }}>
            {fmt(vel.linear)} m/s
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Angular</span>
          <span className="stat-value" style={{ color: Math.abs(vel.angular) > 0.01 ? "#d29922" : "#8b949e" }}>
            {fmt(vel.angular)} rad/s
          </span>
        </div>

        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span className="stat-label">Speed</span>
            <span className="stat-value">{fmt(Math.abs(vel.linear), 2)} m/s</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-brand-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${Math.min(100, (Math.abs(vel.linear) / 2) * 100)}%`,
                background: "linear-gradient(90deg, #00d4ff, #0094b3)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-brand-border">
        <div className="text-brand-muted text-xs uppercase tracking-widest mb-2">Controls</div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div />
          <span className={`key-badge ${keys.current.ArrowUp || keys.current.KeyW ? "active" : ""}`}>↑</span>
          <div />
          <span className={`key-badge ${keys.current.ArrowLeft || keys.current.KeyA ? "active" : ""}`}>←</span>
          <span className={`key-badge ${keys.current.ArrowDown || keys.current.KeyS ? "active" : ""}`}>↓</span>
          <span className={`key-badge ${keys.current.ArrowRight || keys.current.KeyD ? "active" : ""}`}>→</span>
        </div>
      </div>
    </div>
  );
}
