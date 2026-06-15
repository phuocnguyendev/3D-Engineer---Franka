import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

import { Lights } from "@/components/scene/Lights";
import { Floor } from "@/components/scene/Floor";
import { JointSliders } from "@/components/ui/JointSliders";
import { PerformancePanel, PerfReader } from "@/components/ui/PerformancePanel";
import { useManipulatorStore } from "@/store/useManipulatorStore";
import type { PerfStats, DiscoveredJoint } from "@/types/robot";
import { LoadingScreen } from "@/components/scene/LoadingScreen";

const FRANKA_LIMITS: Record<
  string,
  { min: number; max: number; axis: "x" | "y" | "z" }
> = {
  panda_joint1: { min: -2.8973, max: 2.8973, axis: "z" },
  panda_joint2: { min: -1.7628, max: 1.7628, axis: "y" },
  panda_joint3: { min: -2.8973, max: 2.8973, axis: "z" },
  panda_joint4: { min: -3.0718, max: -0.0698, axis: "y" },
  panda_joint5: { min: -2.8973, max: 2.8973, axis: "z" },
  panda_joint6: { min: -0.0175, max: 3.7525, axis: "y" },
  panda_joint7: { min: -2.8973, max: 2.8973, axis: "z" },
};

function discoverJoints(scene: THREE.Object3D): DiscoveredJoint[] {
  const found: DiscoveredJoint[] = [];
  scene.traverse((obj) => {
    const nameLower = obj.name.toLowerCase();
    if (nameLower.includes("panda_joint") && !nameLower.includes("finger")) {
      const limits = FRANKA_LIMITS[obj.name] ?? {
        min: -Math.PI,
        max: Math.PI,
        axis: "y" as const,
      };
      found.push({
        name: obj.name,
        object: obj,
        axis: limits.axis,
        min: limits.min,
        max: limits.max,
      });
    }
  });
  found.sort((a, b) => {
    const nA = parseInt(a.name.replace(/\D/g, "")) || 0;
    const nB = parseInt(b.name.replace(/\D/g, "")) || 0;
    return nA - nB;
  });
  return found;
}

function EndEffectorReader({
  joints,
  onPos,
}: {
  joints: DiscoveredJoint[];
  onPos: (p: { x: number; y: number; z: number }) => void;
}) {
  const posRef = useRef(new THREE.Vector3());
  useFrame(() => {
    if (joints.length === 0) return;
    const last = joints[joints.length - 1];
    if (!last?.object) return;
    last.object.getWorldPosition(posRef.current);
    onPos({ x: posRef.current.x, y: posRef.current.y, z: posRef.current.z });
  });
  return null;
}

function EndEffectorAxes({ joints }: { joints: DiscoveredJoint[] }) {
  const axesRef = useRef<THREE.AxesHelper>(null!);
  const pos = useRef(new THREE.Vector3());
  const quat = useRef(new THREE.Quaternion());
  useFrame(() => {
    if (!axesRef.current || joints.length === 0) return;
    const last = joints[joints.length - 1];
    if (!last?.object) return;
    last.object.getWorldPosition(pos.current);
    last.object.getWorldQuaternion(quat.current);
    axesRef.current.position.copy(pos.current);
    axesRef.current.quaternion.copy(quat.current);
  });
  return <axesHelper ref={axesRef} args={[0.25]} />;
}

declare global {
  interface Window {
    __setRenderStats?: (s: PerfStats) => void;
  }
}

function handleStats(s: PerfStats) {
  window.__setRenderStats?.(s);
}
function ScenePerfReader() {
  return <PerfReader onStats={handleStats} />;
}

function ManipulatorScene({
  url,
  onJointsReady,
}: {
  url: string;
  onJointsReady: (joints: DiscoveredJoint[]) => void;
}) {
  const { scene: gltfScene } = useGLTF(url);

  const scene = useMemo(() => {
    const cloned = gltfScene.clone(true);
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const mat = Array.isArray(child.material)
        ? child.material[0]
        : child.material;
      if (mat instanceof THREE.MeshStandardMaterial) mat.envMapIntensity = 1.2;
    });
    return cloned;
  }, [gltfScene]);

  const joints = useMemo(() => discoverJoints(scene), [scene]);

  // Store joints in a ref so useFrame can mutate Three.js objects freely
  // without the React Compiler flagging mutations on a useMemo return value.
  const jointsRef = useRef<DiscoveredJoint[]>([]);
  useEffect(() => {
    jointsRef.current = joints;
  }, [joints]);

  const notifiedRef = useRef(false);
  useEffect(() => {
    if (notifiedRef.current || joints.length === 0) return;
    notifiedRef.current = true;
    const names = joints.map((j) => j.name);
    const defaults: Record<string, number> = {};
    names.forEach((n) => (defaults[n] = 0));
    useManipulatorStore.getState().initJoints(names, defaults);
    onJointsReady(joints);
  }, [joints, onJointsReady]);

  useFrame(() => {
    const angles = useManipulatorStore.getState().jointAngles;
    jointsRef.current.forEach((j) => {
      const val = angles[j.name];
      if (val !== undefined) j.object.rotation[j.axis] = val;
    });
  });

  return <primitive object={scene} />;
}

// ─── Page Component ────────────────────────────────────────────────
export default function ManipulatorPage() {
  const [joints, setJoints] = useState<DiscoveredJoint[]>([]);
  const [eePos, setEePos] = useState({ x: 0, y: 0, z: 0 });

  const eePosRef = useRef({ x: 0, y: 0, z: 0 });
  const lastEeUpdate = useRef(0);
  function handleEePos(p: { x: number; y: number; z: number }) {
    eePosRef.current = p;
    const now = performance.now();
    if (now - lastEeUpdate.current > 100) {
      lastEeUpdate.current = now;
      setEePos({ ...p });
    }
  }

  return (
    <motion.div
      className="relative w-full h-full flex"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* ── 3D Canvas ──────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [2.8, 2.2, 4.2], fov: 48, near: 0.01, far: 120 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
            outputColorSpace: THREE.SRGBColorSpace,
            powerPreference: "high-performance",
          }}
          style={{ background: "#080c12" }}
          dpr={[1, 2]}
        >
          <Suspense fallback={<LoadingScreen />}>
            <Environment preset="warehouse" environmentIntensity={0.35} />
            <Lights />
            <Floor />

            <ManipulatorScene
              url="/ridgeback_franka.glb"
              onJointsReady={setJoints}
            />
            <EndEffectorAxes joints={joints} />
            <EndEffectorReader joints={joints} onPos={handleEePos} />

            {/* Static contact shadow — robot doesn't move on this page */}
            <ContactShadows
              position={[0, 0.005, 0]}
              opacity={0.55}
              scale={5}
              blur={2.5}
              far={2.5}
              resolution={256}
              color="#001428"
            />

            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.08}
              minDistance={0.5}
              maxDistance={14}
              target={[0, 1.0, 0]}
            />
            <ScenePerfReader />
            <fog attach="fog" args={["#080c12", 25, 70]} />
          </Suspense>
        </Canvas>

        {/* ── HUD overlays ────────────────────────────────────────── */}
        <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-none">
          <div
            className="glass pointer-events-none select-none"
            style={{ minWidth: 200 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-border">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse-slow" />
              <span className="text-brand-muted text-xs font-mono uppercase tracking-widest">
                End-Effector
              </span>
            </div>
            <div className="px-3 py-2">
              {(["x", "y", "z"] as const).map((axis) => (
                <div key={axis} className="stat-row">
                  <span className="stat-label">{axis.toUpperCase()}</span>
                  <span className="stat-value">{eePos[axis].toFixed(4)} m</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-3 pointer-events-none">
          <PerformancePanel />
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
          <div
            className="glass px-5 py-2.5 flex items-center gap-3"
            style={{
              boxShadow:
                "0 0 24px rgba(0,212,255,0.10), 0 4px 28px rgba(0,0,0,0.55)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full bg-brand-accent"
              style={{
                boxShadow: "0 0 8px #00d4ff",
                animation: "pulse 3s ease-in-out infinite",
              }}
            />
            <span className="text-brand-muted text-xs font-mono tracking-widest uppercase">
              Forward Kinematics
            </span>
            <span className="w-px h-4 bg-brand-border" />
            <span className="text-brand-accent text-xs font-mono">
              6-DOF Franka Panda
            </span>
          </div>
        </div>
      </div>

      {/* ── Right sidebar ───────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col p-4 overflow-hidden border-l"
        style={{
          width: 320,
          background: "rgba(8,12,18,0.95)",
          borderColor: "var(--border-hard)",
        }}
      >
        <div className="mb-3 flex-shrink-0">
          <h2 className="text-brand-text font-bold text-base">Joint Control</h2>
          <p className="text-brand-muted text-xs mt-0.5">
            Franka Panda — Forward Kinematics
          </p>
        </div>

        <div
          className="mb-3 flex-shrink-0 rounded-lg p-3"
          style={{
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.15)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-accent text-xs font-mono">◈</span>
            <span className="text-brand-accent text-xs font-semibold tracking-wide">
              Kinematic Chain
            </span>
          </div>
          <p
            className="text-brand-muted"
            style={{ fontSize: 10, lineHeight: 1.5 }}
          >
            Joints auto-discovered from GLB scene graph. Rotations applied
            directly to Three.js nodes every frame via Zustand.
          </p>
        </div>

        <JointSliders joints={joints} />
      </div>
    </motion.div>
  );
}
