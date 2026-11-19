---
version: 1.0.0
name: KoolTech Solutions (KTS) Tier-1 Design System
description: "A precision-crafted, high-conviction engineering design language uniting deep obsidian canvases (#020408), hairline borders (rgba(255,255,255,0.08)), and electric cyan (#00D4FF) with deep indigo (#6366F1). Inspired by Linear's software-craft density and Stripe's typographic authority, designed specifically for enterprise AI systems, cloud infrastructure, and mission-critical cybersecurity."
---

# KoolTech Solutions Design System (`DESIGN.md`)

## 1. Brand Identity & Philosophy

KoolTech Solutions (KTS) engineers mission-critical digital systems and autonomous AI workflows for enterprise organizations across the Dominican Republic, Canada, the United States, and the Caribbean. 

Our aesthetic is **understated, technical, and authoritative**. We do not look like a generic IT repair shop or a templated agency. Every element on screen carries purpose:
- **Obsidian Canvases over Saturated Gradients**: We anchor our interface in deep, optical black and rich dark navy tones, letting content and telemetry command attention.
- **Hairline Precision**: Surfaces are delineated by 1px hairline borders (`rgba(255, 255, 255, 0.08)`), subtle micro-radii (8px to 14px), and luminous focus rings.
- **Typographic Rigor**: High-density headings with tight negative letter-spacing (`-0.035em`), tabular numerals (`tabular-nums`) for all performance metrics and currencies, and unambiguous hierarchy.
- **Zero-Slop Standard**: No broken stock imagery, no cards-inside-cards, no gratuitous animations, no fake testimonials, and no ungrounded claims.

---

## 2. Color Tokens

### Background Surfaces
| Token | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- |
| `--surface-canvas` | `#020408` | Primary root viewport canvas — deep obsidian black |
| `--surface-subtle` | `#050811` | Secondary page canvas and alternate section grounds |
| `--surface-card` | `#090D16` | Standard card, drawer, and modal container surface |
| `--surface-elevated` | `#0F1523` | Hovered cards, dropdown menus, floating tooltips |
| `--surface-overlay` | `rgba(2, 4, 8, 0.85)` | Backdrop filter overlay with `backdrop-blur-md` |

### Hairlines & Borders
| Token | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- |
| `--border-hairline` | `rgba(255, 255, 255, 0.07)` | Standard dividing lines, table rows, card perimeters |
| `--border-subtle` | `rgba(255, 255, 255, 0.12)` | Interactive element perimeters, unselected inputs |
| `--border-accent` | `rgba(0, 212, 255, 0.35)` | Active state borders, focused cards, selected tiers |
| `--border-glow` | `0 0 20px rgba(0, 212, 255, 0.15)` | Subtle luminescent elevation on hovered primary cards |

### Chromatic Accents
| Token | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- |
| `--accent-cyan` | `#00D4FF` | Primary signature accent — CTA buttons, telemetry highlights |
| `--accent-cyan-hover` | `#33DDFF` | Button hover state, interactive links |
| `--accent-indigo` | `#6366F1` | Secondary technical accent — AI system highlights, code badges |
| `--accent-emerald` | `#10B981` | System online, SLA verified, operational pulse |
| `--accent-amber` | `#F59E0B` | System alert, pending invoice, triage warning |
| `--accent-rose` | `#EF4444` | Critical incident, overdue invoice, validation error |

### Ink & Typography Colors
| Token | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- |
| `--ink-primary` | `#F8FAFC` | Main headline text, prominent numbers, crisp body copy |
| `--ink-secondary` | `#94A3B8` | Descriptive paragraphs, subtitles, active nav links |
| `--ink-tertiary` | `#64748B` | Form labels, metadata strings, table headers |
| `--ink-faint` | `#475569` | Disabled inputs, subtle breadcrumb dividers |

---

## 3. Typography Scale & Hierarchy

We employ three distinct typefaces with strict domain separation:
1. **Display Headings**: `Syne` or `Inter Display` with measured negative tracking (`-0.03em` to `-0.04em`) and medium/semibold weights (500–700). Never cartoonish or heavy italicized roman text.
2. **Body & Interface**: `Inter` / `DM Sans` (400, 500, 600) with generous line heights (`1.5` to `1.6`) for rapid scanning.
3. **Telemetry & Code**: `JetBrains Mono` (`font-mono`, `tabular-nums`) for server nodes, latency readouts, uptime percentages, currencies, and terminal code blocks.

```css
/* Typography Scale */
--text-display-xl: 3.75rem; /* 60px - tracking: -0.04em; line-height: 1.08 */
--text-display-lg: 3.00rem; /* 48px - tracking: -0.035em; line-height: 1.12 */
--text-display-md: 2.25rem; /* 36px - tracking: -0.03em; line-height: 1.20 */
--text-headline:   1.50rem; /* 24px - tracking: -0.02em; line-height: 1.30 */
--text-body-lg:    1.125rem;/* 18px - tracking: -0.01em; line-height: 1.55 */
--text-body:       1.00rem; /* 16px - tracking: 0; line-height: 1.60 */
--text-body-sm:    0.875rem;/* 14px - tracking: 0; line-height: 1.50 */
--text-micro:      0.75rem; /* 12px - tracking: 0.05em; font-mono */
```

---

## 4. Component Standards

### 1. Buttons & CTAs
- **Primary CTA**: Solid cyan (`#00D4FF`), black text (`#020408`), font-weight 600, border-radius 10px. Micro-interaction: Subtle translate `-1px` on hover with cyan glow `0 0 24px rgba(0,212,255,0.3)`.
- **Secondary / Ghost**: Hairline border (`rgba(255,255,255,0.12)`), surface `#090D16`, text `#F8FAFC`. Micro-interaction: Border brightens to `rgba(255,255,255,0.25)` and background elevates to `#0F1523`.
- **Terminal Pill**: Monospace text, `px-3 py-1`, rounded full, border `rgba(0, 212, 255, 0.2)` with animated emerald telemetry dot.

### 2. Cards & Containers
- Single-layer glass cards: Background `rgba(9, 13, 22, 0.75)`, backdrop blur `12px`, border `1px solid rgba(255, 255, 255, 0.08)`.
- Hover behavior: Border transitions to `rgba(0, 212, 255, 0.3)` in `200ms ease-out`, card lifts `2px`.
- Never nest glass cards inside glass cards.

### 3. Telemetry & Live Indicators
- Green live pulse dot: `w-2 h-2 rounded-full bg-emerald-400 animate-pulse` with `ring-4 ring-emerald-500/20`.
- Metric readouts: Always format numbers with `tabular-nums font-mono font-semibold` to prevent layout jitter during updates.

---

## 5. Architectural Tone & Voice

- **Enterprise & Direct**: We speak with engineering certainty. Avoid empty fluff ("we are your trusted partner"). State exact technical deliverables: "Autonomous AI orchestration", "Sub-15ms response latency", "Zero-Trust micro-segmentation", "99.99% infrastructure availability".
- **Bilingual Authority**: English and Spanish representations are culturally localized, maintaining identical technical rigor and executive presence across US, Canadian, and LATAM markets.
