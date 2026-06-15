import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useDriveStore } from "@/store/useDriveStore";

interface TrajectoryTrailProps {
  color?: string;
  yOffset?: number;
}

const EMPTY: [number, number, number][] = [
  [0, 0.05, 0],
  [0.001, 0.05, 0],
];

export function TrajectoryTrail({ color = "#00d4ff", yOffset = 0.05 }: TrajectoryTrailProps) {
  const [points, setPoints] = useState<[number, number, number][]>(EMPTY);
  const lastLenRef = useRef(0);
  const frameRef = useRef(0);

  useFrame(() => {
    const { trail, pose } = useDriveStore.getState();

    frameRef.current++;
    const lenChanged = trail.length !== lastLenRef.current;
    // Live tip: update every 3 frames (~20fps) so the line follows robot smoothly
    const liveTick = frameRef.current % 3 === 0;

    if (!lenChanged && !liveTick) return;
    if (trail.length < 1) {
      if (lenChanged) {
        lastLenRef.current = 0;
        setPoints(EMPTY);
      }
      return;
    }

    lastLenRef.current = trail.length;
    const pts: [number, number, number][] = trail.map(
      (pt) => [pt.x, yOffset, pt.z],
    );

    pts.push([pose.x, yOffset, pose.z]);

    setPoints(pts);
  });

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      depthTest={true}
      frustumCulled={false}
    />
  );
}

export default TrajectoryTrail;
