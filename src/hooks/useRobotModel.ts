import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useManipulatorStore } from "@/store/useManipulatorStore";
import type { DiscoveredJoint } from "@/types/robot";

const FRANKA_LIMITS: Record<string, { min: number; max: number; axis: "x" | "y" | "z" }> = {
  panda_joint1: { min: -2.8973, max: 2.8973, axis: "z" },
  panda_joint2: { min: -1.7628, max: 1.7628, axis: "y" },
  panda_joint3: { min: -2.8973, max: 2.8973, axis: "z" },
  panda_joint4: { min: -3.0718, max: -0.0698, axis: "y" },
  panda_joint5: { min: -2.8973, max: 2.8973, axis: "z" },
  panda_joint6: { min: -0.0175, max: 3.7525, axis: "y" },
  panda_joint7: { min: -2.8973, max: 2.8973, axis: "z" },
};

export function useRobotModel(url: string) {
  const { scene } = useGLTF(url);
  const jointsRef = useRef<DiscoveredJoint[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const found: DiscoveredJoint[] = [];
    scene.traverse((obj) => {
      const name = obj.name.toLowerCase();
      if ((name.includes("panda_joint") || name.includes("frankajoints")) && !name.includes("finger")) {
        const limits = FRANKA_LIMITS[obj.name] ?? { min: -Math.PI, max: Math.PI, axis: "y" as const };
        found.push({ name: obj.name, object: obj, axis: limits.axis, min: limits.min, max: limits.max });
      }
    });

    found.sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.name.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    jointsRef.current = found;

    const names = found.map((j) => j.name);
    const defaults: Record<string, number> = Object.fromEntries(names.map((n) => [n, 0]));
    useManipulatorStore.getState().initJoints(names, defaults);
  }, [scene]);

  return { scene, joints: jointsRef };
}
