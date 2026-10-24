/** Amber wash that sits on the photo only. The parent needs `isolate` so the blend stays on the picture. */
export function WarmWash() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#e4c48a]/12 mix-blend-soft-light" />
  )
}
