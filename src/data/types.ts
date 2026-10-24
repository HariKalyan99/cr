/**
 * Shape of all wedding-specific content. Components read from `wedding.ts`
 * and never hard-code personal details.
 */

export interface WeddingImage {
  /** Path prefix inside /public. `-sm.webp` (640px) and `-lg.webp` (full size) must both exist. */
  src: string
  /** Intrinsic size of the `-lg` file; used for aspect ratio and srcset widths. */
  width: number
  height: number
  alt: string
  caption?: string
}

export interface StoryChapter {
  id: string
  label: string
  title: string
  body: string
  image: WeddingImage
}

export type EventMotif = 'mehendi' | 'haldi' | 'wedding' | 'reception'

export interface WeddingEvent {
  id: string
  name: string
  /** Short poetic line shown under the event name. */
  tagline: string
  /** ISO 8601 with explicit offset, e.g. 2027-02-12T18:30:00+05:30 */
  start: string
  end: string
  /** Name of the specific space, e.g. "Garden Lawn". */
  space: string
  venueName: string
  address: string
  /** Text used for Google Maps search / directions. Prefer the venue's exact listed name. */
  mapsQuery: string
  dressCode?: { label: string; swatches: string[] }
  description: string
  motif: EventMotif
  /** Accent colour for this event's ornament. */
  accent: string
}

export interface TravelInfo {
  id: string
  kind: 'airport' | 'rail' | 'metro' | 'road' | 'stay'
  title: string
  detail: string
  note?: string
}

export interface WeddingConfig {
  /**
   * While true, the site shows discreet "sample details" notices next to dates and venues
   * so guests never mistake placeholder data for confirmed plans.
   */
  isSampleContent: boolean
  site: { title: string; description: string }
  couple: {
    partnerOne: string
    partnerTwo: string
    /** Two letters used on the wax seal and monogram. */
    monogram: [string, string]
    hashtag?: string
  }
  /** IANA zone the wedding takes place in; all times are displayed in this zone. */
  timeZone: string
  timeZoneLabel: string
  /** The moment the countdown targets (usually the main ceremony start). */
  weddingDateTime: string
  city: string
  hero: {
    eyebrow: string
    announcement: string
    image: WeddingImage
  }
  invitationCard: {
    preface: string
    request: string
  }
  story: {
    title: string
    intro: string
    chapters: StoryChapter[]
  }
  gallery: {
    title: string
    intro: string
    images: WeddingImage[]
  }
  events: WeddingEvent[]
  venue: {
    name: string
    address: string
    mapsQuery: string
    description: string
    travel: TravelInfo[]
  }
  rsvp: {
    /** ISO date (yyyy-mm-dd) shown as "Kindly respond by". Leave empty to hide. */
    respondBy: string
    maxGuests: number
    /**
     * Optional HTTPS endpoint that accepts a JSON POST (Formspree, Google Apps Script,
     * a serverless function…). When empty, the form will not pretend to save anything.
     */
    endpoint: string
    /** WhatsApp number in international format, digits only (e.g. 919876543210). */
    whatsappNumber: string
    whatsappContactName: string
  }
  closing: {
    title: string
    message: string
    signOff: string
  }
}
