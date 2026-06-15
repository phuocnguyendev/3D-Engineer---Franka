// ─── Robot Types ─────────────────────────────────────────────────────────────

export interface RobotPose {
  x: number      // meters
  y: number      // meters (always 0 — ground plane)
  z: number      // meters
  theta: number  // radians — heading in XZ plane
}

export interface RobotVelocity {
  linear: number   // m/s
  angular: number  // rad/s
}

export interface DriveConfig {
  maxLinearVel: number    // m/s
  maxAngularVel: number   // rad/s
  linearAccel: number     // m/s²
  angularAccel: number    // rad/s²
}

export interface TrajectoryPoint {
  x: number
  z: number
}

// ─── Joint Types ─────────────────────────────────────────────────────────────

import type * as THREE from 'three'

/** A single revolute joint discovered from the GLB scene graph */
export interface DiscoveredJoint {
  name: string
  object: THREE.Object3D
  axis: 'x' | 'y' | 'z'
  min: number   // radians
  max: number   // radians
}

export interface JointAngles {
  [jointName: string]: number
}

// ─── Performance ─────────────────────────────────────────────────────────────

export interface PerfStats {
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  memoryMB: number
  fps: number
}
