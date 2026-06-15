import { forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface RobotModelProps {
  url: string;
  castShadow?: boolean;
}

/**
 * Loads the GLB and exposes its root Group via forwardRef.
 * Used by both pages — each page wraps this and controls positioning.
 */
export const RobotModel = forwardRef<THREE.Group, RobotModelProps>(
  ({ url, castShadow = true }, ref) => {
    const { scene } = useGLTF(url);

    // Enable shadows on all meshes
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = true;
        // Enhance material appearance
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.isMeshStandardMaterial) {
            mat.envMapIntensity = 0.8;
          }
        }
      }
    });

    return (
      <group ref={ref}>
        <primitive object={scene.clone(true)} />
      </group>
    );
  },
);

RobotModel.displayName = "RobotModel";

// Preload for faster first render
useGLTF.preload("/ridgeback_franka.glb");
