/** Same-origin file under `public/`. `path` is relative to the site root. */
export const mediaUrl = (path: string) => `/${path.replace(/^\//, '')}`
