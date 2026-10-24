import { useEffect, useMemo, type Ref } from 'react'
import * as THREE from 'three'
import { CRACK, waxRadius } from '../../lib/seal'

const SEGMENTS = 48

/**
 * One half of the poured-wax outline. Both halves share the same zig-zag crack,
 * so together they form one seamless seal that can split apart.
 */
function halfShape(side: 'left' | 'right', R: number) {
  const top = waxRadius(Math.PI / 2, R)
  const bottom = waxRadius((3 * Math.PI) / 2, R)
  const crack = CRACK.map((dx, i) => new THREE.Vector2(dx * R, -bottom + ((top + bottom) * i) / (CRACK.length - 1)))
  const shape = new THREE.Shape()
  const arc = (from: number, to: number) => {
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = from + ((to - from) * i) / SEGMENTS
      const r = waxRadius(t, R)
      if (i === 0) shape.moveTo(Math.cos(t) * r, Math.sin(t) * r)
      else shape.lineTo(Math.cos(t) * r, Math.sin(t) * r)
    }
  }
  if (side === 'left') {
    arc(Math.PI / 2, (3 * Math.PI) / 2)
    crack.slice(1).forEach((p) => shape.lineTo(p.x, p.y))
  } else {
    arc(-Math.PI / 2, Math.PI / 2)
    crack
      .slice(0, -1)
      .reverse()
      .forEach((p) => shape.lineTo(p.x, p.y))
  }
  shape.closePath()
  return shape
}

const DEPTH = 0.05
const BEVEL = 0.02

interface SealHalfProps {
  radius: number
  monogram: THREE.Texture
  side: 'left' | 'right'
  ref?: Ref<THREE.Group>
}

export function SealHalf({ radius, monogram, side, ref }: SealHalfProps) {
  const { wax, decal, decalMap } = useMemo(() => {
    const shape = halfShape(side, radius)
    // A small bevel keeps the poured edge, without opening a wide groove along the crack.
    const wax = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: radius * 0.006,
      bevelSegments: 2,
      curveSegments: 4,
    })
    const decal = new THREE.ShapeGeometry(shape)
    // ShapeGeometry UVs equal the raw x/y coordinates; remap [-R, R] → [0, 1].
    const decalMap = monogram.clone()
    decalMap.repeat.set(1 / (2 * radius), 1 / (2 * radius))
    decalMap.offset.set(0.5, 0.5)
    decalMap.needsUpdate = true
    return { wax, decal, decalMap }
  }, [radius, monogram, side])

  useEffect(
    () => () => {
      wax.dispose()
      decal.dispose()
      decalMap.dispose()
    },
    [wax, decal, decalMap],
  )

  return (
    <group ref={ref}>
      <mesh geometry={wax} castShadow>
        <meshPhysicalMaterial color="#5c1325" roughness={0.42} clearcoat={0.22} clearcoatRoughness={0.4} sheen={0.3} sheenColor="#b0485a" envMapIntensity={0.7} />
      </mesh>
      <mesh geometry={decal} position-z={DEPTH + BEVEL + 0.002}>
        <meshStandardMaterial
          map={decalMap}
          transparent
          roughness={0.72}
          metalness={0.08}
          envMapIntensity={0.4}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
    </group>
  )
}
