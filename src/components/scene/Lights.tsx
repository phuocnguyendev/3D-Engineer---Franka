export function Lights() {
  return (
    <>
      <hemisphereLight args={['#d0e8ff', '#1a2a38', 0.55]} />

      <directionalLight
        position={[14, 24, 10]}
        intensity={2.8}
        color="#fff6ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-10, 14, -8]} intensity={0.7} color="#88bbff" />
      <directionalLight position={[0, -2, -14]} intensity={0.35} color="#00c8f0" />
      <pointLight position={[0, 0.6, 0]} intensity={5} color="#00d4ff" decay={2.2} distance={14} />
    </>
  )
}
