const projectUrl = () => (import.meta.env?.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '')

/** Public file in the Supabase `wedding` bucket. `path` is relative to the bucket root. */
export const mediaUrl = (path: string) => `${projectUrl()}/storage/v1/object/public/wedding/${path.replace(/^\//, '')}`
