import { Environment, Lightformer, PerformanceMonitor, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from 'three'
import type { DeviceTier } from '../../lib/device'
import type { IntroPhase } from '../invitation/types'
import { Envelope3D } from './Envelope3D'

export interface InvitationSceneProps {
  phase: IntroPhase
  tier: DeviceTier
  onReady: () => void
  onRevealed: () => void
  onContextLost: () => void
}

const QUALITY: Record<DeviceTier, { dpr: [number, number]; sparkles: number; shadowMap: number }> = {
  high: { dpr: [1, 2], sparkles: 60, shadowMap: 1024 },
  mobile: { dpr: [1, 1.75], sparkles: 26, shadowMap: 512 },
  low: { dpr: [1, 1], sparkles: 0, shadowMap: 0 },
}

/**
 * The signature 3D moment: an envelope with a wax seal, lit like a still life.
 * The canvas never receives pointer events, so DOM controls above it always work.
 * Lazy-loaded so three.js is only downloaded for the intro.
 */
export default function InvitationScene({ phase, tier, onReady, onRevealed, onContextLost }: InvitationSceneProps) {
  const q = QUALITY[tier]
  const [dprCap, setDprCap] = useState(q.dpr[1])
  const shadows = q.shadowMap > 0

  return (
    <Canvas
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      dpr={[q.dpr[0], dprCap]}
      shadows={shadows ? 'percentage' : false}
      camera={{ fov: 30, position: [0, 0, 9], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onContextLost()
        })
      }}
    >
      {/* Drop resolution if the device struggles to hold a smooth frame rate. */}
      <PerformanceMonitor onDecline={() => setDprCap(1)} />

      <ambientLight intensity={0.5} color="#f4ebe2" />
      <directionalLight
        position={[-2.6, 4.2, 6.5]}
        intensity={2.1}
        color="#fff3e2"
        castShadow={shadows}
        shadow-mapSize={[q.shadowMap || 512, q.shadowMap || 512]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <pointLight position={[4, -1, 3]} intensity={4} distance={12} color="#ffc9a8" />

      {/*
        Locally rendered studio reflections for the foil and wax — no HDR download.
        Flat foil facing the camera mirrors what is *behind* the camera, so the
        large soft panel at +z is what makes the gold read as gold; the smaller
        panels create moving glints as the envelope tilts with the pointer.
      */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 0, 9]} scale={[12, 7, 1]} color="#ffe9c4" />
        <Lightformer form="rect" intensity={3} position={[0, 4, 5]} scale={[8, 1.5, 1]} color="#fff4de" />
        <Lightformer form="rect" intensity={1.2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 4, 1]} color="#ffd9b0" />
        <Lightformer form="ring" intensity={2} position={[4, 2, 4]} scale={2} color="#ffe2b8" />
      </Environment>

      <Envelope3D phase={phase} tier={tier} onReady={onReady} onRevealed={onRevealed} />

      {shadows && (
        <mesh position-z={-0.7} receiveShadow>
          <planeGeometry args={[40, 30]} />
          <shadowMaterial opacity={0.28} color="#12040a" />
        </mesh>
      )}

      {q.sparkles > 0 && <Sparkles count={q.sparkles} scale={[10, 6, 3]} size={2.2} speed={0.25} opacity={0.75} color="#e9c87e" noise={0.6} />}
    </Canvas>
  )
}
