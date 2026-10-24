# Charan & Rakshitha · Wedding Invitation

A cinematic, single-page wedding invitation: a 3D envelope opening (three.js), followed by
the couple's story, a gallery, the celebrations, a live countdown, venue details, an RSVP form
and a closing scene.

Built with React 19, Vite, TypeScript, Tailwind CSS v4, React Three Fiber + Drei (envelope
only), Framer Motion, GSAP ScrollTrigger and Lenis.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build
npm run lint
npm run typecheck
```

`dist/` is a static site and can be deployed to Netlify, Vercel, GitHub Pages or any static host.

Add `?skip-intro` to the URL to jump straight past the envelope. The intro also only plays once per
browser session; "Open the invitation again" at the bottom of the page replays it.

## Making it real

All content lives in **`src/data/wedding.ts`**. Anything marked `SAMPLE` is a placeholder.

1. Confirm the names, monogram and hashtag.
2. Replace the dates, times, time zone, venue, address and travel notes.
3. Replace the story chapters with your own (the current text is deliberately generic).
4. Swap the photos (see below).
5. Set `isSampleContent: false`. This hides the "Sample details · to be confirmed" notes.

The page title and social-preview description in `index.html` are filled from this file at
build time.
Before sharing links, change `og:image` in `index.html` to an absolute URL on your domain,
because social networks ignore relative image paths.

### Photos

Each image is a pair of WebP files in `public/images/`:

- `name-sm.webp` at about 640 px on its longest side
- `name-lg.webp` at full size, around 1200–1300 px

Reference it in `wedding.ts` as `src: '/images/name'` with the large file's `width` and `height`,
and write a meaningful `alt` text.

### RSVPs

By default nothing is stored, and the form says so plainly: guests are told their reply was
**not** sent. There are two ways to receive RSVPs, and you can enable either or both:

- **Online endpoint:** set `rsvp.endpoint` to an `https://` URL that accepts a JSON `POST`, for example a
  [Formspree](https://formspree.io) form, a Google Apps Script web app, or a serverless function.
  A guest sees "received" only after the endpoint returns a 2xx response.
  The adapter lives in `src/lib/rsvp.ts` if you need a different payload.
- **WhatsApp:** set `rsvp.whatsappNumber` to digits only, including the country code (for example
  `919876543210`). A "Reply on WhatsApp" button then opens a pre-written message to that number.

## How the motion fits together

- **Lenis and GSAP:** Lenis is driven from `gsap.ticker`, and ScrollTrigger updates on every Lenis
  scroll (`src/components/providers/SmoothScroll.tsx`). Lenis is disabled entirely for visitors who
  prefer reduced motion.
- **Animation ownership:** GSAP owns scroll-linked parallax on `[data-parallax]` wrappers and scroll reveals
  (`useScrollReveal`). Framer Motion owns component state animation on inner elements, so the two never
  animate the same property.
- **Accessible defaults:** content is visible by default. Hidden start states are applied only inside
  `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`, so reduced-motion and no-JS-animation
  visitors see everything.
- **Envelope renderers:** the 3D scene is lazy-loaded as its own chunk. A CSS 3D envelope is used when
  WebGL is unavailable, while the scene loads, if the WebGL context is lost, and as an opacity-only
  version for reduced motion.
