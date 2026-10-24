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
  /** Soft amber wash for daylight photos that read cool. */
  warm?: boolean
}

export interface StoryChapter {
  id: string
  label: string
  title: string
  body: string
  image: WeddingImage
}

export type EventMotif = 'mehendi' | 'haldi' | 'sangeet' | 'wedding' | 'reception'

export interface WeddingEvent {
  id: string
  name: string
  /** Short poetic line shown under the event name. */
  tagline: string
  /** ISO 8601 with explicit offset, e.g. 2026-10-30T07:30:00+05:30 */
  start: string
  /** Omit when the card does not give a finishing time. */
  end?: string
  /** Shown instead of a start–end range, e.g. "9:00 AM onwards IST". */
  timeLabel?: string
  /** Name of the specific space, e.g. "Garden Lawn". */
  space: string
  venueName: string
  address: string
  /** Text used for Google Maps search / directions. Prefer the venue's exact listed name. */
  mapsQuery: string
  /** Exact Maps pin from the family, when one was shared. */
  mapsUrl?: string
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

export interface VenueCelebration {
  name: string
  date: string
  /** Reception and Muhurtham are marked so they read ahead of the other days. */
  emphasis?: boolean
}

export interface VenueContact {
  name: string
  /** Ten-digit Indian mobile, digits only. */
  phone: string
}

export interface VenuePlace {
  id: string
  /** Which celebrations happen here. */
  when: string
  celebrations?: VenueCelebration[]
  name: string
  address: string
  mapsQuery: string
  mapsUrl?: string
  description: string
  /** Phone numbers printed for guests, separate from the RSVP WhatsApp. */
  queries?: string
  contacts?: VenueContact[]
  travel: TravelInfo[]
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
  venues: VenuePlace[]
  rsvp: {
    /** ISO date (yyyy-mm-dd) shown as "Kindly respond by". Leave empty to hide. */
    respondBy: string
    maxGuests: number
    /**
     * Optional HTTPS override. Leave empty to use the Supabase `rsvp` function at
     * `${VITE_SUPABASE_URL}/functions/v1/rsvp`. When neither is set, the form does not pretend to save anything.
     */
    endpoint: string
    /** WhatsApp number in international format, digits only (e.g. 919876543210). */
    whatsappNumber: string
    whatsappContactName: string
    /** Public photo WhatsApp shows as the preview on the RSVP message. */
    previewImage: string
  }
  closing: {
    title: string
    message: string
    signOff: string
  }
}
