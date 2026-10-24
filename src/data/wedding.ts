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

const HALL = {
  name: 'S B Convention Hall',
  address: 'Kannahalli, Kodigehalli Post, Magadi Road, Bengaluru, Karnataka 560112',
  mapsQuery: 'SB Convention Hall Kannalli, Kannahalli, Kodigehalli Post, Magadi Road, Bengaluru 560112',
  mapsUrl: 'https://maps.app.goo.gl/rNfqivTySLFcz4WXA',
}

const FARM = {
  name: 'M Gundappa Farm House',
  address: '22, Muktinaga Temple Road, Kengeri Hobli, Maragondanahalli, Bengaluru, Karnataka 560060',
  mapsQuery: 'M Gundappa Farm House, 22 Muktinaga Temple Road, Maragondanahalli, Kengeri Hobli, Bengaluru 560060',
  mapsUrl: 'https://maps.app.goo.gl/2K4r1826iZ44qyUT6',
}

export const wedding: WeddingConfig = {
  isSampleContent: false,

  site: {
    title: 'Charan Raj & Rakshitha H · Wedding Invitation',
    description: 'Charan Raj and Rakshitha H invite you to their wedding celebrations in Bengaluru, 27–30 October 2026.',
  },

  couple: {
    partnerOne: 'Charan Raj',
    partnerTwo: 'Rakshitha H',
    monogram: ['C', 'R'],
    hashtag: '#CharanRajWedsRakshitha',
  },

  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  /** Muhurtham, the ceremony the countdown leads to. */
  weddingDateTime: '2026-10-30T07:30:00+05:30',
  city: 'Bengaluru',

  hero: {
    eyebrow: 'Together with our families',
    announcement:
      'We joyfully invite you to our wedding celebrations in Bengaluru — Haldi, Mehendi and Sangeet on 27 October, the reception on 29 October, and the Muhurtham on 30 October.',
    image: img(
      'hero-mandap',
      864,
      1152,
      'A wedding mandap draped in ivory silk and cascading marigold and jasmine garlands at golden hour',
    ),
  },

  invitationCard: {
    preface: 'Together with our families',
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

  events: [
    {
      id: 'haldi',
      name: 'Haldi',
      tagline: 'Turmeric, blessings & sunshine',
      start: '2026-10-27T09:00:00+05:30',
      timeLabel: '9:00 AM onwards IST',
      space: 'Farm house',
      venueName: FARM.name,
      address: FARM.address,
      mapsQuery: FARM.mapsQuery,
      mapsUrl: FARM.mapsUrl,
      dressCode: { label: 'Yellow', swatches: ['#e2a62b', '#f2cf6b', '#f7e7b4'] },
      description: 'A morning of turmeric and blessings at M Gundappa Farm House. Wear yellow — something you don’t mind getting a little golden.',
      motif: 'haldi',
      accent: '#b9801c',
    },
    {
      id: 'mehendi',
      name: 'Mehendi',
      tagline: 'Henna, colour & laughter',
      start: '2026-10-27T14:00:00+05:30',
      timeLabel: '2:00 PM onwards IST',
      space: 'Farm house',
      venueName: FARM.name,
      address: FARM.address,
      mapsQuery: FARM.mapsQuery,
      mapsUrl: FARM.mapsUrl,
      dressCode: { label: 'Blue, purple & green', swatches: ['#2f4d8a', '#7a4e8a', '#6f7d4c'] },
      description: 'Henna and colour at the farm house the same afternoon. The invitation asks for blue, purple or green.',
      motif: 'mehendi',
      accent: '#3d5a3a',
    },
    {
      id: 'sangeet',
      name: 'Sangeet',
      tagline: 'Music & celebration',
      start: '2026-10-27T00:00:00+05:30',
      space: 'Farm house',
      venueName: FARM.name,
      address: FARM.address,
      mapsQuery: FARM.mapsQuery,
      mapsUrl: FARM.mapsUrl,
      description: 'Music and dance at M Gundappa Farm House on 27 October. A starting time is not printed on the card.',
      motif: 'sangeet',
      accent: '#2c4a7a',
    },
    {
      id: 'reception',
      name: 'Reception',
      tagline: 'An evening together',
      start: '2026-10-29T18:30:00+05:30',
      timeLabel: '6:30 PM onwards IST',
      space: 'Convention hall',
      venueName: HALL.name,
      address: HALL.address,
      mapsQuery: HALL.mapsQuery,
      mapsUrl: HALL.mapsUrl,
      description: 'We receive you from 6:30 in the evening at S B Convention Hall, Kannahalli.',
      motif: 'reception',
      accent: '#5e1a2c',
    },
    {
      id: 'muhurtham',
      name: 'Muhurtham',
      tagline: 'The wedding ceremony',
      start: '2026-10-30T07:30:00+05:30',
      end: '2026-10-30T09:00:00+05:30',
      space: 'Convention hall',
      venueName: HALL.name,
      address: HALL.address,
      mapsQuery: HALL.mapsQuery,
      mapsUrl: HALL.mapsUrl,
      description: 'The wedding ceremony at S B Convention Hall, from 7:30 to 9:00 in the morning.',
      motif: 'wedding',
      accent: '#8a1c2b',
    },
  ],

  venues: [
    {
      id: 'hall',
      when: 'Reception · 29 October · Muhurtham · 30 October',
      name: HALL.name,
      address: HALL.address,
      mapsQuery: HALL.mapsQuery,
      mapsUrl: HALL.mapsUrl,
      description: 'The reception and the Muhurtham are both held at this hall on Magadi Road. Guest rooms are available on the property.',
      travel: [
        {
          id: 'hall-rail',
          kind: 'rail',
          title: 'Nearest railway',
          detail: 'Kengeri Railway Station',
          note: 'About 6 km away',
        },
        {
          id: 'hall-metro',
          kind: 'metro',
          title: 'Nearest metro',
          detail: 'Kengeri, Purple Line',
          note: 'About 7 km away',
        },
        {
          id: 'hall-air',
          kind: 'airport',
          title: 'Airport',
          detail: 'Kempegowda International Airport (BLR)',
          note: 'About 37 km away · allow extra time by road',
        },
        {
          id: 'hall-farm',
          kind: 'road',
          title: 'The other venue',
          detail: 'M Gundappa Farm House, Maragondanahalli',
          note: 'About 5 km from this hall · Haldi, Mehendi and Sangeet',
        },
      ],
    },
    {
      id: 'farm',
      when: 'Haldi, Mehendi & Sangeet · 27 October',
      name: FARM.name,
      address: FARM.address,
      mapsQuery: FARM.mapsQuery,
      mapsUrl: FARM.mapsUrl,
      description: 'The three celebrations on Tuesday, 27 October, are at this farm house on Muktinaga Temple Road.',
      queries: '97432 47776 · 98453 59508',
      travel: [
        {
          id: 'farm-tree',
          kind: 'road',
          title: 'Nearby landmark',
          detail: 'Dodda Alada Mara, the Big Banyan Tree',
          note: 'Ramohalli · about 4 km away',
        },
        {
          id: 'farm-rail',
          kind: 'rail',
          title: 'Nearest railway',
          detail: 'Kengeri Railway Station',
          note: 'About 6 km away',
        },
        {
          id: 'farm-metro',
          kind: 'metro',
          title: 'Nearest metro',
          detail: 'Kengeri, Purple Line',
          note: 'About 6 km away',
        },
        {
          id: 'farm-air',
          kind: 'airport',
          title: 'Airport',
          detail: 'Kempegowda International Airport (BLR)',
          note: 'About 42 km away · allow extra time by road',
        },
      ],
    },
  ],

  rsvp: {
    respondBy: '',
    maxGuests: 6,
    endpoint: '',
    whatsappNumber: '918105356529',
    whatsappContactName: 'the family',
  },

  closing: {
    title: 'With love & gratitude',
    message:
      'Your blessings mean the world to us. Thank you for being part of our story — we cannot wait to celebrate with you.',
    signOff: 'With love,',
  },
}
