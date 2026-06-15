import { create } from "zustand";
import type {
  RobotPose,
  RobotVelocity,
  DriveConfig,
  TrajectoryPoint,
} from "@/types/robot";

interface DriveState {
  pose: RobotPose;
  velocity: RobotVelocity;
  config: DriveConfig;
  trail: TrajectoryPoint[];
  maxTrailLength: number;
  outOfBounds: boolean;

  setPose: (pose: RobotPose) => void;
  setVelocity: (vel: RobotVelocity) => void;
  setConfig: (cfg: Partial<DriveConfig>) => void;
  pushTrailPoint: (pt: TrajectoryPoint) => void;
  clearTrail: () => void;
  setMaxTrailLength: (n: number) => void;
  setOutOfBounds: (v: boolean) => void;
}

export const useDriveStore = create<DriveState>((set, get) => ({
  pose: { x: 0, y: 0, z: 0, theta: 0 },
  velocity: { linear: 0, angular: 0 },
  config: {
    maxLinearVel: 2.0,
    maxAngularVel: 1.5,
    linearAccel: 1.0,
    angularAccel: 1.2,
  },
  trail: [],
  maxTrailLength: 600,
  outOfBounds: false,

  setPose: (pose) => set({ pose }),
  setVelocity: (velocity) => set({ velocity }),
  setConfig: (cfg) => set((s) => ({ config: { ...s.config, ...cfg } })),
  pushTrailPoint: (pt) =>
    set((s) => {
      const trail = [...s.trail, pt];
      if (trail.length > s.maxTrailLength) trail.shift();
      return { trail };
    }),
  clearTrail: () => set({ trail: [] }),
  setMaxTrailLength: (n) => set({ maxTrailLength: n }),
  setOutOfBounds: (v) => set({ outOfBounds: v }),
}));
