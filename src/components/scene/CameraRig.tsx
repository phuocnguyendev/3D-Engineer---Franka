import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDriveStore } from '@/store/useDriveStore'

interface CameraRigProps {
  follow: boolean
  offset?: [number, number, number]
}

/**
 * Follow camera that rotates around the robot using its actual heading.
 * The robot's forward direction is +X at theta=0, rotating CCW for positive theta.
 * Offset is expressed in robot-local space: [right, up, back].
 */
export function CameraRig({ follow, offset = [0, 8, 16] }: CameraRigProps) {
  const { camera } = useThree()
  const camPos = useRef(new THREE.Vector3())
  const lookAt = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!follow) return

    const { pose } = useDriveStore.getState()
    const robotPos = new THREE.Vector3(pose.x, 0, pose.z)

    // Rotate offset vector by robot heading (theta, CCW around Y)
    // Robot faces +X at theta=0, so we rotate offset around Y by theta
    const cosT = Math.cos(pose.theta)
    const sinT = Math.sin(pose.theta)
    const [ox, oy, oz] = offset

    // Transform from robot-local to world:
    //   world.x = cos(theta)*ox - sin(theta)*oz   (forward=+X, right=+Z in robot frame)
    //   world.z = sin(theta)*ox + cos(theta)*oz
    const worldOffset = new THREE.Vector3(
      cosT * ox - sinT * oz,
      oy,
      sinT * ox + cosT * oz
    )

    camPos.current.lerp(robotPos.clone().add(worldOffset), 0.05)
    lookAt.current.lerp(robotPos.clone().add(new THREE.Vector3(0, 1, 0)), 0.05)

    camera.position.copy(camPos.current)
    camera.lookAt(lookAt.current)
  })

  return null
}
