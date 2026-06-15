import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Sparkles,
  ContactShadows,
} from "@react-three/drei";
import { useControls, button } from "leva";
import { motion } from "framer-motion";
import * as THREE from "three";

import { Lights } from "@/components/scene/Lights";
import { Floor } from "@/components/scene/Floor";
import { CameraRig } from "@/components/scene/CameraRig";
import { TelemetryPanel } from "@/components/ui/TelemetryPanel";
import { PerformancePanel, PerfReader } from "@/components/ui/PerformancePanel";
import { useDifferentialDrive } from "@/hooks/useDifferentialDrive";
import { useDriveStore } from "@/store/useDriveStore";
import type { PerfStats } from "@/types/robot";
import { TrajectoryTrail } from "@/components/scene/TrajectoryTrail";
import { LoadingScreen } from "@/components/scene/LoadingScreen";

function DrivingRobot({ url }: { url: string }) {
  const groupRef = useDifferentialDrive();
  const { scene: gltfScene } = useGLTF(url);

  const scene = useMemo(() => {
    const cloned = gltfScene.clone(true);
    cloned.traverse((child) => {
      child.frustumCulled = false;
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

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      {/* Contact shadow is a child → follows robot automatically */}
      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.5}
        scale={6}
        blur={2.8}
        far={2.5}
        resolution={256}
        color="#001428"
      />
    </group>
  );
}

declare global {
  interface Window {
    __setRenderStats?: (s: PerfStats) => void;
  }
}

// ─── Scene Perf Reader ─────────────────────────────────────────────
function handleStats(s: PerfStats) {
  window.__setRenderStats?.(s);
}
function ScenePerfReader() {
  return <PerfReader onStats={handleStats} />;
}

// ─── Main Scene ────────────────────────────────────────────────────
function MainScene({
  followCamera,
  trailColor,
  showTrail,
}: {
  followCamera: boolean;
  trailColor: string;
  showTrail: boolean;
}) {
  return (
    <>
      <Environment preset="warehouse" environmentIntensity={0.35} />
      <Lights />
      <Floor />

      <Sparkles
        count={60}
        scale={[50, 14, 50]}
        size={1.0}
        speed={0.25}
        opacity={0.35}
        color="#00d4ff"
        noise={0.2}
      />

      <DrivingRobot url="/ridgeback_franka.glb" />
      {showTrail && <TrajectoryTrail color={trailColor} />}

      <CameraRig follow={followCamera} />
      {!followCamera && (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={0.08}
          maxPolarAngle={Math.PI / 2.08}
          minDistance={2.5}
          maxDistance={90}
          target={[0, 0.8, 0]}
        />
      )}

      <ScenePerfReader />
      <fog attach="fog" args={["#080c12", 55, 130]} />
    </>
  );
}

// ─── Page Component ────────────────────────────────────────────────
export default function MobileBasePage() {
  const setConfig = useDriveStore((s) => s.setConfig);
  const clearTrail = useDriveStore((s) => s.clearTrail);

  const {
    maxLinearVel,
    maxAngularVel,
    linearAccel,
    angularAccel,
    followCamera,
    showTrail,
    trailColor,
  } = useControls("Drive Settings", {
    maxLinearVel: {
      value: 2.0,
      min: 0.1,
      max: 6.0,
      step: 0.1,
      label: "Max Linear Vel (m/s)",
    },
    maxAngularVel: {
      value: 1.5,
      min: 0.1,
      max: 4.0,
      step: 0.1,
      label: "Max Angular Vel (rad/s)",
    },
    linearAccel: {
      value: 1.0,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      label: "Linear Accel (m/s²)",
    },
    angularAccel: {
      value: 1.2,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      label: "Angular Accel (rad/s²)",
    },
    followCamera: { value: true, label: "Camera Follow Robot" },
    showTrail: { value: true, label: "Show Trail" },
    trailColor: { value: "#00d4ff", label: "Trail Color" },
    "Clear Trail": button(() => clearTrail()),
  });

  useEffect(() => {
    setConfig({ maxLinearVel, maxAngularVel, linearAccel, angularAccel });
  }, [maxLinearVel, maxAngularVel, linearAccel, angularAccel, setConfig]);

  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Canvas
        shadows
        camera={{ position: [7, 5.5, 11], fov: 50, near: 0.1, far: 250 }}
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
          <MainScene
            followCamera={followCamera}
            trailColor={trailColor}
            showTrail={showTrail}
          />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-none">
        <TelemetryPanel />
      </div>
      <div className="absolute top-4 right-4 flex flex-col gap-3 pointer-events-none">
        <PerformancePanel />
      </div>

      {/* Bottom status bar */}
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
            Differential Drive
          </span>
          <span className="w-px h-4 bg-brand-border" />
          <span className="text-brand-accent text-xs font-mono">↑ ↓ ← →</span>
          <span className="text-brand-muted text-xs font-mono opacity-50">
            or
          </span>
          <span className="text-brand-accent text-xs font-mono">W A S D</span>
        </div>
      </div>
    </motion.div>
  );
}
