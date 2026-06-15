import { create } from "zustand";

interface ManipulatorState {
  jointAngles: Record<string, number>;
  jointNames: string[];

  setJointAngle: (name: string, value: number) => void;
  initJoints: (names: string[], defaults: Record<string, number>) => void;
  resetJoints: () => void;
}

export const useManipulatorStore = create<ManipulatorState>((set, get) => ({
  jointAngles: {},
  jointNames: [],

  setJointAngle: (name, value) =>
    set((s) => ({ jointAngles: { ...s.jointAngles, [name]: value } })),

  initJoints: (names, defaults) =>
    set({ jointNames: names, jointAngles: defaults }),

  resetJoints: () =>
    set((s) => {
      const reset: Record<string, number> = {};
      s.jointNames.forEach((n) => (reset[n] = 0));
      return { jointAngles: reset };
    }),
}));
