import type { WeddingImage } from '../data/types'
import { mediaUrl } from './media'

const SMALL = 640

/** Builds src/srcset for the `-sm` (640px) and `-lg` (full size) WebP pair. */
export function imageSources(image: WeddingImage) {
  const scale = Math.min(1, SMALL / Math.max(image.width, image.height))
  const smallWidth = Math.round(image.width * scale)
  return {
    src: mediaUrl(`${image.src}-lg.webp`),
    srcSet: `${mediaUrl(`${image.src}-sm.webp`)} ${smallWidth}w, ${mediaUrl(`${image.src}-lg.webp`)} ${image.width}w`,
  }
}
