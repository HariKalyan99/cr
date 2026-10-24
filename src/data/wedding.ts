import type { WeddingConfig, WeddingImage } from './types.ts'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Single source of truth for every wedding-specific detail on the site.
 *
 *  Items marked  SAMPLE  are placeholders and must be replaced with the real
 *  details before sharing. Set `isSampleContent: false` once they are final;
 *  that removes the "sample details" notices shown to guests.
 *
 *  Photos live in /public/images as `<name>-sm.webp` (640px) and
 *  `<name>-lg.webp` (full size). The current photos are temporary editorial
 *  stand-ins; replace them with your own using the same naming pattern and
 *  update width/height below.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const img = (name: string, width: number, height: number, alt: string, caption?: string): WeddingImage => ({
  src: `/images/${name}`,
  width,
  height,
  alt,
  caption,
})

const VENUE_NAME = 'Palace Grounds' // SAMPLE
const VENUE_ADDRESS = 'Palace Grounds, Jayamahal Road, Vasanth Nagar, Bengaluru, Karnataka' // SAMPLE
const VENUE_MAPS_QUERY = 'Palace Grounds, Bengaluru' // SAMPLE

export const wedding: WeddingConfig = {
  isSampleContent: true,

  site: {
    title: 'Charan & Rakshitha · Wedding Invitation',
    description: 'Charan & Rakshitha warmly invite you to celebrate their wedding.',
  },

  couple: {
    partnerOne: 'Charan',
    partnerTwo: 'Rakshitha',
    monogram: ['C', 'R'],
    hashtag: '#CharanWedsRakshitha',
  },

  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  weddingDateTime: '2027-02-12T18:30:00+05:30', // SAMPLE
  city: 'Bengaluru', // SAMPLE

  hero: {
    eyebrow: 'Together with their families',
    announcement:
      'We joyfully invite you to share in the celebration of our wedding — four days of colour, music, blessings and the beginning of our forever.',
    image: img(
      'hero-mandap',
      864,
      1152,
      'A wedding mandap draped in ivory silk and cascading marigold and jasmine garlands at golden hour',
    ),
  },

  invitationCard: {
    preface: 'Together with their families',
    request: 'request the pleasure of your company at the celebration of their wedding',
  },

  // SAMPLE story — replace with your own chapters. Kept deliberately non-specific.
  story: {
    title: 'Our Story',
    intro: 'Some chapters are written slowly, in small moments that only make sense when you look back.',
    chapters: [
      {
        id: 'first-hello',
        label: 'Chapter I · Where it began',
        title: 'A first hello',
        body: 'It started with an ordinary afternoon and a conversation neither of us wanted to end. Two cups went cold on the table while the hours quietly disappeared.',
        image: img('story-first-hello', 1152, 864, 'Two cups of coffee on a small wooden café table beside a sunlit window'),
      },
      {
        id: 'letters',
        label: 'Chapter II · Growing closer',
        title: 'Letters, journeys & long talks',
        body: 'Across cities and calendars, we kept finding our way back to each other — through late-night calls, small surprises, and a growing collection of shared memories.',
        image: img('story-letters', 864, 1152, 'Handwritten letters, instant photographs and a dried rose resting on ivory linen'),
      },
      {
        id: 'proposal',
        label: 'Chapter III · The question',
        title: 'And then, a yes',
        body: 'One evening, with a ring, a racing heart and a question asked a little nervously, forever stopped being an idea and became a promise.',
        image: img('story-ring', 1152, 864, 'An open burgundy velvet ring box holding a gold ring on a bed of jasmine flowers'),
      },
      {
        id: 'forever',
        label: 'Chapter IV · Two families, one promise',
        title: 'Hand in hand',
        body: 'With the blessings of our elders and the love of everyone who walked with us, we begin a new chapter — and we would love for you to be there.',
        image: img('story-hands', 864, 1152, "A bride's hands with intricate mehendi and gold bangles resting on the groom's hand"),
      },
    ],
  },

  gallery: {
    title: 'Moments in Gold',
    intro: 'A glimpse of the colours, rituals and quiet details we are gathering for our celebration.',
    images: [
      img('gallery-silhouette', 1280, 720, 'A couple walking hand in hand beneath string lights and marigold garlands at dusk', 'Beneath the lights'),
      img('gallery-mehendi', 864, 1152, 'Hands decorated with fresh mehendi cupping rose petals, with green and gold bangles', 'Mehendi'),
      img('gallery-diyas', 1024, 1024, 'Rows of lit brass diyas on a stone floor scattered with marigold and rose petals', 'A thousand small lights'),
      img('gallery-silk', 864, 1152, 'A burgundy Kanjivaram silk saree with a gold zari border and a strand of jasmine', 'Silk & jasmine'),
      img('gallery-haldi', 1152, 864, 'A brass bowl of turmeric paste surrounded by marigolds and mango leaves', 'Haldi morning'),
      img('gallery-reception', 1152, 864, 'An evening table set with ivory linen, gold cutlery, candles and burgundy roses', 'An evening to remember'),
    ],
  },

  // SAMPLE schedule — dates, spaces and dress codes must be confirmed.
  events: [
    {
      id: 'mehendi',
      name: 'Mehendi',
      tagline: 'Henna, music & laughter',
      start: '2027-02-10T16:00:00+05:30',
      end: '2027-02-10T21:00:00+05:30',
      space: 'Garden Lawn',
      venueName: VENUE_NAME,
      address: VENUE_ADDRESS,
      mapsQuery: VENUE_MAPS_QUERY,
      dressCode: { label: 'Shades of green', swatches: ['#7c8b5a', '#a7b38a', '#d8dcc0'] },
      description: 'An afternoon of intricate henna, folk songs and dancing as the celebrations begin.',
      motif: 'mehendi',
      accent: '#6f7d4c',
    },
    {
      id: 'haldi',
      name: 'Haldi',
      tagline: 'Turmeric, blessings & sunshine',
      start: '2027-02-11T10:00:00+05:30',
      end: '2027-02-11T13:00:00+05:30',
      space: 'Courtyard',
      venueName: VENUE_NAME,
      address: VENUE_ADDRESS,
      mapsQuery: VENUE_MAPS_QUERY,
      dressCode: { label: 'Yellows & florals', swatches: ['#e2a62b', '#f2cf6b', '#f7e7b4'] },
      description: 'A joyful morning ritual of turmeric and blessings from family and friends. Wear something you don’t mind getting a little golden.',
      motif: 'haldi',
      accent: '#b9801c',
    },
    {
      id: 'wedding',
      name: 'Wedding',
      tagline: 'The sacred vows',
      start: '2027-02-12T18:30:00+05:30',
      end: '2027-02-12T22:30:00+05:30',
      space: 'Main Pavilion',
      venueName: VENUE_NAME,
      address: VENUE_ADDRESS,
      mapsQuery: VENUE_MAPS_QUERY,
      dressCode: { label: 'Traditional · pastels welcome', swatches: ['#8a1c2b', '#d8b26a', '#f1e4cf'] },
      description: 'Under the mandap, surrounded by those we love, we take our seven steps together. Dinner follows the ceremony.',
      motif: 'wedding',
      accent: '#8a1c2b',
    },
    {
      id: 'reception',
      name: 'Reception',
      tagline: 'An evening of celebration',
      start: '2027-02-13T19:00:00+05:30',
      end: '2027-02-13T23:00:00+05:30',
      space: 'Grand Hall',
      venueName: VENUE_NAME,
      address: VENUE_ADDRESS,
      mapsQuery: VENUE_MAPS_QUERY,
      dressCode: { label: 'Black tie · Indian formal', swatches: ['#1f1b2e', '#5e1a2c', '#c9a45c'] },
      description: 'Dinner, toasts and dancing late into the night as we celebrate as newlyweds.',
      motif: 'reception',
      accent: '#3a3456',
    },
  ],

  // SAMPLE venue — a real, publicly listed venue used only as a stand-in so the
  // directions links work. Replace with the confirmed venue.
  venue: {
    name: VENUE_NAME,
    address: VENUE_ADDRESS,
    mapsQuery: VENUE_MAPS_QUERY,
    description: 'All four celebrations take place across the grounds, so you can settle in once and enjoy every moment.',
    travel: [
      {
        id: 'airport',
        kind: 'airport',
        title: 'Nearest airport',
        detail: 'Kempegowda International Airport (BLR)',
        note: 'Roughly 35 km · about an hour by car, depending on traffic',
      },
      {
        id: 'rail',
        kind: 'rail',
        title: 'Railway station',
        detail: 'KSR Bengaluru City Junction',
        note: 'Roughly 6 km · 20–30 minutes by car',
      },
      {
        id: 'road',
        kind: 'road',
        title: 'Getting around',
        detail: 'App cabs and auto-rickshaws are easy to find across the city',
        note: 'Allow extra time for evening traffic',
      },
    ],
  },

  rsvp: {
    respondBy: '2027-01-20', // SAMPLE
    maxGuests: 6,
    endpoint: '', // e.g. 'https://formspree.io/f/xxxxxxx' — empty means submissions are NOT saved online
    whatsappNumber: '', // e.g. '919876543210' — digits only, with country code
    whatsappContactName: 'the family',
  },

  closing: {
    title: 'With love & gratitude',
    message:
      'Your blessings mean the world to us. Thank you for being part of our story — we cannot wait to celebrate with you.',
    signOff: 'With love,',
  },
}
