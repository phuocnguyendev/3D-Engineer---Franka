import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

function makeFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0c1118'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const v = Math.floor(Math.random() * 14)
    ctx.fillStyle = `rgba(${v},${Math.floor(v * 1.1)},${Math.floor(v * 1.4)},0.25)`
    ctx.fillRect(x, y, 2, 2)
  }

  const step = size / 10
  ctx.lineWidth = 0.8
  ctx.strokeStyle = 'rgba(28,68,100,0.65)'
  for (let i = 0; i <= 10; i++) {
    const p = i * step
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke()
  }
  ctx.lineWidth = 1.8
  ctx.strokeStyle = 'rgba(0,170,210,0.28)'
  for (let i = 0; i <= 10; i += 5) {
    const p = i * step
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke()
  }
  ctx.lineWidth = 2.5
  ctx.strokeStyle = 'rgba(0,200,240,0.18)'
  ctx.strokeRect(1.25, 1.25, size - 2.5, size - 2.5)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(14, 14)
  tex.anisotropy = maxAnisotropy
  return tex
}

export function Floor() {
  const { gl } = useThree()

  const floorTex = useMemo(
    () => makeFloorTexture(gl.capabilities.getMaxAnisotropy()),
    [gl]
  )
  useEffect(() => () => floorTex.dispose(), [floorTex])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial
        map={floorTex}
        color="#d8e8f0"
        roughness={0.88}
        metalness={0.06}
        envMapIntensity={0.25}
      />
    </mesh>
  )
}
