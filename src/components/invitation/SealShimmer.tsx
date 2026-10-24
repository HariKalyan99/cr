import { useLayoutEffect, useMemo, useState } from 'react'

type Spark = {
  dx: number
  dy: number
  size: number
  delay: number
  ox: number
  oy: number
  spark: boolean
}

type Anchor = { left: number; top: number; radius: number }

/** Where the C · R monogram sits, in viewport pixels. Mirrors the 3D camera and seal placement. */
function projectSeal(): Anchor {
  const fov = (30 * Math.PI) / 180
  const camZ = 9
  const viewH = 2 * camZ * Math.tan(fov / 2)
  const viewW = viewH * (window.innerWidth / window.innerHeight)
  const fit = Math.min((viewW * 0.82) / 3.2, (viewH * 0.41) / 2.1, 1.3)
  const localY = 2.1 / 2 - 2.1 * 0.62 + 0.08
  const tilt = 0.1
  const sy = localY * fit
  const sz = 0.1 * fit
  const y = sy * Math.cos(tilt) - sz * Math.sin(tilt) - viewH * 0.06
  const z = sy * Math.sin(tilt) + sz * Math.cos(tilt)
  const half = (camZ - z) * Math.tan(fov / 2)
  return {
    left: window.innerWidth / 2,
    top: (0.5 - y / half / 2) * window.innerHeight,
    radius: ((0.34 * fit) / half) * (window.innerHeight / 2),
  }
}

function sealAnchor(): Anchor {
  const css = document.querySelector<HTMLElement>('[data-env]')
  if (css) {
    const box = css.getBoundingClientRect()
    return { left: box.left + box.width / 2, top: box.top + box.height / 2, radius: box.width / 2 }
  }
  return projectSeal()
}

/** Gold dust born on the letters. Offsets are fractions of the seal radius. */
function dust(): Spark[] {
  return Array.from({ length: 72 }, (_, i) => {
    const turn = (i / 72) * Math.PI * 2
    const jitter = ((i * 37) % 11) / 11 - 0.5
    const near = i % 3 !== 0
    const dist = near ? 0.08 + ((i * 13) % 7) * 0.035 : 0.38 + ((i * 17) % 6) * 0.08
    return {
      dx: Math.cos(turn + jitter * 0.7) * dist,
      dy: Math.sin(turn + jitter * 0.7) * dist * 0.75 - (near ? 0.04 : 0.12),
      size: i % 9 === 0 ? 3.6 : 1.2 + (i % 3) * 0.75,
      delay: ((i * 5) % 10) * 0.022,
      ox: (((i * 13) % 17) - 8) / 8,
      oy: (((i * 7) % 9) - 4) / 4,
      spark: i % 3 === 0,
    }
  })
}

export function SealGoldShimmer({ active, reduced }: { active: boolean; reduced: boolean }) {
  const motes = useMemo(dust, [])
  const [anchor, setAnchor] = useState<Anchor | null>(null)

  useLayoutEffect(() => {
    if (!active) return
    setAnchor(sealAnchor())
  }, [active])

  if (!active || !anchor) return null

  const shown = reduced ? motes.filter((_, i) => i % 5 === 0) : motes
  const letterW = anchor.radius * 0.9
  const letterH = anchor.radius * 0.46

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div
        className={`seal-shimmer absolute ${reduced ? 'is-reduced' : ''}`}
        style={{ left: anchor.left, top: anchor.top }}
      >
        <span className="seal-letter-mist" style={{ width: letterW, height: letterH }} />
        {shown.map((speck, i) => (
          <span
            key={i}
            className={speck.spark ? 'seal-dust is-spark' : 'seal-dust'}
            style={{
              ['--s' as string]: `${speck.size}px`,
              ['--dx' as string]: `${reduced ? 0 : speck.dx * anchor.radius}px`,
              ['--dy' as string]: `${reduced ? 0 : speck.dy * anchor.radius}px`,
              ['--ox' as string]: `${speck.ox * letterW * 0.42}px`,
              ['--oy' as string]: `${speck.oy * letterH * 0.42}px`,
              animationDelay: `${speck.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
