import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const PALETTE = ['#9c2f45', '#7a1f33', '#c2566a', '#e39b2d', '#f0b04a', '#f4ecdc']

/** A slightly cupped petal: a teardrop shape bent along its width. */
function petalGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0.06, 0.05, 0.07, 0.14, 0, 0.2)
  s.bezierCurveTo(-0.07, 0.14, -0.06, 0.05, 0, 0)
  const g = new THREE.ShapeGeometry(s, 6)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    pos.setZ(i, x * x * 9)
  }
  g.computeVertexNormals()
  g.center()
  return g
}

/** Small seeded PRNG (mulberry32) so petal layouts are deterministic and render-pure. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createPetals(count: number) {
  const rand = seeded(20270212)
  return Array.from({ length: count }, () => ({
    x: rand() - 0.5,
    y: rand(),
    z: -2.2 + rand() * 3,
    speed: 0.12 + rand() * 0.18,
    sway: 0.2 + rand() * 0.5,
    phase: rand() * Math.PI * 2,
    spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(1.6),
    rot: new THREE.Euler(rand() * 6, rand() * 6, rand() * 6),
    scale: 0.6 + rand() * 0.8,
    respawn: rand,
  }))
}

/**
 * Slowly drifting rose, marigold and jasmine petals rendered as a single
 * InstancedMesh (one draw call regardless of count).
 */
export function Petals({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const viewport = useThree((s) => s.viewport)
  const geometry = useMemo(() => petalGeometry(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const petals = useMemo(() => createPetals(count), [count])

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) m.setColorAt(i, color.set(PALETTE[i % PALETTE.length]))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, dt) => {
    const m = mesh.current
    if (!m) return
    const t = state.clock.elapsedTime
    const w = viewport.width * 1.3
    const h = viewport.height + 1.5
    const step = Math.min(dt, 0.05)
    petals.forEach((p, i) => {
      p.y -= (p.speed * step) / h
      if (p.y < 0) {
        p.y = 1
        p.x = p.respawn() - 0.5
      }
      p.rot.x += p.spin.x * step
      p.rot.y += p.spin.y * step
      p.rot.z += p.spin.z * step
      dummy.position.set(p.x * w + Math.sin(t * p.sway + p.phase) * 0.35, (p.y - 0.5) * h, p.z)
      dummy.rotation.copy(p.rot)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.55} metalness={0} />
    </instancedMesh>
  )
}
