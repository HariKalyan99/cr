import { useEffect, useState } from 'react'
import type * as THREE from 'three'
import { wedding } from '../../data/wedding'
import { formatLongDate, formatWeekday, parseDate } from '../../lib/dates'
import type { DeviceTier } from '../../lib/device'
import {
  cardTexture,
  flapTexture,
  linerTexture,
  loadCanvasFonts,
  pocketTexture,
  sealTexture,
  type EnvelopeDims,
  type PbrTexture,
} from './textures'

export interface InvitationTextures {
  pocket: PbrTexture
  flap: PbrTexture
  liner: PbrTexture
  card: PbrTexture
  seal: THREE.CanvasTexture
}

const SIZES: Record<DeviceTier, { paper: number; card: number; seal: number; aniso: number }> = {
  high: { paper: 1536, card: 2048, seal: 512, aniso: 8 },
  mobile: { paper: 1024, card: 1536, seal: 384, aniso: 4 },
  low: { paper: 768, card: 1024, seal: 256, aniso: 1 },
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function disposeAll(t: InvitationTextures) {
  ;[t.pocket, t.flap, t.liner, t.card].forEach(({ map, pbr }) => {
    map.dispose()
    pbr.dispose()
  })
  t.seal.dispose()
}

/** Paints all invitation textures once fonts are ready; disposes them on unmount. */
export function useInvitationTextures(dims: EnvelopeDims, cardAspect: number, tier: DeviceTier) {
  const [textures, setTextures] = useState<InvitationTextures | null>(null)

  useEffect(() => {
    let cancelled = false
    let created: InvitationTextures | null = null

    Promise.all([loadCanvasFonts(), loadImage('/vines/6.svg'), loadImage('/logos/1.png')]).then(([, floral, logo]) => {
      if (cancelled) return
      const s = SIZES[tier]
      const date = parseDate(wedding.weddingDateTime)
      const { partnerOne, partnerTwo, monogram } = wedding.couple
      created = {
        pocket: pocketTexture(s.paper, dims, s.aniso),
        flap: flapTexture(s.paper, dims, s.aniso),
        liner: linerTexture(s.paper / 2, dims.W / dims.H, s.aniso),
        card: cardTexture(
          s.card,
          cardAspect,
          {
            monogram,
            preface: wedding.invitationCard.preface,
            names: [partnerOne, partnerTwo],
            request: wedding.invitationCard.request,
            dateLine: date ? `${formatWeekday(date)} · ${formatLongDate(date)}` : 'Date to be announced',
            city: wedding.city,
          },
          s.aniso,
          floral,
          logo,
        ),
        seal: sealTexture(s.seal, monogram, logo),
      }
      setTextures(created)
    })

    return () => {
      cancelled = true
      if (created) disposeAll(created)
    }
  }, [dims, cardAspect, tier])

  return textures
}
