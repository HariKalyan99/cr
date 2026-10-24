/** Google Maps directions to a place; works on mobile (opens the app) and desktop. */
export function directionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

/** Google Maps search for a place. */
export function mapSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Key-less embeddable map. Only loaded when a guest explicitly asks for it. */
export function mapEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

/** Returns a wa.me link, or null if the number is missing or malformed. */
export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, '')
  if (digits.length < 8) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
