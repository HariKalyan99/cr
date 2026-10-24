import type { WeddingImage } from '../data/types'

const SMALL = 640

/** Builds src/srcset for the `-sm` (640px) and `-lg` (full size) WebP pair. */
export function imageSources(image: WeddingImage) {
  const scale = Math.min(1, SMALL / Math.max(image.width, image.height))
  const smallWidth = Math.round(image.width * scale)
  return {
    src: `${image.src}-lg.webp`,
    srcSet: `${image.src}-sm.webp ${smallWidth}w, ${image.src}-lg.webp ${image.width}w`,
  }
}
