# SPIRIT — FTC Team #25547

Official website of **SPIRIT**, a student-led _FIRST_ Tech Challenge robotics team from Astana, Kazakhstan.

Dark cyber-tech design in black, electric yellow and white: a live 3D robot render in the hero, an interactive
wireframe CAD viewer, a wall of award certificates, and a sponsorship call to action.

**Stack:** Next.js 16 (App Router, static export) · React 19 · Tailwind CSS 4 · Framer Motion · Lucide icons · TypeScript

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Local dev server with hot reload                          |
| `npm run build`     | Production build → static site in `out/`                  |
| `npm run preview`   | Serve the built `out/` folder locally (run `build` first) |
| `npm run lint`      | ESLint (Next.js + React Compiler rules)                   |
| `npm run typecheck` | TypeScript                                                |
| `npm run format`    | Prettier (also sorts Tailwind classes)                    |

## Editing content

Almost everything lives in **`lib/site.ts`**: copy, stats, robot specs, team roster, season history, outreach,
sponsors and links. Edit it and the whole page updates.

### Replace before launch

These are placeholders, marked `TODO` in `lib/site.ts`:

- [ ] **`site.email`**: the team inbox. While it is `null`, "Become a sponsor" opens LinkedIn and the footer hides the email line.
- [ ] **`subsystems[].specs`**: swap in your current robot's real numbers.
- [ ] **Portfolio PDF**: replace `public/portfolio/spirit-25547-engineering-portfolio.pdf` with the real portfolio
      (keep the file name, or update `site.portfolio`).

### Team roster

Members live in `team` in `lib/site.ts`. Portraits go in `public/team/` as **4:5 WebP or JPEG** (600 × 750 works
well), framed head-and-shoulders with the eyes about 40% from the top so the cards line up. Members without a
`photo` get a branded placeholder card.

### Awards

Awards live in `awards` in `lib/site.ts`. Each certificate needs two straightened, tightly cropped images in
`public/awards/`: a 1400 × 990 card image and a 2400 × 1697 `-full` version (both √2 landscape, like the paper).
The previous, table-visible versions are kept in `assets/awards-originals/` (not published).

### The robot model

The hero render and the CAD viewer share one low-poly model in **`lib/robot/model.ts`**, built in inches inside the
18 × 18 × 18 in envelope. Parts are boxes, extruded profiles or cylinders tagged by subsystem, so you can reshape the
robot to match your real one. Keep parts from overlapping and the depth sorting stays exact. `lib/robot/engine.ts`
handles projection, lighting and sorting. To embed a real CAD viewer later (for example an Onshape or Sketchfab
embed), swap it in for `<RobotBlueprint />` in `components/sections/robot-specs.tsx`.

### Social preview images

`app/opengraph-image.png` (1200 × 630) and `app/apple-icon.png` are static files; replace them to change how links
look when shared. The favicon is `app/icon.svg`.

## Deploying

The site builds to plain static files in `out/`, so it can be hosted almost anywhere.

1. Set your public URL so canonical links, the sitemap and social previews point to the right domain
   (see `.env.example`):

   ```bash
   NEXT_PUBLIC_SITE_URL=https://your-domain.org
   ```

   On Vercel this falls back to the production domain automatically.

2. Deploy:
   - **Vercel**: import the repo; zero config.
   - **Netlify / Cloudflare Pages**: build command `npm run build`, publish directory `out`.
   - **GitHub Pages**: works with a custom domain. Serving from `username.github.io/repo` also needs `basePath` in
     `next.config.ts`.

## Project structure

```
app/                 layout (fonts, SEO, JSON-LD), page, 404, sitemap, robots, manifest, icons
components/
  layout/            navbar (scroll-spy, mobile drawer), footer
  sections/          hero, team, robot specs, awards, outreach, portfolio, sponsors, ticker
  robot/             live 3D render (hero) and interactive wireframe viewer
  brand/             mascot flame + social icons
  ui/                buttons, HUD primitives, scroll reveal
lib/
  site.ts            ← all content
  robot/             3D model + renderer
```

## Accessibility & performance

- Respects `prefers-reduced-motion`: animation loops, counters, the turntable and the ticker all stand still.
- Keyboard support for the menu, subsystem tabs (arrow keys), CAD viewer (arrow keys rotate) and chart tooltips.
- Hero entrance runs on CSS, so the largest element paints before JavaScript loads. Framer Motion's feature bundle
  is lazy-loaded, and the 3D render pauses whenever it scrolls off screen.
- Content stays visible without JavaScript.

---

_FIRST®, FIRST® Tech Challenge, Gracious Professionalism® and Coopertition® are registered trademarks of FIRST®,
which is not overseeing, involved with, or responsible for this website._
