# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/fitlog/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> **Flows:** User journeys and ScheduleType decisions live in [FLOWS.md](./FLOWS.md). Empty/error/hub screens are designed in `design/web.pen` state frames.

---

**Project:** FITLOG
**Source of truth:** Current web app (`app/web/src/styles.css` + screen components)
**Category:** Fitness workout tracker (mobile-first PWA shell)
**Design Dials:** Variance 3/10 (Centered / Minimal) | Motion 3/10 (Subtle) | Density 8/10 (Dense / Dashboard)
**Style:** Minimalism & Swiss Style — clean, functional, high contrast, geometric sans-serif

> ui-ux-pro-max orange/indigo sports palettes are **not** used. Colors and typography match the shipped FITLOG UI.

---

## Global Rules

### Color Palette (Light — default)

Aligned with `styles.css` semantic tokens + hard-coded blue accents used in screens.

| Role | Hex / Value | CSS Variable | Usage |
|------|-------------|--------------|-------|
| Background | `#FFFFFF` | `--background` | Page canvas |
| Foreground | `#18181B` (zinc-950) | `--foreground` | Primary text, brand |
| Card | `#FFFFFF` | `--card` | Card surfaces |
| Muted | `#F4F4F5` (zinc-100) | `--muted` | Secondary surfaces, skeleton |
| Muted Foreground | `#71717A` (zinc-500) | `--muted-foreground` | Secondary text, inactive tabs |
| Border | `#E4E4E7` (zinc-200) | `--border` | Dividers, card rings |
| Primary | `#18181B` | `--primary` | Default button fill (shadcn) |
| Primary Foreground | `#FAFAFA` | `--primary-foreground` | On primary |
| Accent | `#2563EB` (blue-600) | `--accent` | CTA, FAB, dates, links, photo badge |
| Accent Soft | `#EFF6FF` (blue-50) | `--accent-soft` | Date blocks, hover tints |
| Destructive | `#EF4444` | `--destructive` | Delete actions |
| Chart Chest | `#3B82F6` | `--chart-chest` | Volume line — chest |
| Chart Back | `#10B981` | `--chart-back` | Volume line — back |
| Chart Legs | `#F59E0B` | `--chart-legs` | Volume line — legs |

### Color Palette (Dark)

| Role | Value |
|------|-------|
| Background | `#09090B` (near-black) |
| Foreground | `#FAFAFA` |
| Card | `#18181B` |
| Muted | `#27272A` |
| Muted Foreground | `#A1A1AA` |
| Border | `rgba(255,255,255,0.10)` |
| Accent Soft | `rgba(37,99,235,0.20)` |

**Contrast:** Body text ≥ 4.5:1 on both themes. Do not rely on hue alone for chart series — also use solid / dashed / dotted line styles.

### Typography

- **Font family:** Figtree (`--font-sans`) — already loaded via `@fontsource/figtree`
- **Do not** switch to Barlow Condensed / Barlow for product UI
- **Weights:** 400 body · 500 labels · 600–700 titles · 900 (`font-black`) hero metrics / timer
- **Mono:** system mono for timer (`HH:mm:ss`) and date stamps
- **Scale (mobile):**
  - Display / page title: 24px bold/black
  - Section title: 16–18px semibold
  - Body: 14px
  - Meta / chip: 10–12px medium
  - Tab label: 10px medium

### Spacing

*Density 8 — dashboard-dense; 4/8 rhythm*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-4` | `4px` | Icon–label gaps |
| `--space-8` | `8px` | Related items |
| `--space-12` | `12px` | Chip / compact padding |
| `--space-16` | `16px` | Page horizontal padding (`p-4`) |
| `--space-24` | `24px` | Section gaps (`space-y-6`) |
| `--space-32` | `32px` | Major blocks |

Content width: `max-w-md` (~448px) centered. Screen frames in `.pen`: **390px** wide.

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `10px` (0.625rem) | Base token |
| `--radius-card` | `16px` (`rounded-2xl`) | Cards |
| `--radius-pill` | `999px` | Buttons, FAB, pills |
| `--radius-photo` | `24px` (`rounded-3xl`) | Auth share card |

### Shadows & Blur

| Token | Usage |
|-------|-------|
| Header / sticky bars | `bg-*/80` + `backdrop-blur-md` |
| Footer | soft outer shadow + blur |
| Primary CTA (finish) | `shadow-lg` with blue tint |
| Photo card | `shadow-2xl` |

Prefer ring (`ring-1 ring-foreground/10`) over heavy card shadows for list cards.

### Icons

- **Library:** Lucide only (match code)
- Decorative icons beside labels: hide from a11y tree
- Icon-only controls need accessible names
- Touch targets ≥ 44×44pt

---

## Shell Layout

```
┌─────────────────────────────┐
│ Status bar (design only)    │  62px
├─────────────────────────────┤
│ Header: Dumbbell + FITLOG   │  sticky, blur
│         Settings (ghost)    │
├─────────────────────────────┤
│ Main (p-16, space-y-24)     │
│                             │
├─────────────────────────────┤
│ Tab bar: 홈 | 기록 | FAB | 루틴 | 인증 │
└─────────────────────────────┘
```

- **Tabs:** 홈 `/` · 기록 `/history` · Play FAB → workout · 루틴 `/routines` · 인증 `/photo`
- **Active tab:** accent color + filled icon (design requirement; code may lag)
- **FAB:** elevated circular Play, accent fill, white glyph
- Main content must include bottom inset so lists are not hidden behind the tab bar (`pb-24` pattern)

---

## Component Specs

### Buttons

| Variant | Fill | Text | Radius | Use |
|---------|------|------|--------|-----|
| Primary | `#18181B` or accent for fitness CTAs | light | pill | 운동 완료, 저장 |
| Outline | transparent + border | foreground | `rounded-2xl` | 사진 변경 |
| Ghost | transparent | muted → accent on hover | pill/icon | Nav, edit, settings |
| Destructive ghost | transparent | muted → red | icon | Delete routine |

Transition 150–250ms opacity/color only — no layout-shifting scale.

### Cards

- White/`--card` surface, `rounded-2xl`, optional `ring-1`
- Hover: soft zinc tint or `border-blue-200` for startable routines
- One primary idea per card

### Chips (muscle / category)

- Compact pill or `rounded-md`, zinc muted bg, 10px bold uppercase for category
- Muscle chips on History: accent-soft bg + accent text

### Skeleton

- Muted blocks matching real layout heights (chart ~180px, list rows ~72px)
- Preserve header + tab bar during page load
- Prefer skeleton over spinner flash; expose `aria-busy` on the main region

### Inputs

- `rounded-4xl` / large radius for search; `rounded-2xl` for caption field on Photo
- Focus ring uses accent / ring token

---

## Charts

- **Type:** Line chart (Recharts) for volume over time
- **When:** ≥ 4 data points on time axis; otherwise use stat cards
- **Series:** chest / back / legs — distinct color **and** line style
- **A11y:** tooltip + concise trend summary; never color-only distinction

---

## Motion

- Subtle fade/translate 8–16px, 300–400ms, ease-out
- Hover/press: 150–250ms color/opacity
- Respect `prefers-reduced-motion: reduce` — skip non-essential motion

---

## UX Rules (from ui-ux-pro-max, adopted)

1. **Page loading:** Stable skeleton + `aria-busy`; no flicker spinner for near-instant loads
2. **Active navigation:** Always indicate current tab
3. **Progress:** Multi-step workout shows timer **and** set completion ratio (e.g. 8/12)
4. **Content jumping:** Reserve space for async regions (aspect-ratio for photo card)
5. **One primary CTA** per sticky header region
6. **Overlays:** Fitness picker = **Bottom Sheet / Drawer** at `max-sm` (<640px), **Dialog / Modal** at `min-md` (≥768px); trap focus; visible focus ring; labeled inputs (not placeholder-only)
7. **Pen fonts:** Prefer **Figtree** on canvas text nodes (Inter may fail to rasterize in Pencil)

---

## Anti-Patterns (Do NOT Use)

- ❌ Orange / indigo rebrand tokens that diverge from shipped FITLOG
- ❌ Barlow / condensed sports fonts for product chrome
- ❌ Emojis as structural icons
- ❌ Spinner-only full-page load that collapses layout
- ❌ Color-only chart series
- ❌ Inactive tab styling identical to active
- ❌ Layout-shifting hover transforms
- ❌ Body text below 4.5:1 contrast

---

## Pre-Delivery Checklist

- [ ] Lucide icons only; no emoji icons
- [ ] Active tab state visible
- [ ] Skeleton preserves shell (header + tabs)
- [ ] Light & dark contrast checked
- [ ] Focus states visible
- [ ] `prefers-reduced-motion` respected
- [ ] Mobile 390 / content `max-w-md`; no horizontal scroll
- [ ] Scroll content not hidden behind fixed footer
- [ ] Design tokens referenced via variables in `.pen` (`$--*`)
