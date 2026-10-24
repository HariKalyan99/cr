import type { ImgHTMLAttributes } from 'react'
import type { WeddingImage } from '../../data/types'
import { imageSources } from '../../lib/images'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
  image: WeddingImage
  /** CSS `sizes` hint, e.g. "(min-width: 1024px) 40vw, 90vw". */
  sizes: string
  priority?: boolean
}

export function ResponsiveImage({ image, sizes, priority, className, ...rest }: Props) {
  const { src, srcSet } = imageSources(image)
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      {...rest}
    />
  )
}
