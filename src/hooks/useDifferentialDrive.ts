import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboard } from './useKeyboard'
import { useDriveStore } from '@/store/useDriveStore'
import { FLOOR_HALF } from '@/components/scene/Floor'

const TRAIL_DIST_SQ = 0.05 * 0.05  // 5 cm squared
const TRAIL_INTERVAL = 0.08         // seconds between push checks

function ramp(current: number, target: number, accel: number, dt: number): number {
  const diff = target - current
  const step = accel * dt
  if (Math.abs(diff) <= step) return target
  return current + Math.sign(diff) * step
}

export function useDifferentialDrive() {
  const groupRef = useRef<THREE.Group>(null!)
  const keys = useKeyboard()

  const linVelRef = useRef(0)
  const angVelRef = useRef(0)
  const poseRef = useRef({ x: 0, z: 0, theta: 0 })
  const lastPushRef = useRef(0)
  const lastTrailPosRef = useRef({ x: 0, z: 0 })
  const prevTrailLenRef = useRef(0)

  const { setPose, setVelocity, pushTrailPoint } = useDriveStore.getState()

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05)
    const { config, trail } = useDriveStore.getState()
    const { maxLinearVel, maxAngularVel, linearAccel, angularAccel } = config
    const k = keys.current

    const targetLin =
      k.ArrowUp || k.KeyW ? maxLinearVel
      : k.ArrowDown || k.KeyS ? -maxLinearVel
      : 0

    const targetAng =
      k.ArrowLeft || k.KeyA ? maxAngularVel
      : k.ArrowRight || k.KeyD ? -maxAngularVel
      : 0

    linVelRef.current = THREE.MathUtils.clamp(
      ramp(linVelRef.current, targetLin, linearAccel, dt),
      -maxLinearVel, maxLinearVel,
    )
    angVelRef.current = THREE.MathUtils.clamp(
      ramp(angVelRef.current, targetAng, angularAccel, dt),
      -maxAngularVel, maxAngularVel,
    )

    const v = linVelRef.current
    const w = angVelRef.current

    poseRef.current.theta += w * dt
    const { theta } = poseRef.current
    poseRef.current.x += v * Math.cos(theta) * dt
    poseRef.current.z -= v * Math.sin(theta) * dt

    // ── Boundary clamping ──────────────────────────────────────────
    // FLOOR_HALF is exported from Floor.tsx (= planeGeometry / 2).
    // Single source of truth — if floor size changes, boundary follows.
    // Velocity is NOT killed so the robot can still rotate & move
    // freely in the perpendicular axis after hitting a wall.
    const BOUNDARY = FLOOR_HALF
    const rawX = poseRef.current.x
    const rawZ = poseRef.current.z
    const clampedX = THREE.MathUtils.clamp(rawX, -BOUNDARY, BOUNDARY)
    const clampedZ = THREE.MathUtils.clamp(rawZ, -BOUNDARY, BOUNDARY)

    const isOOB = rawX !== clampedX || rawZ !== clampedZ
    poseRef.current.x = clampedX
    poseRef.current.z = clampedZ

    useDriveStore.getState().setOutOfBounds(isOOB)
    // ──────────────────────────────────────────────────────────────

    const { x, z } = poseRef.current

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z)
      groupRef.current.rotation.y = theta
    }

    if (trail.length === 0 && prevTrailLenRef.current > 0) {
      lastTrailPosRef.current = { x, z }
    }
    prevTrailLenRef.current = trail.length

    const now = _state.clock.elapsedTime
    if (now - lastPushRef.current > TRAIL_INTERVAL) {
      const dx = x - lastTrailPosRef.current.x
      const dz = z - lastTrailPosRef.current.z
      if (dx * dx + dz * dz >= TRAIL_DIST_SQ) {
        pushTrailPoint({ x, z })
        lastTrailPosRef.current = { x, z }
      }
      lastPushRef.current = now
    }

    setPose({ x, y: 0, z, theta })
    setVelocity({ linear: v, angular: w })
  })

  return groupRef
}
