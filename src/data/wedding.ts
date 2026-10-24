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
 *  `<name>-lg.webp` (full size). Width and height below match the large file.
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

  story: {
    title: 'Our Story',
    intro: 'A few frames from the two of them, in silk, gold and fresh mehendi.',
    chapters: [
      {
        id: 'first-hello',
        label: 'Chapter I · Where it began',
        title: 'A first hello',
        body: 'Seated side by side, already at ease in each other’s company.',
        image: img('couple-seated', 1600, 1486, 'Rakshitha in a gold-embroidered silk saree beside Charan, seated in a pinstriped suit and bow tie'),
      },
      {
        id: 'together',
        label: 'Chapter II · Side by side',
        title: 'Side by side',
        body: 'On the steps together, matching each other step for step.',
        image: img('couple-steps', 1146, 1600, 'Rakshitha in a burgundy and gold silk saree and Charan in a pinstriped suit, laughing on stone steps'),
      },
      {
        id: 'proposal',
        label: 'Chapter III · Two families, one promise',
        title: 'Hand in hand',
        body: 'Silk, gold bangles and fresh mehendi — the details of a day shared with both families.',
        image: img('mehendi-silk', 1066, 1600, 'Hands folded in a lap, covered in mehendi and gold rings, with stacks of red and gold bangles over a silk saree'),
      },
      {
        id: 'forever',
        label: 'Chapter IV · The question',
        title: 'And then, a yes',
        body: 'Two gold rings rest in a mehendi-painted palm, his hand open beneath hers.',
        image: img('wedding-rings', 1600, 1066, 'Two gold rings held in a palm covered with fresh mehendi, stacked bangles at the wrist'),
      },
    ],
  },

  gallery: {
    title: 'Moments in Gold',
    intro: 'Silk, mehendi, and the flower-draped setting prepared for the celebrations.',
    images: [
      { ...img('floral-canopy', 1600, 1066, 'A long canopy of white and magenta flower garlands over a garden ceremony', 'Under the garlands'), warm: true },
      img('couple-steps', 1146, 1600, 'Charan and Rakshitha on stone steps, she in a silk saree and he in a pinstriped suit', 'On the steps'),
      img('couple-seated', 1600, 1486, 'Rakshitha in an embroidered silk blouse beside Charan in a pinstriped suit', 'Side by side'),
      img('mehendi-silk', 1066, 1600, 'Mehendi-covered hands, gold rings and stacked bangles resting on a silk saree', 'Mehendi and silk'),
      img('wedding-rings', 1600, 1066, 'Two gold rings in a mehendi-painted palm', 'The rings'),
      { ...img('floral-seat', 1066, 1600, 'A white and gold settee beneath a jasmine-draped carved doorway and hanging flowers', 'Among the flowers'), warm: true },
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
      start: '2026-10-27T15:30:00+05:30',
      timeLabel: '3:30 PM onwards IST',
      space: 'Farm house',
      venueName: FARM.name,
      address: FARM.address,
      mapsQuery: FARM.mapsQuery,
      mapsUrl: FARM.mapsUrl,
      description: 'Music and dance at M Gundappa Farm House on 27 October, from 3:30 in the afternoon.',
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
      id: 'farm',
      when: 'Haldi, Mehendi & Sangeet · 27 October',
      celebrations: [{ name: 'Haldi, Mehendi & Sangeet', date: '27 October' }],
      name: FARM.name,
      address: FARM.address,
      mapsQuery: FARM.mapsQuery,
      mapsUrl: FARM.mapsUrl,
      description: 'The three celebrations on Tuesday, 27 October, are at this farm house on Muktinaga Temple Road.',
      contacts: [
        { name: 'Girija', phone: '9743247776' },
        { name: 'Hanumantharaju', phone: '9845359508' },
      ],
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
    {
      id: 'hall',
      when: 'Reception · 29 October · Muhurtham · 30 October',
      celebrations: [
        { name: 'Reception', date: '29 October', emphasis: true },
        { name: 'Muhurtham', date: '30 October', emphasis: true },
      ],
      name: HALL.name,
      address: HALL.address,
      mapsQuery: HALL.mapsQuery,
      mapsUrl: HALL.mapsUrl,
      description: 'The reception and the Muhurtham are both held at this hall on Magadi Road. Guest rooms are available on the property.',
      contacts: [
        { name: 'Girija', phone: '9743247776' },
        { name: 'Srinivas', phone: '9900087679' },
        { name: 'Charan', phone: '8105356529' },
        { name: 'Manjula', phone: '9901678668' },
        { name: 'Hanumantharaju', phone: '9845359508' },
        { name: 'Rakshitha', phone: '9945659508' },
      ],
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
  ],

  rsvp: {
    respondBy: '',
    maxGuests: 6,
    // Filled from VITE_SUPABASE_URL at runtime. Set this only to override that function.
    endpoint: '',
    whatsappNumber: '918105356529',
    whatsappContactName: 'the family',
    previewImage: 'https://clsdpoijbtqlqrvzdmuw.supabase.co/storage/v1/object/public/wedding/images/wedding-rings.jpg',
  },

  closing: {
    title: 'With love & gratitude',
    message:
      'Your blessings mean the world to us. Thank you for being part of our story — we cannot wait to celebrate with you.',
    signOff: 'With love,',
  },
}
