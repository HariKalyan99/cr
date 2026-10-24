import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '../../lib/gsap'
import type { DeviceTier } from '../../lib/device'
import type { IntroPhase } from '../invitation/types'
import type { EnvelopeDims } from './textures'
import { useInvitationTextures } from './useInvitationTextures'
import { SealHalf } from './WaxSeal3D'

/* Envelope proportions in scene units (origin at the envelope centre). */
const DIMS: EnvelopeDims = { W: 3.2, H: 2.1, flapH: 2.1 * 0.62, pocketV: -0.05 }
const CARD = { w: DIMS.W * 0.93, h: DIMS.H * 0.88, y: -0.07 }
const SEAL = { r: 0.34, y: DIMS.H / 2 - DIMS.flapH + 0.08 }
/** Envelope centre sits this fraction of the viewport height below centre (matches the CSS envelope). */
const STAGE_OFFSET = 0.06
/* Thin z-offsets keep the paper layers in the right order without z-fighting. */
const Z = { back: 0, card: 0.012, pocket: 0.04, flap: 0.056, flapOpen: -0.02, seal: 0.1 }
/** Cardstock thickness. The envelope outline is not bevelled: a bevel mitres the
 *  sharp flap corners inward, so they no longer meet the body. */
const STOCK = { depth: 0.018 }

/**
 * Extrudes a sheet of paper and splits it into three materials:
 * 0 front (the printed face), 1 the cut edge, 2 the back.
 * `bevel` is only for the card, which sits inside the envelope and can have a soft edge.
 */
function paperStock(shape: THREE.Shape, curveSegments = 8, bevel = false) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: STOCK.depth,
    bevelEnabled: bevel,
    bevelThickness: bevel ? 0.004 : 0,
    bevelSize: bevel ? 0.008 : 0,
    bevelSegments: bevel ? 2 : 0,
    curveSegments,
  })
  const pos = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')

  let zMin = Infinity
  let zMax = -Infinity
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < pos.count; i++) {
    zMin = Math.min(zMin, pos.getZ(i))
    zMax = Math.max(zMax, pos.getZ(i))
    minX = Math.min(minX, pos.getX(i))
    minY = Math.min(minY, pos.getY(i))
    maxX = Math.max(maxX, pos.getX(i))
    maxY = Math.max(maxY, pos.getY(i))
  }
  const midZ = (zMin + zMax) / 2
  const w = maxX - minX || 1
  const h = maxY - minY || 1

  // ExtrudeGeometry is non-indexed: groups address vertices, three per triangle.
  const front: number[] = []
  const back: number[] = []
  const sides: number[] = []
  for (const group of geometry.groups) {
    const wall = group.materialIndex === 1
    for (let i = group.start; i < group.start + group.count; i += 3) {
      const bucket = wall ? sides : (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3 > midZ ? front : back
      bucket.push(i, i + 1, i + 2)
    }
  }
  const order = front.concat(back, sides)
  const nextPos = new Float32Array(order.length * 3)
  const nextNormal = new Float32Array(order.length * 3)
  const nextUv = new Float32Array(order.length * 2)
  order.forEach((src, dst) => {
    nextPos.set([pos.getX(src), pos.getY(src), pos.getZ(src)], dst * 3)
    nextNormal.set([normal.getX(src), normal.getY(src), normal.getZ(src)], dst * 3)
    nextUv.set([(pos.getX(src) - minX) / w, (pos.getY(src) - minY) / h], dst * 2)
  })
  geometry.setAttribute('position', new THREE.BufferAttribute(nextPos, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(nextNormal, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(nextUv, 2))
  geometry.clearGroups()
  geometry.addGroup(0, front.length, 0)
  geometry.addGroup(front.length, back.length, 2)
  geometry.addGroup(front.length + back.length, sides.length, 1)
  geometry.computeVertexNormals()
  return geometry
}

function roundedRect(w: number, h: number, r = 0.045) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** Soft elliptical drop shadow, the way a card casts one on a table. */
function contactShadow() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(128, 132, 8, 128, 124, 122)
  g.addColorStop(0, 'rgba(10, 2, 6, 0.62)')
  g.addColorStop(0.42, 'rgba(10, 2, 6, 0.3)')
  g.addColorStop(1, 'rgba(10, 2, 6, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function useEnvelopeGeometry() {
  const geometry = useMemo(() => {
    const { W, H, flapH, pocketV } = DIMS
    // Pocket and flap share the exact top corners (±W/2, H/2). Any inset here
    // shows up as the gap at the corners.
    const pocket = new THREE.Shape()
    pocket.moveTo(-W / 2, -H / 2)
    pocket.lineTo(W / 2, -H / 2)
    pocket.lineTo(W / 2, H / 2)
    pocket.lineTo(0, pocketV)
    pocket.lineTo(-W / 2, H / 2)
    pocket.closePath()

    const flap = new THREE.Shape()
    flap.moveTo(-W / 2, 0)
    flap.lineTo(W / 2, 0)
    flap.lineTo(0, -flapH)
    flap.closePath()

    return {
      back: new THREE.PlaneGeometry(W, H),
      pocket: paperStock(pocket),
      flap: paperStock(flap, 1),
      card: paperStock(roundedRect(CARD.w, CARD.h, 0.03), 8, true),
    }
  }, [])
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry])
  return geometry
}

interface Props {
  phase: IntroPhase
  tier: DeviceTier
  onReady: () => void
  onRevealed: () => void
}

export function Envelope3D({ phase, tier, onReady, onRevealed }: Props) {
  const textures = useInvitationTextures(DIMS, CARD.w / CARD.h, tier)
  const geo = useEnvelopeGeometry()
  const viewport = useThree((s) => s.viewport)
  const get = useThree((s) => s.get)

  const rig = useRef<THREE.Group>(null)
  const envelope = useRef<THREE.Group>(null)
  const flapPivot = useRef<THREE.Group>(null)
  const card = useRef<THREE.Mesh>(null)
  const sealLeft = useRef<THREE.Group>(null)
  const sealRight = useRef<THREE.Group>(null)
  const shadow = useMemo(() => contactShadow(), [])
  useEffect(() => () => shadow.dispose(), [shadow])

  const phaseRef = useRef(phase)
  const pointer = useRef({ x: 0, y: 0 })
  const frames = useRef(0)
  const readyCalled = useRef(false)

  // Fit the envelope between the title and the call to action:
  // ~82% of the width on phones, ~41% of the height on wide screens.
  const fit = Math.min((viewport.width * 0.82) / DIMS.W, (viewport.height * 0.41) / DIMS.H, 1.3)
  const offsetY = -viewport.height * STAGE_OFFSET
  const layout = useRef({ fit, offsetY })
  const revealedRef = useRef(onRevealed)
  useEffect(() => {
    phaseRef.current = phase
    layout.current = { fit, offsetY }
    revealedRef.current = onRevealed
  })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, dt) => {
    const r = rig.current
    if (!r) return
    const idle = phaseRef.current === 'idle'
    const t = state.clock.elapsedTime
    // Gentle hover + pointer parallax while waiting; settles flat to camera once opening.
    const tx = idle ? 0.1 - pointer.current.y * 0.12 + Math.sin(t * 0.7) * 0.015 : 0
    const ty = idle ? pointer.current.x * 0.22 : 0
    r.rotation.x = THREE.MathUtils.damp(r.rotation.x, tx, 3.5, dt)
    r.rotation.y = THREE.MathUtils.damp(r.rotation.y, ty, 3.5, dt)
    r.rotation.z = THREE.MathUtils.damp(r.rotation.z, idle ? Math.sin(t * 0.5) * 0.012 : 0, 3, dt)
    r.position.y = THREE.MathUtils.damp(r.position.y, offsetY + (idle ? Math.sin(t * 0.9) * 0.035 : 0), 3, dt)

    if (textures && !readyCalled.current && ++frames.current > 2) {
      readyCalled.current = true
      onReady()
    }
  })

  /*
   * Opening choreography (seconds):
   *  0.00  seal splits along its crack and the halves tumble away
   *  0.45  flap swings up and over its hinge
   *  1.25  card rises out of the pocket
   *  2.05  envelope drops away while the card glides forward to face the guest
   *  ~3.4  card presented → onRevealed()
   */
  const started = phase !== 'idle'
  useEffect(() => {
    if (!started || !textures) return
    const ctx = gsap.context(() => {
      const L = sealLeft.current!
      const R = sealRight.current!
      const flap = flapPivot.current!
      const c = card.current!
      const env = envelope.current!

      const cardTarget = () => {
        const { camera, size } = get()
        const cam = camera as THREE.PerspectiveCamera
        const { fit: s, offsetY: oy } = layout.current
        const zWorld = Math.min(2.4, cam.position.z * 0.3)
        const vh = 2 * (cam.position.z - zWorld) * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
        const vw = vh * (size.width / size.height)
        const worldWidth = Math.min(vw * 0.88, vh * 0.74 * (CARD.w / CARD.h))
        return { z: zWorld / s, y: -oy / s, k: worldWidth / (CARD.w * s) }
      }

      const tl = gsap.timeline({ onComplete: () => revealedRef.current() })
      tl.to(L.position, { x: -0.04, duration: 0.22, ease: 'power2.out' }, 0)
        .to(R.position, { x: 0.04, duration: 0.22, ease: 'power2.out' }, 0)
        .to(L.rotation, { z: 0.5, y: -0.9, duration: 0.8, ease: 'power2.in' }, 0.18)
        .to(R.rotation, { z: -0.45, y: 0.9, duration: 0.8, ease: 'power2.in' }, 0.18)
        .to(L.position, { x: -0.7, y: -3.2, z: 0.9, duration: 0.85, ease: 'power2.in' }, 0.22)
        .to(R.position, { x: 0.75, y: -3.4, z: 0.9, duration: 0.85, ease: 'power2.in' }, 0.22)
        .set([L, R], { visible: false }, 1.1)
        .to(
          flap.rotation,
          {
            x: -Math.PI * 1.06,
            duration: 1.0,
            ease: 'power2.inOut',
            onUpdate: () => {
              // Once past vertical, tuck the flap behind the back panel so the rising card passes in front of it.
              if (flap.rotation.x < -Math.PI / 2) flap.position.z = Z.flapOpen
            },
          },
          0.45,
        )
        .to(c.position, { y: CARD.y + DIMS.H * 0.66, duration: 1.0, ease: 'power3.out' }, 1.25)
        .to(env.position, { y: -8, duration: 1.15, ease: 'power3.in' }, 2.05)
        .to(env.rotation, { x: 0.55, duration: 1.15, ease: 'power3.in' }, 2.05)
        .to(c.position, { y: () => cardTarget().y, z: () => cardTarget().z, duration: 1.35, ease: 'power3.inOut' }, 2.1)
        .to(c.scale, { x: () => cardTarget().k, y: () => cardTarget().k, duration: 1.35, ease: 'power3.inOut' }, 2.1)
        .to(c.rotation, { keyframes: { x: [0, -0.12, 0], z: [0, 0.03, 0] }, duration: 1.35, ease: 'power2.inOut' }, 2.1)
    })
    return () => ctx.revert()
  }, [started, textures, get])

  if (!textures) return null

  const paper = (t: { map: THREE.Texture; pbr: THREE.Texture }) => ({
    map: t.map,
    roughnessMap: t.pbr,
    metalnessMap: t.pbr,
    roughness: 1,
    metalness: 1,
  })
  // The cut edge is a touch lighter than the face, so the thickness catches the light.
  const edge = { color: '#f3e6cf', roughness: 0.58, metalness: 0.06, envMapIntensity: 0.35 }

  return (
    <group ref={rig} scale={fit} position-y={offsetY} rotation-x={0.1}>
      <group ref={envelope}>
        <mesh position={[0.14, -0.2, -0.28]} renderOrder={-1}>
          <planeGeometry args={[DIMS.W * 1.45, DIMS.H * 1.7]} />
          <meshBasicMaterial map={shadow} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh geometry={geo.back} position-z={Z.back} receiveShadow>
          <meshStandardMaterial {...paper(textures.liner)} />
        </mesh>
        <mesh geometry={geo.pocket} position-z={Z.pocket} castShadow receiveShadow>
          <meshStandardMaterial attach="material-0" {...paper(textures.pocket)} />
          <meshStandardMaterial attach="material-1" {...edge} />
          <meshStandardMaterial attach="material-2" color="#e7d8c0" roughness={0.9} />
        </mesh>
        <group ref={flapPivot} position={[0, DIMS.H / 2, Z.flap]}>
          <mesh geometry={geo.flap} castShadow receiveShadow>
            <meshStandardMaterial attach="material-0" {...paper(textures.flap)} />
            <meshStandardMaterial attach="material-1" {...edge} />
            <meshStandardMaterial attach="material-2" {...paper(textures.liner)} />
          </mesh>
        </group>
        <group position={[0, SEAL.y, Z.seal]}>
          <SealHalf ref={sealLeft} side="left" radius={SEAL.r} monogram={textures.seal} />
          <SealHalf ref={sealRight} side="right" radius={SEAL.r} monogram={textures.seal} />
        </group>
      </group>
      <mesh ref={card} geometry={geo.card} position={[0, CARD.y, Z.card]} castShadow>
        <meshStandardMaterial attach="material-0" {...paper(textures.card)} />
        <meshStandardMaterial attach="material-1" {...edge} />
        <meshStandardMaterial attach="material-2" color="#f6efe2" roughness={0.9} />
      </mesh>
    </group>
  )
}
