import { useCallback } from "react";
import { useManipulatorStore } from "@/store/useManipulatorStore";
import type { DiscoveredJoint } from "@/types/robot";

interface JointSlidersProps {
  joints: DiscoveredJoint[];
}

const JOINT_COLORS = [
  "#00d4ff",
  "#3fb950",
  "#d29922",
  "#ff7b72",
  "#c084fc",
  "#f0883e",
  "#58a6ff",
];

function formatRad(v: number) {
  return v.toFixed(3);
}
function formatDeg(v: number) {
  return ((v * 180) / Math.PI).toFixed(1) + "°";
}

function JointSlider({
  joint,
  value,
  color,
  onChange,
}: {
  joint: DiscoveredJoint;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  const percent = ((value - joint.min) / (joint.max - joint.min)) * 100;

  return (
    <div
      className="rounded-lg px-3 py-2.5 mb-2"
      style={{
        background: "rgba(22,27,34,0.6)",
        border: `1px solid ${color}22`,
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
          />
          <span className="text-brand-text text-xs font-medium font-mono">
            {joint.name}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-brand-muted text-xs font-mono">
            {formatRad(value)} rad
          </span>
          <span className="text-xs font-mono font-bold" style={{ color }}>
            {formatDeg(value)}
          </span>
        </div>
      </div>

      {/* Custom styled range input */}
      <div className="relative">
        <input
          type="range"
          min={joint.min}
          max={joint.max}
          step={0.001}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="range-slider w-full"
          style={{
            background: `linear-gradient(90deg, ${color} ${percent}%, #30363d ${percent}%)`,
          }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-brand-muted" style={{ fontSize: 9 }}>
          {formatDeg(joint.min)}
        </span>
        <span className="text-brand-muted" style={{ fontSize: 9 }}>
          {formatDeg(joint.max)}
        </span>
      </div>
    </div>
  );
}

export function JointSliders({ joints }: JointSlidersProps) {
  const { jointAngles, setJointAngle, resetJoints } = useManipulatorStore();

  const handleChange = useCallback(
    (name: string, value: number, joint: DiscoveredJoint) => {
      setJointAngle(name, value);
      // Directly apply to Three.js object — no re-render lag
      const obj = joint.object;
      if (obj) {
        obj.rotation[joint.axis] = value;
      }
    },
    [setJointAngle],
  );

  const handleReset = useCallback(() => {
    resetJoints();
    joints.forEach((j) => {
      j.object.rotation.set(0, 0, 0);
    });
  }, [joints, resetJoints]);

  if (joints.length === 0) {
    return (
      <div className="glass p-4 text-center">
        <div className="text-brand-muted text-sm">Loading joint data…</div>
        <div className="mt-2 text-xs text-brand-muted">
          Scanning GLB scene graph
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass flex flex-col overflow-hidden"
      style={{ maxHeight: "calc(100vh - 140px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border flex-shrink-0">
        <div>
          <div className="text-brand-text font-semibold text-sm">
            Joint Control
          </div>
          <div className="text-brand-muted text-xs mt-0.5">
            {joints.length} DOF · Franka Panda
          </div>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            background: "rgba(0,212,255,0.1)",
            border: "1px solid rgba(0,212,255,0.3)",
            color: "#00d4ff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,212,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,212,255,0.1)";
          }}
        >
          Reset All
        </button>
      </div>

      {/* Sliders */}
      <div className="overflow-y-auto flex-1 p-3">
        {joints.map((joint, i) => (
          <JointSlider
            key={joint.name}
            joint={joint}
            value={jointAngles[joint.name] ?? 0}
            color={JOINT_COLORS[i % JOINT_COLORS.length]}
            onChange={(v) => handleChange(joint.name, v, joint)}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-brand-border flex-shrink-0">
        <p className="text-brand-muted text-xs text-center">
          Drag sliders to control joint angles
        </p>
      </div>
    </div>
  );
}
